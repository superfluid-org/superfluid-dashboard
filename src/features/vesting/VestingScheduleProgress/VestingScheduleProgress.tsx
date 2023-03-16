import { Box, useTheme } from "@mui/material";
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
        gridColumn: `${nth}/${nth + 2}`,
        bottom: "-5px",
      }}
    >
      <Box
        data-cy={"total-progress-line"}
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
        data-cy={"actual-progress-line"}
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
        gridTemplateColumns: `repeat(${cliffDate ? 4 : 3}, 170px)`,
        justifyContent: "space-between",
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
        dataCy={"vesting-scheduled"}
      />

      {!cliffDate ? (
        <VestingScheduleProgressCheckpoint
          titles={["Vesting Starts", "Stream Starts"]}
          targetDate={cliffAndFlowDate}
          dateNow={dateNow}
          dataCy={"vesting-start"}
        />
      ) : (
        <>
          <VestingScheduleProgressCheckpoint
            titles={["Vesting Starts"]}
            targetDate={startDate}
            dateNow={dateNow}
            dataCy={"cliff-start"}
          />
          <VestingScheduleProgressCheckpoint
            titles={["Cliff Vested", "Stream starts"]}
            targetDate={cliffDate}
            dateNow={dateNow}
            dataCy={"cliff-end"}
          />
        </>
      )}

      <VestingScheduleProgressCheckpoint
        titles={["Vesting Ends"]}
        targetDate={endDate}
        dateNow={dateNow}
        dataCy={"vesting-end"}
      />
    </Box>
  );
};

export default memo(VestingScheduleProgress);
