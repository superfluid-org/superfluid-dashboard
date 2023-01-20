import { useTheme } from "@mui/material";
import { FC, useMemo } from "react";
import LineChart from "../../components/Chart/LineChart";
import useTimer from "../../hooks/useTimer";
import { VestingActivities } from "../../pages/vesting/[_network]/[_id]";
import {
  buildDefaultDatasetConf,
  estimateFrequencyByTimestamp,
} from "../../utils/chartUtils";
import {
  mapVestingActualDataPoints,
  mapVestingExpectedDataPoints,
} from "../../utils/vestingUtils";
import { UnitOfTime } from "../send/FlowRateInput";
import { VestingSchedule } from "./types";

interface VestingGraphProps {
  vestingSchedule: VestingSchedule;
  vestingActivities: VestingActivities;
  height?: number;
}

const VestingGraph: FC<VestingGraphProps> = ({
  vestingSchedule,
  vestingActivities,
  height = 180,
}) => {
  const theme = useTheme();

  const dateNow = useTimer(UnitOfTime.Minute);

  const datasets = useMemo(() => {
    const frequency = estimateFrequencyByTimestamp(
      vestingSchedule.startDate,
      vestingSchedule.endDate
    );

    const actualDataPoints = mapVestingActualDataPoints(
      vestingActivities,
      vestingSchedule,
      dateNow,
      frequency
    );
    const expectedDataPoints = mapVestingExpectedDataPoints(
      vestingSchedule,
      frequency
    );

    return [actualDataPoints, expectedDataPoints];
  }, [vestingSchedule, vestingActivities, dateNow]);

  const datasetsConfigCallbacks = useMemo(
    () => [
      (ctx: CanvasRenderingContext2D) =>
        buildDefaultDatasetConf(ctx, theme.palette.primary.main, height),
      (ctx: CanvasRenderingContext2D) => ({
        ...buildDefaultDatasetConf(ctx, theme.palette.secondary.main, height),
        borderDash: [6, 6],
      }),
    ],
    [height, theme]
  );

  return (
    <LineChart
      height={height}
      datasets={datasets}
      datasetsConfigCallbacks={datasetsConfigCallbacks}
    />
  );
};

export default VestingGraph;
