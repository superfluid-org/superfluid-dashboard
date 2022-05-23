import { alpha, Tooltip, useTheme } from "@mui/material";
import { FC } from "react";
import InfoIcon from "@mui/icons-material/Info";

interface TooltipIconProps {
  title: string;
}

const TooltipIcon: FC<TooltipIconProps> = ({ title }) => {
  const theme = useTheme();

  return (
    <Tooltip title={title}>
      <InfoIcon
        fontSize="small"
        sx={{ color: alpha(theme.palette.action.active, 0.3) }}
      />
    </Tooltip>
  );
};

export default TooltipIcon;
