import { IWeb3FlowOperatorData, Operation } from "@superfluid-finance/sdk-core";
import {
  BaseQuery,
  BaseSuperTokenMutation,
  FlowCreateMutation,
  getFramework,
  registerNewTransaction,
  registerNewTransactionAndReturnQueryFnResult,
  RpcEndpointBuilder,
  TransactionInfo,
  TransactionTitle,
} from "@superfluid-finance/sdk-redux";
import { providers, Signer } from "ethers";
import { getGoerliSdk } from "../../../eth-sdk/client";
import {
  findNetworkByChainId,
  networkDefinition,
} from "../../network/networks";

const getSdk = (
  chainId: number,
  providerOrSigner: providers.Provider | Signer
) => {
  if (chainId === networkDefinition.goerli.id) {
    return getGoerliSdk(providerOrSigner);
  }

  // if (chainId === networkDefinition.polygonMumbai.id) {
  //   return getPolygonMumbaiSdk(providerOrSigner);
  // }

  throw new Error();
};

interface GetStreamScheduledEndDate extends BaseQuery<number | null> {
  superTokenAddress: string;
  senderAddress: string;
  receiverAddress: string;
}

interface GetStreamSchedulerPermissions
  extends BaseQuery<IWeb3FlowOperatorData> {
  senderAddress: string;
  superTokenAddress: string;
}

interface UpdateStreamSchedulerPermissions extends BaseSuperTokenMutation {
  permissions: number;
  flowRateAllowance: string;
  userData?: string;
}

interface RevokeAllStreamSchedulerPermissions extends BaseSuperTokenMutation {}

interface ScheduleStreamEndDate extends BaseSuperTokenMutation {
  senderAddress: string;
  receiverAddress: string;
  endTimestamp: number;
  userData: string;
}

interface UpsertStreamWithScheduling
  extends FlowCreateMutation,
    Omit<ScheduleStreamEndDate, "endTimestamp">,
    GetStreamSchedulerPermissions,
    UpdateStreamSchedulerPermissions {
  userData: string;
  senderAddress: string;
  endTimestamp: number | null;
}

export const streamSchedulerEndpoints = {
  endpoints: (builder: RpcEndpointBuilder) => ({
    schedulerOperatorPermissions: builder.query<
      IWeb3FlowOperatorData,
      GetStreamSchedulerPermissions
    >({
      queryFn: async ({ chainId, superTokenAddress, senderAddress }) => {
        const framework = await getFramework(chainId);
        const superToken = await framework.loadSuperToken(superTokenAddress);
        const network = findNetworkByChainId(chainId);
        if (!network?.streamSchedulerContractAddress) {
          throw new Error("Network doesn't support stream scheduler.");
        }

        const flowOperatorData = await superToken.getFlowOperatorData({
          flowOperator: network.streamSchedulerContractAddress,
          sender: senderAddress,
          providerOrSigner: framework.settings.provider,
        });

        return { data: flowOperatorData };
      },
      providesTags: (_result, _error, arg) => [
        {
          type: "GENERAL",
          id: arg.chainId.toString(),
        },
      ],
    }),
    scheduledEndDate: builder.query<number | null, GetStreamScheduledEndDate>({
      queryFn: async ({
        chainId,
        superTokenAddress,
        senderAddress,
        receiverAddress,
      }) => {
        const framework = await getFramework(chainId);
        const sdk = getSdk(chainId, framework.settings.provider); // TODO(KK): Get this off of a Network.

        const streamOrder = await sdk.StreamScheduler.getStreamOrders(
          senderAddress,
          receiverAddress,
          superTokenAddress
        );

        // TODO(KK): filter out end dates in history?

        return { data: streamOrder.endDate };
      },
      providesTags: (_result, _error, arg) => [
        {
          type: "GENERAL",
          id: arg.chainId.toString(),
        },
      ],
    }),
    upsertStreamWithScheduling: builder.mutation<
      TransactionInfo & { subTransactionTitles: TransactionTitle[] },
      UpsertStreamWithScheduling
    >({
      async queryFn({ chainId, ...arg }, { dispatch }) {
        const framework = await getFramework(chainId);
        const superToken = await framework.loadSuperToken(
          arg.superTokenAddress
        );

        const sdk = getGoerliSdk(arg.signer); // TODO(KK): Get this off of a Network.
        const subOperations: {
          operation: Operation;
          title: TransactionTitle;
        }[] = [];

        const network = findNetworkByChainId(chainId);
        if (network?.streamSchedulerContractAddress) {
          const existingStreamOrder = await sdk.StreamScheduler.getStreamOrders(
            arg.senderAddress,
            arg.receiverAddress,
            arg.superTokenAddress
          );

          if (arg.endTimestamp) {
            const flowOperatorData = await superToken.getFlowOperatorData({
              flowOperator: network.streamSchedulerContractAddress,
              sender: arg.senderAddress,
              providerOrSigner: arg.signer,
            });

            const permissions = Number(flowOperatorData.permissions);
            const hasDeletePermission = permissions & 4;
            if (hasDeletePermission) {
              subOperations.push({
                operation: await superToken.updateFlowOperatorPermissions({
                  flowOperator: network.streamSchedulerContractAddress,
                  flowRateAllowance: arg.flowRateAllowance,
                  permissions: permissions + 4,
                  userData: "0x",
                  overrides: arg.overrides,
                }),
                title: "Update Scheduler Permissions",
              });
            }

            if (arg.endTimestamp !== existingStreamOrder.endDate) {
              const streamOrder =
                await sdk.StreamScheduler.populateTransaction.createStreamOrder(
                  arg.receiverAddress,
                  arg.superTokenAddress,
                  0, // startDate
                  0, // startDuration
                  "0", // flowRate
                  arg.endTimestamp,
                  arg.userData,
                  "0x",
                  arg.overrides ?? {}
                );

              subOperations.push({
                operation: await framework.host.callAppAction(
                  network.streamSchedulerContractAddress,
                  streamOrder.data!
                ),
                title: "Create Stream Order",
              });
            }
          } else {
            if (existingStreamOrder.endDate) {
              const streamOrder =
                await sdk.StreamScheduler.populateTransaction.deleteStreamOrder(
                  arg.receiverAddress,
                  arg.superTokenAddress,
                  "0x"
                );
              subOperations.push({
                operation: await framework.host.callAppAction(
                  network.streamSchedulerContractAddress,
                  streamOrder.data!
                ),
                title: "Delete Stream Order",
              });
            }
          }
        }

        const existingFlow = await superToken.getFlow({
          sender: arg.senderAddress,
          receiver: arg.receiverAddress,
          providerOrSigner: arg.signer,
        });

        const flowArg = {
          sender: arg.senderAddress,
          flowRate: arg.flowRateWei,
          receiver: arg.receiverAddress,
          userData: "0x",
          overrides: arg.overrides,
        };
        if (existingFlow.flowRate === "0") {
          subOperations.push({
            operation: await superToken.createFlow(flowArg),
            title: "Create Stream",
          });
        } else {
          if (arg.flowRateWei !== existingFlow.flowRate) {
            subOperations.push({
              operation: await superToken.updateFlow(flowArg),
              title: "Update Stream",
            });
          }
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
          title:
            subOperations.length === 1 ? subOperations[0].title : "Batch Call",
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
