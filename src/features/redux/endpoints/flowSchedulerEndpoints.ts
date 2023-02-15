import { Operation } from "@superfluid-finance/sdk-core";
import {
  BaseQuery,
  FlowCreateMutation,
  FlowUpdateMutation,
  getFramework,
  registerNewTransaction,
  RpcEndpointBuilder,
  TransactionInfo,
  TransactionTitle,
} from "@superfluid-finance/sdk-redux";
import { BigNumber } from "ethers";
import { getFlowScheduler } from "../../../eth-sdk/getEthSdk";
import { findNetworkByChainId } from "../../network/networks";
import { UnitOfTime } from "../../send/FlowRateInput";
import { rpcApi } from "../store";

export const ACL_CREATE_PERMISSION = 1;
export const ACL_UPDATE_PERMISSION = 2;
export const ACL_DELETE_PERMISSION = 4;

interface GetFlowScheduledDates extends BaseQuery<number | null> {
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

interface ScheduledDatesResponse {
  startDate: number | null;
  endDate: number | null;
}

export const flowSchedulerEndpoints = {
  endpoints: (builder: RpcEndpointBuilder) => ({
    scheduledDates: builder.query<
      ScheduledDatesResponse,
      GetFlowScheduledDates
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

        const { startDate, endDate } = await flowScheduler.getFlowSchedule(
          superTokenAddress,
          senderAddress,
          receiverAddress
        );

        return {
          data: {
            startDate,
            endDate,
          },
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

        const network = findNetworkByChainId(chainId);
        // TODO(KK): Uncomment & implement again when stream scheduling is handled.
        if (network?.flowSchedulerContractAddress) {
          const flowScheduler = getFlowScheduler(chainId, arg.signer);

          const existingDatesResponse = await dispatch(
            rpcApi.endpoints.scheduledDates.initiate(
              {
                chainId,
                superTokenAddress: arg.superTokenAddress,
                senderAddress: arg.senderAddress,
                receiverAddress: arg.receiverAddress,
              },
              {
                subscribe: false,
              }
            )
          ).unwrap();

          const {
            startDate: existingStartTimestamp,
            endDate: existingEndTimestamp,
          } = existingDatesResponse || {};

          if (arg.endTimestamp || arg.startTimestamp) {
            const flowOperatorData = await superToken.getFlowOperatorData({
              flowOperator: network.flowSchedulerContractAddress,
              sender: arg.senderAddress,
              providerOrSigner: arg.signer,
            });

            const permissions = Number(flowOperatorData.permissions);

            const neededPermissions =
              (arg.startTimestamp ? ACL_CREATE_PERMISSION : 0) +
              (arg.endTimestamp ? ACL_DELETE_PERMISSION : 0);

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
              arg.endTimestamp !== existingEndTimestamp
            ) {
              const streamOrder =
                await flowScheduler.populateTransaction.createFlowSchedule(
                  arg.superTokenAddress,
                  arg.receiverAddress,
                  arg.startTimestamp || 0,
                  arg.startTimestamp ? UnitOfTime.Minute * 5 : 0, // startDuration
                  arg.startTimestamp ? arg.flowRateWei : 0, // flowRate
                  0, // startAmount
                  arg.endTimestamp || 0,
                  userData,
                  "0x",
                  arg.overrides ?? {}
                );

              console.log({ arg, streamOrder });

              const isModifyingSchedule = !!(
                existingStartTimestamp || existingEndTimestamp
              );

              subOperations.push({
                operation: await framework.host.callAppAction(
                  network.flowSchedulerContractAddress,
                  streamOrder.data!
                ),
                title: isModifyingSchedule
                  ? "Modify Schedule Order"
                  : "Create Schedule Order",
              });
            }
          } else {
            if (existingEndTimestamp || existingStartTimestamp) {
              const streamOrder =
                await flowScheduler.populateTransaction.deleteFlowSchedule(
                  arg.superTokenAddress,
                  arg.receiverAddress,
                  "0x"
                );
              subOperations.push({
                operation: await framework.host.callAppAction(
                  network.flowSchedulerContractAddress,
                  streamOrder.data!
                ),
                title: "Delete Schedule Order",
              });
            }
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
        } else if (!arg.startTimestamp) {
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
            : arg.endTimestamp || arg.startTimestamp
            ? "Send Scheduled Stream"
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
  }),
};
