import { useTheme } from "@mui/material";
import { ChartOptions } from "chart.js";
import { fromUnixTime } from "date-fns";
import { formatEther } from "ethers/lib/utils";
import { FC, useMemo } from "react";
import LineChart from "../../components/Chart/LineChart";
import { VestingActivities } from "../../pages/vesting/[_network]/[_id]";
import {
  buildDefaultDatasetConf,
  estimateFrequencyByTimestamp,
} from "../../utils/chartUtils";
import {
  calculateVestingScheduleAllocated,
  mapVestingActualDataPoints,
  mapVestingExpectedDataPoints,
} from "../../utils/vestingUtils";
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

  const options = useMemo(() => {
    const { startDate, endDate } = vestingSchedule;

    const totalVesting = Number(
      formatEther(calculateVestingScheduleAllocated(vestingSchedule).toString())
    );

    return {
      scales: {
        x: {
          suggestedMin: fromUnixTime(Number(startDate)).getTime(),
          suggestedMax: fromUnixTime(Number(endDate)).getTime(),
        },
        y: {
          suggestedMin: 0,
          suggestedMax: totalVesting,
        },
      },
    } as ChartOptions<"line">;
  }, [vestingSchedule]);

  const datasets = useMemo(() => {
    const dateNow = new Date();

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
  }, [vestingSchedule, vestingActivities]);

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
      options={options}
      datasetsConfigCallbacks={datasetsConfigCallbacks}
    />
  );
};

export default VestingGraph;
