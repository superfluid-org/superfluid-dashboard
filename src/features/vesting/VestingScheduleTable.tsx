import {
  ListItemText,
  Paper,
  Skeleton,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { useRouter } from "next/router";
import { FC, useMemo, useState } from "react";
import NetworkHeadingRow from "../../components/Table/NetworkHeadingRow";
import TableFilterRow from "../../components/Table/TableFilterRow";
import { EmptyRow } from "../common/EmptyRow";
import { Network } from "../network/networks";
import { PendingVestingSchedule } from "../pendingUpdates/PendingVestingSchedule";
import { VestingSchedule } from "./types";
import VestingRow from "./VestingRow";

const VestingScheduleRowSkeleton = () => {
  return (
    <TableRow>
      <TableCell>
        <Stack direction="row" alignItems="center" gap={1.5}>
          <Skeleton variant="circular" width={24} height={24} />
          <Skeleton variant="rectangular" width={36} height={36} />
          <Typography variant="h7">
            <Skeleton width={80} />
          </Typography>
        </Stack>
      </TableCell>
      <TableCell sx={{ py: 0.5 }}>
        <Stack direction="row" alignItems="center" gap={1.5}>
          <Skeleton variant="circular" width={36} height={36} />
          <ListItemText primary={<Skeleton width={80} />} />
        </Stack>
      </TableCell>
      <TableCell>
        <ListItemText
          primary={<Skeleton width={80} />}
          secondary={<Skeleton width={80} />}
        />
      </TableCell>
      <TableCell>
        <ListItemText
          primary={<Skeleton width={80} />}
          secondary={<Skeleton width={80} />}
        />
      </TableCell>
      <TableCell>
        <ListItemText
          primary={<Skeleton width={80} />}
          secondary={<Skeleton width={80} />}
          primaryTypographyProps={{ variant: "body2", color: "text.secondary" }}
        />
      </TableCell>
    </TableRow>
  );
};

enum VestingStatusFilter {
  All,
  Cliff,
  Vesting,
  Vested,
  Deleted,
}
const StatusFilterOptions = [
  { title: "All", value: VestingStatusFilter.All },
  { title: "Cliff", value: VestingStatusFilter.Cliff },
  { title: "Vesting", value: VestingStatusFilter.Vesting },
  { title: "Vested", value: VestingStatusFilter.Vested },
  { title: "Deleted", value: VestingStatusFilter.Deleted },
];

interface PendingCreateVestingSchedule extends VestingSchedule {
  pendingCreate: PendingVestingSchedule;
}

type VestingSchedules = Array<VestingSchedule | PendingCreateVestingSchedule>;

interface VestingScheduleTableProps {
  network: Network;
  vestingSchedules: VestingSchedules;
  isLoading?: boolean;
  incoming?: boolean;
  dataCy?: string;
}

const VestingScheduleTable: FC<VestingScheduleTableProps> = ({
  network,
  vestingSchedules,
  isLoading = true,
  incoming = false,
  dataCy,
}) => {
  const theme = useTheme();
  const isBelowMd = useMediaQuery(theme.breakpoints.down("md"));
  const router = useRouter();

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [statusFilter, setStatusFilter] = useState(VestingStatusFilter.All);

  const openDetails = (id: string) => () =>
    router.push(`/vesting/${network.slugName}/${id}`);

  const onVestingStatusFilterChange = (newFilter: VestingStatusFilter) => {
    setPage(0);
    setStatusFilter(newFilter);
  };

  const handleChangePage = (_e: unknown, newPage: number) => setPage(newPage);

  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const filteredVestingSchedules = useMemo(() => {
    switch (statusFilter) {
      case VestingStatusFilter.Cliff:
        return vestingSchedules.filter(
          (vestingSchedule) => vestingSchedule.status.isCliff
        );
      case VestingStatusFilter.Vesting:
        return vestingSchedules.filter(
          (vestingSchedule) => vestingSchedule.status.isStreaming
        );
      case VestingStatusFilter.Vested:
        return vestingSchedules.filter(
          (vestingSchedule) =>
            vestingSchedule.status.isFinished &&
            !vestingSchedule.status.isDeleted
        );
      case VestingStatusFilter.Deleted:
        return vestingSchedules.filter(
          (vestingSchedule) => vestingSchedule.status.isDeleted
        );
      default:
        return vestingSchedules.filter(
          (vestingSchedule) => !vestingSchedule.status.isDeleted
        );
    }
  }, [statusFilter, vestingSchedules]);

  return (
    <TableContainer
      data-cy={dataCy}
      component={Paper}
      sx={{
        [theme.breakpoints.down("md")]: {
          mx: -2,
          width: "auto",
          borderRadius: 0,
          border: "none",
          borderBottom: `1px solid ${theme.palette.divider}`,
          boxShadow: "none",
        },
      }}
    >
      <Table>
        <TableHead>
          {incoming && <NetworkHeadingRow colSpan={6} network={network} />}
          <TableFilterRow
            value={statusFilter}
            options={StatusFilterOptions}
            onChange={onVestingStatusFilterChange}
          />
          <TableRow>
            <TableCell>{incoming ? "Sender" : "Receiver"}</TableCell>
            <TableCell>Allocated</TableCell>
            <TableCell>Vested</TableCell>
            <TableCell sx={{ pr: 2 }}>Vesting Start / End</TableCell>
            <TableCell width="140px" sx={{ pr: 2, pl: 0 }}>
              Status
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {isLoading ? (
            <VestingScheduleRowSkeleton />
          ) : filteredVestingSchedules.length === 0 ? (
            <EmptyRow span={6} />
          ) : (
            filteredVestingSchedules
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((vestingSchedule) => (
                <VestingRow
                  key={vestingSchedule.id}
                  network={network}
                  vestingSchedule={vestingSchedule}
                  onClick={
                    (vestingSchedule as PendingCreateVestingSchedule)
                      .pendingCreate
                      ? undefined
                      : openDetails(vestingSchedule.id)
                  }
                />
              ))
          )}
        </TableBody>
      </Table>
      {(filteredVestingSchedules.length > 5 ||
        (!isBelowMd && filteredVestingSchedules.length <= 5)) && (
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={filteredVestingSchedules.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          sx={{
            "> *": {
              visibility:
                filteredVestingSchedules.length <= 5 ? "hidden" : "visible",
            },
          }}
        />
      )}
    </TableContainer>
  );
};

export default VestingScheduleTable;
