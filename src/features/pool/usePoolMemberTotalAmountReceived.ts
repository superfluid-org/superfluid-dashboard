import { BigNumber, BigNumberish } from "ethers";
import { useMemo } from "react";
import { Address } from "viem";
import { superfluidPoolABI } from "../../generated";
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
  const { data, internal: { dataUpdatedAt } } = useContractReads({
    enabled: Boolean(memberAddress && poolAddress),
    contracts: [
      {
        chainId: chainId,
        address: poolAddress as Address,
        abi: superfluidPoolABI,
        functionName: 'getTotalAmountReceivedByMember',
        args: [memberAddress as Address]
      },
      {
        chainId: chainId,
        address: poolAddress as Address,
        abi: superfluidPoolABI,
        functionName: 'getMemberFlowRate',
        args: [memberAddress as Address]
      }
    ],
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
  }, [getTotalAmountReceivedByMember, getMemberFlowRate])
}