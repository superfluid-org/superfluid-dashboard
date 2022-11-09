import Decimal from "decimal.js";
import { BigNumber, BigNumberish } from "ethers";
import { FC } from "react";

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
  const totalSeconds = endDate.getTime() - startDate.getTime();
  const cliffSeconds = cliffDate.getTime() - startDate.getTime();
  const timePercentage = cliffSeconds / totalSeconds;

  const amountPercentage = new Decimal(BigNumber.from(cliffAmount).toString())
    .div(new Decimal(BigNumber.from(totalAmount).toString()))
    .toDP(6)
    .toNumber();

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="100%"
      height="140px"
      viewBox="0 0 200 100"
      fill="none"
      preserveAspectRatio="none"
    >
      <defs>
        <linearGradient
          id="vesting-graph-gradient"
          x1="0"
          y1="0"
          x2="0"
          y2="200"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#10BB35" stopOpacity="0.2" />
          <stop offset="0.68" stopColor="#10BB35" stopOpacity="0" />
        </linearGradient>
      </defs>

      <line
        x1={194 * timePercentage}
        y1={96 - 96 * amountPercentage}
        x2={194 * timePercentage}
        y2="3"
        stroke="#12141e61"
        strokeWidth="3"
        strokeDasharray="6"
        vectorEffect="non-scaling-stroke"
      />

      <path
        d={`M 3 97 H ${194 * timePercentage} V ${
          96 - 96 * amountPercentage
        } L 197 3`}
        stroke="#10BB35"
        strokeWidth="3"
        strokeLinecap="round"
        vectorEffect="non-scaling-stroke"
      />

      <path
        d={`M ${194 * timePercentage} 98 V ${
          96 - 96 * amountPercentage
        } L 198 3 V 98 Z`}
        vectorEffect="non-scaling-stroke"
        fill="url(#vesting-graph-gradient)"
      />
    </svg>
  );
};
