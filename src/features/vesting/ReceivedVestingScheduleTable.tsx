import { skipToken } from "@reduxjs/toolkit/dist/query";
import { FC } from "react";
import NoContentPaper from "../../components/NoContent/NoContentPaper";
import { useGetVestingSchedulesQuery } from "../../vesting-subgraph/getVestingSchedules.generated";
import { networkDefinition } from "../network/networks";
import { useVisibleAddress } from "../wallet/VisibleAddressContext";
import VestingScheduleLoadingTable from "./VestingScheduleLoadingTable";
import VestingScheduleTable from "./VestingScheduleTable";

export const ReceivedVestingScheduleTable: FC = () => {
  const { visibleAddress } = useVisibleAddress();
  const network = networkDefinition.goerli;

  const vestingSchedulesQuery = useGetVestingSchedulesQuery(
    visibleAddress
      ? {
          where: { receiver: visibleAddress?.toLowerCase(), deletedAt: null },
        }
      : skipToken,
    {
      selectFromResult: (result) => ({
        ...result,
        vestingSchedules: result.data?.vestingSchedules ?? [],
      }),
    }
  );

  const { vestingSchedules, isLoading } = vestingSchedulesQuery;
  const hasContent = vestingSchedules.length > 0;

  return (
    <>
      {isLoading ? (
        <VestingScheduleLoadingTable />
      ) : hasContent ? (
        <VestingScheduleTable
          network={network}
          vestingSchedules={vestingSchedules}
        />
      ) : (
        <NoContentPaper
          title="No Received Vesting Schedules"
          description="Vesting schedules that you have received will appear here."
        />
      )}
    </>
  );
};
