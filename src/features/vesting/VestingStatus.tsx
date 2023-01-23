import { Typography } from "@mui/material";
import { getUnixTime } from "date-fns";
import { FC, useMemo } from "react";
import { VestingSchedule } from "./types";

enum VestingStatusType {
  Scheduled = "Scheduled",
  Cliff = "Cliff",
  Vesting = "Vesting", // Needs execution.
  Vested = "Vested", // Needs execution.
  Failed = "Failed",
  Deleted = "Deleted",
  Partial = "Partial", // TODO
  Unknown = "Unknown", // Should never happen.
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
  const cliffUnix = Number(cliffDate);

  const status = useMemo(() => {
    const nowUnix = getUnixTime(new Date());

    if (deletedAt) {
      return VestingStatusType.Deleted;
    } else if (endExecutedAt) {
      return VestingStatusType.Vested;
    } else if (cliffAndFlowExecutedAt) {
      return VestingStatusType.Vesting;
    } else if (nowUnix > cliffUnix) {
      return VestingStatusType.Cliff;
    }

    return VestingStatusType.Scheduled;
  }, [startDate, cliffDate, cliffAndFlowExecutedAt, deletedAt, endExecutedAt]);

  const color = useMemo(() => {
    switch (status) {
      case VestingStatusType.Vested:
        return "initial";
      case VestingStatusType.Vesting:
        return "primary";
      case VestingStatusType.Cliff:
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
