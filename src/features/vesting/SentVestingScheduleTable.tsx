import {
  IconButton,
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
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import { DetailsButton } from "./DetailsButton";
import NextLink from "next/link";

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
          <TableCell></TableCell>
          <TableCell>Asset</TableCell>
          <TableCell>Receiver</TableCell>
          <TableCell></TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {pendingVestingSchedules.map((x) => (
          <TableRow hover key={x.id}>
            <TableCell></TableCell>
            <TableCell>{x.superTokenAddress}</TableCell>
            <TableCell></TableCell>
            <TableCell>PENDING</TableCell>
          </TableRow>
        ))}
        {vestingSchedules.map((x) => (
          <TableRow hover key={x.id}>
            <TableCell>
              <NextLink href={`/vesting/goerli/${x.id}`} passHref>
                <IconButton>
                  <ArrowForwardIcon fontSize="small" />
                </IconButton>
              </NextLink>
            </TableCell>
            <TableCell>{x.superToken}</TableCell>
            <TableCell>{x.receiver}</TableCell>
            <TableCell></TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};
