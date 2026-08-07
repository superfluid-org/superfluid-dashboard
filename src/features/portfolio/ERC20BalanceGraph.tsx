import { Skeleton, Stack, useTheme } from "@mui/material";
import { ChartOptions } from "chart.js";
import { sub } from "date-fns";
import { BigNumber, ethers } from "ethers";
import { FC, useMemo } from "react";
import LineChart, { DataPoint } from "../../components/Chart/LineChart";
import {
  buildDefaultDatasetConf,
  getFilteredStartDate,
} from "../../utils/chartUtils";
import TimeUnitFilter, { TimeUnitFilterType } from "../graph/TimeUnitFilter";
import { ERC20TransferHistoryItem } from "./erc20TransferHistory";

export const ERC20_GRAPH_TIME_FILTERS = [
  TimeUnitFilterType.Week,
  TimeUnitFilterType.Month,
  TimeUnitFilterType.Quarter,
  TimeUnitFilterType.Year,
  TimeUnitFilterType.All,
];

interface ERC20BalanceGraphProps {
  accountAddress: string;
  balance?: string;
  decimals: number;
  filter: TimeUnitFilterType;
  loading: boolean;
  onFilterChange: (filter: TimeUnitFilterType) => void;
  symbol: string;
  transfers: ERC20TransferHistoryItem[];
}

interface TransferGroup {
  incoming: BigNumber;
  outgoing: BigNumber;
  timestamp: number;
}

const ERC20BalanceGraph: FC<ERC20BalanceGraphProps> = ({
  accountAddress,
  balance,
  decimals,
  filter,
  loading,
  onFilterChange,
  symbol,
  transfers,
}) => {
  const theme = useTheme();
  const height = 190;

  const { dataset, rangeStart, rangeEnd } = useMemo(() => {
    const now = new Date();
    const end = now.getTime();
    const parsedTransferTimestamps = transfers
      .map(({ timestamp }) => Date.parse(timestamp))
      .filter(Number.isFinite);
    const earliestTransfer =
      parsedTransferTimestamps.length > 0
        ? Math.min(...parsedTransferTimestamps)
        : sub(now, { months: 1 }).getTime();
    const start =
      filter === TimeUnitFilterType.All
        ? Math.max(0, earliestTransfer - 1)
        : getFilteredStartDate(filter, now, now).getTime();

    if (balance === undefined) {
      return { dataset: [], rangeStart: start, rangeEnd: end };
    }

    const lowerAccountAddress = accountAddress.toLowerCase();
    const groupedTransfers = new Map<number, TransferGroup>();

    transfers.forEach((transfer) => {
      const timestamp = Date.parse(transfer.timestamp);
      if (!Number.isFinite(timestamp) || timestamp < start || timestamp > end) {
        return;
      }

      const isIncoming = transfer.to === lowerAccountAddress;
      const isOutgoing = transfer.from === lowerAccountAddress;
      if (isIncoming === isOutgoing) return;

      try {
        const current = groupedTransfers.get(timestamp) ?? {
          incoming: BigNumber.from(0),
          outgoing: BigNumber.from(0),
          timestamp,
        };
        const amount = BigNumber.from(transfer.rawValue);
        groupedTransfers.set(timestamp, {
          ...current,
          incoming: isIncoming
            ? current.incoming.add(amount)
            : current.incoming,
          outgoing: isOutgoing
            ? current.outgoing.add(amount)
            : current.outgoing,
        });
      } catch {
        // Ignore malformed transfer values without dropping valid history.
      }
    });

    const groupsDescending = [...groupedTransfers.values()].sort(
      (first, second) => second.timestamp - first.timestamp
    );
    let runningBalance = BigNumber.from(balance);
    const balanceAfterTransfer = new Map<number, BigNumber>();

    groupsDescending.forEach(({ incoming, outgoing, timestamp }) => {
      balanceAfterTransfer.set(timestamp, runningBalance);
      runningBalance = runningBalance.sub(incoming).add(outgoing);
    });

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

    const points = [toPoint(start, runningBalance)];
    [...balanceAfterTransfer.entries()]
      .sort(
        ([firstTimestamp], [secondTimestamp]) =>
          firstTimestamp - secondTimestamp
      )
      .forEach(([timestamp, value]) => points.push(toPoint(timestamp, value)));

    if (points[points.length - 1]?.x !== end) {
      points.push(toPoint(end, BigNumber.from(balance)));
    }

    return { dataset: points, rangeStart: start, rangeEnd: end };
  }, [accountAddress, balance, decimals, filter, symbol, transfers]);

  const options = useMemo<ChartOptions<"line">>(
    () => ({
      interaction: {
        mode: "nearest",
        axis: "x",
        intersect: false,
      },
      scales: {
        x: {
          min: rangeStart,
          max: rangeEnd,
          offset: true,
        },
        y: { beginAtZero: true },
      },
    }),
    [rangeEnd, rangeStart]
  );

  const datasetsConfigCallbacks = useMemo(
    () => [
      (context: CanvasRenderingContext2D) => ({
        ...buildDefaultDatasetConf(context, theme.palette.primary.main, height),
        label: `${symbol} balance`,
        tension: 0.18,
        spanGaps: true,
        pointRadius: 0,
        pointHoverRadius: 4,
      }),
    ],
    [symbol, theme.palette.primary.main]
  );

  return (
    <Stack sx={{ gap: 1.5 }}>
      <Stack direction="row" sx={{ justifyContent: "flex-end" }}>
        <TimeUnitFilter
          activeFilter={filter}
          onChange={onFilterChange}
          options={ERC20_GRAPH_TIME_FILTERS}
        />
      </Stack>
      {loading || balance === undefined ? (
        <Skeleton variant="rounded" width="100%" height={height} />
      ) : (
        <LineChart
          height={height}
          datasets={[dataset]}
          options={options}
          datasetsConfigCallbacks={datasetsConfigCallbacks}
        />
      )}
    </Stack>
  );
};

export default ERC20BalanceGraph;
