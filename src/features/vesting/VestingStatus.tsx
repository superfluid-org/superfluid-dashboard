import { Typography } from "@mui/material";
import { FC } from "react";

interface VestingStatusProps {}

const VestingStatus: FC<VestingStatusProps> = ({}) => {
  return (
    <Typography variant="h6" component="span" color="primary">
      Vesting
    </Typography>
  );
};

export default VestingStatus;
