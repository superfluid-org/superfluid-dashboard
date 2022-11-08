import { FC } from "react";
import { useGetVestingScheduleQuery } from "../../vesting-subgraph/getVestingSchedule.generated";
import Page404 from "../../pages/404";
import { Network } from "../network/networks";
import { VestingScheduleGraph } from "./VestingScheduleGraph";

export const VestingScheduleDetails: FC<{
  network: Network;
  id: string;
}> = ({ id }) => {
  const vestingScheduleQuery = useGetVestingScheduleQuery({
    id
  });

  if (vestingScheduleQuery.isLoading) {
    return <>Loading...</>
  }

  const vestingSchedule = vestingScheduleQuery.data?.createVestingScheduleEvent;
  if (!vestingSchedule) {
    return <Page404 />;
  }

  const {  } = vestingSchedule;

  return (
    <>
      {/* <VestingScheduleGraph cliffAmountEther={} cliffDate={} /> */}
    </>
  );
};  