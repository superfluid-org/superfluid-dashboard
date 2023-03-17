import { BigNumber } from "ethers";
import { useCallback } from "react";
import {
  BIG_NUMBER_ZERO,
  calculateBufferAmount,
  calculateMaybeCriticalAtTimestamp,
} from "../../utils/tokenUtils";
import { Network } from "../network/networks";
import { RealtimeBalance } from "../redux/endpoints/balanceFetcher";
import { ScheduledFlowRate } from "./FlowRateInput";

const calculateDateWhenBalanceCritical = (
  realtimeBalance?: RealtimeBalance,
  totalFlowRate?: BigNumber
) => {
  if (!realtimeBalance || !totalFlowRate || !totalFlowRate.isNegative()) {
    return undefined;
  }

  const criticalAtTimestamp = calculateMaybeCriticalAtTimestamp({
    balanceUntilUpdatedAtWei: realtimeBalance.balance,
    updatedAtTimestamp: realtimeBalance.balanceTimestamp,
    totalNetFlowRateWei: totalFlowRate,
  });

  if (criticalAtTimestamp.lte(BIG_NUMBER_ZERO)) return undefined;

  return new Date(criticalAtTimestamp.mul(1000).toNumber());
};

// TODO(MK): Move token buffer calculation to a hook instead of having it in callback func
// TODO(KK): Memoize in a way that multiple components could invoke it and not calc twice?
export default function useCalculateBufferInfo() {
  return useCallback(
    (
      network: Network,
      realtimeBalance: RealtimeBalance,
      existingScheduledFlowRate: ScheduledFlowRate | null,
      scheduledFlowRate: ScheduledFlowRate,
      tokenBuffer: string
    ) => {
      const newBufferAmount = calculateBufferAmount(
        network,
        scheduledFlowRate.flowRate,
        tokenBuffer
      );

      const oldBufferAmount = existingScheduledFlowRate
        ? calculateBufferAmount(
            network,
            existingScheduledFlowRate.flowRate,
            tokenBuffer
          )
        : BigNumber.from(0);

      const bufferDelta = newBufferAmount.sub(oldBufferAmount);

      const balanceAfterBuffer = BigNumber.from(
        realtimeBalance?.balance ?? 0
      ).sub(bufferDelta);

      const flowRateDelta = existingScheduledFlowRate
        ? BigNumber.from(scheduledFlowRate.flowRate).sub(
            BigNumber.from(existingScheduledFlowRate.flowRate)
          )
        : scheduledFlowRate.flowRate;

      const newTotalFlowRate =
        flowRateDelta && realtimeBalance
          ? BigNumber.from(realtimeBalance.flowRate).sub(flowRateDelta)
          : undefined;

      const oldDateWhenBalanceCritical = calculateDateWhenBalanceCritical(
        realtimeBalance,
        BigNumber.from(realtimeBalance.flowRate)
      );

      const newDateWhenBalanceCritical = calculateDateWhenBalanceCritical(
        realtimeBalance,
        realtimeBalance && flowRateDelta
          ? BigNumber.from(realtimeBalance.flowRate).sub(flowRateDelta)
          : undefined
      );

      return {
        newBufferAmount,
        oldBufferAmount,
        bufferDelta,
        balanceAfterBuffer,
        newFlowRate: scheduledFlowRate.flowRate,
        flowRateDelta,
        newTotalFlowRate,
        oldDateWhenBalanceCritical,
        newDateWhenBalanceCritical,
      };
    },
    []
  );
}
