import { readContract } from "@wagmi/core";
import { Address, erc20Abi } from "viem";
import { cfaAbi, cfaAddress } from "@sfpro/sdk/abi/core";
import { flowSchedulerAbi } from "@sfpro/sdk/abi/automation";
import { getUnixTime } from "date-fns";
import { wagmiConfig } from "../wallet/WagmiManager";
import { allNetworks, findNetworkOrThrow } from "../network/networks";
import { getContractAddress } from "./operations";

/**
 * viem-based direct-chain reads shared by the wagmi-hook write path (replacing sdk-core's
 * reads that lived inside the RTK mutations). Write-hook preflight uses these directly for
 * fresh chain state; the RTK query endpoints reuse them where caching/tags are wanted.
 */

export async function getFlowOperatorData(arg: {
  chainId: number;
  superTokenAddress: string;
  senderAddress: string;
  flowOperatorAddress: string;
}): Promise<{ permissions: number; flowRateAllowanceWei: bigint }> {
  const [, permissions, flowRateAllowance] = await readContract(wagmiConfig, {
    chainId: arg.chainId,
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
  return readContract(wagmiConfig, {
    chainId: arg.chainId,
    abi: erc20Abi,
    address: arg.tokenAddress as Address,
    functionName: "allowance",
    args: [arg.ownerAddress as Address, arg.spenderAddress as Address],
  });
}

export interface Web3FlowInfo {
  updatedAtTimestamp: number;
  flowRateWei: string;
  depositWei: string;
  owedDepositWei: string;
}

export async function getActiveFlow(arg: {
  chainId: number;
  tokenAddress: string;
  senderAddress: string;
  receiverAddress: string;
}): Promise<Web3FlowInfo | null> {
  const [timestamp, flowRate, deposit, owedDeposit] = await readContract(
    wagmiConfig,
    {
      chainId: arg.chainId,
      abi: cfaAbi,
      address: getContractAddress(cfaAddress, arg.chainId, "CFAv1"),
      functionName: "getFlow",
      args: [
        arg.tokenAddress as Address,
        arg.senderAddress as Address,
        arg.receiverAddress as Address,
      ],
    }
  );
  if (flowRate === 0n) {
    return null;
  }
  return {
    updatedAtTimestamp: Number(timestamp) * 1000,
    depositWei: deposit.toString(),
    flowRateWei: flowRate.toString(),
    owedDepositWei: owedDeposit.toString(),
  };
}

export interface StreamScheduleResponse {
  startDate?: number;
  endDate?: number;
  flowRate?: string;
}

export async function getFlowSchedule(arg: {
  chainId: number;
  superTokenAddress: string;
  senderAddress: string;
  receiverAddress: string;
}): Promise<StreamScheduleResponse> {
  const network = findNetworkOrThrow(allNetworks, arg.chainId);
  const flowSchedulerContractAddress = network.flowSchedulerContractAddress;
  if (!flowSchedulerContractAddress) {
    throw new Error("Flow scheduler not supported on this network");
  }

  const { startDate, endDate, startMaxDelay, flowRate } = await readContract(
    wagmiConfig,
    {
      chainId: arg.chainId,
      abi: flowSchedulerAbi,
      address: flowSchedulerContractAddress as Address,
      functionName: "getFlowSchedule",
      args: [
        arg.superTokenAddress as Address,
        arg.senderAddress as Address,
        arg.receiverAddress as Address,
      ],
    }
  );

  const unixNow = getUnixTime(new Date());

  const isStartExpired = startDate + startMaxDelay <= unixNow;
  const effectiveStartDate = isStartExpired ? undefined : startDate;

  return {
    startDate: effectiveStartDate,
    endDate: endDate ? endDate : undefined,
    flowRate: isStartExpired ? undefined : flowRate.toString(),
  };
}
