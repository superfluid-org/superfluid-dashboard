import { alpha } from "@mui/material";
import { ChartDataset, ChartOptions } from "chart.js";

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
      display: false,
      grace: 0,
    },
    x: {
      display: false,
      type: "logarithmic",
    },
  },
};

export const createCTXGradient = (
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
): Omit<ChartDataset<"line">, "data"> => ({
  backgroundColor: createCTXGradient(ctx, color, height),
  label: "Balance",
  fill: true,
  borderWidth: 3,
  borderColor: color,
  pointRadius: 5,
  pointBorderColor: "transparent",
  pointBackgroundColor: "transparent",
  tension: 0.1,
});
