import {
  Button,
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
import { getUnixTime } from "date-fns";
import { useRouter } from "next/router";
import { FC, useCallback, useMemo, useState } from "react";
import { EmptyRow } from "../common/EmptyRow";
import NetworkIcon from "../network/NetworkIcon";
import { Network } from "../network/networks";
import { PendingVestingSchedule } from "../pendingUpdates/PendingVestingSchedule";
import { VestingSchedule } from "./types";
import VestingRow from "./VestingRow";

enum VestingStatusFilter {
  All,
  Cliff,
  Vesting,
  Vested,
}

interface VestingScheduleTableProps {
  network: Network;
  vestingSchedules: Array<VestingSchedule>;
  pendingVestingSchedules?: Array<
    VestingSchedule & { pendingCreate: PendingVestingSchedule }
  >;
  incoming?: boolean;
  dataCy?: string;
}

const VestingScheduleTable: FC<VestingScheduleTableProps> = ({
  network,
  vestingSchedules,
  pendingVestingSchedules = [],
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

  const setVestingStatusFilter = (type: VestingStatusFilter) => () => {
    setPage(0);
    setStatusFilter(type);
  };

  const handleChangePage = (_e: unknown, newPage: number) => setPage(newPage);

  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const getFilterBtnColor = useCallback(
    (type: VestingStatusFilter) =>
      type === statusFilter ? "primary" : "secondary",
    [statusFilter]
  );

  const filteredVestingSchedules = useMemo(() => {
    const dateNowUnix = getUnixTime(new Date());

    // TODO: (MÕ) - Move this logic to a separate func getVestingScheduleStatus to reuse it
    switch (statusFilter) {
      case VestingStatusFilter.Cliff:
        return vestingSchedules.filter(
          (vestingSchedule) =>
            vestingSchedule.cliffDate &&
            Number(vestingSchedule.cliffDate) > dateNowUnix
        );
      case VestingStatusFilter.Vesting:
        return vestingSchedules.filter(
          (vestingSchedule) =>
            Number(vestingSchedule.cliffDate || vestingSchedule.startDate) <=
              dateNowUnix && Number(vestingSchedule.endDate) > dateNowUnix
        );
      case VestingStatusFilter.Vested:
        return vestingSchedules.filter(
          (vestingSchedule) => Number(vestingSchedule.endDate) <= dateNowUnix
        );
      default:
        return vestingSchedules;
    }
  }, [statusFilter, vestingSchedules]);

  const hasContent = useMemo(
    () =>
      filteredVestingSchedules.length !== 0 ||
      pendingVestingSchedules.length !== 0,
    [filteredVestingSchedules, pendingVestingSchedules]
  );

  return (
    <TableContainer
      data-cy={dataCy}
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
            <TableCell colSpan={6}>
              <Stack direction="row" alignItems="center" gap={1}>
                <Button
                  variant="textContained"
                  size={isBelowMd ? "small" : "medium"}
                  color={getFilterBtnColor(VestingStatusFilter.All)}
                  onClick={setVestingStatusFilter(VestingStatusFilter.All)}
                >
                  All
                </Button>
                <Button
                  variant="textContained"
                  size={isBelowMd ? "small" : "medium"}
                  color={getFilterBtnColor(VestingStatusFilter.Cliff)}
                  onClick={setVestingStatusFilter(VestingStatusFilter.Cliff)}
                >
                  Cliff
                </Button>
                <Button
                  variant="textContained"
                  size={isBelowMd ? "small" : "medium"}
                  color={getFilterBtnColor(VestingStatusFilter.Vesting)}
                  onClick={setVestingStatusFilter(VestingStatusFilter.Vesting)}
                >
                  Vesting
                </Button>
                <Button
                  variant="textContained"
                  size={isBelowMd ? "small" : "medium"}
                  color={getFilterBtnColor(VestingStatusFilter.Vested)}
                  onClick={setVestingStatusFilter(VestingStatusFilter.Vested)}
                >
                  Vested
                </Button>
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
          {hasContent ? (
            <>
              {pendingVestingSchedules.map((vestingSchedule) => (
                <VestingRow
                  key={vestingSchedule.id}
                  network={network}
                  vestingSchedule={vestingSchedule}
                />
              ))}
              {filteredVestingSchedules.map((vestingSchedule) => (
                <VestingRow
                  key={vestingSchedule.id}
                  network={network}
                  vestingSchedule={vestingSchedule}
                  onClick={openDetails(vestingSchedule.id)}
                />
              ))}
            </>
          ) : (
            <EmptyRow span={6} />
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
