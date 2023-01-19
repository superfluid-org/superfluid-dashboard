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

  const vestingSchedulesLoading =
    receivedSchedulesLoading || sentSchedulesLoading;

  return (
    <Stack gap={2}>
      <Stack
        gap={2}
        direction={
          receivedVestingSchedules.length === 0 &&
          mappedSentVestingSchedules.length > 0
            ? "column-reverse"
            : "column"
        }
      >
        <Stack gap={2} direction="column">
          <Typography variant="h6">
            {vestingSchedulesLoading ? (
              <Skeleton width="200px" />
            ) : (
              "Received Vesting Schedules"
            )}
          </Typography>
          <Card sx={{ p: 0, mb: 3 }}>
            {vestingSchedulesLoading || receivedVestingSchedules.length > 0 ? (
              <VestingScheduleTable
                dataCy={"received-table"}
                isLoading={vestingSchedulesLoading}
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
        </Stack>

        <Stack gap={2} direction="column">
          <Typography variant="h6">
            {vestingSchedulesLoading ? (
              <Skeleton width="200px" />
            ) : (
              "Sent Vesting Schedules"
            )}
          </Typography>
          <Card sx={{ p: 0 }}>
            {vestingSchedulesLoading ||
            mappedSentVestingSchedules.length > 0 ? (
              <VestingScheduleTable
                data-cy={"created-table"}
                isLoading={vestingSchedulesLoading}
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
        </Stack>
      </Stack>
      <Card sx={{ p: 0 }}>
        <VestingSchedulerAllowances />
      </Card>
    </Stack>
  );
};

export default VestingScheduleTables;
