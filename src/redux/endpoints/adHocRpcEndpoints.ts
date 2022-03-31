import { SpeakerGroup } from '@mui/icons-material';
import { ERC20Token } from '@superfluid-finance/sdk-core';
import {
  getFramework,
  TransactionInfo,
  getSigner,
  RpcEndpointBuilder,
  registerNewTransactionAndReturnQueryFnResult,
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
      { chainId: number; superTokenAddress: string; amountWei: string, waitForcConfirmation?: boolean }
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

        return await registerNewTransactionAndReturnQueryFnResult({
          transactionResponse,
          chainId: arg.chainId,
          waitForConfirmation: !!arg.waitForcConfirmation,
          dispatch: queryApi.dispatch,
          key: "APPROVE"
        });
      },
    }),
  }),
};
