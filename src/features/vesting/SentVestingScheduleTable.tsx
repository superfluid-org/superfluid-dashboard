import { skipToken } from "@reduxjs/toolkit/dist/query";
import { FC, useMemo } from "react";
import NoContentPaper from "../../components/NoContent/NoContentPaper";
import { useGetVestingSchedulesQuery } from "../../vesting-subgraph/getVestingSchedules.generated";
import { networkDefinition } from "../network/networks";
import {
  mapPendingToVestingSchedule,
  useAddressPendingVestingSchedules,
} from "../pendingUpdates/PendingVestingSchedule";
import { useVisibleAddress } from "../wallet/VisibleAddressContext";
import VestingScheduleLoadingTable from "./VestingScheduleLoadingTable";
import VestingScheduleTable from "./VestingScheduleTable";

export const SentVestingScheduleTable: FC = () => {
  const network = networkDefinition.goerli;
  const { visibleAddress } = useVisibleAddress();

  const vestingSchedulesQuery = useGetVestingSchedulesQuery(
    visibleAddress
      ? {
          where: { sender: visibleAddress?.toLowerCase(), deletedAt: null },
        }
      : skipToken,
    {
      selectFromResult: (result) => ({
        ...result,
        vestingSchedules: result.data?.vestingSchedules ?? [],
      }),
    }
  );

  const pendingVestingSchedules =
    useAddressPendingVestingSchedules(visibleAddress);

  const mappedPendingVestingSchedules = useMemo(
    () =>
      visibleAddress
        ? pendingVestingSchedules.map((pendingVestingSchedule) =>
            mapPendingToVestingSchedule(visibleAddress, pendingVestingSchedule)
          )
        : [],
    [pendingVestingSchedules, visibleAddress]
  );

  const { vestingSchedules, isLoading } = vestingSchedulesQuery;
  const hasContent =
    vestingSchedules.length > 0 || mappedPendingVestingSchedules.length > 0;

  return (
    <>
      {isLoading ? (
        <VestingScheduleLoadingTable />
      ) : hasContent ? (
        <VestingScheduleTable
          data-cy={"created-table"}
          network={network}
          vestingSchedules={vestingSchedules}
          pendingVestingSchedules={mappedPendingVestingSchedules}
        />
      ) : (
        <NoContentPaper
          dataCy={"no-created-schedules"}
          title="No Sent Vesting Schedules"
          description="Vesting schedules that you have created will appear here."
        />
      )}
    </>
  );
};
