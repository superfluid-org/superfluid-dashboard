import { getUnixTime } from "date-fns";
import { BigNumber } from "ethers";
import { FC, useEffect, useMemo, useState } from "react";
import FlowingBalance from "../token/FlowingBalance";
import { VestingSchedule } from "./types";

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

  const [unixNow, setUnixNow] = useState(getUnixTime(new Date()));

  useEffect(() => {
    let timeout: number | null = null;

    const untilStart = Number(cliffDateUnix || startDateUnix) - unixNow;
    const untilEnd = Number(endDateUnix) - unixNow;

    console.log({ untilStart, untilEnd });

    if (untilStart > 0) {
      timeout = window.setTimeout(
        () => setUnixNow(getUnixTime(new Date())),
        untilStart
      );
    } else if (untilEnd > 0) {
      timeout = window.setTimeout(
        () => setUnixNow(getUnixTime(new Date())),
        untilEnd
      );
    }

    return () => {
      if (timeout !== null) window.clearTimeout(timeout);
    };
  }, [unixNow, startDateUnix, cliffDateUnix, endDateUnix]);

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
