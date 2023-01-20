import { getUnixTime } from "date-fns";
import { BigNumber } from "ethers";
import { FC, PropsWithChildren, useMemo } from "react";
import FlowingBalance from "../token/FlowingBalance";
import { VestingSchedule } from "./types";

interface VestedBalanceProps extends PropsWithChildren {
  vestingSchedule: VestingSchedule;
}

const VestedBalance: FC<VestedBalanceProps> = ({
  children,
  vestingSchedule,
}) => {
  const {
    cliffAndFlowDate,
    endDate,
    cliffAndFlowExecutedAt,
    endExecutedAt,
    cliffAmount,
    flowRate,
  } = vestingSchedule;

  const balanceAtLastEvent = useMemo(() => {
    if (endExecutedAt) {
      const secondsStreamed =
        Number(Math.max(Number(endExecutedAt), Number(endDate))) -
        Number(cliffAndFlowDate);

      return BigNumber.from(secondsStreamed)
        .mul(flowRate)
        .add(cliffAmount || 0)
        .toString();
    } else if (cliffAndFlowExecutedAt) {
      return BigNumber.from(cliffAmount || 0).toString();
    }

    return "0";
  }, [
    cliffAmount,
    flowRate,
    cliffAndFlowDate,
    cliffAndFlowExecutedAt,
    endDate,
    endExecutedAt,
  ]);

  const lastEventTimestamp = useMemo(() => {
    // Fallback is pretty random because we are showing static zero balance anyway.
    if (endExecutedAt) {
      return Number(endExecutedAt);
    } else if (cliffAndFlowExecutedAt) {
      return Number(cliffAndFlowDate);
    }

    return getUnixTime(new Date());
  }, [endExecutedAt, cliffAndFlowExecutedAt, cliffAndFlowDate]);

  const currentFlowRate = useMemo(() => {
    console.log(
      cliffAndFlowExecutedAt,
      endExecutedAt,
      cliffAndFlowExecutedAt && !endExecutedAt ? flowRate : "0"
    );
    return cliffAndFlowExecutedAt && !endExecutedAt ? flowRate : "0";
  }, [cliffAndFlowExecutedAt, endExecutedAt, flowRate]);

  return (
    <>
      <FlowingBalance
        balance={balanceAtLastEvent}
        flowRate={currentFlowRate}
        balanceTimestamp={lastEventTimestamp}
        disableRoundingIndicator
      />
      {children}
    </>
  );
};

export default VestedBalance;
