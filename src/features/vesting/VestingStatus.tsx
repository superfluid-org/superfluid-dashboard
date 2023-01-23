import { Typography } from "@mui/material";
import { getUnixTime } from "date-fns";
import { FC, useMemo } from "react";
import { VestingSchedule } from "./types";

enum VestingStatusType {
  ScheduledStart = "Scheduled",
  CliffPeriod = "Cliff",
  CliffAndFlowExecuted = "Vesting", // Needs execution.
  EndExecuted = "Vested", // Needs execution.
  EndFailed = "Failed",
  Deleted = "Deleted",
}

interface VestingStatusProps {
  vestingSchedule: VestingSchedule;
}

const VestingStatus: FC<VestingStatusProps> = ({ vestingSchedule }) => {
  const {
    startDate,
    cliffDate,
    endDate,
    cliffAndFlowExecutedAt,
    endExecutedAt,
    deletedAt,
  } = vestingSchedule;

  const status = useMemo(() => {
    const nowUnix = getUnixTime(new Date());

    if (deletedAt) {
      return VestingStatusType.Deleted;
    } else if (endExecutedAt) {
      return VestingStatusType.EndExecuted;
    } else if (cliffAndFlowExecutedAt) {
      return VestingStatusType.CliffAndFlowExecuted;
    } 
    
    if (cliffDate) {
      const cliffUnix = Number(cliffDate);
      if (nowUnix > cliffUnix) {
        return VestingStatusType.CliffPeriod;
      }
    }

    return VestingStatusType.ScheduledStart;
  }, [startDate, cliffDate, cliffAndFlowExecutedAt, deletedAt, endExecutedAt]);

  const color = useMemo(() => {
    switch (status) {
      case VestingStatusType.EndExecuted:
        return "initial";
      case VestingStatusType.CliffAndFlowExecuted:
        return "primary";
      case VestingStatusType.CliffPeriod:
        return "warning.main";
    }
  }, [status]);

  return (
    <Typography variant="h6" component="span" color={color}>
      {status}
    </Typography>
  );
};

export default VestingStatus;
