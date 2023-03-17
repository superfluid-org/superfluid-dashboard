import {
  Box,
  Stack,
  Typography,
} from "@mui/material";
import add from "date-fns/fp/add";
import format from "date-fns/fp/format";
import { FC } from "react";
import { useFormContext } from "react-hook-form";
import AddressName from "../../components/AddressName/AddressName";
import AddressAvatar from "../../components/Avatar/AddressAvatar";
import { parseEtherOrZero } from "../../utils/tokenUtils";
import AddressCopyTooltip from "../common/AddressCopyTooltip";
import NetworkIcon from "../network/NetworkIcon";
import { Network } from "../network/networks";
import { timeUnitWordMap } from "../send/FlowRateInput";
import TokenIcon from "../token/TokenIcon";
import { VestingFormLabels } from "./CreateVestingForm";
import { ValidVestingForm } from "./CreateVestingFormProvider";
import { CreateVestingCardView, VestingToken } from "./CreateVestingSection";
import { CreateVestingTransactionButton } from "./CreateVestingTransactionButton";
import { VestingScheduleGraph } from "./VestingScheduleGraph";

interface CreateVestingPreviewProps {
  token: VestingToken;
  network: Network;
  setView: (value: CreateVestingCardView) => void;
}

export const CreateVestingPreview: FC<CreateVestingPreviewProps> = ({
  token,
  network,
  setView,
}) => {
  const { watch } = useFormContext<ValidVestingForm>();

  const [
    receiverAddress,
    totalAmountEther,
    startDate,
    vestingPeriod,
    cliffAmountEther = "0",
    cliffPeriod,
    cliffEnabled,
  ] = watch([
    "data.receiverAddress",
    "data.totalAmountEther",
    "data.startDate",
    "data.vestingPeriod",
    "data.cliffAmountEther",
    "data.cliffPeriod",
    "data.cliffEnabled",
  ]);

  const { numerator: cliffNumerator = 0, denominator: cliffDenominator } =
    cliffPeriod;

  const cliffDate = cliffEnabled
    ? add(
        {
          seconds: cliffNumerator * cliffDenominator,
        },
        startDate
      )
    : undefined;

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
              <Stack direction="row" alignItems="center" gap={1}>
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
              {VestingFormLabels.Network}
            </Typography>
            <Stack direction="row" alignItems="center" gap={1}>
              <NetworkIcon size={28} network={network} />
              <Typography>{network.name}</Typography>
            </Stack>
          </Stack>
        </Box>

        <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2 }}>
          <Stack>
            <Typography color="text.secondary">
              {VestingFormLabels.SuperToken}
            </Typography>
            <Stack direction="row" alignItems="center" gap={1}>
              <TokenIcon isSuper tokenSymbol={token.symbol} size={28} />
              <Typography>{token.symbol}</Typography>
            </Stack>
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
              {VestingFormLabels.TotalVestedAmount}
            </Typography>
            <Typography data-cy={"preview-total-amount"}>
              {totalAmountEther} {token.symbol}
            </Typography>
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

        {cliffEnabled && cliffDate && (
          <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2 }}>
            <Stack>
              <Typography color="text.secondary">
                {VestingFormLabels.CliffAmount}
              </Typography>
              <Typography data-cy={"preview-cliff-amount"}>
                {cliffAmountEther} {token.symbol}
              </Typography>
            </Stack>

            <Stack>
              <Typography color="text.secondary">
                {VestingFormLabels.CliffPeriod}
              </Typography>
              <Typography data-cy="preview-cliff-period" color="text.primary">
                {cliffPeriod.numerator}{" "}
                {timeUnitWordMap[cliffPeriod.denominator]} (
                {format("LLLL d, yyyy", cliffDate)})
              </Typography>
            </Stack>
          </Box>
        )}
      </Stack>
      <CreateVestingTransactionButton setView={setView} />
    </Stack>
  );
};
