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

interface DoEverythingTogether
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
    streamScheduledEndDate: builder.query<
      number | null,
      GetStreamScheduledEndDate
    >({
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
    scheduleStreamEndDate: builder.mutation<
      TransactionInfo,
      ScheduleStreamEndDate
    >({
      queryFn: async ({ chainId, ...arg }, { dispatch }) => {
        const sdk = getGoerliSdk(arg.signer); // TODO(KK): Get this off of a Network.

        const contractTransaction = await sdk.StreamScheduler.createStreamOrder(
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

        const signerAddress = await arg.signer.getAddress();
        return registerNewTransactionAndReturnQueryFnResult({
          dispatch,
          chainId,
          transactionResponse: contractTransaction,
          waitForConfirmation: !!arg.waitForConfirmation,
          signer: signerAddress,
          extraData: arg.transactionExtraData,
          title: "Schedule Stream End Date",
        });
      },
    }),
    doEverythingTogether: builder.mutation<
      TransactionInfo & { subTransactionTitles: TransactionTitle[] },
      DoEverythingTogether
    >({
      async queryFn({ chainId, ...arg }, { dispatch }) {
        const framework = await getFramework(chainId);
        const superToken = await framework.loadSuperToken(
          arg.superTokenAddress
        );

        const sdk = getGoerliSdk(arg.signer); // TODO(KK): Get this off of a Network.
        const operations: [
          operation: Operation,
          transactionTitle: TransactionTitle
        ][] = [];

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
            if (permissions < 4) {
              operations.push([
                await superToken.updateFlowOperatorPermissions({
                  flowOperator: network.streamSchedulerContractAddress,
                  flowRateAllowance: arg.flowRateAllowance,
                  permissions: permissions + 4, // TODO(KK): Check with protocol guys if this is OK?
                  userData: "0x",
                  overrides: arg.overrides,
                }),
                "Update Stream Scheduler Permissions",
              ]);
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

              operations.push([
                await framework.host.callAppAction(
                  network.streamSchedulerContractAddress,
                  streamOrder.data!
                ),
                "Create Stream Order",
              ]);
            }
          } else {
            if (existingStreamOrder) {
              const streamOrder =
                await sdk.StreamScheduler.populateTransaction.deleteStreamOrder(
                  arg.receiverAddress,
                  arg.superTokenAddress,
                  "0x"
                );

              operations.push([
                await framework.host.callAppAction(
                  network.streamSchedulerContractAddress,
                  streamOrder.data!
                ),
                "Delete Stream Order",
              ]);
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
          operations.push([
            await superToken.createFlow(flowArg),
            "Create Stream",
          ]);
        } else {
          operations.push([
            await superToken.updateFlow(flowArg),
            "Update Stream",
          ]);
        }

        const signerAddress = await arg.signer.getAddress();

        const executable =
          operations.length === 1
            ? operations[0][0]
            : framework.batchCall(operations.map((x) => x[0]));
        const transactionResponse = await executable.exec(arg.signer);

        const subTransactionTitles = operations.map((x) => x[1]);

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
          title: operations.length === 1 ? operations[0][1] : "Batch Call",
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
    streamSchedulerPermissions: builder.query<
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
    updateStreamSchedulerPermissions: builder.mutation<
      TransactionInfo,
      UpdateStreamSchedulerPermissions
    >({
      queryFn: async ({ chainId, ...arg }, { dispatch }) => {
        const framework = await getFramework(chainId);
        const superToken = await framework.loadSuperToken(
          arg.superTokenAddress
        );
        const network = findNetworkByChainId(chainId);
        if (!network?.streamSchedulerContractAddress) {
          throw new Error("Network doesn't support stream scheduler.");
        }

        const transactionResponse = await superToken
          .updateFlowOperatorPermissions({
            flowOperator: network.streamSchedulerContractAddress,
            flowRateAllowance: arg.flowRateAllowance,
            permissions: arg.permissions,
            overrides: arg.overrides,
            userData: arg.userData,
          })
          .exec(arg.signer);

        const signerAddress = await arg.signer.getAddress();
        return registerNewTransactionAndReturnQueryFnResult({
          dispatch,
          chainId,
          transactionResponse,
          waitForConfirmation: !!arg.waitForConfirmation,
          signer: signerAddress,
          extraData: arg.transactionExtraData,
          title: "Update Stream Scheduler Permissions",
        });
      },
    }),
    revokeAllStreamSchedulerPermissions: builder.mutation<
      TransactionInfo,
      RevokeAllStreamSchedulerPermissions
    >({
      queryFn: async ({ chainId, ...arg }, { dispatch }) => {
        const framework = await getFramework(chainId);
        const superToken = await framework.loadSuperToken(
          arg.superTokenAddress
        );
        const network = findNetworkByChainId(chainId);
        if (!network?.streamSchedulerContractAddress) {
          throw new Error("Network doesn't support stream scheduler.");
        }

        const transactionResponse = await superToken
          .revokeFlowOperatorWithFullControl({
            flowOperator: network.streamSchedulerContractAddress,
          })
          .exec(arg.signer);

        const signerAddress = await arg.signer.getAddress();

        return registerNewTransactionAndReturnQueryFnResult({
          dispatch,
          chainId,
          transactionResponse,
          waitForConfirmation: !!arg.waitForConfirmation,
          signer: signerAddress,
          extraData: arg.transactionExtraData,
          title: "Update Stream Scheduler Permissions",
        });
      },
    }),
  }),
};
