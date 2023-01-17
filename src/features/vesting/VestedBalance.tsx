import { BigNumber } from "ethers";
import { FC, PropsWithChildren, useMemo } from "react";
import FlowingBalance from "../token/FlowingBalance";
import { VestingSchedule } from "./types";
import useUnixDateWithVestingTriggers from "./useUnixDateWithVestingTriggers";

interface VestedBalanceProps extends PropsWithChildren {
  vestingSchedule: VestingSchedule;
}

const VestedBalance: FC<VestedBalanceProps> = ({
  children,
  vestingSchedule,
}) => {
  const {
    cliffAndFlowDate: cliffAndFlowDateUnix,
    endDate: endDateUnix,
    cliffAmount,
    flowRate,
    startDate,
    cliffDate,
  } = vestingSchedule;

  const unixNow = useUnixDateWithVestingTriggers(
    cliffAndFlowDateUnix,
    endDateUnix
  );
  console.log({ cliffAndFlowDateUnix, startDate, cliffDate });
  const currentFlowRate = useMemo(
    () =>
      unixNow > Number(cliffAndFlowDateUnix) && unixNow < Number(endDateUnix)
        ? flowRate
        : "0",
    [cliffAndFlowDateUnix, endDateUnix, unixNow, flowRate]
  );

  const currentBalance = useMemo(() => {
    const streamStartUnix = Number(cliffAndFlowDateUnix);
    const streamedSeconds = Math.min(
      unixNow - streamStartUnix,
      Number(endDateUnix) - streamStartUnix
    );

    if (streamedSeconds < 0) return "0";

    return BigNumber.from(flowRate)
      .mul(streamedSeconds)
      .add(cliffAmount || "0")
      .toString();
  }, [cliffAndFlowDateUnix, endDateUnix, unixNow, cliffAmount, flowRate]);

  return (
    <>
      <FlowingBalance
        balance={currentBalance}
        flowRate={currentFlowRate}
        balanceTimestamp={unixNow}
        disableRoundingIndicator
      />
      {children}
    </>
  );
};

export default VestedBalance;
