import { alpha, Box, useTheme } from "@mui/material";
import Chart, { ScriptableLineSegmentContext } from "chart.js/auto";
import { FC, useEffect, useRef } from "react";

const estimation =
  (length: number, result: any) => (c: ScriptableLineSegmentContext) =>
    c.p1DataIndex > length - 4 ? result : undefined;

const createGradient = (
  ctx: CanvasRenderingContext2D,
  color: string,
  height: number
) => {
  var gradient = ctx.createLinearGradient(0, 0, 0, height - 8);
  gradient.addColorStop(0, alpha(color, 0.2));
  gradient.addColorStop(1, alpha(color, 0));
  return gradient;
};

interface TokenBalanceGraphProps {
  height?: number;
}

const TokenBalanceGraph: FC<TokenBalanceGraphProps> = ({ height = 180 }) => {
  const theme = useTheme();
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    let chart: Chart | null = null;

    if (canvasRef.current) {
      const ctx = canvasRef.current.getContext("2d");

      if (ctx) {
        const greenGradient = createGradient(
          ctx,
          theme.palette.primary.main,
          height
        );
        const redGradient = createGradient(
          ctx,
          theme.palette.secondary.main,
          height
        );
        const data = [5, 7, 3, 4, 3, 2, 3, 4, 5, 6, 3, 4, 5];

        chart = new Chart(ctx, {
          type: "line",
          data: {
            labels: data.map(() => ""),
            datasets: [
              {
                backgroundColor: greenGradient,
                label: "Numbers",
                fill: true,
                data: data,
                borderWidth: 3,
                borderColor: theme.palette.primary.main,
                pointRadius: 5,
                pointBorderColor: "transparent",
                pointBackgroundColor: "transparent",
                // tension: 0.3,
                segment: {
                  borderColor: estimation(
                    data.length,
                    theme.palette.secondary.main
                  ),
                  borderDash: estimation(data.length, [6, 6]),
                  backgroundColor: estimation(data.length, redGradient),
                },
              },
            ],
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            interaction: {
              intersect: false,
            },
            plugins: {
              legend: {
                display: false,
              },
            },
            scales: {
              y: {
                display: false,
              },
              x: {
                display: false,
              },
            },
          },
        });
      }
    }

    return () => {
      if (chart) chart.destroy();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [canvasRef]);

  return (
    <Box sx={{ height, mx: -0.5 }}>
      <canvas ref={canvasRef} />
    </Box>
  );
};

export default TokenBalanceGraph;
