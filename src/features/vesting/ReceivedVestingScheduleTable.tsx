import { skipToken } from "@reduxjs/toolkit/dist/query";
import { FC } from "react";
import { useGetVestingSchedulesQuery } from "../../vesting-subgraph/getVestingSchedules.generated";
import { networkDefinition } from "../network/networks";
import { useVisibleAddress } from "../wallet/VisibleAddressContext";
import VestingScheduleTable from "./VestingScheduleTable";

export const ReceivedVestingScheduleTable: FC = () => {
  const { visibleAddress } = useVisibleAddress();
  const network = networkDefinition.goerli;

  // TODO(KK): Not really vesting schedules, just creation events.
  const { vestingSchedules } = useGetVestingSchedulesQuery(
    visibleAddress
      ? {
          where: { receiver: visibleAddress?.toLowerCase() },
        }
      : skipToken,
    {
      selectFromResult: (result) => ({
        ...result,
        vestingSchedules: result.data?.vestingSchedules ?? [],
      }),
    }
  );

  return (
    <VestingScheduleTable
      network={network}
      vestingSchedules={vestingSchedules}
    />
  );
};
