import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
} from "@mui/material";
import { skipToken } from "@reduxjs/toolkit/dist/query";
import { useRouter } from "next/router";
import { FC } from "react";
import { useGetVestingSchedulesQuery } from "../../vesting-subgraph/getVestingSchedules.generated";
import { networkDefinition } from "../network/networks";
import { useVisibleAddress } from "../wallet/VisibleAddressContext";
import VestingRow from "./VestingRow";

export const ReceivedVestingScheduleTable: FC = () => {
  const { visibleAddress } = useVisibleAddress();
  const network = networkDefinition.goerli;
  const router = useRouter();

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

  const openDetails = (id: string) => () =>
    router.push(`/vesting/${network.slugName}/${id}`);

  return (
    <Table>
      <TableHead>
        <TableRow>
          <TableCell sx={{ pl: 8.5 }}>Receiver</TableCell>
          <TableCell>Total vesting</TableCell>
          <TableCell>Cliff</TableCell>
          <TableCell>Start / End</TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {vestingSchedules.map((vestingSchedule) => (
          <VestingRow
            key={vestingSchedule.id}
            network={network}
            vestingSchedule={vestingSchedule}
            onClick={openDetails(vestingSchedule.id)}
          />
        ))}
      </TableBody>
    </Table>
  );
};
