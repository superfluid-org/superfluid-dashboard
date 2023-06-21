import {
  ERC20Token,
  WrapperSuperToken,
} from "@superfluid-finance/sdk-core";
import {
  getFramework,
  registerNewTransactionAndReturnQueryFnResult,
  RpcEndpointBuilder,
  TransactionInfo,
  TransactionTitle,
} from "@superfluid-finance/sdk-redux";
import { WriteContractPreparedArgs, writeContract } from "@wagmi/core";
import { Overrides, Signer } from "ethers";
import {
  balanceFetcher,
  BalanceQueryParams,
  RealtimeBalance,
  UnderlyingBalance,
} from "./balanceFetcher";
import { NATIVE_ASSET_ADDRESS } from "./tokenTypes";

declare module "@superfluid-finance/sdk-redux" {
  interface TransactionTitleOverrides {
    "Approve Allowance": true;
    "Claim Tokens": true;
    "Modify Stream": true;
    "Fix Access for Vesting": true;
    // Vesting scheduler
    "Approve Vesting Scheduler": true; // Give Stream Scheduler contract delete & update permission, flow rate allowance, token allowance.
    "Create Vesting Schedule": true;
    "Delete Vesting Schedule": true;
    // Scheduled streams
    "Schedule Stream": true;
    "Approve Stream Scheduler": true; // Give Stream Scheduler contract create & delete permissions, flow rate allowance.
    "Create Schedule": true;
    "Modify Schedule": true;
    "Delete Schedule": true;
    "Enable Auto-Wrap": true;
    "Revoke Token Allowance": true;
    "Revoke Flow Operator": true;
    "Revoke Access": true;
    "Modify Permissions & Allowances": true;
    "Update Token Allowance": true;
    "Update Flow Operator Permissions": true;
    "Disable Auto-Wrap": true;
  }
}

export interface Web3FlowInfo {
  updatedAtTimestamp: number;
  flowRateWei: string;
  depositWei: string;
  owedDepositWei: string;
}

const writeContractEndpoint = (builder: RpcEndpointBuilder) =>
  builder.mutation<
    TransactionInfo,
    {
      signer: Signer;
      config: WriteContractPreparedArgs<unknown[], string> & {
        chainId: number;
      };
      transactionExtraData?: Record<string, unknown>;
      transactionTitle: TransactionTitle,
    }
  >({
    queryFn: async ({ signer, config, transactionTitle, transactionExtraData }, { dispatch }) => {
      const result = await writeContract(config);
      return registerNewTransactionAndReturnQueryFnResult({
        dispatch,
        signerAddress: await signer.getAddress(),
        chainId: config.chainId,
        title: transactionTitle,
        transactionResponse: {
          chainId: config.chainId,
          ...result
        },
        extraData: transactionExtraData,
      });
    },
  });

export const adHocRpcEndpoints = {
  endpoints: (builder: RpcEndpointBuilder) => ({
    writeContract: writeContractEndpoint(builder),
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
          signerAddress: await arg.signer.getAddress(),
          dispatch: queryApi.dispatch,
          title: "Approve Allowance",
          extraData: arg.transactionExtraData,
        });
      },
    }),
    tokenBuffer: builder.query<string, { chainId: number; token: string }>({
      queryFn: async (arg) => {
        const framework = await getFramework(arg.chainId);
        const minBuffer = await framework.governance.getMinimumDeposit({
          token: arg.token,
          providerOrSigner: framework.settings.provider,
        });

        return {
          data: minBuffer,
        };
      },
      providesTags: (_result, _error, arg) => [
        {
          type: "GENERAL",
          id: arg.chainId, // TODO(KK): Could be made more specific.
        },
      ],
    }),
    isEOA: builder.query<boolean | null, { chainId: number; accountAddress: string }>({
      keepUnusedDataFor: Number.MAX_VALUE,
      queryFn: async ({ chainId, accountAddress }) => {
        const framework = await getFramework(chainId);
        try {
          const code = await framework.settings.provider.getCode(
            accountAddress
          );
          const isSmartContract = code.length > 2; // The code is "0x" when not a smart contract.
          return {
            data: !isSmartContract,
          };
        } catch (e) {
          console.error("Error while checking if account is EOA", e);
          return {
            data: null
          };
        }
      },
    }),
  }),
};
