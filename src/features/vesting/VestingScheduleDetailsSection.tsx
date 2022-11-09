import { FC } from "react";
import { useGetVestingScheduleQuery } from "../../vesting-subgraph/getVestingSchedule.generated";
import Page404 from "../../pages/404";
import { Network } from "../network/networks";
import { VestingScheduleGraph } from "./VestingScheduleGraph";
import { BigNumber } from "ethers";
import { CircularProgress, Stack, Typography } from "@mui/material";
import { useVestingToken } from "./useVestingToken";
import { VestingFormLabels } from "./CreateVestingForm";
import { AccountChip } from "./AccountChip";
import format from "date-fns/fp/format";
import { formatEther } from "ethers/lib/utils";
import { TokenChip } from "./TokenChip";
import { PageLoader } from "./PageLoader";

export const VestingScheduleDetails: FC<{
  network: Network;
  id: string;
}> = ({ network, id }) => {
  const vestingScheduleQuery = useGetVestingScheduleQuery({
    id,
  });

  // TODO(KK): handle failure and skip here?
  const tokenQuery = useVestingToken(
    network,
    vestingScheduleQuery?.data?.vestingSchedule?.superToken
  );
  const token = tokenQuery.token;

  if (vestingScheduleQuery.isLoading || !token) {
    return <PageLoader />;
  }

  const vestingSchedule = vestingScheduleQuery.data?.vestingSchedule;

  if (!vestingSchedule) {
    return <Page404 />;
  }

  const {
    cliffAmount,
    receiver,
    sender,
    superToken,
    flowRate
  } = vestingSchedule;
  const cliffDate = Number(vestingSchedule.cliffDate);
  const startDate = Number(vestingSchedule.startDate);
  const endDate = Number(vestingSchedule.endDate);

  // TODO(KK): get this to Subgraph
  const cliffAndFlowDate = cliffDate ? startDate : cliffDate;
  const totalFlowed = BigNumber.from(flowRate).mul(endDate - cliffAndFlowDate);
  const totalAmount = BigNumber.from(cliffAmount).add(totalFlowed);

  const cliffAmountEther = formatEther(cliffAmount);
  const totalAmountEther = formatEther(totalAmount);

  return (
    <>
      <VestingScheduleGraph
        cliffAmount={cliffAmount}
        cliffDate={new Date(cliffDate * 1000)}
        endDate={new Date(endDate * 1000)}
        startDate={new Date(startDate * 1000)}
        totalAmount={totalAmount}
      />
      <Stack>
        <Typography color="text.secondary">
          {VestingFormLabels.Receiver}
        </Typography>
        <AccountChip address={receiver}></AccountChip>
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
          {format("LLLL d, yyyy", cliffDate)}
        </Typography>
      </Stack>

      <Stack>
        <Typography color="text.secondary">
          {VestingFormLabels.CliffAmount}
        </Typography>
        <Typography color="text.primary">
          {cliffAmountEther} {token.symbol}
        </Typography>
      </Stack>

      <Stack>
        <Typography color="text.secondary">
          {VestingFormLabels.TotalVestingPeriod}
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
          {totalAmountEther} {token.symbol}
        </Typography>
      </Stack>
    </>
  );
};
