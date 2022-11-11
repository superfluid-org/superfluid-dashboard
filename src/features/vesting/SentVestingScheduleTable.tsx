import { Paper, Typography, useMediaQuery, useTheme } from "@mui/material";
import { skipToken } from "@reduxjs/toolkit/dist/query";
import { useRouter } from "next/router";
import { FC, useMemo } from "react";
import NoContentPaper from "../../components/NoContent/NoContentPaper";
import { useGetVestingSchedulesQuery } from "../../vesting-subgraph/getVestingSchedules.generated";
import { networkDefinition } from "../network/networks";
import {
  mapPendingToVestingSchedule,
  useAddressPendingVestingSchedules,
} from "../pendingUpdates/PendingVestingSchedule";
import { useVisibleAddress } from "../wallet/VisibleAddressContext";
import VestingScheduleTable from "./VestingScheduleTable";

export const SentVestingScheduleTable: FC = () => {
  const network = networkDefinition.goerli;

  const { visibleAddress } = useVisibleAddress();
  const theme = useTheme();
  const isBelowMd = useMediaQuery(theme.breakpoints.down("md"));

  // TODO(KK): Not really vesting schedules, just creation events.
  const { vestingSchedules } = useGetVestingSchedulesQuery(
    visibleAddress
      ? {
          where: { sender: visibleAddress?.toLowerCase() },
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

  const hasContent =
    vestingSchedules.length > 0 || mappedPendingVestingSchedules.length > 0;

  return (
    <>
      {hasContent && (
        <VestingScheduleTable
          network={network}
          vestingSchedules={vestingSchedules}
          pendingVestingSchedules={mappedPendingVestingSchedules}
        />
      )}
      {!hasContent && (
        <NoContentPaper
          title="No Sent Vesting Schedules"
          description="Vesting schedules that you have created will appear here."
        />
      )}
    </>
  );
};
