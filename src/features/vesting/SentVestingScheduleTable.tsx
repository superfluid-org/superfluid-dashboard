import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
} from "@mui/material";
import { skipToken } from "@reduxjs/toolkit/dist/query";
import { FC } from "react";
import { useAddressPendingVestingSchedules } from "../pendingUpdates/PendingVestingSchedule";
import { useVisibleAddress } from "../wallet/VisibleAddressContext";
import { useGetVestingSchedulesQuery } from "../../vesting-subgraph/getVestingSchedules.generated";

export const SentVestingScheduleTable: FC = () => {
  const { visibleAddress } = useVisibleAddress();

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
        vestingSchedules: result.data?.createVestingScheduleEvents ?? [],
      }),
    }
  );

  const pendingVestingSchedules =
    useAddressPendingVestingSchedules(visibleAddress);

  return (
    <Table>
      <TableHead>
        <TableRow>
          <TableCell>Asset</TableCell>
          <TableCell>Receiver</TableCell>
          <TableCell></TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {pendingVestingSchedules.map((x) => (
          <TableRow key={x.id}>
            <TableCell>{x.superTokenAddress}</TableCell>
            <TableCell>PENDING</TableCell>
          </TableRow>
        ))}
        {vestingSchedules.map((x) => (
          <TableRow key={x.id}>
            <TableCell>{x.superToken}</TableCell>
            <TableCell>{x.receiver}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};
