import { Box, useTheme } from "@mui/material";
import { fromUnixTime, getUnixTime } from "date-fns";
import { BigNumber } from "ethers";
import { formatEther, parseEther } from "ethers/lib/utils";
import { FC, useCallback, useMemo } from "react";
import LineChart, { DataPoint } from "../../components/Chart/LineChart";
import { buildDefaultDatasetConf } from "../../utils/chartUtils";
import { getDatesBetween } from "../../utils/dateUtils";
import { VestingSchedule } from "../../vesting-subgraph/schema.generated";
import { UnitOfTime } from "../send/FlowRateInput";

function getFrequency(startDate: Date, endDate: Date): UnitOfTime {
  const diffSeconds = getUnixTime(endDate) - getUnixTime(startDate);

  // We want at least 10 data points.
  const frequency = Math.round(diffSeconds / 10);

  // Don't go higher than one day
  if (frequency > UnitOfTime.Day) return UnitOfTime.Day;

  // Rounding frequency to match one of our time units
  const normalizedFrequency =
    Object.values(UnitOfTime)
      .reverse()
      .find((s) => s <= frequency) || UnitOfTime.Second;

  return normalizedFrequency as UnitOfTime;
}

function mapVestingGraphDataPoints(vestingSchedule: VestingSchedule) {
  const {
    startDate: startDateUnix,
    endDate: endDateUnix,
    cliffDate: cliffDateUnix,
    flowRate,
    cliffAmount,
  } = vestingSchedule;

  const startDate = fromUnixTime(Number(startDateUnix));
  const endDate = fromUnixTime(Number(endDateUnix));

  const dates = getDatesBetween(
    startDate,
    endDate,
    getFrequency(startDate, endDate)
  );

  return dates.reduce((mappedData: DataPoint[], date: Date) => {
    const dateUnix = getUnixTime(date);

    const secondsStreamed = dateUnix - Number(cliffDateUnix || startDateUnix);

    if (secondsStreamed > 0) {
      const amountStreamed = BigNumber.from(secondsStreamed).mul(
        BigNumber.from(flowRate).toNumber()
      );

      const vestedCliffAmount = secondsStreamed > 0 ? cliffAmount : "0";

      const etherAmount = formatEther(amountStreamed.add(vestedCliffAmount));

      return [
        ...mappedData,
        {
          x: date.getTime(),
          y: Number(etherAmount),
          ether: etherAmount,
        },
      ];
    }

    return [
      ...mappedData,
      {
        x: date.getTime(),
        y: 0,
        ether: "0",
      },
    ];
  }, []);
}

interface VestingGraphProps {
  vestingSchedule: VestingSchedule;
  height?: number;
}

const VestingGraph: FC<VestingGraphProps> = ({
  vestingSchedule,
  height = 180,
}) => {
  const theme = useTheme();

  const datasets = useMemo(() => {
    const dateNowUnix = getUnixTime(new Date());

    const mappedDataPoints = mapVestingGraphDataPoints(vestingSchedule);

    const vestedDataPoints = mappedDataPoints.filter(
      ({ x }) => x <= dateNowUnix
    );

    const notVestedDataPoints = mappedDataPoints.filter(
      ({ x }) => x > dateNowUnix
    );

    return [
      vestedDataPoints, // Used for the green (vested) line.
      notVestedDataPoints, // Used for the gray (not vested) line.
    ];
  }, [vestingSchedule]);

  const datasetConfigCb = useCallback(
    (ctx: CanvasRenderingContext2D) => {
      return buildDefaultDatasetConf(ctx, theme.palette.primary.main, height);
    },
    [height, theme]
  );

  const datasetsConfigCallbacks = useMemo(
    () => [datasetConfigCb, datasetConfigCb],
    [datasetConfigCb]
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
