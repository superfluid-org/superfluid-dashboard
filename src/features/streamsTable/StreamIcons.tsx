import AllInclusiveIcon from "@mui/icons-material/AllInclusive";
import TimerOutlined from "@mui/icons-material/TimerOutlined";
import {
  SvgIconProps,
  Tooltip,
  TooltipProps,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { FC } from "react";

interface ScheduledStreamIconProps {
  scheduledStart?: boolean;
  scheduledEnd?: boolean;
  IconProps?: Partial<SvgIconProps>;
}

export const ScheduledStreamIcon: FC<ScheduledStreamIconProps> = ({
  scheduledStart = false,
  scheduledEnd = false,
  IconProps = {},
}) => (
  <StreamIconTooltip
    title={`This stream has scheduled ${scheduledStart ? "start " : ""}${
      scheduledStart && scheduledEnd ? "and " : ""
    }${scheduledEnd ? "end " : ""}date.`}
  >
    <TimerOutlined sx={{ display: "block" }} {...IconProps} />
  </StreamIconTooltip>
);

export const ActiveStreamIcon = () => (
  <StreamIconTooltip title="This stream will run indefinitely.">
    <AllInclusiveIcon sx={{ display: "block" }} />
  </StreamIconTooltip>
);

interface StreamIconTooltip {
  title: string;
  children: TooltipProps["children"];
  TooltipProps?: Partial<TooltipProps>;
}

export const StreamIconTooltip: FC<StreamIconTooltip> = ({
  title,
  children,
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
      {children}
    </Tooltip>
  );
};
