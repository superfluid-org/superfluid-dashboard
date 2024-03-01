import { BigNumber, BigNumberish } from "ethers";
import { useMemo } from "react";

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

export const usePoolMemberTotalAmountReceived = (
  member: PoolMemberInput | null | undefined,
  pool: PoolInput | null | undefined
) => {
  return useMemo(() => {
    if (member && pool) {
      return getPoolMemberTotalAmountReceived(member, pool);
    }
  }, [member, pool]);
};

export const getPoolMemberTotalAmountReceived = (
  member: PoolMemberInput,
  pool: PoolInput
): {
  memberCurrentTotalAmountReceived: BigNumber;
  memberFlowRate: BigNumber;
  timestamp: number;
} => {
  const currentTimestamp = Math.round(Date.now() / 1000);
  const memberUnits = BigNumber.from(member.units);
  const poolUnits = BigNumber.from(pool.totalUnits);

  if (memberUnits.isZero()) {
    return {
      memberCurrentTotalAmountReceived: BigNumber.from(
        member.totalAmountReceivedUntilUpdatedAt
      ),
      memberFlowRate: BigNumber.from(0),
      timestamp: currentTimestamp,
    };
  }

  const poolCurrentTotalAmountDistributedDelta = BigNumber.from(
    pool.flowRate
  ).mul(currentTimestamp - pool.updatedAtTimestamp);

  const poolCurrentTotalAmountDistributed = BigNumber.from(
    pool.totalAmountDistributedUntilUpdatedAt
  ).add(poolCurrentTotalAmountDistributedDelta);

  const memberCurrentTotalAmountReceivedDelta =
    poolCurrentTotalAmountDistributed
      .sub(member.poolTotalAmountDistributedUntilUpdatedAt)
      .mul(memberUnits)
      .div(poolUnits);

  const memberCurrentTotalAmountReceived = BigNumber.from(
    member.totalAmountReceivedUntilUpdatedAt
  ).add(memberCurrentTotalAmountReceivedDelta);

  const memberFlowRate = BigNumber.from(pool.flowRate)
    .mul(memberUnits)
    .div(poolUnits);

  return {
    memberCurrentTotalAmountReceived,
    memberFlowRate: memberFlowRate,
    timestamp: currentTimestamp,
  };
};
