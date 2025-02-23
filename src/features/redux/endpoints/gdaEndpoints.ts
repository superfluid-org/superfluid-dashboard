import { Address, Operation } from "@superfluid-finance/sdk-core";
import {
  BaseSuperTokenMutation,
  RpcEndpointBuilder,
  TransactionInfo,
  TransactionTitle,
  getFramework,
  registerNewTransaction,
} from "@superfluid-finance/sdk-redux";

interface ConnectToPool extends BaseSuperTokenMutation {
  poolAddress: Address;
  //   accountAddress: Address;
}

interface DisconnectFromPool extends BaseSuperTokenMutation {
  poolAddress: Address;
  //   accountAddress: Address;
}

interface CancelDistributionStream extends BaseSuperTokenMutation {
  poolAddress: Address;
  senderAddress: Address;
}

export const gdaEndpoints = {
  endpoints: (builder: RpcEndpointBuilder) => ({
    connectToPool: builder.mutation<TransactionInfo, ConnectToPool>({
      queryFn: async (
        {
          chainId,
          superTokenAddress,
          poolAddress,
          overrides,
          signer,
          transactionExtraData,
        },
        { dispatch }
      ) => {
        const framework = await getFramework(chainId);
        const superToken = await framework.loadSuperToken(superTokenAddress);

        const transactionResponse = await superToken
          .connectPool({
            pool: poolAddress,
            overrides,
          })
          .exec(signer);

        const signerAddress = await signer.getAddress();
        await registerNewTransaction({
          transactionResponse,
          chainId,
          dispatch,
          signerAddress,
          title: "Connect to Pool",
          extraData: transactionExtraData,
        });

        return {
          data: {
            chainId,
            hash: transactionResponse.hash,
          },
        };
      },
    }),
    disconnectFromPool: builder.mutation<TransactionInfo, DisconnectFromPool>({
      queryFn: async (
        {
          chainId,
          superTokenAddress,
          poolAddress,
          overrides,
          signer,
          transactionExtraData,
        },
        { dispatch }
      ) => {
        const framework = await getFramework(chainId);
        const superToken = await framework.loadSuperToken(superTokenAddress);

        const transactionResponse = await superToken
          .disconnectPool({
            pool: poolAddress,
            overrides,
          })
          .exec(signer);

        const signerAddress = await signer.getAddress();
        await registerNewTransaction({
          transactionResponse,
          chainId,
          dispatch,
          signerAddress,
          title: "Disconnect from Pool",
          extraData: transactionExtraData,
        });

        return {
          data: {
            chainId,
            hash: transactionResponse.hash,
          },
        };
      },
    }),
    cancelDistributionStream: builder.mutation<
      TransactionInfo & { subTransactionTitles: TransactionTitle[] },
      CancelDistributionStream
    >({
      async queryFn({ chainId, ...arg }, { dispatch }) {
        const framework = await getFramework(chainId);

        const subOperations: {
          operation: Operation;
          title: TransactionTitle;
        }[] = [];

        const superToken = await framework.loadSuperToken(arg.superTokenAddress);

        subOperations.push({
          operation: await superToken.distributeFlow({
            pool: arg.poolAddress,
            overrides: arg.overrides,
            from: arg.senderAddress,
            requestedFlowRate: "0"
          }),
          title: "Cancel Distribution Stream",
        });

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
          title: "Cancel Distribution Stream",
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
