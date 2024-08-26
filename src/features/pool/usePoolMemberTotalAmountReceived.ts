import { BigNumber, BigNumberish } from "ethers";
import { useMemo } from "react";
import { Address } from "viem";
import { superfluidPoolAbi } from "../../generated";
import { useContractReads } from "wagmi";

export type PoolMemberInput = {
  units: BigNumberish;
  poolTotalAmountDistributedUntilUpdatedAt: BigNumberish;
  totalAmountReceivedUntilUpdatedAt: BigNumberish;
};

export type PoolInput = {
  flowRate: BigNumberish;
  totalAmountDistributedUntilUpdatedAt: BigNumberish;
  totalUnits: BigNumberish;
  updatedAtTimestamp: number;
};

export const useTotalAmountReceivedFromPoolMember = (
  chainId: number,
  memberAddress?: string | Address,
  poolAddress?: string | Address
) => {
  const { data, dataUpdatedAt } = useContractReads({
    contracts: [
      {
        chainId: chainId,
        address: poolAddress as Address,
        abi: superfluidPoolAbi,
        functionName: 'getTotalAmountReceivedByMember',
        args: [memberAddress as Address]
      },
      {
        chainId: chainId,
        address: poolAddress as Address,
        abi: superfluidPoolAbi,
        functionName: 'getMemberFlowRate',
        args: [memberAddress as Address]
      }
    ],
    query: {
      enabled: Boolean(memberAddress && poolAddress),
    }
  })

  const [getTotalAmountReceivedByMember, getMemberFlowRate] = data ?? []

  return useMemo(() => {
    if (
      getTotalAmountReceivedByMember?.status === 'success' &&
      getMemberFlowRate?.status === 'success'
    ) {
      return {
        timestamp: Math.round(dataUpdatedAt / 1000),
        memberCurrentTotalAmountReceived: BigNumber.from(
          getTotalAmountReceivedByMember.result.toString()
        ),
        memberFlowRate: BigNumber.from(getMemberFlowRate.result.toString())
      }
    } else {
      return null
    }
  }, [getTotalAmountReceivedByMember, getMemberFlowRate, dataUpdatedAt])
}