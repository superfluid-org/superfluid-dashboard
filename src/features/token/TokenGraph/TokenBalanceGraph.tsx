import { Skeleton, useTheme } from "@mui/material";
import { Address } from "@superfluid-finance/sdk-core";
import { ChartOptions } from "chart.js/auto";
import { fromUnixTime, getUnixTime, isSameDay, max, sub } from "date-fns";
import { BigNumber, ethers } from "ethers";
import minBy from "lodash/fp/minBy";
import { FC, useMemo } from "react";
import LineChart, { DataPoint } from "../../../components/Chart/LineChart";
import {
  buildDefaultDatasetConf,
  estimateFrequencyByTimestamp,
  getFilteredStartDate,
} from "../../../utils/chartUtils";
import { dateNowSeconds, getDatesBetween } from "../../../utils/dateUtils";
import { TimeUnitFilterType } from "../../graph/TimeUnitFilter";
import { Network } from "../../network/networks";
import { TokenBalance } from "../../redux/endpoints/adHocSubgraphEndpoints";
import { RealtimeBalance } from "../../redux/endpoints/balanceFetcher";
import { rpcApi, subgraphApi } from "../../redux/store";

const mapForecastDatesWithData = (
  realTimeBalance: RealtimeBalance,
  dates: Date[]
) => {
  const {
    balance,
    balanceTimestamp: balanceTimestamp,
    flowRate,
  } = realTimeBalance;

  const balanceBigNumber = BigNumber.from(balance);

  return dates.map((date) => {
    const etherAtDate = ethers.utils.formatEther(
      balanceBigNumber.add(
        BigNumber.from(flowRate).mul(
          BigNumber.from(getUnixTime(date) - balanceTimestamp)
        )
      )
    );

    return {
      x: date.getTime(),
      y: Number(etherAtDate),
      ether: etherAtDate,
    };
  });
};

const mapDatesWithData = (
  tokenBalances: Array<TokenBalance>,
  dates: Array<Date>
): DataPoint[] =>
  dates.reduce<{
    data: DataPoint[];
    lastTokenBalance: TokenBalance;
  }>(
    ({ data, lastTokenBalance }, date) => {
      const currentTokenBalance =
        tokenBalances.find(({ timestamp }) =>
          isSameDay(date, new Date(timestamp * 1000))
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
      lastTokenBalance: {
        balance: "0",
        totalNetFlowRate: "0",
        timestamp: dateNowSeconds(),
      } as TokenBalance,
    }
  ).data;

interface TokenBalanceGraphProps {
  filter: TimeUnitFilterType;
  network: Network;
  account: Address;
  token: Address;
  showForecast?: boolean;
  height?: number;
}

const TokenBalanceGraph: FC<TokenBalanceGraphProps> = ({
  filter,
  network,
  account,
  token,
  showForecast,
  height = 180,
}) => {
  const theme = useTheme();

  const realTimeBalanceQuery = rpcApi.useRealtimeBalanceQuery({
    chainId: network.id,
    tokenAddress: token,
    accountAddress: account,
  });

  const accountTokenBalanceHistoryQuery =
    subgraphApi.useAccountTokenBalanceHistoryQuery({
      chainId: network.id,
      accountAddress: account,
      tokenAddress: token,
    });

  const tokenBalances = useMemo(
    () => accountTokenBalanceHistoryQuery.data || [],
    [accountTokenBalanceHistoryQuery.data]
  );

  const { startDate, endDate, dateNow, frequency } = useMemo(() => {
    const currentDate = new Date();
    const currentDateUnix = getUnixTime(currentDate);

    const smallestTimestamp =
      minBy((x) => x.timestamp, tokenBalances)?.timestamp || currentDateUnix;

    const minimumDateUnix = getUnixTime(sub(currentDate, { days: 1 }));

    const startDateUnix = Math.min(smallestTimestamp, minimumDateUnix);

    const forecastEndUnix =
      currentDateUnix + (currentDateUnix - startDateUnix) / 4;

    const endDateUnix = showForecast ? forecastEndUnix : currentDateUnix;

    const frequency = estimateFrequencyByTimestamp(
      startDateUnix,
      currentDateUnix
    );

    return {
      dateNow: currentDate,
      startDate: fromUnixTime(startDateUnix - frequency),
      endDate: fromUnixTime(endDateUnix),
      frequency,
    };
  }, [tokenBalances, showForecast]);

  const datasets = useMemo(
    () => {
      if (tokenBalances.length === 0) return [[], []];

      const balanceDates = getDatesBetween(startDate, dateNow, frequency);

      const balanceDataset = mapDatesWithData(tokenBalances, balanceDates);

      if (!showForecast || !realTimeBalanceQuery.data)
        return [balanceDataset, []];

      const forecastDates = getDatesBetween(dateNow, endDate, frequency);
      const forecastDataset = mapForecastDatesWithData(
        realTimeBalanceQuery.data,
        forecastDates
      );

      return [balanceDataset, forecastDataset];
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      tokenBalances,
      realTimeBalanceQuery.data,
      showForecast,
      startDate,
      endDate,
      dateNow,
      frequency,
    ]
  );

  const options = useMemo(() => {
    const startDateWithMinimum = max([
      startDate,
      getFilteredStartDate(filter, dateNow, startDate),
    ]);

    const dateNowUnix = getUnixTime(dateNow);
    const maxDate = showForecast
      ? fromUnixTime(
        dateNowUnix + (dateNowUnix - getUnixTime(startDateWithMinimum)) / 4
      )
      : dateNow;

    return {
      scales: {
        x: {
          min: startDateWithMinimum.getTime(),
          max: maxDate.getTime(),
          offset: true,
        },
        y: {
          offset: true,
        },
      },
    } as ChartOptions<"line">;
  }, [startDate, dateNow, filter, showForecast]);

  const datasetsConfigCallbacks = useMemo(
    () => [
      (ctx: CanvasRenderingContext2D) =>
        buildDefaultDatasetConf(ctx, theme.palette.primary.main, height),
      (ctx: CanvasRenderingContext2D) => ({
        ...buildDefaultDatasetConf(ctx, theme.palette.secondary.main, height),
        borderDash: [6, 6],
      }),
    ],
    [height, theme.palette.primary.main, theme.palette.secondary.main]
  );

  if (accountTokenBalanceHistoryQuery.isLoading) {
    return <Skeleton variant="rounded" width="100%" height={`${height}px`} />;
  }

  return (
    <LineChart
      height={height}
      datasets={datasets}
      options={options}
      datasetsConfigCallbacks={datasetsConfigCallbacks}
    />
  );
};

export default TokenBalanceGraph;
