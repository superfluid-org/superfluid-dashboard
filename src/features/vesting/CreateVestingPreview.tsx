import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { Box, Button, IconButton, Stack, Typography } from "@mui/material";
import add from "date-fns/fp/add";
import format from "date-fns/fp/format";
import { FC } from "react";
import { useFormContext } from "react-hook-form";
import { timeUnitWordMap } from "../send/FlowRateInput";
import { CreateVestingCardView, VestingToken } from "./CreateVestingSection";
import { VestingFormLabels } from "./CreateVestingForm";
import { ValidVestingForm } from "./CreateVestingFormProvider";
import { CreateVestingTransactionButton } from "./CreateVestingTransactionButton";
import { VestingScheduleGraph } from "./VestingScheduleGraph";
import { AccountChip } from "./AccountChip";
import { TokenChip } from "./TokenChip";
import { parseEtherOrZero } from "../../utils/tokenUtils";

export const CreateVestingPreview: FC<{
  token: VestingToken;
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
    <Button type="button" onClick={() => setView(CreateVestingCardView.Form)}>
      Back
    </Button>
  );

  return (
    <Stack gap={1}>
      <VestingScheduleGraph
        startDate={startDate}
        endDate={endDate}
        cliffDate={cliffDate}
        cliffAmount={parseEtherOrZero(cliffAmountEther)}
        totalAmount={parseEtherOrZero(totalAmountEther)}
      />

      <Stack>
        <Typography color="text.secondary">
          {VestingFormLabels.Receiver}
        </Typography>

        <AccountChip address={receiverAddress}></AccountChip>
      </Stack>

      <Stack>
        <Typography color="text.secondary">
          {VestingFormLabels.Token}
        </Typography>
        <TokenChip token={token} />
      </Stack>

      <Stack>
        <Typography color="text.secondary">
          {VestingFormLabels.VestingStartDate}
        </Typography>
        <Typography color="text.primary">
          {format("LLLL d, yyyy", startDate)}
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

      <Stack
        direction="row"
        gap={1}
        sx={{
          display: "grid",
          gridTemplateColumns: "1fr 2fr",
        }}
      >
        {BackButton}
        <CreateVestingTransactionButton setView={setView} />
      </Stack>
    </Stack>
  );
};
