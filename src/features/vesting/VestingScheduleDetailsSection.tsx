import { Box, Stack, Typography } from "@mui/material";
import format from "date-fns/fp/format";
import { BigNumber } from "ethers";
import { formatEther } from "ethers/lib/utils";
import { FC } from "react";
import AddressName from "../../components/AddressName/AddressName";
import AddressAvatar from "../../components/Avatar/AddressAvatar";
import Page404 from "../../pages/404";
import config from "../../utils/config";
import { getTimeInSeconds } from "../../utils/dateUtils";
import { useGetVestingScheduleQuery } from "../../vesting-subgraph/getVestingSchedule.generated";
import { Network } from "../network/networks";
import SharingSection from "../socialSharing/SharingSection";
import TokenIcon from "../token/TokenIcon";
import { VestingFormLabels } from "./CreateVestingForm";
import { BigLoader } from "./BigLoader";
import { DeleteVestingTransactionButton } from "./DeleteVestingTransactionButton";
import ConnectionBoundary from "../transactionBoundary/ConnectionBoundary";
import { useVestingToken } from "./useVestingToken";
import { VestingScheduleGraph } from "./VestingScheduleGraph";
import Amount from "../token/Amount";
import AddressCopyTooltip from "../common/AddressCopyTooltip";

export const VestingScheduleDetails: FC<{
  network: Network;
  id: string;
}> = ({ network, id }) => {
  const vestingScheduleQuery = useGetVestingScheduleQuery({
    id,
  });

  const tokenQuery = useVestingToken(
    network,
    vestingScheduleQuery?.data?.vestingSchedule?.superToken
  );

  const token = tokenQuery.token;

  if (vestingScheduleQuery.isLoading || !token) {
    return <BigLoader />;
  }

  const vestingSchedule = vestingScheduleQuery.data?.vestingSchedule;

  if (!vestingSchedule) {
    return <Page404 />;
  }

  const {
    cliffAmount,
    receiver: receiverAddress,
    sender: senderAddress,
    superToken: superTokenAddress,
    flowRate,
    deletedAt,
    endExecutedAt,
  } = vestingSchedule;
  const cliffDate = new Date(Number(vestingSchedule.cliffDate) * 1000);
  const startDate = new Date(Number(vestingSchedule.startDate) * 1000);
  const endDate = new Date(Number(vestingSchedule.endDate) * 1000);
  const canDelete = !deletedAt && !endExecutedAt;

  // TODO(KK): get this to Subgraph
  const cliffAndFlowDate = cliffDate ? startDate : cliffDate;
  const totalFlowed = BigNumber.from(flowRate).mul(
    getTimeInSeconds(endDate) - getTimeInSeconds(cliffAndFlowDate)
  );
  const totalAmount = BigNumber.from(cliffAmount).add(totalFlowed);

  const cliffAmountEther = formatEther(cliffAmount);
  const totalAmountEther = formatEther(totalAmount);

  const urlToShare = `${config.appUrl}/vesting/${network.slugName}/${id}`;

  return (
    <Stack gap={3}>
      <Box sx={{ my: 2 }}>
        <VestingScheduleGraph
          cliffAmount={cliffAmount}
          cliffDate={cliffDate}
          endDate={endDate}
          startDate={startDate}
          totalAmount={totalAmount}
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
                <Typography>
                  <AddressName address={receiverAddress} />
                </Typography>
              </Stack>
            </AddressCopyTooltip>
          </Stack>
          <Stack>
            <Typography color="text.secondary">Start Date</Typography>
            <Typography color="text.primary">
              {format("LLLL d, yyyy HH:mm", startDate)}
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
              <Typography>
                {cliffAmountEther} {token.symbol}
              </Typography>
            </Stack>
          </Stack>

          <Stack>
            <Typography color="text.secondary">
              {VestingFormLabels.CliffPeriod}
            </Typography>
            <Typography color="text.primary">
              {format("LLLL d, yyyy HH:mm", cliffDate)}
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
              <Typography>
                <Amount wei={totalAmount} /> {token.symbol}
              </Typography>
            </Stack>
          </Stack>

          <Stack>
            <Typography color="text.secondary">End Date</Typography>
            <Typography color="text.primary">
              {format("LLLL d, yyyy HH:mm", endDate)}
            </Typography>
          </Stack>
        </Box>
      </Stack>

      <Box sx={{ mt: 2 }}>
        <SharingSection
          url={urlToShare}
          twitterText="Start vesting with Superfluid!"
          telegramText="Start vesting with Superfluid!"
          twitterHashtags="Superfluid,Vesting"
        />
      </Box>

      {canDelete && (
        <Box sx={{ mt: 2 }}>
          <ConnectionBoundary expectedNetwork={network}>
            <DeleteVestingTransactionButton
              superTokenAddress={superTokenAddress}
              senderAddress={senderAddress}
              receiverAddress={receiverAddress}
            />
          </ConnectionBoundary>
        </Box>
      )}
    </Stack>
  );
};
