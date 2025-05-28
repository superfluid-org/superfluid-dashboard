import { useTheme } from "@mui/material";
import { ChartOptions } from "chart.js";
import { fromUnixTime, max, min } from "date-fns";
import { formatEther } from "ethers/lib/utils";
import { FC, useMemo } from "react";
import LineChart from "../../components/Chart/LineChart";
import { VestingActivities } from "../../pages/vesting/[_network]/[_id]";
import {
  buildDefaultDatasetConf,
  estimateFrequencyByTimestamp,
  getFilteredEndDate,
  getFilteredStartDate,
} from "../../utils/chartUtils";
import {
  mapVestingActualDataPoints,
  mapVestingExpectedDataPoints,
} from "../../utils/vestingUtils";
import { TimeUnitFilterType } from "../graph/TimeUnitFilter";
import { VestingSchedule } from "./types";

interface VestingGraphProps {
  vestingSchedule: VestingSchedule;
  vestingActivities: VestingActivities;
  filter?: TimeUnitFilterType;
  height?: number;
}

// TODO: I need to add vesting schedule updates here

const VestingGraph: FC<VestingGraphProps> = ({
  vestingSchedule,
  vestingActivities,
  filter = TimeUnitFilterType.All,
  height = 180,
}) => {
  const theme = useTheme();

  const options = useMemo(() => {
    const {
      startDate: startDateUnix,
      endDate: endDateUnix,
      endExecutedAt: endExecutedAtUnix,
    } = vestingSchedule;

    const totalVesting = Number(
      formatEther(vestingSchedule.totalAmount)
    );

    const currentDate = new Date();

    const endExecutedAt = fromUnixTime(endExecutedAtUnix ?? 0);
    const endDate = fromUnixTime(endDateUnix);
    const maxDate = max([endDate, endExecutedAt]);

    const minDate = fromUnixTime(startDateUnix);

    const startDateWithMinimum = max([
      minDate,
      getFilteredStartDate(filter, min([currentDate, maxDate]), minDate),
    ]);

    const endDateWithMaximum = min([
      maxDate,
      getFilteredEndDate(filter, max([currentDate, minDate]), maxDate),
    ]);

    return {
      scales: {
        x: {
          min: startDateWithMinimum.getTime(),
          max: endDateWithMaximum.getTime(),
        },
        y: {
          suggestedMin: 0,
          suggestedMax: totalVesting,
        },
      },
    } as ChartOptions<"line">;
  }, [vestingSchedule, filter]);

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
      vestingActivities,
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
