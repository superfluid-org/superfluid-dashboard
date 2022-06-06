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
    setPage(0);
    setRowsPerPage(parseInt(event.target.value, 10));
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
    [transferEvents, transferEventFilter]
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
    transferEvents.length === 0 && transferEventsQuery.isFetching;

  return (
    <TableContainer>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell colSpan={5}>
              <Stack direction="row" alignItems="center" gap={1}>
                <Button
                  variant="textContained"
                  color={getFilterBtnColor(TransferTypeFilter.All)}
                  onClick={changeTypeFilter(TransferTypeFilter.All)}
                >
                  All {!isLoading && ` (${transferEvents.length})`}
                </Button>
                <Button
                  variant="textContained"
                  color={getFilterBtnColor(TransferTypeFilter.Sent)}
                  onClick={changeTypeFilter(TransferTypeFilter.Sent)}
                >
                  Sent {!isLoading && ` (${receivedCount})`}
                </Button>
                <Button
                  variant="textContained"
                  color={getFilterBtnColor(TransferTypeFilter.Received)}
                  onClick={changeTypeFilter(TransferTypeFilter.Received)}
                >
                  Received {!isLoading && ` (${sentCount})`}
                </Button>
              </Stack>
            </TableCell>
          </TableRow>

          <TableRow>
            <TableCell>To/From</TableCell>
            <TableCell>Amount</TableCell>
            <TableCell>Date Sent</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {isLoading ? (
            <TransferEventLoadingRow />
          ) : filteredTransferEvents.length === 0 ? (
            <EmptyRow span={3} />
          ) : (
            filteredTransferEvents
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((transferEvent) => (
                <TransferEventRow
                  key={transferEvent.id}
                  transferEvent={transferEvent}
                />
              ))
          )}
        </TableBody>
      </Table>
      <TablePagination
        rowsPerPageOptions={[5, 10, 25]}
        component="div"
        count={transferEvents.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
        sx={{
          "> *": {
            visibility: transferEvents.length <= 5 ? "hidden" : "visible",
          },
        }}
      />
    </TableContainer>
  );
};

export default TransferEventsTable;
