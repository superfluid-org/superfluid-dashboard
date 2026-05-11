import { Button, Skeleton, Stack, Typography, useTheme } from "@mui/material";
import { Address } from "@superfluid-finance/sdk-core";
import { ChartOptions } from "chart.js/auto";
import { fromUnixTime, getUnixTime, sub } from "date-fns";
import { BigNumber, ethers } from "ethers";
import { FC, useMemo } from "react";
import LineChart, { DataPoint } from "../../../components/Chart/LineChart";
import {
  buildDefaultDatasetConf,
  getFilteredStartDate,
} from "../../../utils/chartUtils";
import balanceApi from "../../balance/balanceApi.slice";
import { TimeUnitFilterType } from "../../graph/TimeUnitFilter";
import { Network } from "../../network/networks";
import { RealtimeBalance } from "../../redux/endpoints/balanceFetcher";
import { rpcApi } from "../../redux/store";

// Fallback floor used only when the "All" filter is selected AND the
// account has no recorded movements yet (so the history request has no
// meaningful start anyway). 2021-01-01 UTC predates Superfluid mainnet
// deployment on every supported chain.
const ALL_FALLBACK_FLOOR_UNIX = 1_609_459_200;
const FORECAST_POINTS = 12;
const FORECAST_MAX_DURATION_SECONDS = 30 * 24 * 60 * 60; // 30 days

const projectBalanceAt = (
  realTimeBalance: RealtimeBalance,
  date: Date
): DataPoint => {
  const { balance, balanceTimestamp, flowRate } = realTimeBalance;
  const elapsed = BigNumber.from(getUnixTime(date) - balanceTimestamp);
  const projected = BigNumber.from(balance).add(
    BigNumber.from(flowRate).mul(elapsed)
  );
  const clamped = projected.gt(0) ? projected : BigNumber.from(0);
  const ether = ethers.utils.formatEther(clamped);
  return { x: date.getTime(), y: Number(ether), ether };
};

const mapForecastDatesWithData = (
  realTimeBalance: RealtimeBalance,
  dates: Date[]
): DataPoint[] => {
  const { balance, balanceTimestamp, flowRate } = realTimeBalance;
  const balanceBN = BigNumber.from(balance);
  const flowRateBN = BigNumber.from(flowRate);

  const points: DataPoint[] = [];

  for (const date of dates) {
    const elapsed = BigNumber.from(getUnixTime(date) - balanceTimestamp);
    const projected = balanceBN.add(flowRateBN.mul(elapsed));

    if (projected.lte(0) && flowRateBN.lt(0)) {
      // Zero-crossing: emit an exact zero point at the crossing time, then
      // stop the forecast line.
      const zeroCrossingUnix =
        balanceTimestamp +
        Number(balanceBN.mul(BigNumber.from(-1)).div(flowRateBN));
      points.push({
        x: zeroCrossingUnix * 1000,
        y: 0,
        ether: "0.0",
      });
      break;
    }

    points.push(projectBalanceAt(realTimeBalance, date));
  }

  return points;
};

