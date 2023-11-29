import {
  Button,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { Address } from "@superfluid-finance/sdk-core";
import { FC, useMemo, useState } from "react";
import { EmptyRow } from "../common/EmptyRow";
import { Network } from "../network/networks";
import { subgraphApi } from "../redux/store";
import { useVisibleAddress } from "../wallet/VisibleAddressContext";
import TransferEventRow, { TransferEventLoadingRow } from "./TransferEventRow";

enum TransferTypeFilter {
  All,
  Sent,
  Received,
}

interface TransferEventFilter {
  type: TransferTypeFilter;
}

interface TransferEventsTableProps {
  tokenAddress: Address;
  network: Network;
}

const TransferEventsTable: FC<TransferEventsTableProps> = ({
  tokenAddress,
  network,
}) => {
  const theme = useTheme();
  const isBelowMd = useMediaQuery(theme.breakpoints.down("md"));
  const { visibleAddress = "" } = useVisibleAddress();
  const lowerVisibleAddress = visibleAddress.toLowerCase();

  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [page, setPage] = useState(0);
  const [transferEventFilter, setTransferEventFilter] =
    useState<TransferEventFilter>({
      type: TransferTypeFilter.All,
    });

  const transferEventsQuery = subgraphApi.useTransferEventsQuery({
    chainId: network.id,
    filter: {
      addresses_contains: [visibleAddress],
      token: tokenAddress,
    },
    pagination: {
      take: Infinity,
      skip: 0,
    },
    order: {
      orderBy: "timestamp",
      orderDirection: "desc",
    },
  });

  const handleChangePage = (_e: unknown, newPage: number) => setPage(newPage);

  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const newRowsPerPage = rowsPerPage === -1 ? filteredTransferEvents.length : parseInt(event.target.value, 10);
    setRowsPerPage(newRowsPerPage);
    setPage(0);
  };

  const changeTypeFilter = (typeFilter: TransferTypeFilter) => () => {
    setPage(0);
    setTransferEventFilter({ ...transferEventFilter, type: typeFilter });
  };

  const getFilterBtnColor = (typeFilter: TransferTypeFilter) =>
    transferEventFilter.type === typeFilter ? "primary" : "secondary";

  const transferEvents = useMemo(
    () => transferEventsQuery.data?.items || [],
    [transferEventsQuery.data]
  );

  const filteredTransferEvents = useMemo(
    () =>
      transferEvents.filter((transferEvent) => {
        switch (transferEventFilter.type) {
          case TransferTypeFilter.All:
            return true;
          case TransferTypeFilter.Sent:
            return transferEvent.from === lowerVisibleAddress;
          case TransferTypeFilter.Received:
            return transferEvent.to === lowerVisibleAddress;
        }
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [transferEvents, transferEventFilter, page, rowsPerPage]
  );

  const { sentCount, receivedCount } = useMemo(
    () => ({
      sentCount: transferEvents.filter(
        ({ from }) => from === lowerVisibleAddress
      ).length,
      receivedCount: transferEvents.filter(
        ({ to }) => to === lowerVisibleAddress
      ).length,
    }),
    [transferEvents, lowerVisibleAddress]
  );

  const isLoading =
    transferEvents.length === 0 && transferEventsQuery.isLoading;

  return (
    <TableContainer
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
          <TableRow>
            <TableCell colSpan={5}>
              <Stack direction="row" alignItems="center" gap={1}>
                <Button
                  data-cy={"all-tab"}
                  variant="textContained"
                  size={isBelowMd ? "small" : "medium"}
                  color={getFilterBtnColor(TransferTypeFilter.All)}
                  onClick={changeTypeFilter(TransferTypeFilter.All)}
                >
                  All {!isLoading && ` (${transferEvents.length})`}
                </Button>
                <Button
                  data-cy={"sent-tab"}
                  variant="textContained"
                  size={isBelowMd ? "small" : "medium"}
                  color={getFilterBtnColor(TransferTypeFilter.Sent)}
                  onClick={changeTypeFilter(TransferTypeFilter.Sent)}
                >
                  Sent {!isLoading && ` (${sentCount})`}
                </Button>
                <Button
                  data-cy={"received-tab"}
                  variant="textContained"
                  size={isBelowMd ? "small" : "medium"}
                  color={getFilterBtnColor(TransferTypeFilter.Received)}
                  onClick={changeTypeFilter(TransferTypeFilter.Received)}
                >
                  Received {!isLoading && ` (${receivedCount})`}
                </Button>
              </Stack>
            </TableCell>
          </TableRow>
          {!isBelowMd && (
            <TableRow>
              <TableCell>To/From</TableCell>
              <TableCell>Amount</TableCell>
              <TableCell>Date Sent</TableCell>
            </TableRow>
          )}
        </TableHead>
        <TableBody>
          {isLoading ? (
            <TransferEventLoadingRow />
          ) : filteredTransferEvents.length === 0 ? (
            <EmptyRow span={3} />
          ) : (
            filteredTransferEvents
              .slice(page * rowsPerPage, (page + 1) * rowsPerPage)
              .map((transferEvent) => (
                <TransferEventRow
                  key={transferEvent.id}
                  transferEvent={transferEvent}
                  network={network}
                />
              ))
          )}
        </TableBody>
      </Table>
      {filteredTransferEvents.length > 5 && (
        <TablePagination
          rowsPerPageOptions={[5, 10, 25, { value: filteredTransferEvents.length, label: 'All' }]}
          component="div"
          count={filteredTransferEvents.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      )}
    </TableContainer>
  );
};

export default TransferEventsTable;
