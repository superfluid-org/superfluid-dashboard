import {
  ERC20Token
} from "@superfluid-finance/sdk-core";
import {
  getFramework,
  TransactionInfo,
  getSigner,
  RpcEndpointBuilder,
  registerNewTransactionAndReturnQueryFnResult,
} from "@superfluid-finance/sdk-redux";

declare module "@superfluid-finance/sdk-redux" {
  interface TransactionTitleOverrides {
    "Approve Allowance": true;
  }
}

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
    realtimeBalanceOfNow: builder.query<
    {
      availableBalance: string;
      deposit: string;
      owedDeposit: string;
      timestampMs: number;
    },
      { chainId: number; tokenAddress: string; accountAddress: string }
    >({
      queryFn: async (arg) => {
        const framework = await getFramework(arg.chainId);
        const superToken = await framework.loadSuperToken(arg.tokenAddress);
        const realtimeBalanceOfNow = await superToken.realtimeBalanceOf({
          account: arg.accountAddress,
          providerOrSigner: framework.settings.provider,
          timestamp: Date.now(), // No need to worry about timezones here.
        });
        return {
          data: {
            availableBalance: realtimeBalanceOfNow.availableBalance,
            deposit: realtimeBalanceOfNow.deposit,
            owedDeposit: realtimeBalanceOfNow.owedDeposit,
            timestampMs: realtimeBalanceOfNow.timestamp.getTime()
          },
        };
      },
    }),
    approve: builder.mutation<
      TransactionInfo,
      {
        chainId: number;
        superTokenAddress: string;
        amountWei: string;
        waitForConfirmation?: boolean;
      }
    >({
      queryFn: async (arg, queryApi) => {
        const framework = await getFramework(arg.chainId);
        const signer = await getSigner(arg.chainId);
        const superToken = await framework.loadSuperToken(
          arg.superTokenAddress
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
          signer: await signer.getAddress(),
          waitForConfirmation: !!arg.waitForConfirmation,
          dispatch: queryApi.dispatch,
          title: "Approve Allowance",
          extraData: undefined,
        });
      },
    }),
  }),
};
