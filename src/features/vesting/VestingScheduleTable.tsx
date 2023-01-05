import {
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
  useTheme,
} from "@mui/material";
import { useRouter } from "next/router";
import { FC } from "react";
import { VestingSchedule } from "../../vesting-subgraph/schema.generated";
import NetworkIcon from "../network/NetworkIcon";
import { Network } from "../network/networks";
import { PendingVestingSchedule } from "../pendingUpdates/PendingVestingSchedule";
import VestingRow from "./VestingRow";

interface VestingScheduleTableProps {
  network: Network;
  vestingSchedules: Array<VestingSchedule>;
  pendingVestingSchedules?: Array<
    VestingSchedule & { pendingCreate: PendingVestingSchedule }
  >;
  incoming?: boolean;
}

const VestingScheduleTable: FC<VestingScheduleTableProps> = ({
  network,
  vestingSchedules,
  pendingVestingSchedules = [],
  incoming = false,
}) => {
  const theme = useTheme();
  const router = useRouter();

  const openDetails = (id: string) => () =>
    router.push(`/vesting/${network.slugName}/${id}`);

  return (
    <Table>
      <TableHead>
        <TableRow>
          <TableCell
            colSpan={5}
            sx={{
              p: 0,
              [theme.breakpoints.up("md")]: { border: "none" },
              [theme.breakpoints.down("md")]: { p: 0 },
            }}
          >
            <Stack
              direction="row"
              alignItems="center"
              gap={2}
              sx={{ py: 2, px: 4, [theme.breakpoints.down("md")]: { p: 2 } }}
            >
              <NetworkIcon network={network} />
              <Typography
                data-cy="network-name"
                variant="h5"
                color="text.primary"
                translate="no"
              >
                {network.name}
              </Typography>
            </Stack>
          </TableCell>
        </TableRow>
        <TableRow>
          <TableCell>Asset</TableCell>
          <TableCell>{incoming ? "From" : "To"}</TableCell>
          <TableCell>Allocated</TableCell>
          <TableCell>Vested</TableCell>
          <TableCell sx={{ pr: 2 }}>Vesting Start / End</TableCell>
          <TableCell sx={{ pr: 2, pl: 0, width: 0 }}>Status</TableCell>
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
