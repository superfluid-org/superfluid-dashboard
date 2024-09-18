import { Box, useTheme, useThemeProps } from "@mui/material";
import { fromUnixTime } from "date-fns";
import { FC, memo, useMemo } from "react";
import useTimer from "../../../hooks/useTimer";
import { UnitOfTime } from "../../send/FlowRateInput";
import { VestingSchedule } from "../types";
import VestingScheduleProgressCheckpoint from "./VestingScheduleProgressCheckpoint";
import { groupBy, map, orderBy, size, sortBy, uniqBy } from "lodash";

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
    claimValidityDate: unixClaimValidityDate,
    cliffAndFlowExecutedAt: unixCliffAndFlowExecutedAt,
    deletedAt: unixDeletedAt,
  } = vestingSchedule;

  const unixClaimedAt = (unixClaimValidityDate && unixCliffAndFlowExecutedAt) ? unixCliffAndFlowExecutedAt : 0; 

  const dateNow = useTimer(UnitOfTime.Minute);
  const deletedAt = useMemo(() => unixDeletedAt ? new Date(unixDeletedAt * 1000) : null, [unixDeletedAt]);

  function* generateProgressDataPoints() {
    // We generate data points first based on which we create the progress slices. We want them to be sequential without breaks.
    // Don't worry about them being correctly ordered here, we'll order them in the next step.
    yield unixCreatedAt;
    yield unixStartDate;
    if (unixCliffDate) {
      yield unixCliffDate;
    } else {
      yield unixCliffAndFlowDate;
    }
    if (unixClaimedAt) {
      yield unixClaimedAt;
    }
    if (unixDeletedAt) {
      yield unixDeletedAt;
    }
    yield unixEndDate;
    if (unixClaimValidityDate) {
      yield unixClaimValidityDate;
    }
  }

  function* generateProgressDataSlices() {
    // We create the progress slices, we want them to be sequential without breaks.
    // We order them and leave only unique values.
    const dates = uniqBy(orderBy([...generateProgressDataPoints()], x => x, "asc"), x => x);

    for (let i = 0; i < dates.length - 1; i++) {
      yield { start: dates[i], end: dates[i + 1] };
    }
  }

  const progressData = [...generateProgressDataSlices()];

  function* generateCheckpointData() {
    // We create checkpoints to put on the timeline.
    // Don't worry about ordering or things happening at the same time, we'll do ordering and grouping in a next step.
    yield {
      title: "Vesting Scheduled",
      targetDate: unixCreatedAt,
      dataCy: "vesting-scheduled",
    };
    yield {
      title: "Vesting Starts",
      targetDate: unixCliffDate ? unixStartDate : unixCliffAndFlowDate,
      dataCy: "vesting-start",
    }
    if (unixClaimValidityDate) {
      yield {
        title: "Claiming Starts",
        targetDate: unixCliffAndFlowDate,
        dataCy: "claim-start",
      };
    } else {
      yield {
        title: "Stream Starts",
        targetDate: unixCliffAndFlowDate,
        dataCy: "stream-start",
      };
    }
    if (unixCliffDate) {
      yield {
        title: "Cliff Vested",
        targetDate: unixCliffDate,
        dataCy: "cliff-end",
      };
    }
    if (unixClaimedAt) {
      yield {
        title: "Claimed",
        targetDate: unixClaimedAt,
        dataCy: "vesting-claimed",
      };
    }
    yield {
      title: "Vesting Ends",
      targetDate: unixEndDate,
      dataCy: "vesting-end",
    };
    if (unixDeletedAt) {
      yield {
        title: "Schedule Deleted",
        targetDate: unixDeletedAt,
        dataCy: "vesting-deleted",
      };
    }
    if (!unixClaimedAt && unixClaimValidityDate) {
      yield {
        title: "Claiming Ends",
        targetDate: unixClaimValidityDate,
        dataCy: "claim-ends",
      };
    }
  }
  const checkpointData = groupBy(orderBy([...generateCheckpointData()], ordering => ordering.targetDate), grouping => grouping.targetDate);
  let checkpointDataIterator = 0;

  return (
    <Box
      sx={{
        display: "grid",
        justifyContent: "space-between",
        [theme.breakpoints.up("md")]: {
          gridTemplateColumns: `repeat(${size(checkpointData)}, 170px)`,
        },
        [theme.breakpoints.down("md")]: {
          gridTemplateRows: `repeat(${size(checkpointData)}, 90px)`,
        },
      }}
    >
      {progressData.map((props, index) => (
        <VestingProgress
          key={index}
          nth={index + 1}
          dateNow={deletedAt ?? dateNow}
          start={fromUnixTime(props.start)}
          end={fromUnixTime(props.end)}
        />
      ))}

      {map(checkpointData, (group) => {
        ++checkpointDataIterator;
        return (
          <VestingScheduleProgressCheckpoint
            key={checkpointDataIterator}
            nth={checkpointDataIterator}
            measureDate={deletedAt ?? dateNow}
            targetDate={fromUnixTime(group[0].targetDate)}
            titles={group.map(x => x.title)}
            dataCy={group[0].dataCy}
          />
        );
      }
      )}
    </Box>
  );
};

export default memo(VestingScheduleProgress);
