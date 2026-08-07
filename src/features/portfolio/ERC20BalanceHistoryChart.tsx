import { useTheme } from "@mui/material";
import { utils } from "ethers";
import { FC, useMemo } from "react";
import LineChart, { DataPoint } from "../../components/Chart/LineChart";
import {
  buildDefaultDatasetConf,
  createCTXGradient,
} from "../../utils/chartUtils";
import { ERC20BalanceHistoryPoint } from "./erc20BalanceHistory";

const ERC20BalanceHistoryChart: FC<{
  points: ERC20BalanceHistoryPoint[];
  decimals: number;
  symbol: string;
  height?: number;
}> = ({ points, decimals, symbol, height = 210 }) => {
  const theme = useTheme();
  const data = useMemo<DataPoint[]>(
    () =>
      points.flatMap((point) => {
        try {
          const formatted = utils.formatUnits(point.balance, decimals);
          const value = Number(formatted);
          return Number.isFinite(value)
            ? [
                {
                  x: Date.parse(point.timestamp),
                  y: value,
                  ether: `${formatted} ${symbol}`,
                },
              ]
            : [];
        } catch {
          return [];
        }
      }),
    [decimals, points, symbol]
  );
  const datasetConfig = useMemo(
    () => [
      (context: CanvasRenderingContext2D) => ({
        ...buildDefaultDatasetConf(context, theme.palette.primary.main, height),
        backgroundColor: createCTXGradient(
          context,
          theme.palette.primary.main,
          height
        ),
        stepped: "after" as const,
        pointRadius: data.length < 12 ? 3 : 0,
      }),
    ],
    [data.length, height, theme.palette.primary.main]
  );

  return (
    <LineChart
      datasets={[data]}
      datasetsConfigCallbacks={datasetConfig}
      height={height}
    />
  );
};

export default ERC20BalanceHistoryChart;
