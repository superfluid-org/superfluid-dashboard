import InfoIcon from "@mui/icons-material/Info";
import { SvgIconProps, Tooltip, useMediaQuery, useTheme } from "@mui/material";
import { TooltipProps } from "@mui/material/Tooltip";
import { FC, ReactNode } from "react";

interface TooltipWithIconProps {
  title: ReactNode;
  IconProps?: Partial<SvgIconProps>;
  TooltipProps?: Partial<TooltipProps>;
}

const TooltipWithIcon: FC<TooltipWithIconProps> = ({
  title,
  IconProps = { sx: {} },
  TooltipProps = {},
}) => {
  const theme = useTheme();
  const isBelowMd = useMediaQuery(theme.breakpoints.down("md"));

  return (
    <Tooltip
      arrow
      title={title}
      enterTouchDelay={isBelowMd ? 0 : 700}
      placement="top"
      {...TooltipProps}
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

export default TooltipWithIcon;
