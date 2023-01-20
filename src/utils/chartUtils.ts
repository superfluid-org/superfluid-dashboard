import { alpha } from "@mui/material";
import { ChartDataset, ChartOptions } from "chart.js";
import { fromUnixTime, getUnixTime } from "date-fns";
import { BigNumber, ethers } from "ethers";
import { DataPoint } from "../components/Chart/LineChart";
import { UnitOfTime } from "../features/send/FlowRateInput";

export const DEFAULT_LINE_CHART_OPTIONS: ChartOptions<"line"> = {
  responsive: true,
  maintainAspectRatio: false,
  interaction: {
    intersect: false,
  },
  plugins: {
    legend: {
      display: false,
    },
    tooltip: {
      displayColors: false,
    },
  },
  scales: {
    y: {
      display: false,
      grace: 0,
    },
    x: {
      display: false,
      type: "logarithmic",
    },
  },
};

export const createCTXGradient = (
  ctx: CanvasRenderingContext2D,
  color: string,
  height: number
) => {
  var gradient = ctx.createLinearGradient(0, 0, 0, height);
  gradient.addColorStop(0, alpha(color, 0.2));
  gradient.addColorStop(1, alpha(color, 0));
  return gradient;
};

export const buildDefaultDatasetConf = (
  ctx: CanvasRenderingContext2D,
  color: string,
  height: number
): Omit<ChartDataset<"line">, "data"> => ({
  backgroundColor: createCTXGradient(ctx, color, height),
  label: "Balance",
  fill: true,
  borderWidth: 3,
  borderColor: color,
  pointRadius: 5,
  pointBorderColor: "transparent",
  pointBackgroundColor: "transparent",
  tension: 0.1,
});

export function estimateFrequencyByTimestamp(
  startUnix: string,
  endUnix: string
): UnitOfTime {
  return estimateFrequency(
    fromUnixTime(Number(startUnix)),
    fromUnixTime(Number(endUnix))
  );
}

export function estimateFrequency(startDate: Date, endDate: Date): UnitOfTime {
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

export interface TokenBalance {
  balance: string;
  totalNetFlowRate: string;
  timestamp: number;
}

export const isSameFrequency = (
  date1: number,
  date2: number,
  frequency: UnitOfTime
) => date1 <= date2 && date2 <= date1 + frequency;

export function mapTokenBalancesToDataPoints(
  dates: Date[],
  tokenBalances: TokenBalance[],
  frequency: UnitOfTime,
  initialTokenBalance: TokenBalance
) {
  return dates.reduce<{
    data: DataPoint[];
    lastTokenBalance: TokenBalance;
  }>(
    ({ data, lastTokenBalance }, date) => {
      const foundTokenBalances = tokenBalances.filter(({ timestamp }) =>
        isSameFrequency(getUnixTime(date), timestamp, frequency)
      );

      const currentTokenBalances =
        foundTokenBalances.length > 0 ? foundTokenBalances : [lastTokenBalance];

      const mappedDataPoints = currentTokenBalances.map((tokenBalance) =>
        mapFrequencyTokenBalanceToDataPoints(date, tokenBalance)
      );

      return {
        data: [...data, ...mappedDataPoints],
        lastTokenBalance: currentTokenBalances[currentTokenBalances.length - 1],
      };
    },
    {
      data: [],
      lastTokenBalance: initialTokenBalance,
    }
  ).data;
}

export function mapFrequencyTokenBalanceToDataPoints(
  date: Date,
  tokenBalance: TokenBalance
) {
  const { balance, totalNetFlowRate, timestamp } = tokenBalance;

  const flowingBalance =
    totalNetFlowRate !== "0"
      ? BigNumber.from(totalNetFlowRate).mul(
          BigNumber.from(Math.floor(date.getTime() / 1000) - timestamp)
        )
      : BigNumber.from(0);

  const wei = BigNumber.from(balance).add(flowingBalance);

  const pointValue = ethers.utils.formatEther(
    wei.gt(BigNumber.from(0)) ? wei : BigNumber.from(0)
  );

  return {
    x: date.getTime(),
    y: Number(pointValue),
    ether: pointValue,
  };
}
