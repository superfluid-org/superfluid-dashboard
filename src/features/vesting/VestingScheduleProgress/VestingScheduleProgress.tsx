import { Box, useTheme, useThemeProps } from "@mui/material";
import { fromUnixTime } from "date-fns";
import { FC, memo, useMemo } from "react";
import useTimer from "../../../hooks/useTimer";
import { UnitOfTime } from "../../send/FlowRateInput";
import { VestingSchedule } from "../types";
import VestingScheduleProgressCheckpoint from "./VestingScheduleProgressCheckpoint";

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

    return Math.max(Math.min(1, progressMs / totalMs), 0);
  }, [start, end, dateNow]);

  return (
    <Box
      sx={{
        position: "relative",
        [theme.breakpoints.up("md")]: {
          bottom: "-5px",
          gridColumn: `${nth}/${nth + 2}`,
          gridRow: "1/2",
        },
        [theme.breakpoints.down("md")]: {
          right: "-5px",
          gridColumn: "1/2",
          gridRow: `${nth}/${nth + 2}`,
        },
      }}
    >
      <Box
        data-cy={"total-progress-line"}
        sx={{
          background: theme.palette.divider,
          position: "absolute",
          [theme.breakpoints.up("md")]: {
            width: `calc(100% - 180px)`,
            height: "2px",
            left: "90px",
            top: "-1px",
          },
          [theme.breakpoints.down("md")]: {
            height: `calc(100% - 100px)`,
            width: "2px",
            top: "50px",
            left: "-1px",
          },
        }}
      />
      <Box
        data-cy={"actual-progress-line"}
        sx={{
          background: theme.palette.primary.main,
          position: "absolute",
          [theme.breakpoints.up("md")]: {
            width: `calc(calc(100% - 180px) * ${progress})`,
            height: "2px",
            left: "90px",
            top: "-1px",
          },
          [theme.breakpoints.down("md")]: {
            height: `calc(calc(100% - 100px) * ${progress})`,
            width: "2px",
            top: "50px",
            left: "-1px",
          },
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
  const theme = useTheme();

  const {
    createdAt: unixCreatedAt,
    startDate: unixStartDate,
    cliffDate: unixCliffDate,
    endDate: unixEndDate,
    cliffAndFlowDate: unixCliffAndFlowDate,
  } = vestingSchedule;

  const dateNow = useTimer(UnitOfTime.Minute);

  const createdAt = useMemo(() => fromUnixTime(unixCreatedAt), [unixCreatedAt]);

  const startDate = useMemo(() => fromUnixTime(unixStartDate), [unixStartDate]);

  const cliffDate = useMemo(
    () => (unixCliffDate ? fromUnixTime(unixCliffDate) : null),
    [unixCliffDate]
  );

  const endDate = useMemo(() => fromUnixTime(unixEndDate), [unixEndDate]);

  const cliffAndFlowDate = useMemo(
    () => fromUnixTime(Number(unixCliffAndFlowDate)),
    [unixCliffAndFlowDate]
  );

  return (
    <Box
      sx={{
        display: "grid",
        justifyContent: "space-between",
        [theme.breakpoints.up("md")]: {
          gridTemplateColumns: `repeat(${cliffDate ? 4 : 3}, 170px)`,
        },
        [theme.breakpoints.down("md")]: {
          gridTemplateRows: `repeat(${cliffDate ? 4 : 3}, 90px)`,
        },
      }}
    >
      <VestingProgress
        nth={1}
        start={createdAt}
        end={startDate}
        dateNow={dateNow}
      />

      {!cliffDate ? (
        <VestingProgress
          nth={cliffDate ? 4 : 2}
          start={cliffAndFlowDate}
          end={endDate}
          dateNow={dateNow}
        />
      ) : (
        <>
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
        </>
      )}

      <VestingScheduleProgressCheckpoint
        titles={["Vesting Scheduled"]}
        targetDate={createdAt}
        dateNow={dateNow}
        nth={1}
        dataCy={"vesting-scheduled"}
      />

      {!cliffDate ? (
        <VestingScheduleProgressCheckpoint
          titles={["Vesting Starts", "Stream Starts"]}
          targetDate={cliffAndFlowDate}
          dateNow={dateNow}
          nth={2}
          dataCy={"vesting-start"}
        />
      ) : (
        <>
          <VestingScheduleProgressCheckpoint
            titles={["Vesting Starts"]}
            targetDate={startDate}
            dateNow={dateNow}
            nth={2}
            dataCy={"cliff-start"}
          />
          <VestingScheduleProgressCheckpoint
            titles={["Cliff Vested", "Stream starts"]}
            targetDate={cliffDate}
            dateNow={dateNow}
            nth={3}
            dataCy={"cliff-end"}
          />
        </>
      )}

      <VestingScheduleProgressCheckpoint
        titles={["Vesting Ends"]}
        targetDate={endDate}
        dateNow={dateNow}
        nth={cliffDate ? 4 : 3}
        dataCy={"vesting-end"}
      />
    </Box>
  );
};

export default memo(VestingScheduleProgress);
