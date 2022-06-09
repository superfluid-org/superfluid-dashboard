import { BigNumber } from "ethers";
import { useCallback } from "react";
import { calculateMaybeCriticalAtTimestamp } from "../../utils/tokenUtils";
import { Network } from "../network/networks";
import { Web3FlowInfo } from "../redux/endpoints/adHocRpcEndpoints";
import { RealtimeBalance } from "../redux/endpoints/balanceFetcher";
import {
  calculateTotalAmountWei,
  FlowRateWei,
  UnitOfTime,
} from "./FlowRateInput";

const calculateBufferAmount = (params: {
  flowRateWithTime: FlowRateWei;
  network: Network;
}): BigNumber => {
  const { flowRateWithTime, network } = params;

  const bufferAmount = calculateTotalAmountWei(flowRateWithTime)
    .mul(network.bufferTimeInMinutes)
    .mul(60);

  return bufferAmount;
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
      const newBufferAmount = calculateBufferAmount({
        network,
        flowRateWithTime: flowRate,
      });

      const oldBufferAmount = activeFlow
        ? calculateBufferAmount({
            network,
            flowRateWithTime: {
              amountWei: activeFlow.flowRateWei,
              unitOfTime: UnitOfTime.Second,
            },
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

      const oldDateWhenBalanceCritical =
        realtimeBalance && newTotalFlowRate
          ? newTotalFlowRate.isNegative()
            ? new Date(
                calculateMaybeCriticalAtTimestamp({
                  balanceUntilUpdatedAtWei: realtimeBalance.balance.toString(),
                  updatedAtTimestamp: realtimeBalance.balanceTimestamp,
                  totalNetFlowRateWei: newTotalFlowRate.toString(),
                })
                  .mul(1000)
                  .toNumber()
              )
            : undefined
          : undefined;

      const newDateWhenBalanceCritical =
        realtimeBalance && newTotalFlowRate && flowRateDelta
          ? newTotalFlowRate.isNegative()
            ? new Date(
                calculateMaybeCriticalAtTimestamp({
                  balanceUntilUpdatedAtWei: realtimeBalance.balance.toString(),
                  updatedAtTimestamp: realtimeBalance.balanceTimestamp,
                  totalNetFlowRateWei: BigNumber.from(realtimeBalance.flowRate)
                    .sub(flowRateDelta)
                    .toString(),
                })
                  .mul(1000)
                  .toNumber()
              )
            : undefined
          : undefined;

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