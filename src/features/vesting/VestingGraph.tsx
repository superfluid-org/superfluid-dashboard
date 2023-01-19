import { useTheme } from "@mui/material";
import {
  FlowUpdatedEvent,
  Stream,
  TransferEvent,
} from "@superfluid-finance/sdk-core";
import { add, fromUnixTime, getUnixTime, isSameDay, min } from "date-fns";
import { BigNumber, ethers } from "ethers";
import { formatEther } from "ethers/lib/utils";
import { orderBy, sortBy } from "lodash/fp";
import { FC, useMemo } from "react";
import LineChart from "../../components/Chart/LineChart";
import useTimer from "../../hooks/useTimer";
import { VestingActivities } from "../../pages/vesting/[_network]/[_id]";
import { Activities, Activity } from "../../utils/activityUtils";
import { buildDefaultDatasetConf } from "../../utils/chartUtils";
import { dateNowSeconds, getDatesBetween } from "../../utils/dateUtils";
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

interface DataPoint {
  x: number;
  y: number;
  ether: string;
}

type MappedData = Array<DataPoint>;

interface TokenBalance {
  balance: string;
  totalNetFlowRate: string;
  timestamp: number;
}

function mapVestingActualDataPoints(
  vestingActivities: VestingActivities,
  vestingSchedule: VestingSchedule,
  dateNow: Date
) {
  const startDate = fromUnixTime(Number(vestingSchedule.startDate));
  const vestingEndDate = fromUnixTime(Number(vestingSchedule.endDate));

  const endDate = vestingSchedule.endExecutedAt
    ? min([fromUnixTime(Number(vestingSchedule.endExecutedAt)), dateNow])
    : dateNow;

  const frequency = getFrequency(startDate, vestingEndDate);

  const dates = getDatesBetween(startDate, endDate, frequency);

  const mappedTokenBalances = sortBy(
    (activity) => activity.keyEvent.timestamp,
    vestingActivities
  )
    .reduce((tokenBalances, activity) => {
      const lastBalance =
        tokenBalances.length > 0
          ? tokenBalances[tokenBalances.length - 1]
          : ({
              balance: "0",
              totalNetFlowRate: "0",
              timestamp: Number(vestingSchedule.startDate),
            } as TokenBalance);

      const secondsElapsed =
        activity.keyEvent.timestamp - lastBalance.timestamp;

      const amountFlowed = BigNumber.from(lastBalance.totalNetFlowRate).mul(
        secondsElapsed
      );

      const newBalance = BigNumber.from(lastBalance.balance).add(amountFlowed);

      if (activity.keyEvent.name === "FlowUpdated") {
        return [
          ...tokenBalances,
          {
            balance: newBalance.toString(),
            totalNetFlowRate: activity.keyEvent.flowRate,
            timestamp: activity.keyEvent.timestamp,
          },
        ];
      } else if (activity.keyEvent.name === "Transfer") {
        const newerBalance = newBalance.add(activity.keyEvent.value);

        return [
          ...tokenBalances,
          {
            balance: lastBalance.balance,
            totalNetFlowRate: lastBalance.totalNetFlowRate,
            timestamp: activity.keyEvent.timestamp - 1,
          },
          {
            balance: newerBalance.toString(),
            totalNetFlowRate: lastBalance.totalNetFlowRate,
            timestamp: activity.keyEvent.timestamp,
          },
        ];
      }

      return tokenBalances;
    }, [] as TokenBalance[])
    .reverse();

  const initialTokenBalance = {
    balance: "0",
    totalNetFlowRate: "0",
    timestamp: Number(vestingSchedule.startDate),
  } as TokenBalance;

  return mapTokenBalancesToDataPoints(
    dates,
    mappedTokenBalances,
    frequency,
    initialTokenBalance
  );
}

const isSameFrequency = (date1: number, date2: number, frequency: UnitOfTime) =>
  date1 <= date2 && date2 <= date1 + frequency;

function mapTokenBalancesToDataPoints(
  dates: Date[],
  tokenBalances: TokenBalance[],
  frequency: UnitOfTime,
  initialTokenBalance: TokenBalance
) {
  return dates.reduce<{
    data: MappedData;
    lastTokenBalance: TokenBalance;
  }>(
    ({ data, lastTokenBalance }, date) => {
      const currentTokenBalance =
        tokenBalances.find(({ timestamp }) =>
          isSameFrequency(getUnixTime(date), timestamp, frequency)
        ) || lastTokenBalance;

      const { balance, totalNetFlowRate, timestamp } = currentTokenBalance;

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
        data: [
          ...data,
          {
            x: date.getTime(),
            y: Number(pointValue),
            ether: pointValue,
          },
        ],
        lastTokenBalance: currentTokenBalance,
      };
    },
    {
      data: [],
      lastTokenBalance: initialTokenBalance,
    }
  ).data;
}

function mapVestingExpectedDataPoints(vestingSchedule: VestingSchedule) {
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
    const actualDataPoints = mapVestingActualDataPoints(
      vestingActivities,
      vestingSchedule,
      dateNow
    );
    const expectedDataPoints = mapVestingExpectedDataPoints(vestingSchedule);

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
