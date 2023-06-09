import { useTheme } from "@mui/material";
import Box from "@mui/material/Box";
import Chart, { ChartDataset, ChartOptions, TooltipItem } from "chart.js/auto";
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
}

type DatasetConfigCallback = (
  ctx: CanvasRenderingContext2D
) => Omit<ChartDataset<"line">, "data">;

interface LineChartProps {
  datasets: DataPoint[][];
  datasetsConfigCallbacks: DatasetConfigCallback[];
  height: number;
  options?: Partial<ChartOptions<"line">>;
}

const LineChart: FC<LineChartProps> = ({
  datasets,
  datasetsConfigCallbacks,
  height,
  options = {},
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

    const defaultDatasetsOptions = set(
      "plugins.tooltip.callbacks",
      {
        title: (context: Array<TooltipItem<"line">>) =>
          format(
            new Date((context[0]?.raw as DataPoint).x),
            "MMMM do, yyyy HH:mm"
          ),
        label: (context: TooltipItem<"line">) =>
          (context.raw as DataPoint).ether,
      },
      DEFAULT_LINE_CHART_OPTIONS
    );

    const datasetsOptions = merge(defaultDatasetsOptions, options);

    const chart = new Chart(canvasContext, {
      type: "line",
      data: {
        labels: [],
        datasets: initialDatasetsConfig,
      },
      options: datasetsOptions,
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

    const newOptions = merge(currentChart.options, options);
    mutateSet(currentChart, "options", newOptions);

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
