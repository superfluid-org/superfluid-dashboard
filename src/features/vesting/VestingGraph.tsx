import { useTheme } from "@mui/material";
import { fromUnixTime, getUnixTime } from "date-fns";
import { BigNumber } from "ethers";
import { formatEther } from "ethers/lib/utils";
import { FC, useMemo } from "react";
import LineChart, { DataPoint } from "../../components/Chart/LineChart";
import { buildDefaultDatasetConf } from "../../utils/chartUtils";
import { getDatesBetween } from "../../utils/dateUtils";
import { UnitOfTime } from "../send/FlowRateInput";
import { VestingSchedule } from "./types";

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
    const dateNow = Date.now();

    const mappedDataPoints = mapVestingGraphDataPoints(vestingSchedule);

    const vestedDataPoints = mappedDataPoints.filter(({ x }) => x <= dateNow);
    const notVestedDataPoints = mappedDataPoints.filter(({ x }) => x > dateNow);

    return [
      vestedDataPoints, // Used for the green (vested) line.
      notVestedDataPoints, // Used for the gray (not vested) line.
    ];
  }, [vestingSchedule]);

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
