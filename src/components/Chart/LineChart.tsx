import { useTheme } from "@mui/material";
import Box from "@mui/material/Box";
import Chart, {
  ChartDataset,
  ChartOptions,
  Plugin,
  TooltipItem,
} from "chart.js/auto";
import { format } from "date-fns";
import merge from "lodash/fp/merge";
import set from "lodash/fp/set";
import mutateSet from "lodash/set";
import { FC, useEffect, useRef } from "react";
import { DEFAULT_LINE_CHART_OPTIONS } from "../../utils/chartUtils";

export interface DataPoint {
  x: number;
  y: number;
  ether: string;
  // Optional pre-formatted (ether) breakdown surfaced in the tooltip. Only the
  // historical balance series populates these; forecast/live points leave them
  // undefined so the tooltip can omit unavailable rows.
  connected?: string;
  disconnected?: string;
  deposit?: string;
  total?: string;
  // Set only on the forecast's exact zero-crossing point (genuine projected
  // liquidation), so it can be distinguished from balances merely clamped to 0.
  isLiquidation?: boolean;
  // Set on claimable points where the disconnected balance is the dominant share
  // of total — used to gradient-fill only those segments of the claimable line.
  claimableDominant?: boolean;
}

type DatasetConfigCallback = (
  ctx: CanvasRenderingContext2D
) => Omit<ChartDataset<"line">, "data">;

const DEFAULT_TOOLTIP_CALLBACKS = {
  // Null-safe: a tooltip `filter` can leave the active item set empty (chart.js
  // still calls these), so never assume context[0]/raw exists.
  title: (context: Array<TooltipItem<"line">>) => {
    const dp = context[0]?.raw as DataPoint | undefined;
    return dp ? format(new Date(dp.x), "MMMM do, yyyy HH:mm") : "";
  },
  label: (context: TooltipItem<"line">) =>
    (context.raw as DataPoint | undefined)?.ether ?? "",
};

// Build the full options object by layering the caller's `options` over a fresh
// copy of the shared defaults (with default tooltip callbacks). Rebuilding from
// the defaults on every update — rather than merging into the live
// chart.options — prevents stale keys (e.g. a previous range's x min/max, or
// callbacks) from lingering when a later `options` object omits them.
const buildChartOptions = (
  options: Partial<ChartOptions<"line">>
): ChartOptions<"line"> =>
  merge(
    set(
      "plugins.tooltip.callbacks",
      DEFAULT_TOOLTIP_CALLBACKS,
      DEFAULT_LINE_CHART_OPTIONS
    ),
    options
  );

interface LineChartProps {
  datasets: DataPoint[][];
  datasetsConfigCallbacks: DatasetConfigCallback[];
  height: number;
  options?: Partial<ChartOptions<"line">>;
  // Stable instance plugins. Chart.js instance plugins must be passed at chart
  // construction, so this should be a stable (module-level) array. Per-render
  // plugin state should be driven through `options` (each plugin reads its own
  // `options.plugins[<id>]`), not by swapping the array.
  plugins?: Plugin<"line">[];
}

const EMPTY_PLUGINS: Plugin<"line">[] = [];

const LineChart: FC<LineChartProps> = ({
  datasets,
  datasetsConfigCallbacks,
  height,
  options = {},
  plugins = EMPTY_PLUGINS,
}) => {
  const theme = useTheme();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const chartRef = useRef<Chart<"line"> | null>(null);

  useEffect(() => {
    const canvasContext = canvasRef.current?.getContext("2d");
    if (!canvasContext) return;

    const initialDatasetsConfig = datasetsConfigCallbacks.map((cb, index) => ({
      data: datasets[index] || [],
      ...cb(canvasContext),
    }));

    const chart = new Chart(canvasContext, {
      type: "line",
      data: {
        labels: [],
        datasets: initialDatasetsConfig,
      },
      options: buildChartOptions(options),
      plugins,
    });

    chartRef.current = chart;

    return () => {
      chart.destroy();
    };

    // We do not want options to destroy and rebuild the chart. We are updating it below instead.
    // Also disabling datasets as dep because we want to update them separately down without creating new chart.
    // TODO: (M) This should be more clear and split up. Chart should be ideally created only once.
    // datasetsConfigCallbacks could be moved to a separate useEffect although we should use their initial value.

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [datasetsConfigCallbacks, height]);

  useEffect(() => {
    const currentChart = chartRef.current;

    if (!currentChart) return;

    datasets.forEach((dataset, index) => {
      mutateSet(currentChart.data.datasets, [index, "data"], dataset);
    });

    currentChart.update();
  }, [chartRef, datasets]);

  useEffect(() => {
    const currentChart = chartRef.current;

    if (!currentChart) return;

    mutateSet(currentChart, "options", buildChartOptions(options));

    currentChart.update();
  }, [chartRef, options]);

  return (
    <Box
      sx={{
        height,
        maxWidth: "100%",
        [theme.breakpoints.up("md")]: {
          mx: -0.5,
        },
        [theme.breakpoints.down("md")]: {
          maxWidth: "calc(100vw - 32px)",
        },
      }}
    >
      <canvas ref={canvasRef} />
    </Box>
  );
};

export default LineChart;
