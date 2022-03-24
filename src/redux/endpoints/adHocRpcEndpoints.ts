import { ERC20Token } from '@superfluid-finance/sdk-core';
import {
  getFramework,
  TransactionInfo,
  registerNewTransaction,
  getSigner,
  RpcEndpointBuilder,
} from '@superfluid-finance/sdk-redux';

export const adHocRpcEndpoints = {
  endpoints: (builder: RpcEndpointBuilder) => ({
    balanceOf: builder.query<
      string,
      { chainId: number; tokenAddress: string; accountAddress: string }
    >({
      queryFn: async (arg) => {
        const framework = await getFramework(arg.chainId);
        return {
          data: await new ERC20Token(arg.tokenAddress).balanceOf({
            account: arg.accountAddress,
            providerOrSigner: framework.settings.provider,
          }),
        };
      },
    }),
    approve: builder.mutation<
      TransactionInfo,
      { chainId: number; superTokenAddress: string; amountWei: string }
    >({
      queryFn: async (arg, queryApi) => {
        const framework = await getFramework(arg.chainId);
        const signer = await getSigner(arg.chainId);
        const superToken = await framework.loadSuperToken(
          arg.superTokenAddress,
        );

        const transactionResponse = await superToken.underlyingToken
          .approve({
            amount: arg.amountWei,
            receiver: superToken.address,
          })
          .exec(signer);

        await registerNewTransaction(
          arg.chainId,
          transactionResponse.hash,
          true,
          queryApi.dispatch,
        );

        return {
          data: {
            hash: transactionResponse.hash,
            chainId: arg.chainId,
          },
          meta: {
            monitorAddress: await signer.getAddress(),
          },
        };
      },
    }),
  }),
};
