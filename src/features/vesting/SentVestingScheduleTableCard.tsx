import {
  Card,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import { skipToken } from "@reduxjs/toolkit/dist/query";
import { uniq } from "lodash";
import { FC } from "react";
import { useGetSentVestingSchedulesQuery } from "../../vesting-subgraph/getSentVestingSchedules.generated";
import { useVisibleAddress } from "../wallet/VisibleAddressContext";

export const VestingScheduleTableCard: FC = () => {
  const { visibleAddress } = useVisibleAddress();

  // TODO(KK): Not really vesting schedules, just creation events.
  const { vestingSchedules } = useGetSentVestingSchedulesQuery(
    visibleAddress
      ? {
          sender: visibleAddress?.toLowerCase(),
        }
      : skipToken,
    {
      selectFromResult: (result) => ({
        ...result,
        vestingSchedules:
          result.data?.createVestingScheduleEvents?.map((x) => x.receiver) ??
          [],
      }),
    }
  );

  return (
    <Card>
      <Typography variant="h6" component="h3">
        Sent Vesting Schedules
      </Typography>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Receiver</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {vestingSchedules.map((x) => (
            <TableRow key={x.id}>
              <TableCell>{x.receiver}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Card>
  );
};
