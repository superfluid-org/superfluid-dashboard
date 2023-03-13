import { Operation } from "@superfluid-finance/sdk-core";
import {
  BaseQuery,
  FlowCreateMutation,
  FlowDeleteMutation,
  FlowUpdateMutation,
  getFramework,
  registerNewTransaction,
  RpcEndpointBuilder,
  TransactionInfo,
  TransactionTitle,
} from "@superfluid-finance/sdk-redux";
import { BigNumber } from "ethers";
import { getFlowScheduler } from "../../../eth-sdk/getEthSdk";
import { allNetworks, tryFindNetwork } from "../../network/networks";
import { UnitOfTime } from "../../send/FlowRateInput";
import { rpcApi } from "../store";

export const ACL_CREATE_PERMISSION = 1;
export const ACL_UPDATE_PERMISSION = 2;
export const ACL_DELETE_PERMISSION = 4;

interface GetFlowSchedule extends BaseQuery<number | null> {
  superTokenAddress: string;
  senderAddress: string;
  receiverAddress: string;
}

export interface UpsertFlowWithScheduling
  extends FlowCreateMutation,
    FlowUpdateMutation {
  senderAddress: string;
  startTimestamp: number | null;
  endTimestamp: number | null;
}

export interface DeleteFlowWithScheduling extends FlowDeleteMutation {
  senderAddress: string;
}

interface StreamScheduleResponse {
  startDate?: number;
  startMaxDelay?: number;
  endDate?: number;
  flowRate?: string;
}

