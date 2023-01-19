import { Card, Skeleton, Stack, Typography } from "@mui/material";
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
import { VestingSchedulerAllowances } from "./VestingSchedulerAllowances";
import VestingScheduleTable from "./VestingScheduleTable";

interface VestingScheduleTablesProps {}

const VestingScheduleTables: FC<VestingScheduleTablesProps> = ({}) => {
  const { visibleAddress } = useVisibleAddress();
  const { network } = useExpectedNetwork();

  const {
    vestingSchedules: receivedVestingSchedules,
    isLoading: receivedSchedulesLoading,
  } = vestingSubgraphApi.useGetVestingSchedulesQuery(
    visibleAddress
      ? {
          chainId: network.id,
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

  const {
    vestingSchedules: sentVestingSchedules,
    isLoading: sentSchedulesLoading,
  } = vestingSubgraphApi.useGetVestingSchedulesQuery(
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

  const mappedSentVestingSchedules = useMemo(() => {
    return [...mappedPendingVestingSchedules, ...(sentVestingSchedules || [])];
  }, [mappedPendingVestingSchedules, sentVestingSchedules]);

  return (
    <Stack gap={2}>
      <Typography variant="h6">
        {receivedSchedulesLoading ? <Skeleton /> : "Received Vesting Schedules"}
      </Typography>
      <Card sx={{ p: 0, mb: 3 }}>
        {receivedSchedulesLoading || receivedVestingSchedules.length > 0 ? (
          <VestingScheduleTable
            dataCy={"received-table"}
            isLoading={receivedSchedulesLoading}
            network={network}
            vestingSchedules={receivedVestingSchedules}
          />
        ) : (
          <NoContentPaper
            dataCy={"no-received-schedules"}
            title="No Received Vesting Schedules"
            description="Vesting schedules that you have received will appear here."
          />
        )}
      </Card>

      <Typography variant="h6">
        {sentSchedulesLoading ? <Skeleton /> : "Sent Vesting Schedules"}
      </Typography>
      <Card sx={{ p: 0 }}>
        {sentSchedulesLoading || mappedSentVestingSchedules.length > 0 ? (
          <VestingScheduleTable
            data-cy={"created-table"}
            isLoading={sentSchedulesLoading}
            network={network}
            vestingSchedules={mappedSentVestingSchedules}
          />
        ) : (
          <NoContentPaper
            dataCy={"no-created-schedules"}
            title="No Sent Vesting Schedules"
            description="Vesting schedules that you have created will appear here."
          />
        )}
      </Card>
      <Card sx={{ p: 0 }}>
        <VestingSchedulerAllowances />
      </Card>
    </Stack>
  );
};

export default VestingScheduleTables;
