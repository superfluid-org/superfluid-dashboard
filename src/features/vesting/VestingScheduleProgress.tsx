import { Stack, Box, Typography, useTheme } from "@mui/material";
import { format, fromUnixTime } from "date-fns";
import { FC, useMemo } from "react";
import { VestingSchedule } from "../../vesting-subgraph/schema.generated";

interface VestingCheckpointProps {
  title: string;
  date: Date;
}

const VestingCheckpoint: FC<VestingCheckpointProps> = ({ title, date }) => {
  const theme = useTheme();
  const isActive = useMemo(() => date <= new Date(), [date]);

  return (
    <Stack alignItems="center">
      <Stack sx={{ position: "relative", width: "100%", alignItems: "center" }}>
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
      <Typography variant="h6" color="text.secondary" sx={{ mt: 1 }}>
        {title}
      </Typography>
      <Typography variant="h6">{format(date, "MMM do, yyyy HH:mm")}</Typography>
    </Stack>
  );
};

interface VestingProgressProps {
  nth: number;
  end: Date;
  start: Date;
}

const VestingProgress: FC<VestingProgressProps> = ({ nth, start, end }) => {
  const theme = useTheme();

  const progress = useMemo(() => {
    if (!start) return 0;

    const progressMs = Date.now() - start.getTime();
    const totalMs = end.getTime() - start.getTime();
    return Math.min(100, (progressMs / totalMs) * 100);
  }, [start, end]);

  return (
    <Box
      sx={{
        position: "relative",
        gridColumn: `${nth}/${nth + 2}`,
        bottom: "-5px",
      }}
    >
      <Box
        sx={{
          background: theme.palette.divider,
          width: `calc(100% - 180px)`,
          height: "2px",
          position: "absolute",
          left: "90px",
          top: "calc(50% - 1px)",
        }}
      />
      <Box
        sx={{
          background: theme.palette.primary.main,
          width: `calc(${progress}% - 180px)`,
          height: "2px",
          position: "absolute",
          left: "90px",
          top: "calc(50% - 1px)",
        }}
      />
    </Box>
  );
};

interface VestingScheduleProgressProps {
  vestingSchedule: VestingSchedule;
}

const VestingScheduleProgress: FC<VestingScheduleProgressProps> = ({
  vestingSchedule,
}) => {
  const {
    startDate: unixStartDate,
    cliffDate: unixCliffDate,
    endDate: unixEndDate,
  } = vestingSchedule;

  const startDate = useMemo(
    () => fromUnixTime(Number(unixStartDate)),
    [unixStartDate]
  );

  const cliffDate = useMemo(
    () => fromUnixTime(Number(unixCliffDate)),
    [unixCliffDate]
  );

  const endDate = useMemo(
    () => fromUnixTime(Number(unixEndDate)),
    [unixEndDate]
  );

  return (
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: "repeat(4, 170px)",
        justifyContent: "space-between",
      }}
    >
      <VestingProgress nth={1} start={startDate} end={cliffDate} />
      <VestingProgress nth={2} start={cliffDate} end={cliffDate} />
      <VestingProgress nth={3} start={cliffDate} end={endDate} />

      <VestingCheckpoint title="Vesting Scheduled" date={startDate} />
      <VestingCheckpoint title="Cliff" date={cliffDate} />
      <VestingCheckpoint title="Vesting Starts" date={cliffDate} />
      <VestingCheckpoint title="Vesting Ends" date={endDate} />
    </Box>
  );
};

export default VestingScheduleProgress;
