import { alpha } from "@mui/material";
import {
  ChartDataset,
  ChartOptions,
  ScriptableLineSegmentContext,
} from "chart.js";

export const DEFAULT_LINE_CHART_OPTIONS: ChartOptions<"line"> = {
  responsive: true,
  maintainAspectRatio: false,
  interaction: {
    intersect: false,
  },
  plugins: {
    legend: {
      display: false,
    },
    tooltip: {
      displayColors: false,
    },
  },
  scales: {
    y: {
      ticks: {
        stepSize: 1,
      },
      display: false,
      grace: 0,
    },
    x: {
      display: false,
      grace: 0,
    },
  },
};

// TODO: This should be used as segment filter for balance estimation
const estimation =
  (length: number, result: any) => (c: ScriptableLineSegmentContext) =>
    c.p1DataIndex > length - 4 ? result : undefined;

const createGradient = (
  ctx: CanvasRenderingContext2D,
  color: string,
  height: number
) => {
  var gradient = ctx.createLinearGradient(0, 0, 0, height);
  gradient.addColorStop(0, alpha(color, 0.2));
  gradient.addColorStop(1, alpha(color, 0));
  return gradient;
};

export const buildDefaultDatasetConf = (
  ctx: CanvasRenderingContext2D,
  color: string,
  height: number
): ChartDataset<"line"> => ({
  backgroundColor: createGradient(ctx, color, height),
  label: "Balance",
  fill: true,
  borderWidth: 3,
  borderColor: color,
  pointRadius: 5,
  pointBorderColor: "transparent",
  pointBackgroundColor: "transparent",
  tension: 0.1,
  data: [], // Placeholder, should be overridden
});
