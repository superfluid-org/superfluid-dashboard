import {
  Box,
  Button,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  useTheme,
} from "@mui/material";
import { Address } from "@superfluid-finance/sdk-core";
import { FC, memo, useMemo, useState } from "react";
import { Network } from "../network/networks";
import { subgraphApi } from "../redux/store";
import { useWalletContext } from "../wallet/WalletContext";
import StreamRow, { EmptyRow, StreamRowLoading } from "./StreamRow";

enum StreamTypeFilter {
  All,
  Incoming,
  Outgoing,
}

interface StreamFilter {
  type: StreamTypeFilter;
}

interface StreamsTableProps {
  network: Network;
  tokenAddress: Address;
  subTable?: boolean;
  lastElement?: boolean;
}

const StreamsTable: FC<StreamsTableProps> = ({
  network,
  tokenAddress,
  subTable,
  lastElement,
}) => {
  const theme = useTheme();
  const { walletAddress } = useWalletContext();

  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [page, setPage] = useState(0);
  const [selectActive, setSelectActive] = useState(false);
  const [streamsFilter, setStreamsFilter] = useState<StreamFilter>({
    type: StreamTypeFilter.All,
  });

  const incomingStreamsQuery = subgraphApi.useStreamsQuery({
    chainId: network.chainId,
    filter: {
      receiver: walletAddress,
      token: tokenAddress,
    },
    pagination: {
      take: Infinity,
      skip: 0,
    },
    order: {
      orderBy: "updatedAtTimestamp",
      orderDirection: "desc",
    },
  });

  const outgoingStreamsQuery = subgraphApi.useStreamsQuery({
    chainId: network.chainId,
    filter: {
      sender: walletAddress,
      token: tokenAddress,
    },
    pagination: {
      take: Infinity,
      skip: 0,
    },
    order: {
      orderBy: "updatedAtTimestamp",
      orderDirection: "desc",
    },
  });

  const data = useMemo(() => {
    return [
      ...([StreamTypeFilter.All, StreamTypeFilter.Incoming].includes(
        streamsFilter.type
      )
        ? incomingStreamsQuery.data?.data || []
        : []),
      ...([StreamTypeFilter.All, StreamTypeFilter.Outgoing].includes(
        streamsFilter.type
      )
        ? outgoingStreamsQuery.data?.data || []
        : []),
    ].sort((s1, s2) => s2.updatedAtTimestamp - s1.updatedAtTimestamp);
  }, [incomingStreamsQuery, outgoingStreamsQuery, streamsFilter]);

  const handleChangePage = (_e: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const setStreamTypeFilter = (type: StreamTypeFilter) => () =>
    setStreamsFilter({ ...streamsFilter, type });

  const toggleSelectActive = () => setSelectActive(!selectActive);

  const getFilterBtnColor = (type: StreamTypeFilter) =>
    type === streamsFilter.type ? "primary" : "secondary";

  const isLoading =
    data.length === 0 &&
    (incomingStreamsQuery.isLoading || incomingStreamsQuery.isLoading);

  return (
    <TableContainer
      sx={
        subTable
          ? {
              background: theme.palette.action.hover,
              borderRadius: lastElement ? "0 0 20px 20px" : 0,
              border: "none",
              boxShadow: "none",
            }
          : {}
      }
    >
      <Table
        size="small"
        sx={{
          ...(lastElement && {
            borderTop: `1px solid ${theme.palette.divider}`,
          }),
          ...(subTable && {
            ".MuiTableCell-root:first-of-type": {
              pl: 9,
            },
          }),
        }}
      >
        <TableHead>
          <TableRow>
            <TableCell colSpan={5}>
              <Stack direction="row" alignItems="center" gap={1}>
                <Button
                  variant="textContained"
                  color={getFilterBtnColor(StreamTypeFilter.All)}
                  onClick={setStreamTypeFilter(StreamTypeFilter.All)}
                >
                  All (
                  {(incomingStreamsQuery.data?.data.length || 0) +
                    (outgoingStreamsQuery.data?.data.length || 0)}
                  )
                </Button>
                <Button
                  variant="textContained"
                  color={getFilterBtnColor(StreamTypeFilter.Incoming)}
                  onClick={setStreamTypeFilter(StreamTypeFilter.Incoming)}
                >
                  Incoming{" "}
                  {incomingStreamsQuery.isSuccess &&
                    `(${incomingStreamsQuery.data?.data.length})`}
                </Button>
                <Button
                  variant="textContained"
                  color={getFilterBtnColor(StreamTypeFilter.Outgoing)}
                  onClick={setStreamTypeFilter(StreamTypeFilter.Outgoing)}
                >
                  Outgoing{" "}
                  {outgoingStreamsQuery.isSuccess &&
                    `(${outgoingStreamsQuery.data?.data.length})`}
                </Button>

                <Stack flex={1} direction="row" justifyContent="flex-end">
                  {/* <Button
                      variant="contained"
                      color={selectActive ? "error" : "secondary"}
                      onClick={toggleSelectActive}
                    >
                      {`${selectActive ? "Cancel" : "Select"} Multiple`}
                    </Button> */}
                </Stack>
              </Stack>
            </TableCell>
          </TableRow>
          <TableRow>
            <TableCell width="185">To / From</TableCell>
            <TableCell width="290">All Time Flow</TableCell>
            <TableCell width="300">Flow rate</TableCell>
            <TableCell width="300">Start / End Date</TableCell>
            <TableCell width="120" align="center">
              Filter
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {isLoading ? (
            <StreamRowLoading />
          ) : data.length === 0 ? (
            <EmptyRow span={5} />
          ) : (
            data
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((stream) => (
                <StreamRow key={stream.id} stream={stream} network={network} />
              ))
          )}
        </TableBody>
      </Table>
      <TablePagination
        rowsPerPageOptions={[5, 10, 25]}
        component="div"
        count={data.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
        sx={{
          "> *": {
            visibility: data.length <= 5 ? "hidden" : "visible",
          },
        }}
      />
    </TableContainer>
  );
};

export default memo(StreamsTable);
