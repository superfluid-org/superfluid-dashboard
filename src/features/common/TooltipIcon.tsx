import { alpha, Tooltip, useMediaQuery, useTheme } from "@mui/material";
import { FC } from "react";
import InfoIcon from "@mui/icons-material/Info";

interface TooltipIconProps {
  title: string;
}

const TooltipIcon: FC<TooltipIconProps> = ({ title }) => {
  const theme = useTheme();
  const isBelowMd = useMediaQuery(theme.breakpoints.down("md"));

  return (
    <Tooltip
      arrow
      title={title}
      enterTouchDelay={isBelowMd ? 0 : 700}
      placement="top"
    >
      <InfoIcon
        fontSize="small"
        sx={{
          color: "inherit",
          opacity: 0.3,
          verticalAlign: "bottom",
          cursor: "help",
        }}
      />
    </Tooltip>
  );
};

export default TooltipIcon;