export const flowSchedulerEndpoints = {
  endpoints: (builder: RpcEndpointBuilder) => ({
    getFlowSchedule: builder.query<
      StreamScheduleResponse | null,
      GetFlowSchedule
    >({
      queryFn: async ({
        chainId,
        superTokenAddress,
        senderAddress,
        receiverAddress,
      }) => {
        const framework = await getFramework(chainId);
        const flowScheduler = getFlowScheduler(
          chainId,
          framework.settings.provider
        );

        const { startDate, endDate, startMaxDelay, flowRate } =
          await flowScheduler.getFlowSchedule(
            superTokenAddress,
            senderAddress,
            receiverAddress
          );

        if (!startDate && !endDate) return { data: null };

        return {
          data: {
            startDate,
            endDate,
            startMaxDelay,
            flowRate: flowRate.toString(),
          } as StreamScheduleResponse,
        };
      },
      providesTags: (_result, _error, arg) => [
        {
          type: "GENERAL",
          id: arg.chainId.toString(),
        },
      ],
    }),
    upsertFlowWithScheduling: builder.mutation<
      TransactionInfo & { subTransactionTitles: TransactionTitle[] },
      UpsertFlowWithScheduling
    >({
      async queryFn({ chainId, ...arg }, { dispatch }) {
        const userData = arg.userDataBytes ?? "0x";
        const framework = await getFramework(chainId);
        const hasScheduledStart = !!arg.startTimestamp;
        const hasScheduledEnd = !!arg.endTimestamp;
        const hasScheduling = hasScheduledStart || hasScheduledEnd;

        const [superToken, activeExistingFlow] = await Promise.all([
          framework.loadSuperToken(arg.superTokenAddress),
          dispatch(
            rpcApi.endpoints.getActiveFlow.initiate(
              {
                chainId,
                tokenAddress: arg.superTokenAddress,
                senderAddress: arg.senderAddress,
                receiverAddress: arg.receiverAddress,
              },
              {
                subscribe: false,
              }
            )
          ).unwrap(),
        ]);

        const subOperations: {
          operation: Operation;
          title: TransactionTitle;
        }[] = [];

        const network = tryFindNetwork(allNetworks, chainId);

        if (network?.flowSchedulerContractAddress) {
          const flowScheduler = getFlowScheduler(chainId, arg.signer);

          const existingFlowSchedule = await dispatch(
            rpcApi.endpoints.getFlowSchedule.initiate(
              {
                chainId,
                superTokenAddress: arg.superTokenAddress,
                senderAddress: arg.senderAddress,
                receiverAddress: arg.receiverAddress,
              },
              {
                subscribe: false,
                forceRefetch: true,
              }
            )
          ).unwrap();

          const {
            startDate: existingStartTimestamp,
            endDate: existingEndTimestamp,
            flowRate: existingFlowRate,
          } = existingFlowSchedule || {};

          if (hasScheduling) {
            const flowOperatorData = await superToken.getFlowOperatorData({
              flowOperator: network.flowSchedulerContractAddress,
              sender: arg.senderAddress,
              providerOrSigner: arg.signer,
            });

            const permissions = Number(flowOperatorData.permissions);

            const neededPermissions =
              (hasScheduledStart ? ACL_CREATE_PERMISSION : 0) |
              (hasScheduledEnd ? ACL_DELETE_PERMISSION : 0);

            const hasNeededPermissions = permissions & neededPermissions;

            const doesNeedAllowance = !activeExistingFlow && arg.startTimestamp;
            const neededAllowance = doesNeedAllowance
              ? BigNumber.from(flowOperatorData.flowRateAllowance)
                  .add(BigNumber.from(arg.flowRateWei))
                  .toString()
              : flowOperatorData.flowRateAllowance;

            if (!hasNeededPermissions || doesNeedAllowance) {
              subOperations.push({
                operation: await superToken.updateFlowOperatorPermissions({
                  flowOperator: network.flowSchedulerContractAddress,
                  flowRateAllowance: neededAllowance,
                  permissions: permissions | neededPermissions,
                  userData: userData,
                  overrides: arg.overrides,
                }),
                title: "Update Scheduler Permissions",
              });
            }

            if (
              arg.startTimestamp !== existingStartTimestamp ||
              arg.endTimestamp !== existingEndTimestamp ||
              (hasScheduledStart && arg.flowRateWei !== existingFlowRate)
            ) {
              const streamOrder =
                await flowScheduler.populateTransaction.createFlowSchedule(
                  arg.superTokenAddress,
                  arg.receiverAddress,
                  arg.startTimestamp || 0,
                  hasScheduledStart ? UnitOfTime.Day * 3 : 0, // startDuration
                  hasScheduledStart ? arg.flowRateWei : 0, // flowRate
                  0, // startAmount
                  arg.endTimestamp || 0,
                  userData,
                  "0x",
                  arg.overrides ?? {}
                );

              const isModifyingSchedule = !!(
                existingStartTimestamp || existingEndTimestamp
              );

              subOperations.push({
                operation: await framework.host.callAppAction(
                  network.flowSchedulerContractAddress,
                  streamOrder.data!
                ),
                title: isModifyingSchedule
                  ? "Modify Schedule"
                  : "Create Schedule",
              });
            }
          } else if (existingStartTimestamp || existingEndTimestamp) {
            const deleteStreamOrder =
              await flowScheduler.populateTransaction.deleteFlowSchedule(
                arg.superTokenAddress,
                arg.receiverAddress,
                "0x"
              );
            subOperations.push({
              operation: await framework.host.callAppAction(
                network.flowSchedulerContractAddress,
                deleteStreamOrder.data!
              ),
              title: "Delete Schedule",
            });
          }
        }

        const flowArg = {
          userData,
          sender: arg.senderAddress,
          flowRate: arg.flowRateWei,
          receiver: arg.receiverAddress,
          overrides: arg.overrides,
        };

        if (activeExistingFlow) {
          if (arg.flowRateWei !== activeExistingFlow.flowRateWei) {
            subOperations.push({
              operation: await superToken.updateFlow(flowArg),
              title: "Update Stream",
            });
          }
        } else if (!hasScheduledStart) {
          // We are creating a flow only if it is not scheduled into future
          subOperations.push({
            operation: await superToken.createFlow(flowArg),
            title: "Create Stream",
          });
        }

        const signerAddress = await arg.signer.getAddress();

        const executableOperationOrBatchCall =
          subOperations.length === 1
            ? subOperations[0].operation
            : framework.batchCall(subOperations.map((x) => x.operation));

        const transactionResponse = await executableOperationOrBatchCall.exec(
          arg.signer
        );

        const subTransactionTitles = subOperations.map((x) => x.title);
        const mainTransactionTitle =
          subTransactionTitles.length === 1
            ? subTransactionTitles[0]
            : activeExistingFlow
            ? "Modify Stream"
            : hasScheduledStart
            ? "Schedule Stream"
            : "Create Stream";

        await registerNewTransaction({
          dispatch,
          chainId,
          transactionResponse,
          waitForConfirmation: !!arg.waitForConfirmation,
          signer: signerAddress,
          extraData: {
            subTransactionTitles,
            ...(arg.transactionExtraData ?? {}),
          },
          title: mainTransactionTitle,
        });

        return {
          data: {
            chainId,
            hash: transactionResponse.hash,
            subTransactionTitles,
          },
        };
      },
    }),
    deleteFlowWithScheduling: builder.mutation<
      TransactionInfo & { subTransactionTitles: TransactionTitle[] },
      DeleteFlowWithScheduling
    >({
      async queryFn({ chainId, ...arg }, { dispatch }) {
        const userData = arg.userDataBytes ?? "0x";
        const framework = await getFramework(chainId);

        const subOperations: {
          operation: Operation;
          title: TransactionTitle;
        }[] = [];

        const activeFlowQuery = dispatch(
          rpcApi.endpoints.getActiveFlow.initiate(
            {
              chainId,
              tokenAddress: arg.superTokenAddress,
              senderAddress: arg.senderAddress,
              receiverAddress: arg.receiverAddress,
            },
            {
              subscribe: true,
              forceRefetch: true,
            }
          )
        );

        const [superToken, activeExistingFlow] = await Promise.all([
          framework.loadSuperToken(arg.superTokenAddress),
          activeFlowQuery.unwrap().finally(() => activeFlowQuery.unsubscribe()),
        ]);

        const network = tryFindNetwork(allNetworks, chainId);

        if (!!activeExistingFlow && network) {
          subOperations.push({
            operation: await superToken.deleteFlow({
              userData,
              sender: arg.senderAddress,
              receiver: arg.receiverAddress,
              overrides: arg.overrides,
            }),
            title: "Close Stream",
          });
        }

        if (network?.flowSchedulerContractAddress) {
          const flowScheduler = getFlowScheduler(chainId, arg.signer);

          const existingFlowSchedule = await dispatch(
            rpcApi.endpoints.getFlowSchedule.initiate(
              {
                chainId,
                superTokenAddress: arg.superTokenAddress,
                senderAddress: arg.senderAddress,
                receiverAddress: arg.receiverAddress,
              },
              {
                subscribe: true,
                forceRefetch: true,
              }
            )
          ).unwrap();

          const {
            startDate: existingStartTimestamp,
            endDate: existingEndTimestamp,
          } = existingFlowSchedule || {};

          if (existingStartTimestamp || existingEndTimestamp) {
            const deleteStreamOrder =
              await flowScheduler.populateTransaction.deleteFlowSchedule(
                arg.superTokenAddress,
                arg.receiverAddress,
                "0x"
              );
            subOperations.push({
              operation: await framework.host.callAppAction(
                network.flowSchedulerContractAddress,
                deleteStreamOrder.data!
              ),
              title: "Delete Schedule",
            });
          }
        }

        const executableOperationOrBatchCall =
          subOperations.length === 1
            ? subOperations[0].operation
            : framework.batchCall(subOperations.map((x) => x.operation));

        const transactionResponse = await executableOperationOrBatchCall.exec(
          arg.signer
        );

        const subTransactionTitles = subOperations.map((x) => x.title);

        const signerAddress = await arg.signer.getAddress();

        await registerNewTransaction({
          dispatch,
          chainId,
          transactionResponse,
          waitForConfirmation: !!arg.waitForConfirmation,
          signer: signerAddress,
          extraData: {
            subTransactionTitles,
            ...(arg.transactionExtraData ?? {}),
          },
          title: "Close Stream",
        });

        return {
          data: {
            chainId,
            hash: transactionResponse.hash,
            subTransactionTitles,
          },
        };
      },
    }),
  }),
};
