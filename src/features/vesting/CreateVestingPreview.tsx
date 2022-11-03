import { FC } from "react";
import { useFormContext } from "react-hook-form";
import { ValidVestingForm } from "./CreateVestingFormProvider";
import { rpcApi } from "../redux/store";
import { Box, IconButton, Stack, Typography } from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { TransactionBoundary } from "../transactionBoundary/TransactionBoundary";
import { TransactionButton } from "../transactionBoundary/TransactionButton";
import add from "date-fns/fp/add";
import format from "date-fns/fp/format";
import { timeUnitWordMap } from "../send/FlowRateInput";
import ConnectionBoundary from "../transactionBoundary/ConnectionBoundary";
import {
  CreateVestingCardView,
  VestingLabels,
  VestingToken,
} from "./CreateVestingCard";
import { parseEtherOrZero } from "../../utils/tokenUtils";
import { getTimeInSeconds } from "../../utils/dateUtils";
import { BigNumber } from "ethers";
import { CreateVestingTransactionButton } from "./CreateVestingTransactionButton";

export const CreateVestingPreview: FC<{
  token: VestingToken | undefined;
  setView: (value: CreateVestingCardView) => void;
}> = ({ token, setView }) => {
  const { watch, formState, handleSubmit } = useFormContext<ValidVestingForm>();

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

  const [createVestingSchedule, createVestingScheduleResult] =
    rpcApi.useCreateVestingScheduleMutation();

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

  return (
    <Stack gap={1}>
      {BackButton}
      <Typography component="h2" variant="h5" sx={{ mb: 3 }}>
        Preview Vesting Schedule
      </Typography>

      <Stack>
        <Typography color="text.secondary">{VestingLabels.Receiver}</Typography>
        <Typography color="text.primary">{receiverAddress}</Typography>
      </Stack>

      <Stack>
        <Typography color="text.secondary">{VestingLabels.Token}</Typography>
        <Typography color="text.primary">{superTokenAddress}</Typography>
      </Stack>

      <Stack>
        <Typography color="text.secondary">
          {VestingLabels.TotalVestedAmount}
        </Typography>
        <Typography color="text.primary">
          {totalAmountEther} {token?.symbol}
        </Typography>
      </Stack>

      <Stack>
        <Typography color="text.secondary">
          {VestingLabels.VestingStartDate}
        </Typography>
        <Typography color="text.primary">
          {format("LLLL d, yyyy", startDate)}
        </Typography>
      </Stack>

      <Stack>
        <Typography color="text.secondary">
          {VestingLabels.CliffPeriod}
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
          {VestingLabels.CliffAmount}
        </Typography>
        <Typography color="text.primary">
          {cliffAmountEther} {token?.symbol}
        </Typography>
      </Stack>

      <Stack>
        <Typography color="text.secondary">
          {VestingLabels.TotalVestingPeriod}
        </Typography>
        <Typography color="text.primary">
          {vestingPeriod.numerator} {timeUnitWordMap[vestingPeriod.denominator]}
        </Typography>
        <Typography color="text.primary">
          {format("LLLL d, yyyy", endDate)}
        </Typography>
      </Stack>

      <ConnectionBoundary>
        <CreateVestingTransactionButton />
      </ConnectionBoundary>
    </Stack>
  );
};
