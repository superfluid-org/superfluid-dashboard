import { Typography } from "@mui/material";
import { FC, useMemo } from "react";
import { VestingSchedule } from "./types";

interface VestingStatusProps {
  vestingSchedule: VestingSchedule;
}

const VestingStatus: FC<VestingStatusProps> = ({ vestingSchedule }) => {
  const { status } = vestingSchedule;

  const color = useMemo(() => {
    if (status.isError) {
      return "error.main";
    }

    if (status.isCliff) {
      return "warning.main";
    }

    if (status.isStreaming && !status.isError) {
      return "primary";
    }

    if (status.isFinished) {
      return "initial";
    }
  }, [status]);

  return (
    <Typography variant="h7" component="span" color={color}>
      {vestingSchedule.status.title}
    </Typography>
  );
};

export default VestingStatus;
