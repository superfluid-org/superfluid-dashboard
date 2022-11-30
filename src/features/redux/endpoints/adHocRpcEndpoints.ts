import { ERC20Token, WrapperSuperToken } from "@superfluid-finance/sdk-core";
import {
  getFramework,
  TransactionInfo,
  RpcEndpointBuilder,
  registerNewTransactionAndReturnQueryFnResult,
} from "@superfluid-finance/sdk-redux";
import { NATIVE_ASSET_ADDRESS } from "./tokenTypes";
import {
  balanceFetcher,
  BalanceQueryParams,
  UnderlyingBalance,
  RealtimeBalance,
} from "./balanceFetcher";
import { Overrides, Signer } from "ethers";

declare module "@superfluid-finance/sdk-redux" {
  interface TransactionTitleOverrides {
    "Approve Allowance": true;
    "Claim Tokens": true;
    "Approve Scheduler for End Date": true; // Give Stream Scheduler contract delete permission.
    "Approve Vesting Scheduler": true; // Give Stream Scheduler contract delete & update permission.
    "Schedule Stream End Date": true;
    "Remove Stream End Date": true;
    "Send Closed-Ended Stream": true;
    "Modify Stream": true;
    "Create Vesting Schedule": true;
    "Delete Vesting Schedule": true;
  }
}

export interface Web3FlowInfo {
  updatedAtTimestamp: number;
  flowRateWei: string;
  depositWei: string;
  owedDepositWei: string;
}

export const adHocRpcEndpoints = {
  endpoints: (builder: RpcEndpointBuilder) => ({
    getActiveFlow: builder.query<
      // TODO(KK): Create equivalent endpoint in the SDK
      Web3FlowInfo | null,
      {
        chainId: number;
        tokenAddress: string;
        senderAddress: string;
        receiverAddress: string;
      }
    >({
      queryFn: async (arg) => {
        const framework = await getFramework(arg.chainId);
        const token = await framework.loadSuperToken(arg.tokenAddress);
        const result: Web3FlowInfo = await token
          .getFlow({
            sender: arg.senderAddress,
            receiver: arg.receiverAddress,
            providerOrSigner: framework.settings.provider,
          })
          .then((x) => ({
            updatedAtTimestamp: x.timestamp.getTime(),
            depositWei: x.deposit,
            flowRateWei: x.flowRate,
            owedDepositWei: x.owedDeposit,
          }));
        return {
          data: result.flowRateWei !== "0" ? result : null,
        };
      },
      providesTags: (_result, _error, arg) => [
        {
          type: "GENERAL",
          id: arg.chainId, // TODO(KK): Could be made more specific.
        },
      ],
    }),
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
        transactionExtraData?: Record<string, unknown>;
        signer: Signer;
        overrides: Overrides;
      }
    >({
      queryFn: async (arg, queryApi) => {
        const framework = await getFramework(arg.chainId);
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
            overrides: arg.overrides,
          })
          .exec(arg.signer);

        return await registerNewTransactionAndReturnQueryFnResult({
          transactionResponse,
          chainId: arg.chainId,
          signer: await arg.signer.getAddress(),
          waitForConfirmation: !!arg.waitForConfirmation,
          dispatch: queryApi.dispatch,
          title: "Approve Allowance",
          extraData: arg.transactionExtraData,
        });
      },
    }),
  }),
};
