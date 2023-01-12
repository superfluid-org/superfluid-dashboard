import { Typography } from "@mui/material";
import { getUnixTime } from "date-fns";
import { FC, useMemo } from "react";
import { VestingSchedule } from "./types";

enum VestingStatusType {
  Cliff = "Cliff",
  Vesting = "Vesting",
  Vested = "Vested",
}

interface VestingStatusProps {
  vestingSchedule: VestingSchedule;
}

const VestingStatus: FC<VestingStatusProps> = ({ vestingSchedule }) => {
  const { startDate, cliffDate, endDate } = vestingSchedule;

  const status = useMemo(() => {
    const dateNow = getUnixTime(new Date());

    if (Number(endDate) < dateNow) {
      return VestingStatusType.Vested;
    } else if (Number(cliffDate || startDate) < dateNow) {
      return VestingStatusType.Vesting;
    } else {
      return VestingStatusType.Cliff;
    }
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
