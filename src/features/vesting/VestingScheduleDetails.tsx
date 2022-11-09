import { FC } from "react";
import { useGetVestingScheduleQuery } from "../../vesting-subgraph/getVestingSchedule.generated";
import Page404 from "../../pages/404";
import { Network } from "../network/networks";
import { VestingScheduleGraph } from "./VestingScheduleGraph";
import { BigNumber } from "ethers";

export const VestingScheduleDetails: FC<{
  network: Network;
  id: string;
}> = ({ id }) => {
  const vestingScheduleQuery = useGetVestingScheduleQuery({
    id,
  });

  if (vestingScheduleQuery.isLoading) {
    return <>Loading...</>;
  }

  const vestingSchedule = vestingScheduleQuery.data?.vestingSchedule;
  if (!vestingSchedule) {
    return <Page404 />;
  }

  const {
    cliffAmount,
    cliffDate,
    endDate,
    flowRate,
    receiver,
    sender,
    startDate,
    superToken,
  } = vestingSchedule;

  // TODO(KK): get this to Subgraph
  const cliffAndFlowDate = cliffDate ? startDate : cliffDate;
  const totalFlowed = BigNumber.from(flowRate).mul(endDate - cliffAndFlowDate);
  const totalAmount = BigNumber.from(cliffAmount).add(totalFlowed);

  return (
    <>
      <VestingScheduleGraph
        cliffAmount={cliffAmount}
        cliffDate={new Date(cliffDate * 1000)}
        endDate={new Date(endDate * 1000)}
        startDate={new Date(startDate * 1000)}
        totalAmount={totalAmount}
      />
    </>
  );
};
