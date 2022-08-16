import { BigNumber } from "ethers";
import { useCallback } from "react";
import {
  BIG_NUMBER_ZERO,
  calculateBufferAmount,
  calculateMaybeCriticalAtTimestamp,
} from "../../utils/tokenUtils";
import { Network } from "../network/networks";
import { Web3FlowInfo } from "../redux/endpoints/adHocRpcEndpoints";
import { RealtimeBalance } from "../redux/endpoints/balanceFetcher";
import {
  calculateTotalAmountWei,
  FlowRateWei,
  UnitOfTime,
} from "./FlowRateInput";

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

// TODO(KK): Memoize in a way that multiple components could invoke it and not calc twice?
export default function useCalculateBufferInfo() {
  return useCallback(
    (
      network: Network,
      realtimeBalance: RealtimeBalance,
      activeFlow: Web3FlowInfo | null,
      flowRate: FlowRateWei
    ) => {
      const newBufferAmount = calculateBufferAmount(network, flowRate);

      const oldBufferAmount = activeFlow
        ? calculateBufferAmount(network, {
            amountWei: activeFlow.flowRateWei,
            unitOfTime: UnitOfTime.Second,
          })
        : BigNumber.from(0);

      const bufferDelta = newBufferAmount.sub(oldBufferAmount);

      const balanceAfterBuffer = BigNumber.from(
        realtimeBalance?.balance ?? 0
      ).sub(bufferDelta);

      const newFlowRate = calculateTotalAmountWei({
        amountWei: flowRate.amountWei,
        unitOfTime: flowRate.unitOfTime,
      });

      const flowRateDelta = activeFlow
        ? newFlowRate.sub(BigNumber.from(activeFlow.flowRateWei))
        : newFlowRate;

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
        newFlowRate,
        flowRateDelta,
        newTotalFlowRate,
        oldDateWhenBalanceCritical,
        newDateWhenBalanceCritical,
      };
    },
    []
  );
}
