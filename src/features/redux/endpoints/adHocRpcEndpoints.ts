import {
  ERC20Token,
  NativeAssetSuperToken,
  WrapperSuperToken,
} from "@superfluid-finance/sdk-core";
import {
  getFramework,
  TransactionInfo,
  getSigner,
  RpcEndpointBuilder,
  registerNewTransactionAndReturnQueryFnResult,
} from "@superfluid-finance/sdk-redux";
import { NATIVE_ASSET_ADDRESS } from "./adHocSubgraphEndpoints";
import { balanceFetcher, BalanceQueryParams, UnderlyingBalance, RealtimeBalance } from "./balanceFetcher";

declare module "@superfluid-finance/sdk-redux" {
  interface TransactionTitleOverrides {
    "Approve Allowance": true;
  }
}

export const adHocRpcEndpoints = {
  endpoints: (builder: RpcEndpointBuilder) => ({
    underlyingBalance: builder.query<UnderlyingBalance, BalanceQueryParams>({
      queryFn: async (arg) => {
        return {
          data: await balanceFetcher.getUnderlyingBalance(arg),
        };
      },
      providesTags: (_result, _error, arg) => [
        {
          type: "GENERAL",
          id: arg.chainId, // TODO(KK): Could be made more specific.
        },
      ],
    }),
    realtimeBalance: builder.query<RealtimeBalance, BalanceQueryParams>({
      queryFn: async (arg) => {
        return {
          data: await balanceFetcher.getRealtimeBalance(arg),
        };
      },
      providesTags: (_result, _error, arg) => [
        {
          type: "GENERAL",
          id: arg.chainId, // TODO(KK): Could be made more specific.
        },
      ],
    }),
    balance: builder.query<
      string,
      { chainId: number; tokenAddress: string; accountAddress: string }
    >({
      queryFn: async (arg) => {
        const framework = await getFramework(arg.chainId);

        if (arg.tokenAddress === NATIVE_ASSET_ADDRESS) {
          return {
            data: (
              await framework.settings.provider.getBalance(arg.accountAddress)
            ).toString(),
          };
        } else {
          return {
            data: (
              await new ERC20Token(arg.tokenAddress).balanceOf({
                account: arg.accountAddress,
                providerOrSigner: framework.settings.provider,
              })
            ).toString(),
          };
        }
      },
      providesTags: (_result, _error, arg) => [
        {
          type: "GENERAL",
          id: arg.chainId, // TODO(KK): Could be made more specific.
        },
      ],
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
            timestampMs: realtimeBalanceOfNow.timestamp.getTime(),
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
        transactionExtraData?: Record<string, unknown>
      }
    >({
      queryFn: async (arg, queryApi) => {
        const framework = await getFramework(arg.chainId);
        const signer = await getSigner(arg.chainId);
        const superToken = await framework.loadSuperToken(
          arg.superTokenAddress
        );

        if (!(superToken instanceof WrapperSuperToken)) {
          throw new Error(
            "Only wrapped ERC-20 super tokens need to approve their underlying token."
          );
        }

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
          extraData: arg.transactionExtraData,
        });
      },
    }),
  }),
};
