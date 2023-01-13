import { Stack, Box, Typography, useTheme } from "@mui/material";
import { format, fromUnixTime } from "date-fns";
import { FC, useMemo } from "react";
import useTimer from "../../hooks/useTimer";
import { UnitOfTime } from "../send/FlowRateInput";
import { VestingSchedule } from "./types";

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
  dateNow: Date;
}

const VestingProgress: FC<VestingProgressProps> = ({
  nth,
  start,
  end,
  dateNow,
}) => {
  const theme = useTheme();

  const progress = useMemo(() => {
    if (!start) return 0;
    const dateNowMs = dateNow.getTime();

    const progressMs = dateNowMs - start.getTime();
    const totalMs = end.getTime() - start.getTime();
    return Math.min(1, progressMs / totalMs);
  }, [start, end, dateNow]);

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
          width: `calc(calc(100% - 180px) * ${progress})`,
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
    createdAt: unixCreatedAt,
    startDate: unixStartDate,
    cliffDate: unixCliffDate,
    endDate: unixEndDate,
  } = vestingSchedule;

  const dateNow = useTimer(UnitOfTime.Minute);

  const createdAt = useMemo(
    () => fromUnixTime(Number(unixCreatedAt)),
    [unixCreatedAt]
  );

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
      <VestingProgress
        nth={1}
        start={createdAt}
        end={startDate}
        dateNow={dateNow}
      />
      <VestingProgress
        nth={2}
        start={startDate}
        end={cliffDate}
        dateNow={dateNow}
      />
      <VestingProgress
        nth={3}
        start={cliffDate}
        end={endDate}
        dateNow={dateNow}
      />

      <VestingCheckpoint title="Vesting Scheduled" date={createdAt} />
      <VestingCheckpoint title="Vesting Starts" date={startDate} />
      <VestingCheckpoint title="Cliff" date={cliffDate} />
      <VestingCheckpoint title="Vesting Ends" date={endDate} />
    </Box>
  );
};

export default VestingScheduleProgress;
