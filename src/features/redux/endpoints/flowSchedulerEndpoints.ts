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
import { getUnixTime } from "date-fns";
import { BigNumber } from "ethers";
import { getFlowScheduler } from "../../../eth-sdk/getEthSdk";
import { isCloseToUnlimitedFlowRateAllowance } from "../../../utils/isCloseToUnlimitedAllowance";
import {
  allNetworks,
  findNetworkOrThrow,
  tryFindNetwork,
} from "../../network/networks";
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

        const unixNow = getUnixTime(new Date());

        const isStartExpired = startDate + startMaxDelay <= unixNow;
        const effectiveStartDate = isStartExpired ? undefined : startDate;

        return {
          data: {
            startDate: effectiveStartDate,
            endDate: endDate ? endDate : undefined,
            flowRate: isStartExpired ? undefined : flowRate.toString(),
          } as StreamScheduleResponse,
        };
      },
      providesTags: (_result, _error, arg) => [
        {
          type: "GENERAL",
          id: arg.chainId,
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
        const shouldScheduleStart = !!arg.startTimestamp;
        const shouldScheduledEnd = !!arg.endTimestamp;
        const shouldSchedule = shouldScheduleStart || shouldScheduledEnd;

        const getActiveFlow = dispatch(
          rpcApi.endpoints.getActiveFlow.initiate(
            {
              chainId,
              tokenAddress: arg.superTokenAddress,
              senderAddress: arg.senderAddress,
              receiverAddress: arg.receiverAddress,
            },
            {
              subscribe: true,
            }
          )
        );
        const [superToken, activeExistingFlow] = await Promise.all([
          framework.loadSuperToken(arg.superTokenAddress),
          getActiveFlow.unwrap().finally(() => getActiveFlow.unsubscribe()),
        ]);

        const subOperations: {
          operation: Operation;
          title: TransactionTitle;
        }[] = [];

        const network = tryFindNetwork(allNetworks, chainId);

        if (network?.flowSchedulerContractAddress) {
          const flowScheduler = getFlowScheduler(chainId, arg.signer);

          const getFlowSchedule = dispatch(
            rpcApi.endpoints.getFlowSchedule.initiate(
              {
                chainId,
                superTokenAddress: arg.superTokenAddress,
                senderAddress: arg.senderAddress,
                receiverAddress: arg.receiverAddress,
              },
              {
                subscribe: true,
              }
            )
          );
          const existingFlowSchedule = await getFlowSchedule
            .unwrap()
            .finally(() => getFlowSchedule.unsubscribe());

          const {
            startDate: existingStartTimestamp,
            endDate: existingEndTimestamp,
            flowRate: existingFlowRate,
          } = existingFlowSchedule || {};

          if (shouldSchedule) {
            const flowOperatorData = await superToken.getFlowOperatorData({
              flowOperator: network.flowSchedulerContractAddress,
              sender: arg.senderAddress,
              providerOrSigner: arg.signer,
            })

            const existingFlowRateAllowance = BigNumber.from(
              flowOperatorData.flowRateAllowance
            );
            const existingPermissions = Number(flowOperatorData.permissions);

            const permissionsDelta =
              (shouldScheduleStart ? ACL_CREATE_PERMISSION : 0) |
              (shouldScheduledEnd ? ACL_DELETE_PERMISSION : 0);
            const newPermissions = existingPermissions | permissionsDelta;

            const doesNeedAllowance = !activeExistingFlow && arg.startTimestamp;
            const flowRateAllowanceDelta = doesNeedAllowance
              ? BigNumber.from(arg.flowRateWei)
              : BigNumber.from("0");
            const newFlowRateAllowance = isCloseToUnlimitedFlowRateAllowance(
              existingFlowRateAllowance
            )
              ? existingFlowRateAllowance
              : existingFlowRateAllowance.add(flowRateAllowanceDelta);

            const hasEnoughSuperTokenAccess =
              existingPermissions === newPermissions &&
              existingFlowRateAllowance.eq(newFlowRateAllowance);

            if (!hasEnoughSuperTokenAccess) {
              subOperations.push({
                operation:
                  await superToken.increaseFlowRateAllowanceWithPermissions({
                    flowOperator: network.flowSchedulerContractAddress,
                    flowRateAllowanceDelta: flowRateAllowanceDelta.toString(),
                    permissionsDelta: permissionsDelta,
                    userData: userData,
                    overrides: arg.overrides,
                  }),
                title: "Approve Stream Scheduler",
              });
            }

            if (
              arg.startTimestamp !== existingStartTimestamp ||
              arg.endTimestamp !== existingEndTimestamp ||
              (shouldScheduleStart && arg.flowRateWei !== existingFlowRate)
            ) {
              const streamOrder =
                await flowScheduler.populateTransaction.createFlowSchedule(
                  arg.superTokenAddress,
                  arg.receiverAddress,
                  arg.startTimestamp || 0,
                  shouldScheduleStart ? UnitOfTime.Day * 1 : 0, // startDuration
                  shouldScheduleStart ? arg.flowRateWei : 0, // flowRate
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
        } else if (!shouldScheduleStart) {
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
            : shouldScheduleStart
            ? "Schedule Stream"
            : "Create Stream";

        await registerNewTransaction({
          dispatch,
          chainId,
          transactionResponse,
          signerAddress,
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
            }
          )
        );

        const [superToken, activeExistingFlow] = await Promise.all([
          framework.loadSuperToken(arg.superTokenAddress),
          activeFlowQuery.unwrap().finally(() => activeFlowQuery.unsubscribe()),
        ]);

        const network = findNetworkOrThrow(allNetworks, chainId);

        if (activeExistingFlow) {
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
          const getFlowSchedule = dispatch(
            rpcApi.endpoints.getFlowSchedule.initiate(
              {
                chainId,
                superTokenAddress: arg.superTokenAddress,
                senderAddress: arg.senderAddress,
                receiverAddress: arg.receiverAddress,
              },
              {
                subscribe: true,
              }
            )
          );
          const existingFlowSchedule = await getFlowSchedule
            .unwrap()
            .finally(() => getFlowSchedule.unsubscribe());

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
          signerAddress,
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
