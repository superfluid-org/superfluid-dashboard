import { Typography, TypographyProps } from "@mui/material";
import { FC, useMemo } from "react";
import { VestingSchedule } from "./types";

interface VestingStatusProps {
  vestingSchedule: VestingSchedule;
  TypographyProps?: Partial<TypographyProps>;
}

const VestingStatus: FC<VestingStatusProps> = ({
  vestingSchedule,
  TypographyProps = {},
}) => {
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
    <Typography
      data-cy={"vesting-status"}
      variant="h7"
      component="span"
      color={color}
      {...TypographyProps}
    >
      {vestingSchedule.status.title}
    </Typography>
  );
};

export default VestingStatus;
