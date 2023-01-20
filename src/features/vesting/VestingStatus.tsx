import { Typography } from "@mui/material";
import { getUnixTime } from "date-fns";
import { FC, useMemo } from "react";
import { VestingSchedule } from "./types";

enum VestingStatusType {
  Scheduled = "Scheduled",
  Cliff = "Cliff",
  Vesting = "Vesting",
  Vested = "Vested",
  Failed = "Failed",
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
    const dateNow = getUnixTime(new Date());

    if (deletedAt) {
      return VestingStatusType.Deleted;
    } else if (endExecutedAt && Number(endExecutedAt) < dateNow) {
      return VestingStatusType.Vested;
    } else if (
      cliffAndFlowExecutedAt &&
      Number(cliffAndFlowExecutedAt) < dateNow
    ) {
      return VestingStatusType.Vesting;
    } else if (Number(startDate) < dateNow && cliffDate) {
      return VestingStatusType.Cliff;
    }

    return VestingStatusType.Scheduled;
  }, [startDate, cliffDate, endDate]);

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
