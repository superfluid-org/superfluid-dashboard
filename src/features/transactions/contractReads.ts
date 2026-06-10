import { Address, erc20Abi } from "viem";
import { cfaAbi, cfaAddress } from "@sfpro/sdk/abi/core";
import { resolvedWagmiClients } from "../wallet/WagmiManager";
import { getContractAddress } from "./operations";

/**
 * viem-based direct-chain reads shared by the wagmi-hook write path (replacing sdk-core's
 * `superToken.getFlowOperatorData` / `allowance` reads that lived inside the RTK mutations).
 */

export async function getFlowOperatorData(arg: {
  chainId: number;
  superTokenAddress: string;
  senderAddress: string;
  flowOperatorAddress: string;
}): Promise<{ permissions: number; flowRateAllowanceWei: bigint }> {
  const publicClient = resolvedWagmiClients[arg.chainId]();
  const [, permissions, flowRateAllowance] = await publicClient.readContract({
    abi: cfaAbi,
    address: getContractAddress(cfaAddress, arg.chainId, "CFAv1"),
    functionName: "getFlowOperatorData",
    args: [
      arg.superTokenAddress as Address,
      arg.senderAddress as Address,
      arg.flowOperatorAddress as Address,
    ],
  });
  return {
    permissions: Number(permissions),
    flowRateAllowanceWei: flowRateAllowance,
  };
}

export async function getErc20Allowance(arg: {
  chainId: number;
  tokenAddress: string;
  ownerAddress: string;
  spenderAddress: string;
}): Promise<bigint> {
  const publicClient = resolvedWagmiClients[arg.chainId]();
  return publicClient.readContract({
    abi: erc20Abi,
    address: arg.tokenAddress as Address,
    functionName: "allowance",
    args: [arg.ownerAddress as Address, arg.spenderAddress as Address],
  });
}
