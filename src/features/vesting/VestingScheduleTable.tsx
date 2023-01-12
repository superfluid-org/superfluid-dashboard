import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
} from "@mui/material";
import { useRouter } from "next/router";
import { FC } from "react";
import { Network } from "../network/networks";
import { PendingVestingSchedule } from "../pendingUpdates/PendingVestingSchedule";
import { VestingSchedule } from "./types";
import VestingRow from "./VestingRow";

interface VestingScheduleTableProps {
  network: Network;
  vestingSchedules: Array<VestingSchedule>;
  pendingVestingSchedules?: Array<VestingSchedule & { pendingCreate: PendingVestingSchedule }>;
  dataCy?:string;
}

const VestingScheduleTable: FC<VestingScheduleTableProps> = ({
  network,
  vestingSchedules,
  pendingVestingSchedules = [],
  dataCy,
}) => {
  const router = useRouter();

  const openDetails = (id: string) => () =>
    router.push(`/vesting/${network.slugName}/${id}`);

  return (
    <Table data-cy={dataCy}>
      <TableHead>
        <TableRow>
          <TableCell sx={{ pl: 8.5 }}>Receiver</TableCell>
          <TableCell>Total vesting</TableCell>
          <TableCell>Cliff</TableCell>
          <TableCell sx={{ pr: 2 }}>Start / End</TableCell>
          <TableCell sx={{ pr: 2, pl: 0, width: 0 }}></TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {pendingVestingSchedules.map((vestingSchedule) => (
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
            onClick={openDetails(vestingSchedule.id)}
          />
        ))}
      </TableBody>
    </Table>
  );
};

export default VestingScheduleTable;