const getDatesBetween = (start: Date, end: Date, steps: number): Date[] => {
  if (steps <= 0 || end.getTime() <= start.getTime()) return [];
  const startMs = start.getTime();
  const span = end.getTime() - startMs;
  const out: Date[] = [];
  for (let i = 0; i <= steps; i++) {
    out.push(new Date(startMs + (span * i) / steps));
  }
  return out;
};

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

  const isAll = filter === TimeUnitFilterType.All;

  // For "All", look up the timestamp of the account's first recorded
  // movement for this token. Use that as the chart start so the X range
  // isn't padded with a long flat-zero stretch.
  const firstMovementQuery = balanceApi.useFirstMovementTimestampQuery(
    { chainId: network.id, account, token },
    { skip: !isAll }
  );

  const { startTimestamp, dateNow, forecastEndDate } = useMemo(() => {
    const currentDate = new Date();
    const currentUnix = getUnixTime(currentDate);

    let startUnix: number;
    if (isAll) {
      if (firstMovementQuery.isLoading || firstMovementQuery.isError) {
        // Probe pending or failed — pick a sensible recent window so we
        // don't fire the history request with the 2021 floor (which wastes
        // points). On success the history query re-fires with the real
        // first-movement timestamp.
        startUnix = getUnixTime(sub(currentDate, { months: 1 }));
      } else {
        const firstMovementUnix = firstMovementQuery.data ?? null;
        startUnix = firstMovementUnix ?? ALL_FALLBACK_FLOOR_UNIX;
      }
    } else {
      const startDate = getFilteredStartDate(
        filter,
        currentDate,
        currentDate // non-All filters never hit the default
      );
      startUnix = getUnixTime(startDate);
    }

    const proportionalDurationUnix = Math.floor((currentUnix - startUnix) / 4);
    const forecastDurationUnix = Math.min(
      proportionalDurationUnix,
      FORECAST_MAX_DURATION_SECONDS
    );
    const forecastEndUnix = currentUnix + forecastDurationUnix;
    return {
      startTimestamp: startUnix,
      dateNow: currentDate,
      forecastEndDate: fromUnixTime(forecastEndUnix),
    };
  }, [
    filter,
    isAll,
    firstMovementQuery.data,
    firstMovementQuery.isLoading,
    firstMovementQuery.isError,
  ]);

  const balanceHistoryQuery = balanceApi.useBalanceHistoryQuery(
    {
      chainId: network.id,
      account,
      token,
      startTimestamp,
      points: 50,
    },
    // Wait for the "All" probe to resolve before firing — avoids a
    // throwaway request against a stale default window.
    { skip: isAll && firstMovementQuery.isLoading }
  );

  const realTimeBalanceQuery = rpcApi.useRealtimeBalanceQuery({
    chainId: network.id,
    tokenAddress: token,
    accountAddress: account,
  });

  useMemo(() => {
    if (process.env.NODE_ENV === "production") return;
    if (balanceHistoryQuery.isError) {
      // eslint-disable-next-line no-console
      console.error(
        "[TokenBalanceGraph] balance-history request failed",
        balanceHistoryQuery.error
      );
    } else if (balanceHistoryQuery.data) {
      const pts = balanceHistoryQuery.data.points;
      // eslint-disable-next-line no-console
      console.debug(
        "[TokenBalanceGraph] balance-history points=%d first=%o last=%o",
        pts.length,
        pts[0],
        pts[pts.length - 1]
      );
    }
  }, [
    balanceHistoryQuery.data,
    balanceHistoryQuery.error,
    balanceHistoryQuery.isError,
  ]);

  const datasets = useMemo<DataPoint[][]>(() => {
    const points = balanceHistoryQuery.data?.points ?? [];

    const balanceDataset: DataPoint[] = points.map((p) => {
      const wei = BigNumber.from(p.connectedBalance);
      const ether = ethers.utils.formatEther(
        wei.gt(BigNumber.from(0)) ? wei : BigNumber.from(0)
      );
      return {
        x: Number(p.timestamp) * 1000,
        y: Number(ether),
        ether,
      };
    });

    // Replace the API's tail point with the RPC live value. The API
    // emits 50 evenly-spaced points up to ~now, but its last point can
    // be indexer-lagged (today's value is still yesterday's). Using
    // RPC for the right edge guarantees the chart shows the actual
    // current balance and connects cleanly to the forecast (also RPC).
    if (realTimeBalanceQuery.data && balanceDataset.length > 0) {
      const livePoint = projectBalanceAt(realTimeBalanceQuery.data, dateNow);
      if (livePoint.x > balanceDataset[balanceDataset.length - 1].x) {
        balanceDataset.pop();
      }
      balanceDataset.push(livePoint);
    }

    if (!showForecast || !realTimeBalanceQuery.data) {
      return [balanceDataset, []];
    }

    const forecastDates = getDatesBetween(
      dateNow,
      forecastEndDate,
      FORECAST_POINTS
    );
    const forecastDataset = mapForecastDatesWithData(
      realTimeBalanceQuery.data,
      forecastDates
    );

    return [balanceDataset, forecastDataset];
  }, [
    balanceHistoryQuery.data,
    realTimeBalanceQuery.data,
    showForecast,
    dateNow,
    forecastEndDate,
  ]);

  const options = useMemo<ChartOptions<"line">>(() => {
    // Derive the X-axis bounds from the rendered data so datasets and
    // bounds always mutate atomically in the same React commit. During
    // a refetch (e.g. filter switch) the chart keeps showing the
    // previous response's points against their own coherent range,
    // then everything swaps in one commit when the new response lands.
    const balanceDataset = datasets[0];
    const forecastDataset = datasets[1];

    if (balanceDataset.length === 0) {
      return {
        scales: {
          x: { offset: true },
          y: { offset: true },
        },
      };
    }

    const firstX = balanceDataset[0].x;
    const lastHistoricalX = balanceDataset[balanceDataset.length - 1].x;
    const lastForecastX =
      forecastDataset.length > 0
        ? forecastDataset[forecastDataset.length - 1].x
        : lastHistoricalX;

    return {
      scales: {
        x: { min: firstX, max: lastForecastX, offset: true },
        y: { offset: true },
      },
    };
  }, [datasets]);

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

  if (balanceHistoryQuery.isLoading || firstMovementQuery.isLoading) {
    return <Skeleton variant="rounded" width="100%" height={`${height}px`} />;
  }

  if (balanceHistoryQuery.isError && !balanceHistoryQuery.data) {
    return (
      <BalanceGraphErrorFallback
        height={height}
        onRetry={() => balanceHistoryQuery.refetch()}
        isRetrying={balanceHistoryQuery.isFetching}
      />
    );
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

const BalanceGraphErrorFallback: FC<{
  height: number;
  onRetry: () => void;
  isRetrying: boolean;
}> = ({ height, onRetry, isRetrying }) => (
  <Stack
    alignItems="center"
    justifyContent="center"
    spacing={1}
    sx={{
      height: `${height}px`,
      width: "100%",
      borderRadius: 1,
      border: (theme) => `1px dashed ${theme.palette.divider}`,
      px: 2,
      textAlign: "center",
    }}
  >
    <Typography variant="body2" color="text.secondary">
      Couldn&apos;t load balance history.
    </Typography>
    <Button
      size="small"
      variant="text"
      onClick={onRetry}
      disabled={isRetrying}
    >
      {isRetrying ? "Retrying…" : "Try again"}
    </Button>
  </Stack>
);

export default TokenBalanceGraph;
