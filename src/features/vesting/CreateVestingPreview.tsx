import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { Box, IconButton, Stack, Typography } from "@mui/material";
import add from "date-fns/fp/add";
import format from "date-fns/fp/format";
import Decimal from "decimal.js";
import { FC } from "react";
import { useFormContext } from "react-hook-form";
import { timeUnitWordMap } from "../send/FlowRateInput";
import ConnectionBoundary from "../transactionBoundary/ConnectionBoundary";
import { CreateVestingCardView, VestingToken } from "./CreateVestingCard";
import { VestingFormLabels } from "./CreateVestingForm";
import { ValidVestingForm } from "./CreateVestingFormProvider";
import { CreateVestingTransactionButton } from "./CreateVestingTransactionButton";

interface VestingGraphProps {
  startDate: Date;
  endDate: Date;
  cliffDate: Date;
  cliffAmountEther: string;
  totalAmountEther: string;
}

const VestingGraph: FC<VestingGraphProps> = ({
  startDate,
  endDate,
  cliffDate,
  cliffAmountEther,
  totalAmountEther,
}) => {
  const totalSeconds = endDate.getTime() - startDate.getTime();
  const cliffSeconds = cliffDate.getTime() - startDate.getTime();
  const timePercentage = cliffSeconds / totalSeconds;
  const amountPercentage = new Decimal(cliffAmountEther)
    .div(new Decimal(totalAmountEther))
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

export const CreateVestingPreview: FC<{
  token: VestingToken | undefined;
  setView: (value: CreateVestingCardView) => void;
}> = ({ token, setView }) => {
  const { watch } = useFormContext<ValidVestingForm>();

  const [
    superTokenAddress,
    receiverAddress,
    totalAmountEther,
    startDate,
    cliffAmountEther,
    vestingPeriod,
    cliffPeriod,
  ] = watch([
    "data.superTokenAddress",
    "data.receiverAddress",
    "data.totalAmountEther",
    "data.startDate",
    "data.cliffAmountEther",
    "data.vestingPeriod",
    "data.cliffPeriod",
  ]);

  const cliffDate = add(
    {
      seconds: cliffPeriod.numerator * cliffPeriod.denominator,
    },
    startDate
  );

  const endDate = add(
    {
      seconds: vestingPeriod.numerator * vestingPeriod.denominator,
    },
    startDate
  );

  const BackButton = (
    <Box>
      <IconButton
        data-cy={"back-button"}
        color="inherit"
        onClick={() => setView(CreateVestingCardView.Form)}
      >
        <ArrowBackIcon />
      </IconButton>
    </Box>
  );

  return (
    <Stack gap={1}>
      {BackButton}
      <Typography component="h2" variant="h5" sx={{ mb: 3 }}>
        Preview Vesting Schedule
      </Typography>

      <VestingGraph
        startDate={startDate}
        endDate={endDate}
        cliffDate={cliffDate}
        cliffAmountEther={cliffAmountEther}
        totalAmountEther={totalAmountEther}
      />

      <Stack>
        <Typography color="text.secondary">
          {VestingFormLabels.Receiver}
        </Typography>
        <Typography color="text.primary">{receiverAddress}</Typography>
      </Stack>

      <Stack>
        <Typography color="text.secondary">
          {VestingFormLabels.Token}
        </Typography>
        <Typography color="text.primary">{superTokenAddress}</Typography>
      </Stack>

      <Stack>
        <Typography color="text.secondary">
          {VestingFormLabels.TotalVestingPeriod}
        </Typography>
        <Typography color="text.primary">
          {vestingPeriod.numerator} {timeUnitWordMap[vestingPeriod.denominator]}
        </Typography>
        <Typography color="text.primary">
          {format("LLLL d, yyyy", endDate)}
        </Typography>
      </Stack>

      <Stack>
        <Typography color="text.secondary">
          {VestingFormLabels.TotalVestedAmount}
        </Typography>
        <Typography color="text.primary">
          {totalAmountEther} {token?.symbol}
        </Typography>
      </Stack>

      <Stack>
        <Typography color="text.secondary">
          {VestingFormLabels.CliffPeriod}
        </Typography>
        <Typography color="text.primary">
          {cliffPeriod.numerator} {timeUnitWordMap[cliffPeriod.denominator]}
        </Typography>
        <Typography color="text.primary">
          {format("LLLL d, yyyy", cliffDate)}
        </Typography>
      </Stack>

      <Stack>
        <Typography color="text.secondary">
          {VestingFormLabels.CliffAmount}
        </Typography>
        <Typography color="text.primary">
          {cliffAmountEther} {token?.symbol}
        </Typography>
      </Stack>

      <Stack>
        <Typography color="text.secondary">
          {VestingFormLabels.VestingStartDate}
        </Typography>
        <Typography color="text.primary">
          {format("LLLL d, yyyy", startDate)}
        </Typography>
      </Stack>

      <ConnectionBoundary>
        <CreateVestingTransactionButton />
      </ConnectionBoundary>
    </Stack>
  );
};
