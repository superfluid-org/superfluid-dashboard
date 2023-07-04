import { NATIVE_ASSET_ADDRESS } from "./tokenTypes";
import { wagmiPublicClient } from "../../wallet/WagmiManager";
import {
  constantFlowAgreementV1ABI,
  constantFlowAgreementV1Address,
  erc20ABI,
  superTokenABI,
} from "../../../generated";

// NOTE: We are using viem's PublicClient here and we're assuming automatic batching (multicall) is turned on: https://viem.sh/docs/clients/public.html#batch-multicall-optional

export type UnderlyingBalance = {
  balance: string;
};

export type RealtimeBalance = {
  balance: string;
  balanceTimestamp: number;
  flowRate: string;
};

export type BalanceQueryParams = {
  chainId: number;
  tokenAddress: string;
  accountAddress: string;
};

export const balanceFetcher = {
  async getUnderlyingBalance(
    arg: BalanceQueryParams
  ): Promise<UnderlyingBalance> {
    const publicClient = wagmiPublicClient({ chainId: arg.chainId });

    if (arg.tokenAddress === NATIVE_ASSET_ADDRESS) {
      return {
        balance: await publicClient
          .getBalance({ address: arg.accountAddress as `0x${string}` })
          .then((x) => x.toString()),
      };
    } else {
      return {
        balance: await publicClient
          .readContract({
            abi: erc20ABI,
            address: arg.tokenAddress as `0x${string}`,
            functionName: "balanceOf",
            args: [arg.accountAddress as `0x${string}`],
          })
          .then((x) => x.toString()),
      };
    }
  },
  async getRealtimeBalance(arg: BalanceQueryParams): Promise<RealtimeBalance> {
    const publicClient = wagmiPublicClient({ chainId: arg.chainId });

    const [realtimeBalanceOfNow, flowRate] = await Promise.all([
      publicClient.readContract({
        abi: superTokenABI,
        address: arg.tokenAddress as `0x${string}`,
        functionName: "realtimeBalanceOfNow",
        args: [arg.accountAddress as `0x${string}`],
      }),
      publicClient.readContract({
        abi: constantFlowAgreementV1ABI,
        address: constantFlowAgreementV1Address[arg.chainId as keyof typeof constantFlowAgreementV1Address],
        functionName: "getNetFlow",
        args: [
          arg.tokenAddress as `0x${string}`,
          arg.accountAddress as `0x${string}`,
        ],
      }),
    ]);

    const [balance, _deposit, _owedDeposit, balanceTimestamp] =
      realtimeBalanceOfNow;

    return {
      balance: balance.toString(),
      balanceTimestamp: Number(balanceTimestamp),
      flowRate: flowRate.toString(),
    };
  },
};
