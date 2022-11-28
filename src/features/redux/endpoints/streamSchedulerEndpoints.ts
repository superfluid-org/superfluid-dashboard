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
import { findNetworkByChainId } from "../../network/networks";
import { rpcApi } from "../store";
import { getEthSdk } from "../../../eth-sdk/getEthSdk";

export const ACL_CREATE_PERMISSION = 1;
export const ACL_UPDATE_PERMISSION = 2;
export const ACL_DELETE_PERMISSION = 4;

interface GetStreamScheduledEndDate extends BaseQuery<number | null> {
  superTokenAddress: string;
  senderAddress: string;
  receiverAddress: string;
}

interface UpsertFlowWithScheduling
  extends FlowCreateMutation,
    FlowUpdateMutation {
  senderAddress: string;
  endTimestamp: number | null;
}

export const streamSchedulerEndpoints = {
  endpoints: (builder: RpcEndpointBuilder) => ({
    scheduledEndDate: builder.query<number | null, GetStreamScheduledEndDate>({
      queryFn: async ({
        chainId,
        superTokenAddress,
        senderAddress,
        receiverAddress,
      }) => {
        const framework = await getFramework(chainId);
        const { streamScheduler } = getEthSdk(
          chainId,
          framework.settings.provider
        );

        const streamOrder = await streamScheduler.getStreamOrders(
          senderAddress,
          receiverAddress,
          superTokenAddress
        );

        return { data: streamOrder.endDate };
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
        if (network?.streamSchedulerContractAddress) {
          const { streamScheduler } = getEthSdk(chainId, arg.signer);
          const existingEndTimestamp = await dispatch(
            rpcApi.endpoints.scheduledEndDate.initiate(
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

          if (arg.endTimestamp) {
            const flowOperatorData = await superToken.getFlowOperatorData({
              flowOperator: network.streamSchedulerContractAddress,
              sender: arg.senderAddress,
              providerOrSigner: arg.signer,
            });

            const permissions = Number(flowOperatorData.permissions);
            const hasDeletePermission = permissions & ACL_DELETE_PERMISSION;
            if (!hasDeletePermission) {
              subOperations.push({
                operation: await superToken.updateFlowOperatorPermissions({
                  flowOperator: network.streamSchedulerContractAddress,
                  flowRateAllowance: flowOperatorData.flowRateAllowance,
                  permissions: permissions + ACL_DELETE_PERMISSION,
                  userData: userData,
                  overrides: arg.overrides,
                }),
                title: "Approve Scheduler for End Date",
              });
            }

            if (arg.endTimestamp !== existingEndTimestamp) {
              const streamOrder =
                await streamScheduler.populateTransaction.createStreamOrder(
                  arg.receiverAddress,
                  arg.superTokenAddress,
                  0, // startDate
                  0, // startDuration
                  "0", // flowRate
                  arg.endTimestamp,
                  userData,
                  "0x",
                  arg.overrides ?? {}
                );

              subOperations.push({
                operation: await framework.host.callAppAction(
                  network.streamSchedulerContractAddress,
                  streamOrder.data!
                ),
                title: "Schedule Stream End Date",
              });
            }
          } else {
            if (existingEndTimestamp) {
              const streamOrder =
                await streamScheduler.populateTransaction.deleteStreamOrder(
                  arg.receiverAddress,
                  arg.superTokenAddress,
                  "0x"
                );
              subOperations.push({
                operation: await framework.host.callAppAction(
                  network.streamSchedulerContractAddress,
                  streamOrder.data!
                ),
                title: "Remove Stream End Date",
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
        } else {
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
            : arg.endTimestamp
            ? "Send Closed-Ended Stream"
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
