import { Address } from "@superfluid-finance/sdk-core";
import {
  BaseSuperTokenMutation,
  RpcEndpointBuilder,
  TransactionInfo,
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
  }),
};
