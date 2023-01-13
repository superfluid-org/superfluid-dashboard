import { BigNumber } from "ethers";
import { FC, useMemo } from "react";
import FlowingBalance from "../token/FlowingBalance";
import { VestingSchedule } from "./types";
import useUnixDateWithVestingTriggers from "./useUnixDateWithVestingTriggers";

interface VestedBalanceProps {
  vestingSchedule: VestingSchedule;
}

const VestedBalance: FC<VestedBalanceProps> = ({ vestingSchedule }) => {
  const {
    startDate: startDateUnix,
    cliffDate: cliffDateUnix,
    endDate: endDateUnix,
    cliffAmount,
    flowRate,
  } = vestingSchedule;

  const unixNow = useUnixDateWithVestingTriggers(
    startDateUnix,
    endDateUnix,
    cliffDateUnix
  );

  const currentFlowRate = useMemo(
    () =>
      unixNow > Number(cliffDateUnix || startDateUnix) &&
      unixNow < Number(endDateUnix)
        ? flowRate
        : "0",
    [cliffDateUnix, startDateUnix, endDateUnix, unixNow, flowRate]
  );

  const currentBalance = useMemo(() => {
    const streamStartUnix = Number(cliffDateUnix || startDateUnix);
    const streamedSeconds = Math.min(
      unixNow - streamStartUnix,
      Number(endDateUnix) - streamStartUnix
    );

    if (streamedSeconds < 0) return "0";

    return BigNumber.from(flowRate)
      .mul(streamedSeconds)
      .add(cliffAmount || "0")
      .toString();
  }, [
    cliffDateUnix,
    startDateUnix,
    endDateUnix,
    unixNow,
    cliffAmount,
    flowRate,
  ]);

  return (
    <FlowingBalance
      balance={currentBalance}
      flowRate={currentFlowRate}
      balanceTimestamp={unixNow}
      disableRoundingIndicator
    />
  );
};

export default VestedBalance;
