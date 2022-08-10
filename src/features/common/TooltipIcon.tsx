import {
  alpha,
  SvgIconProps,
  Tooltip,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { FC } from "react";
import InfoIcon from "@mui/icons-material/Info";

interface TooltipIconProps {
  title: string;
  IconProps?: Partial<SvgIconProps>;
}

const TooltipIcon: FC<TooltipIconProps> = ({
  title,
  IconProps = { sx: {} },
}) => {
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
        {...IconProps}
        sx={{
          color: "inherit",
          opacity: 0.3,
          verticalAlign: "bottom",
          cursor: "help",
          ...IconProps.sx,
        }}
      />
    </Tooltip>
  );
};

export default TooltipIcon;
