import {
  CircularProgress,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
} from "@mui/material";
import { skipToken } from "@reduxjs/toolkit/dist/query";
import { FC, useMemo } from "react";
import {
  mapPendingToVestingSchedule,
  useAddressPendingVestingSchedules,
} from "../pendingUpdates/PendingVestingSchedule";
import { useVisibleAddress } from "../wallet/VisibleAddressContext";
import { useGetVestingSchedulesQuery } from "../../vesting-subgraph/getVestingSchedules.generated";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import NextLink from "next/link";
import { AccountChip } from "./AccountChip";
import VestingRow from "./VestingRow";
import { networkDefinition, networks } from "../network/networks";

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
    <Table>
      <TableHead>
        <TableRow>
          <TableCell sx={{ ml: 8.5 }}>Receiver</TableCell>
          <TableCell>Total vesting</TableCell>
          <TableCell>Cliff</TableCell>
          <TableCell>Start / End</TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {mappedPendingVestingSchedules.map((vestingSchedule) => (
          <VestingRow
            key={vestingSchedule.id}
            network={network}
            vestingSchedule={vestingSchedule}
          />
        ))}
        {vestingSchedules.map((vestingSchedule) => (
          <VestingRow
            key={vestingSchedule.id}
            network={network}
            vestingSchedule={vestingSchedule}
          />
        ))}
      </TableBody>
    </Table>
  );
};
