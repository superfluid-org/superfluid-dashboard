import { Typography } from "@mui/material";
import { getUnixTime } from "date-fns";
import { FC, useMemo } from "react";
import { VestingSchedule, VestingStatusType } from "./types";

interface VestingStatusProps {
  vestingSchedule: VestingSchedule;
}

const VestingStatus: FC<VestingStatusProps> = ({ vestingSchedule }) => {
  const status = useMemo(() => {
    const {
      deletedAt,
      failedAt,
      startDate,
      endDate,
      cliffDate,
      cliffAndFlowExecutedAt,
      cliffAndFlowExpirationAt,
      endExecutedAt,
      didEarlyEndCompensationFail,
    } = vestingSchedule;
    const nowUnix = getUnixTime(new Date());

    if (deletedAt) {
      if (deletedAt > startDate) {
        return VestingStatusType.DeletedAfterStart;
      }

      return VestingStatusType.DeletedBeforeStart;
    }

    if (failedAt) {
      return VestingStatusType.EndFailed;
    }

    if (didEarlyEndCompensationFail) {
      return VestingStatusType.EndCompensationFailed;
    }

    if (endExecutedAt) {
      if (endExecutedAt > endDate) {
        return VestingStatusType.EndOverflowed;
      }

      return VestingStatusType.EndExecuted;
    }

    if (cliffAndFlowExecutedAt) {
      return VestingStatusType.CliffAndFlowExecuted;
    }

    if (nowUnix > cliffAndFlowExpirationAt) {
      return VestingStatusType.CliffAndFlowExpired;
    }

    if (cliffDate) {
      if (nowUnix > cliffDate) {
        return VestingStatusType.CliffPeriod;
      }
    }

    return VestingStatusType.ScheduledStart;
  }, [vestingSchedule]);

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
