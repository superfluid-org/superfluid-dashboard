import { NATIVE_ASSET_ADDRESS } from "./tokenTypes";
import { resolvedWagmiClients } from "../../wallet/WagmiManager";
import {
  constantFlowAgreementV1Abi,
  constantFlowAgreementV1Address,
  erc20Abi,
  generalDistributionAgreementV1Abi,
  generalDistributionAgreementV1Address,
  superTokenAbi,
} from "../../../generated";
import { allNetworks, findNetworkOrThrow } from "../../network/networks";

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
    const publicClient = resolvedWagmiClients[arg.chainId]();

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
            abi: erc20Abi,
            address: arg.tokenAddress as `0x${string}`,
            functionName: "balanceOf",
            args: [arg.accountAddress as `0x${string}`],
          })
          .then((x) => x.toString()),
      };
    }
  },
  async getRealtimeBalance(arg: BalanceQueryParams): Promise<RealtimeBalance> {
    const publicClient = resolvedWagmiClients[arg.chainId]();
    const network = findNetworkOrThrow(allNetworks, arg.chainId);

    const [realtimeBalanceOfNow, cfaflowRate, gdaFlowRate] = await Promise.all([
      publicClient.readContract({
        abi: superTokenAbi,
        address: arg.tokenAddress as `0x${string}`,
        functionName: "realtimeBalanceOfNow",
        args: [arg.accountAddress as `0x${string}`],
      }),
      publicClient.readContract({
        abi: constantFlowAgreementV1Abi,
        address:
          constantFlowAgreementV1Address[
            arg.chainId as keyof typeof constantFlowAgreementV1Address
          ],
        functionName: "getNetFlow",
        args: [
          arg.tokenAddress as `0x${string}`,
          arg.accountAddress as `0x${string}`,
        ],
      }),
      network.supportsGDA
        ? publicClient.readContract({
            abi: generalDistributionAgreementV1Abi,
            address:
              generalDistributionAgreementV1Address[
                arg.chainId as keyof typeof generalDistributionAgreementV1Address
              ],
            functionName: "getNetFlow",
            args: [
              arg.tokenAddress as `0x${string}`,
              arg.accountAddress as `0x${string}`,
            ],
          })
        : Promise.resolve(null),
    ]);

    const flowRate = cfaflowRate + (gdaFlowRate ?? 0n);

    const [balance, _deposit, _owedDeposit, balanceTimestamp] =
      realtimeBalanceOfNow;

    return {
      balance: balance.toString(),
      balanceTimestamp: Number(balanceTimestamp),
      flowRate: flowRate.toString(),
    };
  },
};
