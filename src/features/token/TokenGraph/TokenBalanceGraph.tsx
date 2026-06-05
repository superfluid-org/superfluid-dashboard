import {
  alpha,
  Button,
  Skeleton,
  Stack,
  Typography,
  useTheme,
} from "@mui/material";
import { Address } from "@superfluid-finance/sdk-core";
import {
  Chart,
  ChartOptions,
  ChartType,
  Plugin,
  ScriptableLineSegmentContext,
  TooltipItem,
} from "chart.js/auto";
import { fromUnixTime, getUnixTime, sub } from "date-fns";
import { BigNumber, ethers } from "ethers";
import { FC, useMemo } from "react";
import LineChart, { DataPoint } from "../../../components/Chart/LineChart";
import {
  buildDefaultDatasetConf,
  createCTXGradient,
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

// Number of balance-snapshot points requested, scaled with the visible window
// (~1 per day) so longer periods get finer resolution. The Balances API caps
// `points` at 200 (requests above return 200), so that's the ceiling.
const MIN_POINTS = 50;
const MAX_POINTS = 200;

// The claimable (disconnected) series is gradient-filled only where it makes up
// at least this share of the total balance — so it doesn't cover the green
// connected gradient in periods with a meaningful connected balance.
const CLAIMABLE_DOMINANT_PERCENT = 80;

// Claimable line/fill color — a muted yellow-green: same family as the green
// primary line but less prominent. (Tweak here to taste.)
const CLAIMABLE_COLOR = "#A8B84D";

// Format a wei string to ether, clamping negatives to zero (balances are never
// shown negative on the chart).
const formatWeiClamped = (value: string): string => {
  const wei = BigNumber.from(value);
  return ethers.utils.formatEther(wei.gt(0) ? wei : BigNumber.from(0));
};

// Multi-line tooltip label for the balance chart. Historical points carry a
// connected/disconnected/deposit/total breakdown; live and forecast points only
// carry `ether`. Rows that are undefined (unavailable) or zero are omitted to
// keep the tooltip compact.
const balanceTooltipLabel = (
  context: TooltipItem<"line">
): string | string[] => {
  const dp = context.raw as DataPoint | undefined;
  if (!dp) return "";
  const rows: string[] = [];
  const pushRow = (label: string, value: string | undefined) => {
    if (value !== undefined && Number(value) !== 0) {
      rows.push(`${label}: ${value}`);
    }
  };
  pushRow("Connected", dp.connected);
  pushRow("Disconnected", dp.disconnected);
  pushRow("Locked deposit", dp.deposit);
  pushRow("Total", dp.total);
  return rows.length > 0 ? rows : dp.ether;
};

interface LiquidationMarkerOptions {
  at?: number | null; // epoch milliseconds
  color?: string;
  label?: string;
}

// Register the plugin's options on Chart.js so `options.plugins.liquidationMarker`
// is type-checked.
declare module "chart.js" {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  interface PluginOptionsByType<TType extends ChartType> {
    liquidationMarker?: LiquidationMarkerOptions;
  }
}

// Draws a vertical dashed line at the projected liquidation (balance-hits-zero)
// timestamp. Marker state is read from `options.plugins.liquidationMarker`, so
// it updates via the options effect without recreating the chart.
const liquidationMarkerPlugin: Plugin<"line", LiquidationMarkerOptions> = {
  id: "liquidationMarker",
  afterDatasetsDraw: (chart, _args, opts) => {
    const at = opts?.at;
    if (at == null) return;
    const xScale = chart.scales.x;
    if (!xScale) return;
    const px = xScale.getPixelForValue(at);
    const { top, bottom, left, right } = chart.chartArea;
    if (px < left || px > right) return;

    const { ctx } = chart;
    const color = opts.color ?? "rgba(244, 67, 54, 0.7)";
    ctx.save();
    ctx.beginPath();
    ctx.setLineDash([4, 4]);
    ctx.lineWidth = 1;
    ctx.strokeStyle = color;
    ctx.moveTo(px, top);
    ctx.lineTo(px, bottom);
    ctx.stroke();
    if (opts.label) {
      const alignRight = px > (left + right) / 2;
      ctx.setLineDash([]);
      ctx.fillStyle = color;
      ctx.font = "10px sans-serif";
      ctx.textAlign = alignRight ? "right" : "left";
      ctx.fillText(opts.label, px + (alignRight ? -4 : 4), top + 10);
    }
    ctx.restore();
  },
};

// Stable instance-plugin array (passed to Chart at construction).
const LINE_CHART_PLUGINS: Plugin<"line">[] = [
  liquidationMarkerPlugin as Plugin<"line">,
];

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
        isLiquidation: true,
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

  const { startTimestamp, dateNow, forecastEndDate, points } = useMemo(() => {
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

    // Scale resolution with the window (~1 point/day), floored/capped. Span
    // covers the tricky "All" case automatically: short history -> few points,
    // long history -> capped. Guard against a non-positive span.
    const spanDays = Math.max(0, (currentUnix - startUnix) / 86400);
    const points = Math.min(
      MAX_POINTS,
      Math.max(MIN_POINTS, Math.round(spanDays))
    );

    return {
      startTimestamp: startUnix,
      dateNow: currentDate,
      forecastEndDate: fromUnixTime(forecastEndUnix),
      points,
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
      points,
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
      const connected = formatWeiClamped(p.connectedBalance);
      return {
        x: Number(p.timestamp) * 1000,
        y: Number(connected),
        ether: connected,
        connected,
        disconnected: formatWeiClamped(p.disconnectedBalance),
        deposit: formatWeiClamped(p.deposit),
        total: formatWeiClamped(p.totalBalance),
      };
    });

    // Quiet supporting series, shown only when they carry non-zero values so
    // the sparkline stays clean. Fixed dataset slots (empty arrays when hidden)
    // — LineChart updates dataset data by index, so the slot count must be
    // stable across renders.
    const hasDeposit = points.some((p) => BigNumber.from(p.deposit).gt(0));
    const hasClaimable = points.some((p) =>
      BigNumber.from(p.disconnectedBalance).gt(0)
    );

    const depositDataset: DataPoint[] = hasDeposit
      ? points.map((p) => {
          const deposit = formatWeiClamped(p.deposit);
          return {
            x: Number(p.timestamp) * 1000,
            y: Number(deposit),
            ether: deposit,
            deposit,
          };
        })
      : [];

    const claimableDataset: DataPoint[] = hasClaimable
      ? points.map((p) => {
          const disconnected = formatWeiClamped(p.disconnectedBalance);
          const connectedWei = BigNumber.from(p.connectedBalance);
          const disconnectedWei = BigNumber.from(p.disconnectedBalance);
          const totalWei = connectedWei.add(disconnectedWei);
          // disconnected / total >= CLAIMABLE_DOMINANT_PERCENT% (integer-safe).
          const claimableDominant =
            totalWei.gt(0) &&
            disconnectedWei
              .mul(100)
              .gte(totalWei.mul(CLAIMABLE_DOMINANT_PERCENT));
          return {
            x: Number(p.timestamp) * 1000,
            y: Number(disconnected),
            ether: disconnected,
            disconnected,
            claimableDominant,
          };
        })
      : [];

    // Replace the API's tail point with the RPC live value. The API
    // emits evenly-spaced points up to ~now, but its last point can
    // be indexer-lagged (today's value is still yesterday's). Using
    // RPC for the right edge guarantees the chart shows the actual
    // current balance and connects cleanly to the forecast (also RPC).
    if (realTimeBalanceQuery.data && balanceDataset.length > 0) {
      const apiTail = balanceDataset[balanceDataset.length - 1];
      const liveBase = projectBalanceAt(realTimeBalanceQuery.data, dateNow);
      // Connected comes from the live RPC value (accurate "now"); carry the most
      // recent known claimable/deposit from the API tail so the "now" tooltip
      // still shows them (they only lag the indexer slightly). Recompute total
      // from the live connected + last-known claimable to stay consistent.
      const connected = liveBase.ether;
      const disconnected = apiTail.disconnected;
      const total = disconnected
        ? ethers.utils.formatEther(
            ethers.utils
              .parseEther(connected)
              .add(ethers.utils.parseEther(disconnected))
          )
        : connected;
      const livePoint: DataPoint = {
        ...liveBase,
        connected,
        disconnected,
        deposit: apiTail.deposit,
        total,
      };
      if (livePoint.x > apiTail.x) {
        balanceDataset.pop();
      }
      balanceDataset.push(livePoint);
    }

    if (!showForecast || !realTimeBalanceQuery.data) {
      return [balanceDataset, [], depositDataset, claimableDataset];
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

    return [balanceDataset, forecastDataset, depositDataset, claimableDataset];
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

    const lastForecast =
      forecastDataset.length > 0
        ? forecastDataset[forecastDataset.length - 1]
        : undefined;
    const lastHistoricalX =
      balanceDataset.length > 0
        ? balanceDataset[balanceDataset.length - 1].x
        : undefined;

    // Use the explicitly-tagged zero-crossing point (set only on a genuine
    // negative-flow liquidation), and only when it lands in the future — past
    // crossings or balances merely clamped to 0 must not draw a marker.
    const liquidationPoint = forecastDataset.find((p) => p.isLiquidation);
    const liquidationAt =
      liquidationPoint &&
      (lastHistoricalX === undefined || liquidationPoint.x >= lastHistoricalX)
        ? liquidationPoint.x
        : null;

    // axis:"x" makes hover pick the nearest point horizontally; ties at a shared
    // timestamp resolve to the first dataset (the connected line), so the quiet
    // deposit/claimable lines never steal the breakdown tooltip.
    const interaction = {
      mode: "nearest" as const,
      axis: "x" as const,
      intersect: false,
    };

    const plugins = {
      tooltip: {
        // Only the connected (0) and forecast (1) datasets contribute tooltip
        // rows; the supporting deposit/claimable series (2/3) are already folded
        // into the connected point's breakdown, and `nearest` returns every
        // dataset tied at the same x — which otherwise adds a stray bare "0.0".
        filter: (item: TooltipItem<"line">) => item.datasetIndex <= 1,
        callbacks: { label: balanceTooltipLabel },
      },
      liquidationMarker: {
        at: liquidationAt,
        color: theme.palette.error.main,
        label: liquidationAt != null ? "Liquidation" : undefined,
      },
    };

    if (balanceDataset.length === 0 || lastHistoricalX === undefined) {
      return {
        interaction,
        plugins,
        scales: {
          x: { offset: true },
          y: { offset: true },
        },
      };
    }

    const firstX = balanceDataset[0].x;
    // Never let a forecast endpoint shrink the domain below the live tail.
    const maxX = Math.max(lastHistoricalX, lastForecast?.x ?? lastHistoricalX);

    return {
      interaction,
      plugins,
      scales: {
        x: { min: firstX, max: maxX, offset: true },
        y: { offset: true },
      },
    };
  }, [datasets, theme.palette.error.main]);

  const datasetsConfigCallbacks = useMemo(
    () => [
      (ctx: CanvasRenderingContext2D) =>
        buildDefaultDatasetConf(ctx, theme.palette.primary.main, height),
      (ctx: CanvasRenderingContext2D) => ({
        ...buildDefaultDatasetConf(ctx, theme.palette.secondary.main, height),
        borderDash: [6, 6],
      }),
      // Locked deposit — faint blue shade, no line. Flat alpha (not a height
      // gradient, which vanishes for the small deposit band near the bottom).
      // Draws under the green connected fill, so it reads as a subtle blue tint
      // of the bottom band.
      (_ctx: CanvasRenderingContext2D) => ({
        label: "Locked deposit",
        backgroundColor: alpha(theme.palette.info.main, 0.12),
        fill: true,
        borderWidth: 0,
        pointRadius: 0,
        tension: 0.1,
      }),
      // Claimable (disconnected GDA/IDA) — quiet yellow-green line everywhere,
      // with a matching gradient fill only on segments where claimable dominates
      // the total (so it doesn't cover the green gradient where connected is
      // meaningful).
      (ctx: CanvasRenderingContext2D) => {
        const grad = createCTXGradient(ctx, CLAIMABLE_COLOR, height);
        return {
          label: "Disconnected",
          borderColor: CLAIMABLE_COLOR,
          backgroundColor: grad,
          fill: true,
          borderWidth: 2,
          pointRadius: 0,
          pointBorderColor: "transparent",
          pointBackgroundColor: "transparent",
          tension: 0.1,
          segment: {
            // `chart` exists on the segment context at runtime but isn't on the
            // public type, so cast to read it; the index fields are typed.
            backgroundColor: (s: ScriptableLineSegmentContext) => {
              const chart = (s as unknown as { chart: Chart<"line"> }).chart;
              const data = chart.data.datasets[s.datasetIndex]
                .data as unknown as DataPoint[];
              return data[s.p0DataIndex]?.claimableDominant &&
                data[s.p1DataIndex]?.claimableDominant
                ? grad
                : "transparent";
            },
          },
        };
      },
    ],
    [
      height,
      theme.palette.primary.main,
      theme.palette.secondary.main,
      theme.palette.info.main,
    ]
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
      plugins={LINE_CHART_PLUGINS}
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
