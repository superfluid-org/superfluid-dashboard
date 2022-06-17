import { Box, useTheme } from "@mui/material";
import { Address } from "@superfluid-finance/sdk-core";
import Chart, { TooltipItem } from "chart.js/auto";
import {
  add,
  differenceInDays,
  endOfDay,
  format,
  isSameDay,
  startOfYear,
  sub,
} from "date-fns";
import { BigNumber, ethers } from "ethers";
import minBy from "lodash/fp/minBy";
import set from "lodash/fp/set";
import mutateSet from "lodash/set";
import { FC, useCallback, useEffect, useMemo, useRef } from "react";
import {
  buildDefaultDatasetConf,
  DEFAULT_LINE_CHART_OPTIONS,
} from "../../utils/chartUtils";
import { getDatesBetween } from "../../utils/dateUtils";
import { Network } from "../network/networks";
import { TokenBalance } from "../redux/endpoints/adHocSubgraphEndpoints";
import { rpcApi, subgraphApi } from "../redux/store";

export enum GraphType {
  Day,
  Week,
  Month,
  Quarter,
  Year,
  YTD,
  All,
}

interface DataPoint {
  x: number;
  y: number;
  ether: string;
}

type MappedData = Array<DataPoint>;

interface TokenBalanceGraphProps {
  graphType: GraphType;
  network: Network;
  account: Address;
  token: Address;
  showForecast?: boolean;
  height?: number;
}

const TokenBalanceGraph: FC<TokenBalanceGraphProps> = ({
  graphType,
  network,
  account,
  token,
  showForecast,
  height = 180,
}) => {
  const currentDate = useMemo(() => new Date(), []);
  const theme = useTheme();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const chartRef = useRef<Chart<"line"> | null>(null);

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

  const mapDatesWithData = useCallback(
    (tokenBalances: Array<TokenBalance>, dates: Array<Date>): MappedData =>
      dates.reduce<{
        data: MappedData;
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
            timestamp: Math.floor(Date.now() / 1000),
          } as TokenBalance,
        }
      ).data,
    []
  );

  const graphStartDate = useMemo(() => {
    switch (graphType) {
      case GraphType.Day:
        return sub(currentDate, {
          days: 1,
        });
      case GraphType.Week:
        return sub(currentDate, {
          days: 7,
        });
      case GraphType.Month:
        return sub(currentDate, {
          months: 1,
        });
      case GraphType.Quarter:
        return sub(currentDate, {
          months: 3,
        });
      case GraphType.Year:
        return sub(currentDate, {
          years: 1,
        });
      case GraphType.YTD:
        return startOfYear(currentDate);
      default: {
        const smallestDate =
          minBy("timestamp", tokenBalances)?.timestamp ||
          Math.floor(Date.now() / 1000);

        return add(new Date(smallestDate * 1000), { days: -1 });
      }
    }
  }, [tokenBalances, graphType, currentDate]);

  const graphData = useMemo(
    () => {
      if (tokenBalances.length === 0) return [];

      const smallestDate =
        minBy("timestamp", tokenBalances)?.timestamp ||
        Math.floor(Date.now() / 1000);

      return mapDatesWithData(
        tokenBalances,
        getDatesBetween(
          endOfDay(add(new Date(smallestDate * 1000), { days: -1 })),
          currentDate
        )
      );
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [tokenBalances, currentDate]
  );

  const forecast = useMemo(
    () => {
      if (!realTimeBalanceQuery.data) return [];

      const { balance, balanceTimestamp, flowRate } = realTimeBalanceQuery.data;
      const balanceBigNumber = BigNumber.from(balance);

      return getDatesBetween(
        currentDate,
        endOfDay(
          add(currentDate, {
            days: differenceInDays(
              add(currentDate, { months: 4 }),
              currentDate
            ),
          })
        )
      ).map((date) => {
        const ethersAtDate = ethers.utils.formatEther(
          balanceBigNumber.add(
            BigNumber.from(flowRate).mul(
              BigNumber.from(
                Math.floor(date.getTime() / 1000) - balanceTimestamp
              )
            )
          )
        );

        return {
          x: date.getTime(),
          y: Number(ethersAtDate),
          ether: ethersAtDate,
        };
      });
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [realTimeBalanceQuery.data, currentDate]
  );

  useEffect(() => {
    const canvasContext = canvasRef.current?.getContext("2d");
    if (!canvasContext) return;

    const chart = new Chart(canvasContext, {
      type: "line",
      data: {
        labels: [],
        datasets: [
          {
            data: [],
            ...buildDefaultDatasetConf(
              canvasContext,
              theme.palette.primary.main,
              height
            ),
          },
          {
            data: [],
            ...buildDefaultDatasetConf(
              canvasContext,
              theme.palette.secondary.main,
              height
            ),
            borderDash: [6, 6],
          },
        ],
      },
      options: set(
        "plugins.tooltip.callbacks",
        {
          title: (context: Array<TooltipItem<"line">>) =>
            format(new Date((context[0]?.raw as DataPoint).x), "MMMM do, yyyy"),
          label: (context: TooltipItem<"line">) =>
            (context.raw as DataPoint).ether,
        },
        DEFAULT_LINE_CHART_OPTIONS
      ),
    });

    chartRef.current = chart;

    return () => {
      chart.destroy();
    };
  }, [height, theme]);

  useEffect(() => {
    if (!chartRef.current) return;

    if (graphData.length > 0) {
      mutateSet(chartRef.current.data.datasets, "[0].data", graphData);
      mutateSet(chartRef.current.data.datasets, "[1].data", forecast);
    }

    const timespan = Math.floor(Date.now() - graphStartDate.getTime());
    const spacing = timespan / 100; // 1% of the y axis will be spacing or else clipping will occur.
    const forecastLength = showForecast ? timespan / 3 : 0; // Forecast will be 25% of the graph.

    mutateSet(
      chartRef.current.options,
      "scales.x.min",
      graphStartDate.getTime() - spacing
    );
    mutateSet(
      chartRef.current.options,
      "scales.x.max",
      Date.now() + forecastLength
    );

    chartRef.current.update();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chartRef, graphData, graphStartDate, forecast, showForecast]);

  return (
    <Box sx={{ height, mx: -0.5 }}>
      <canvas ref={canvasRef} />
    </Box>
  );
};

export default TokenBalanceGraph;
