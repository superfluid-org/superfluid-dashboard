import { Stack, Box, Typography, useTheme } from "@mui/material";
import { format } from "date-fns";
import { FC, useMemo } from "react";

interface VestingProgressItemProps {
  title: string;
  date: Date;
  progressStart?: Date;
}

const VestingProgressItem: FC<VestingProgressItemProps> = ({
  title,
  date,
  progressStart,
}) => {
  const theme = useTheme();

  const progress = useMemo(() => {
    if (!progressStart) return 0;

    const progressMs = Date.now() - progressStart.getTime();
    const totalMs = date.getTime() - progressStart.getTime();
    return Math.min(100, (progressMs / totalMs) * 100);
  }, [date, progressStart]);

  const isActive = !progressStart || progress >= 100;

  return (
    <Stack alignItems="center">
      <Stack sx={{ position: "relative", width: "100%", alignItems: "center" }}>
        {/* Inactive progress */}
        {progressStart && (
          <Box
            sx={{
              background: theme.palette.divider,
              width: `calc(100% - 10px)`,
              height: "2px",
              position: "absolute",
              left: "calc(-50% + 5px)",
              top: "calc(50% - 1px)",
            }}
          />
        )}

        {/* Active progress */}
        <Box
          sx={{
            background: theme.palette.primary.main,
            width: `${progress}%`,
            height: "2px",
            position: "absolute",
            left: "-50%",
            top: "calc(50% - 1px)",
          }}
        />

        {/* Dot */}
        <Box
          sx={{
            background: isActive
              ? theme.palette.primary.main
              : theme.palette.divider,
            width: "10px",
            height: "10px",
            borderRadius: "50%",
          }}
        />
      </Stack>
      <Typography color="text.secondary">{title}</Typography>
      <Typography>{format(date, "MMM do, yyyy HH:mm")}</Typography>
    </Stack>
  );
};

interface VestingScheduleProgressProps {}

const VestingScheduleProgress: FC<VestingScheduleProgressProps> = ({}) => {
  return (
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: "repeat(4, 1fr)",
      }}
    >
      <VestingProgressItem
        title="Vesting Scheduled"
        date={new Date("2023-01-06T12:56:49.377Z")}
      />
      <VestingProgressItem
        title="Cliff"
        date={new Date("2023-01-06T12:57:49.377Z")}
        progressStart={new Date("2023-01-06T12:56:49.377Z")}
      />
      <VestingProgressItem
        title="Vesting Starts"
        date={new Date("2023-01-06T12:58:49.377Z")}
        progressStart={new Date("2023-01-06T12:57:49.377Z")}
      />
      <VestingProgressItem
        title="Vesting Ends"
        date={new Date("2023-01-06T13:59:49.377Z")}
        progressStart={new Date("2023-01-06T12:58:49.377Z")}
      />
    </Box>
  );
};

export default VestingScheduleProgress;
