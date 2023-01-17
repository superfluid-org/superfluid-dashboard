import { skipToken } from "@reduxjs/toolkit/dist/query";
import { FC, useMemo } from "react";
import NoContentPaper from "../../components/NoContent/NoContentPaper";
import { vestingSubgraphApi } from "../../vesting-subgraph/vestingSubgraphApi";
import { useExpectedNetwork } from "../network/ExpectedNetworkContext";
import {
  mapPendingToVestingSchedule,
  useAddressPendingVestingSchedules,
} from "../pendingUpdates/PendingVestingSchedule";
import { useVisibleAddress } from "../wallet/VisibleAddressContext";
import VestingScheduleTable from "./VestingScheduleTable";

export const SentVestingScheduleTable: FC = () => {
  const { visibleAddress } = useVisibleAddress();
  const { network } = useExpectedNetwork();

  const vestingSchedulesQuery = vestingSubgraphApi.useGetVestingSchedulesQuery(
    visibleAddress
      ? {
          chainId: network.id,
          where: { sender: visibleAddress?.toLowerCase(), deletedAt: null },
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

  const mappedVestingSchedules = useMemo(() => {
    return [
      ...mappedPendingVestingSchedules,
      ...(vestingSchedulesQuery.vestingSchedules || []),
    ];
  }, [mappedPendingVestingSchedules, vestingSchedulesQuery.vestingSchedules]);

  const { isLoading } = vestingSchedulesQuery;
  const hasContent = mappedVestingSchedules.length > 0;

  return (
    <>
      {isLoading || hasContent ? (
        <VestingScheduleTable
          data-cy={"created-table"}
          isLoading={isLoading}
          network={network}
          vestingSchedules={mappedVestingSchedules}
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
