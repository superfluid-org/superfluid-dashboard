import { FC, PropsWithChildren, useMemo } from "react";
import { vestingScheduleToTokenBalance } from "../../utils/vestingUtils";
import FlowingBalance from "../token/FlowingBalance";
import { VestingSchedule } from "./types";

interface VestedBalanceProps extends PropsWithChildren {
  vestingSchedule: VestingSchedule;
}

const VestedBalance: FC<VestedBalanceProps> = ({
  children,
  vestingSchedule,
}) => {
  const { balance, timestamp, totalNetFlowRate } = useMemo(
    () => vestingScheduleToTokenBalance(vestingSchedule),
    [vestingSchedule]
  );

  return (
    <>
      <FlowingBalance
        balance={balance}
        flowRate={totalNetFlowRate}
        balanceTimestamp={timestamp}
        disableRoundingIndicator
      />
      {children}
    </>
  );
};

export default VestedBalance;
