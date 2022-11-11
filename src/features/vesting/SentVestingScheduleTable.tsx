import { skipToken } from "@reduxjs/toolkit/dist/query";
import { useRouter } from "next/router";
import { FC, useMemo } from "react";
import { useGetVestingSchedulesQuery } from "../../vesting-subgraph/getVestingSchedules.generated";
import { networkDefinition } from "../network/networks";
import {
  mapPendingToVestingSchedule,
  useAddressPendingVestingSchedules,
} from "../pendingUpdates/PendingVestingSchedule";
import { useVisibleAddress } from "../wallet/VisibleAddressContext";
import VestingScheduleTable from "./VestingScheduleTable";

export const SentVestingScheduleTable: FC = () => {
  const { visibleAddress } = useVisibleAddress();
  const network = networkDefinition.goerli;

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

  return (
    <VestingScheduleTable
      network={network}
      vestingSchedules={vestingSchedules}
      pendingVestingSchedules={mappedPendingVestingSchedules}
    />
  );
};
