import { Skeleton, Stack, Typography, useTheme } from "@mui/material";
import { ChartOptions } from "chart.js";
import { BigNumber, ethers } from "ethers";
import { FC, useMemo } from "react";
import LineChart, { DataPoint } from "../../components/Chart/LineChart";
import { buildDefaultDatasetConf } from "../../utils/chartUtils";
import { ERC20TransferHistoryItem } from "./erc20TransferHistory";

interface ERC20BalanceGraphProps {
  accountAddress: string;
  balance?: string;
  decimals: number;
  loading: boolean;
  symbol: string;
  transfers: ERC20TransferHistoryItem[];
}

const ERC20BalanceGraph: FC<ERC20BalanceGraphProps> = ({
  accountAddress,
  balance,
  decimals,
  loading,
  symbol,
  transfers,
}) => {
  const theme = useTheme();
  const height = 190;

  const dataset = useMemo<DataPoint[]>(() => {
    if (balance === undefined || transfers.length === 0) return [];

    const lowerAccountAddress = accountAddress.toLowerCase();
    let runningBalance = BigNumber.from(balance);
    const points: DataPoint[] = [];
    const toPoint = (x: number, value: BigNumber): DataPoint => {
      const nonNegativeValue = value.isNegative() ? BigNumber.from(0) : value;
      const formatted = ethers.utils.formatUnits(nonNegativeValue, decimals);
      const numericValue = Number(formatted);

      return {
        x,
        y: Number.isFinite(numericValue) ? numericValue : 0,
        ether: `${formatted} ${symbol}`,
      };
    };

    const groups = new Map<number, ERC20TransferHistoryItem[]>();
    transfers.forEach((transfer) => {
      const timestamp = Date.parse(transfer.timestamp);
      if (!Number.isFinite(timestamp)) return;
      const group = groups.get(timestamp) ?? [];
      group.push(transfer);
      groups.set(timestamp, group);
    });

    const timestamps = [...groups.keys()].sort((a, b) => b - a);
    if (timestamps.length === 0) return [];
    const latestTimestamp = timestamps[0];
    points.push(
      toPoint(Math.max(Date.now(), latestTimestamp + 1), runningBalance)
    );

    timestamps.forEach((timestamp) => {
      points.push(toPoint(timestamp, runningBalance));

      groups.get(timestamp)?.forEach((transfer) => {
        const isIncoming = transfer.to === lowerAccountAddress;
        const isOutgoing = transfer.from === lowerAccountAddress;
        if (isIncoming === isOutgoing) return;

        try {
          const amount = BigNumber.from(transfer.rawValue);
          runningBalance = isIncoming
            ? runningBalance.sub(amount)
            : runningBalance.add(amount);
        } catch {
          // Ignore malformed values while preserving the rest of the history.
        }
      });

      points.push(toPoint(timestamp - 1, runningBalance));
    });

    return points.sort((a, b) => a.x - b.x);
  }, [accountAddress, balance, decimals, symbol, transfers]);

  const options = useMemo<ChartOptions<"line">>(
    () => ({
      interaction: {
        mode: "nearest",
        axis: "x",
        intersect: false,
      },
      scales: {
        x:
          dataset.length > 1
            ? {
                min: dataset[0].x,
                max: dataset[dataset.length - 1].x,
                offset: true,
              }
            : { offset: true },
        y: { beginAtZero: true },
      },
    }),
    [dataset]
  );

  const datasetsConfigCallbacks = useMemo(
    () => [
      (context: CanvasRenderingContext2D) => ({
        ...buildDefaultDatasetConf(context, theme.palette.primary.main, height),
        label: `${symbol} balance`,
        stepped: "after" as const,
        tension: 0,
        pointRadius: dataset.length <= 50 ? 3 : 0,
      }),
    ],
    [dataset.length, symbol, theme.palette.primary.main]
  );

  if (loading && balance === undefined) {
    return <Skeleton variant="rounded" width="100%" height={height} />;
  }

  if (dataset.length === 0) {
    return (
      <Stack
        sx={{
          alignItems: "center",
          justifyContent: "center",
          height,
          color: "text.secondary",
        }}
      >
        <Typography variant="body2">
          Balance history will appear after the first indexed transfer.
        </Typography>
      </Stack>
    );
  }

  return (
    <LineChart
      height={height}
      datasets={[dataset]}
      options={options}
      datasetsConfigCallbacks={datasetsConfigCallbacks}
    />
  );
};

export default ERC20BalanceGraph;
