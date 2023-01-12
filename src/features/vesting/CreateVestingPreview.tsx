import { Box, Stack, Typography } from "@mui/material";
import add from "date-fns/fp/add";
import format from "date-fns/fp/format";
import { FC } from "react";
import { useFormContext } from "react-hook-form";
import AddressName from "../../components/AddressName/AddressName";
import AddressAvatar from "../../components/Avatar/AddressAvatar";
import { parseEtherOrZero } from "../../utils/tokenUtils";
import AddressCopyTooltip from "../common/AddressCopyTooltip";
import { timeUnitWordMap } from "../send/FlowRateInput";
import TokenIcon from "../token/TokenIcon";
import { VestingFormLabels } from "./CreateVestingForm";
import { ValidVestingForm } from "./CreateVestingFormProvider";
import { CreateVestingCardView, VestingToken } from "./CreateVestingSection";
import { CreateVestingTransactionButton } from "./CreateVestingTransactionButton";
import { VestingScheduleGraph } from "./VestingScheduleGraph";

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

  return (
    <Stack gap={3}>
      <Box sx={{ my: 2 }}>
        <VestingScheduleGraph
          startDate={startDate}
          endDate={endDate}
          cliffDate={cliffDate}
          cliffAmount={parseEtherOrZero(cliffAmountEther)}
          totalAmount={parseEtherOrZero(totalAmountEther)}
        />
      </Box>

      <Stack gap={2}>
        <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2 }}>
          <Stack>
            <Typography color="text.secondary">
              {VestingFormLabels.Receiver}
            </Typography>

            <AddressCopyTooltip address={receiverAddress}>
              <Stack direction="row" alignItems="center" gap={1.5}>
                <AddressAvatar
                  address={receiverAddress}
                  AvatarProps={{
                    sx: { width: "24px", height: "24px", borderRadius: "5px" },
                  }}
                  BlockiesProps={{ size: 8, scale: 3 }}
                />
                <Typography data-cy={"preview-receiver"}>
                  <AddressName address={receiverAddress} />
                </Typography>
              </Stack>
            </AddressCopyTooltip>
          </Stack>
          <Stack>
            <Typography color="text.secondary">
              {VestingFormLabels.VestingStartDate}
            </Typography>
            <Typography data-cy="preview-start-date" color="text.primary">
              {format("LLLL d, yyyy", startDate)}
            </Typography>
          </Stack>
        </Box>

        <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2 }}>
          <Stack>
            <Typography color="text.secondary">
              {VestingFormLabels.CliffAmount}
            </Typography>
            <Stack direction="row" alignItems="center" gap={1}>
              <TokenIcon isSuper tokenSymbol={token.symbol} size={28} />
              <Typography data-cy={"preview-cliff-amount"}>
                {cliffAmountEther} {token.symbol}
              </Typography>
            </Stack>
          </Stack>

          <Stack>
            <Typography color="text.secondary">
              {VestingFormLabels.CliffPeriod}
            </Typography>
            <Typography data-cy="preview-cliff-period" color="text.primary">
              {cliffPeriod.numerator} {timeUnitWordMap[cliffPeriod.denominator]}{" "}
              ({format("LLLL d, yyyy", cliffDate)})
            </Typography>
          </Stack>
        </Box>

        <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2 }}>
          <Stack>
            <Typography color="text.secondary">
              {VestingFormLabels.TotalVestedAmount}
            </Typography>
            <Stack direction="row" alignItems="center" gap={1}>
              <TokenIcon isSuper tokenSymbol={token.symbol} size={28} />
              <Typography data-cy={"preview-total-amount"}>
                {totalAmountEther} {token.symbol}
              </Typography>
            </Stack>
          </Stack>

          <Stack>
            <Typography color="text.secondary">
              {VestingFormLabels.TotalVestingPeriod}
            </Typography>
            <Typography data-cy="preview-total-period" color="text.primary">
              {vestingPeriod.numerator}{" "}
              {timeUnitWordMap[vestingPeriod.denominator]} (
              {format("LLLL d, yyyy", endDate)})
            </Typography>
          </Stack>
        </Box>
      </Stack>

      <CreateVestingTransactionButton setView={setView} />
    </Stack>
  );
};
