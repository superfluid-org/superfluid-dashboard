import { RpcEndpointBuilder } from "@superfluid-finance/sdk-redux";
import { governanceAbi, governanceAddress, hostAddress } from "@sfpro/sdk/abi/core";
import { Address, erc20Abi } from "viem";
import {
  getActiveFlow,
  Web3FlowInfo,
} from "../../transactions/contractReads";
import { getContractAddress } from "../../transactions/operations";
import { resolvedWagmiClients } from "../../wallet/WagmiManager";
import { superTokenAbi } from "@sfpro/sdk/abi";
import {
  balanceFetcher,
  BalanceQueryParams,
  RealtimeBalance,
  UnderlyingBalance,
} from "./balanceFetcher";
import { NATIVE_ASSET_ADDRESS } from "./tokenTypes";
import { uniq } from "lodash";

declare module "@superfluid-finance/sdk-redux" {
  interface TransactionTitleOverrides {
    "Approve Allowance": true;
    "Claim Tokens": true;
    "Modify Stream": true;
    "Send Transfer": true;
    "Fix Access for Vesting (v1)": true;
    "Fix Access for Vesting (v2)": true;
    "Fix Access for Vesting (v3)": true;
    // Vesting scheduler
    "Approve Vesting Scheduler": true; // Give Stream Scheduler contract delete & update permission, flow rate allowance, token allowance.
    "Create Vesting Schedule": true;
    "Create Batch of Vesting Schedules": true;
    "Delete Vesting Schedule": true;
    "Claim Vesting Schedule": true;
    "Update Vesting Schedule": true;
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
    "Connect to Pool": true;
    "Disconnect from Pool": true;
    "Interface Fee": true;
    "Cancel Distribution Stream": true;

    // TODO: Is there a better name to use?
    "Execute Tranch Update": true;
  }
}

export type { Web3FlowInfo } from "../../transactions/contractReads";

export const adHocRpcEndpoints = {
  endpoints: (builder: RpcEndpointBuilder) => ({
    getActiveFlow: builder.query<
      Web3FlowInfo | null,
      {
        chainId: number;
        tokenAddress: string;
        senderAddress: string;
        receiverAddress: string;
      }
    >({
      queryFn: async (arg) => {
        return {
          data: await getActiveFlow(arg),
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
    underlyingBalances: builder.query<
      { balances: Record<string, string> },
      { chainId: number; accountAddress: string; tokenAddresses: string[] }
    >({
      queryFn: async (arg) => {
        const uniqueAddresses = uniq(arg.tokenAddresses);

        const balancePromises = uniqueAddresses.map((tokenAddress) =>
          balanceFetcher
            .getUnderlyingBalance({
              accountAddress: arg.accountAddress,
              chainId: arg.chainId,
              tokenAddress,
            })
            .then((x) => ({ [tokenAddress]: x.balance }))
        );
        const balances = await Promise.all(balancePromises);

        return {
          data: {
            balances: Object.assign({}, ...balances),
          },
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
        const publicClient = resolvedWagmiClients[arg.chainId]();

        if (arg.tokenAddress === NATIVE_ASSET_ADDRESS) {
          return {
            data: (
              await publicClient.getBalance({
                address: arg.accountAddress as Address,
              })
            ).toString(),
          };
        } else {
          return {
            data: (
              await publicClient.readContract({
                abi: erc20Abi,
                address: arg.tokenAddress as Address,
                functionName: "balanceOf",
                args: [arg.accountAddress as Address],
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
        const publicClient = resolvedWagmiClients[arg.chainId]();
        const [availableBalance, deposit, owedDeposit, timestamp] =
          await publicClient.readContract({
            abi: superTokenAbi,
            address: arg.tokenAddress as Address,
            functionName: "realtimeBalanceOfNow",
            args: [arg.accountAddress as Address],
          });
        return {
          data: {
            availableBalance: availableBalance.toString(),
            deposit: deposit.toString(),
            owedDeposit: owedDeposit.toString(),
            timestampMs: Number(timestamp) * 1000,
          },
        };
      },
    }),
    tokenBuffer: builder.query<string, { chainId: number; token: string }>({
      queryFn: async (arg) => {
        const publicClient = resolvedWagmiClients[arg.chainId]();
        const minBuffer = await publicClient.readContract({
          abi: governanceAbi,
          address: getContractAddress(
            governanceAddress,
            arg.chainId,
            "Superfluid Governance"
          ),
          functionName: "getSuperTokenMinimumDeposit",
          args: [
            getContractAddress(hostAddress, arg.chainId, "Superfluid Host"),
            arg.token as Address,
          ],
        });

        return {
          data: minBuffer.toString(),
        };
      },
      providesTags: (_result, _error, arg) => [
        {
          type: "GENERAL",
          id: arg.chainId, // TODO(KK): Could be made more specific.
        },
      ],
    }),
    isEOA: builder.query<
      boolean | null,
      { chainId: number; accountAddress: string }
    >({
      keepUnusedDataFor: Number.MAX_VALUE,
      queryFn: async ({ chainId, accountAddress }) => {
        const publicClient = resolvedWagmiClients[chainId]();
        try {
          const code = await publicClient.getCode({
            address: accountAddress as Address,
          });
          const isSmartContract = !!code && code.length > 2; // The code is "0x"/undefined when not a smart contract.
          return {
            data: !isSmartContract,
          };
        } catch (e) {
          console.error("Error while checking if account is EOA", e);
          return {
            data: null,
          };
        }
      },
    }),
  }),
};
