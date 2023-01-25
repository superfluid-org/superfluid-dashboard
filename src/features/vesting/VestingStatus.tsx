import { Typography } from "@mui/material";
import { FC, useMemo } from "react";
import { VestingSchedule } from "./types";

interface VestingStatusProps {
  vestingSchedule: VestingSchedule;
}

const VestingStatus: FC<VestingStatusProps> = ({ vestingSchedule }) => {
  const color = useMemo(() => {
    if (vestingSchedule.status.isCliff) {
      return "warning.main";
    }

    if (vestingSchedule.status.isStreaming && !vestingSchedule.status.isError) {
      return "primary";
    }

    if (vestingSchedule.status.isFinished) {
      return "initial";
    }
  }, [vestingSchedule]);

  return (
    <Typography variant="h6" component="span" color={color}>
      {vestingSchedule.status.name}
    </Typography>
  );
};

export default VestingStatus;
