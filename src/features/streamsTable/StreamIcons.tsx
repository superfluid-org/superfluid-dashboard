import { Tooltip, TooltipProps, useMediaQuery, useTheme } from "@mui/material";
import AllInclusiveIcon from "@mui/icons-material/AllInclusive";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import TimerOutlined from "@mui/icons-material/TimerOutlined";
import { FC, PropsWithChildren, ReactElement, ReactNode, useMemo } from "react";

interface ScheduledStreamIconProps {
  scheduledStart: boolean;
  scheduledEnd: boolean;
}

export const ScheduledStreamIcon: FC<ScheduledStreamIconProps> = ({
  scheduledStart,
  scheduledEnd,
}) => (
  <StreamIconTooltip
    title={`This stream has scheduled ${scheduledStart ? "start " : ""}${
      scheduledStart && scheduledEnd ? "and " : ""
    }${scheduledEnd ? "end " : ""}date.`}
  >
    <TimerOutlined sx={{ display: "block" }} />
  </StreamIconTooltip>
);

export const ActiveStreamIcon = () => (
  <StreamIconTooltip title="This stream will run infinitely.">
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
