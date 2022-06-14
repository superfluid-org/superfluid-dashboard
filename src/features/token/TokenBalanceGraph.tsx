import { Box, useTheme } from "@mui/material";
import { Address } from "@superfluid-finance/sdk-core";
import Chart, {
  ScriptableLineSegmentContext,
  TooltipItem,
} from "chart.js/auto";
import {
  add,
  endOfDay,
  format,
  isSameDay,
  startOfDay,
  startOfYear,
  sub,
} from "date-fns";
import { BigNumber, ethers } from "ethers";
import minBy from "lodash/fp/minBy";
import { FC, useCallback, useEffect, useMemo, useRef } from "react";
import {
  buildDefaultDatasetConf,
  createCTXGradient,
  DEFAULT_LINE_CHART_OPTIONS,
} from "../../utils/chartUtils";
import { getDatesBetween } from "../../utils/dateUtils";
import { Network } from "../network/networks";
import { TokenBalance } from "../redux/endpoints/adHocSubgraphEndpoints";
import { rpcApi, subgraphApi } from "../redux/store";
import set from "lodash/fp/set";

export const forecastEstimation =
  (dataLength: number) => (result: any) => (c: ScriptableLineSegmentContext) =>
    c.p1DataIndex > dataLength ? result : undefined;

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

interface GraphData {
  data: Array<DataPoint>;
  labels: string[];
}

type MappedData = Array<{ value: DataPoint; date: Date }>;

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
  const theme = useTheme();
  const canvasRef = useRef<HTMLCanvasElement>(null);

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

  const realTimeBalanceQuery = rpcApi.useRealtimeBalanceQuery({
    chainId: network.id,
    tokenAddress: token,
    accountAddress: account,
  });

  const getGraphStartDate = (type: GraphType) => {
    const currentDate = new Date();

    switch (type) {
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
      default:
        return startOfYear(currentDate);
    }
  };

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

          const pointValue = ethers.utils.formatEther(
            BigNumber.from(balance).add(flowingBalance)
          );

          return {
            data: [
              ...data,
              {
                value: {
                  x: 0,
                  y: Number(pointValue),
                  ether: pointValue,
                },
                date,
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

  const graphData = useMemo(
    () => {
      if (tokenBalances.length === 0) return [];

      return mapDatesWithData(
        tokenBalances,
        getDatesBetween(
          endOfDay(
            new Date(
              ((minBy("timestamp", tokenBalances)?.timestamp || 0) -
                60 * 60 * 24) *
                1000
            )
          ),
          new Date()
        )
      );
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [tokenBalances]
  );

  const filteredGraphData = useMemo(() => {
    if (graphType === GraphType.All) return graphData;

    const startDate = getGraphStartDate(graphType);
    return graphData.filter(({ date }) => date > startDate);
  }, [graphData, graphType]);

  const generateForecast = useCallback(
    (
      balance: string,
      balanceTimestamp: number,
      flowRate: string,
      length: number
    ) => {
      const dates = getDatesBetween(
        startOfDay(add(new Date(), { days: 1 })),
        startOfDay(add(new Date(), { days: length })) // Forecast is 1/5 of the graph.
      );

      return dates.map((date) => {
        const flowedBalance =
          flowRate === "0"
            ? BigNumber.from(0)
            : BigNumber.from(
                Math.floor(date.getTime() / 1000) - balanceTimestamp
              ).mul(BigNumber.from(flowRate));

        const balanceAtTime = ethers.utils.formatEther(
          BigNumber.from(balance).add(flowedBalance)
        );
        return {
          value: {
            x: 0,
            y: Number(balanceAtTime),
            ether: balanceAtTime,
          },
          date,
        };
      });
    },
    []
  );

  const generatedForecast = useMemo(() => {
    if (
      filteredGraphData.length > 0 &&
      realTimeBalanceQuery.data &&
      showForecast
    ) {
      const { balance, balanceTimestamp, flowRate } = realTimeBalanceQuery.data;
      return generateForecast(
        balance,
        balanceTimestamp,
        flowRate,
        Math.floor(filteredGraphData.length / 4)
      );
    }

    return [];
  }, [
    filteredGraphData.length,
    realTimeBalanceQuery.data,
    generateForecast,
    showForecast,
  ]);

  useEffect(() => {
    let chart: Chart | null = null;

    if (canvasRef.current) {
      const ctx = canvasRef.current.getContext("2d");

      if (ctx) {
        const { data, labels } = filteredGraphData
          .concat(generatedForecast)
          .reduce<GraphData>(
            (mappedData, dataPoint) => ({
              data: [...mappedData.data, dataPoint.value],
              labels: [
                ...mappedData.labels,
                format(dataPoint.date, "MMMM do, yyyy"),
              ],
            }),
            { data: [], labels: [] }
          );

        const forecastGradient = createCTXGradient(
          ctx,
          theme.palette.secondary.main,
          height
        );

        const forecastEstimationFunc = forecastEstimation(
          filteredGraphData.length
        );

        chart = new Chart(ctx, {
          type: "line",
          data: {
            labels,
            datasets: [
              {
                data,
                ...buildDefaultDatasetConf(
                  ctx,
                  theme.palette.primary.main,
                  height
                ),
                segment: {
                  borderColor: forecastEstimationFunc(
                    theme.palette.secondary.main
                  ),
                  borderDash: forecastEstimationFunc([6, 6]),
                  backgroundColor: forecastEstimationFunc(forecastGradient),
                },
              },
            ],
          },
          options: set(
            "plugins.tooltip.callbacks.label",
            (context: TooltipItem<"line">) => {
              return (context.raw as DataPoint).ether;
            },
            DEFAULT_LINE_CHART_OPTIONS
          ),
        });
      }
    }

    return () => {
      if (chart) chart.destroy();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [canvasRef, filteredGraphData, generatedForecast]);

  return (
    <Box sx={{ height, mx: -0.5 }}>
      <canvas ref={canvasRef} />
    </Box>
  );
};

export default TokenBalanceGraph;
