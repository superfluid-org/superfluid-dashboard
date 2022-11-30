import { Stack, Typography } from "@mui/material";
import { format } from "date-fns";
import Decimal from "decimal.js";
import { BigNumber, BigNumberish } from "ethers";
import {
  FC,
  useEffect,
  useRef,
  useState,
} from "react";

export interface VestingScheduleGraphProps {
  startDate: Date;
  endDate: Date;
  cliffDate: Date;
  cliffAmount: BigNumberish;
  totalAmount: BigNumberish;
}

export const VestingScheduleGraph: FC<VestingScheduleGraphProps> = ({
  startDate,
  endDate,
  cliffDate,
  cliffAmount,
  totalAmount,
}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const cliffRef = useRef<SVGLineElement>(null);

  const [cliffLabelX, setCliffLabelX] = useState(0);

  const totalSeconds = endDate.getTime() - startDate.getTime();
  const cliffSeconds = cliffDate.getTime() - startDate.getTime();
  const cliffRatio = cliffSeconds / totalSeconds;

  const amountPercentage = new Decimal(BigNumber.from(cliffAmount).toString())
    .div(new Decimal(BigNumber.from(totalAmount).toString()))
    .toDP(6)
    .toNumber();

  useEffect(() => {
    if (svgRef.current && cliffRef.current) {
      const { x: x1, width: w1 } = svgRef.current.getBoundingClientRect();
      const { x: x2, width: w2 } = cliffRef.current.getBoundingClientRect();
      setCliffLabelX(((x2 - x1) / (w1 - w2)) * 100);
    }
  }, [svgRef, cliffRef]);

  return (
    <Stack gap={0.5} sx={{ position: "relative" }}>
      <svg
        ref={svgRef}
        xmlns="http://www.w3.org/2000/svg"
        width="100%"
        height="140px"
        viewBox="0 0 200 100"
        fill="none"
        preserveAspectRatio="none"
        style={{
          display: "block",
        }}
      >
        <defs>
          <linearGradient
            id="vesting-graph-gradient"
            x1="0"
            y1="0"
            x2="0"
            y2="150"
            gradientUnits="userSpaceOnUse"
          >
            <stop stopColor="#10BB35" stopOpacity="0.2" />
            <stop offset="0.68" stopColor="#10BB35" stopOpacity="0" />
          </linearGradient>
        </defs>

        <line
          ref={cliffRef}
          x1={194 * cliffRatio}
          y1={96 - 96 * amountPercentage}
          x2={194 * cliffRatio}
          y2="3"
          stroke="#12141E61"
          strokeWidth="3"
          strokeDasharray="6"
          vectorEffect="non-scaling-stroke"
        />

        <path
          d={`M 3 97 H ${194 * cliffRatio} V ${
            96 - 96 * amountPercentage
          } L 197 3`}
          stroke="#10BB35"
          strokeWidth="3"
          strokeLinecap="round"
          vectorEffect="non-scaling-stroke"
        />

        <path
          d={`M ${194 * cliffRatio} 98 V ${
            96 - 96 * amountPercentage
          } L 198 3 V 98 Z`}
          vectorEffect="non-scaling-stroke"
          fill="url(#vesting-graph-gradient)"
        />
      </svg>
      <Typography
        variant="body2"
        color="text.disabled"
        sx={{
          position: "absolute",
          top: 0,
          ...(cliffLabelX > 45
            ? { right: `calc(${100 - cliffLabelX}% + 8px)` }
            : { left: `calc(${cliffLabelX}% + 8px)` }),
        }}
      >
        Cliff: {format(cliffDate, "LLL d, yyyy HH:mm")}
      </Typography>
      <Stack direction="row" justifyContent="space-between" sx={{ mx: 0.75 }}>
        <Typography variant="body2" color="text.disabled">
          Start: {format(startDate, "LLL d, yyyy HH:mm")}
        </Typography>
        <Typography variant="body2" color="text.disabled">
          End: {format(endDate, "LLL d, yyyy HH:mm")}
        </Typography>
      </Stack>
    </Stack>
  );
};
