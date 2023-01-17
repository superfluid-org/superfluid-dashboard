import { useTheme } from "@mui/material";
import { fromUnixTime, getUnixTime } from "date-fns";
import { BigNumber } from "ethers";
import { formatEther } from "ethers/lib/utils";
import { FC, useEffect, useMemo, useState } from "react";
import LineChart, { DataPoint } from "../../components/Chart/LineChart";
import useTimer from "../../hooks/useTimer";
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

  const cliffAndFlowDateUnix = Number(
    cliffDateUnix !== "0" ? cliffDateUnix : startDateUnix
  );

  const dates = getDatesBetween(
    startDate,
    endDate,
    getFrequency(startDate, endDate)
  );

  // If there is no cliff then we are not going to add a separate data point for that.
  let cliffAdded = cliffAmount === "0";

  return dates.reduce((mappedData: DataPoint[], date: Date) => {
    const dateUnix = getUnixTime(date);

    const secondsStreamed = dateUnix - cliffAndFlowDateUnix;

    if (secondsStreamed > 0) {
      const amountStreamed = BigNumber.from(secondsStreamed).mul(flowRate);

      const etherAmount = formatEther(amountStreamed.add(cliffAmount || "0"));

      const newDataPoint = {
        x: date.getTime(),
        y: Number(etherAmount),
        ether: etherAmount,
      };

      if (!cliffAdded) {
        cliffAdded = true;
        const cliffAmountEther = formatEther(cliffAmount || "0");

        return [
          ...mappedData,
          {
            x: fromUnixTime(Number(cliffDateUnix)).getTime(),
            y: Number(cliffAmountEther),
            ether: cliffAmountEther,
          },
          newDataPoint,
        ];
      }

      return [...mappedData, newDataPoint];
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

  const dateNow = useTimer(UnitOfTime.Minute);

  const datasets = useMemo(() => {
    const dateNowMs = dateNow.getTime();
    const mappedDataPoints = mapVestingGraphDataPoints(vestingSchedule);

    const vestedDataPoints = mappedDataPoints.filter(({ x }) => x <= dateNowMs);
    const notVestedDataPoints = mappedDataPoints.filter(
      ({ x }) => x > dateNowMs
    );

    const lastVested = vestedDataPoints[vestedDataPoints.length - 1];

    return [
      vestedDataPoints, // Used for the green (vested) line.
      [...(lastVested ? [lastVested] : []), ...notVestedDataPoints], // Used for the gray (not vested) line.
    ];
  }, [vestingSchedule, dateNow]);

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
