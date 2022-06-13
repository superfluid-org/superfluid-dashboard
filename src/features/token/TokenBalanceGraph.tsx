import { Box, useTheme } from "@mui/material";
import { Address } from "@superfluid-finance/sdk-core";
import Chart from "chart.js/auto";
import { endOfDay, format, isSameDay, startOfYear, sub } from "date-fns";
import { BigNumber, ethers } from "ethers";
import minBy from "lodash/fp/minBy";
import { FC, useCallback, useEffect, useMemo, useRef } from "react";
import {
  buildDefaultDatasetConf,
  DEFAULT_LINE_CHART_OPTIONS,
} from "../../utils/chartUtils";
import { getDatesBetween } from "../../utils/dateUtils";
import { Network } from "../network/networks";
import { TokenBalance } from "../redux/endpoints/adHocSubgraphEndpoints";
import { subgraphApi } from "../redux/store";

export enum GraphType {
  Day,
  Week,
  Month,
  Quarter,
  Year,
  YTD,
  All,
}

interface GraphData {
  data: number[];
  labels: string[];
}

interface DataPoint {
  value: number;
  date: Date;
}

interface TokenBalanceGraphProps {
  graphType: GraphType;
  network: Network;
  account: Address;
  token: Address;
  height?: number;
}

const TokenBalanceGraph: FC<TokenBalanceGraphProps> = ({
  graphType,
  network,
  account,
  token,
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
    (tokenBalances: Array<TokenBalance>, dates: Array<Date>) =>
      dates.reduce<{
        data: Array<DataPoint>;
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

          return {
            data: [
              ...data,
              {
                value: Number(
                  ethers.utils.formatEther(
                    BigNumber.from(balance).add(flowingBalance)
                  )
                ),
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

  useEffect(() => {
    let chart: Chart | null = null;

    if (canvasRef.current) {
      const ctx = canvasRef.current.getContext("2d");

      if (ctx) {
        const { data, labels } = filteredGraphData.reduce<GraphData>(
          (mappedData, dataPoint) => ({
            data: [...mappedData.data, dataPoint.value],
            labels: [
              ...mappedData.labels,
              format(dataPoint.date, "MMMM do, yyyy"),
            ],
          }),
          { data: [], labels: [] }
        );

        chart = new Chart(ctx, {
          type: "line",
          data: {
            labels,
            datasets: [
              {
                ...buildDefaultDatasetConf(
                  ctx,
                  theme.palette.primary.main,
                  height
                ),
                data,
                // TODO: This conf is for forecast
                // segment: {
                //   borderColor: estimation(
                //     data.length,
                //     theme.palette.secondary.main
                //   ),
                //   borderDash: estimation(data.length, [6, 6]),
                //   backgroundColor: estimation(data.length, redGradient),
                // },
              },
            ],
          },
          options: DEFAULT_LINE_CHART_OPTIONS,
        });
      }
    }

    return () => {
      if (chart) chart.destroy();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [canvasRef, filteredGraphData]);

  return (
    <Box sx={{ height, mx: -0.5 }}>
      <canvas ref={canvasRef} />
    </Box>
  );
};

export default TokenBalanceGraph;
