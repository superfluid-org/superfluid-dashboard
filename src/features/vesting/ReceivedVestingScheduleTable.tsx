import { skipToken } from "@reduxjs/toolkit/dist/query";
import { FC } from "react";
import NoContentPaper from "../../components/NoContent/NoContentPaper";
import { vestingSubgraphApi } from "../../vesting-subgraph/vestingSubgraphApi";
import { networkDefinition } from "../network/networks";
import { useVisibleAddress } from "../wallet/VisibleAddressContext";
import VestingScheduleLoadingTable from "./VestingScheduleLoadingTable";
import VestingScheduleTable from "./VestingScheduleTable";

export const ReceivedVestingScheduleTable: FC = () => {
  const { visibleAddress } = useVisibleAddress();
  const network = networkDefinition.goerli;

  const vestingSchedulesQuery = vestingSubgraphApi.useGetVestingSchedulesQuery(
    visibleAddress
      ? {
          chainId: networkDefinition.goerli.id,
          where: { receiver: visibleAddress?.toLowerCase(), deletedAt: null },
          orderBy: "createdAt",
          orderDirection: "desc",
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
          incoming
          dataCy={"received-table"}
          network={network}
          vestingSchedules={vestingSchedules}
        />
      ) : (
        <NoContentPaper
          dataCy={"no-received-schedules"}
          title="No Received Vesting Schedules"
          description="Vesting schedules that you have received will appear here."
        />
      )}
    </>
  );
};
