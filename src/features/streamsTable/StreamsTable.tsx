import {
  alpha,
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
import { skipToken } from "@reduxjs/toolkit/dist/query";
import { Address, Stream } from "@superfluid-finance/sdk-core";
import { FC, memo, useCallback, useMemo, useState } from "react";
import {
  isActiveStreamSchedulingOrder,
  mapStreamScheduling,
} from "../../hooks/streamSchedulingHooks";
import { getAddress } from "../../utils/memoizedEthersUtils";
import { EmptyRow } from "../common/EmptyRow";
import { Network } from "../network/networks";
import {
  PendingOutgoingStream,
  useAddressPendingOutgoingStreams,
} from "../pendingUpdates/PendingOutgoingStream";
import { platformApi } from "../redux/platformApi/platformApi";
import { subgraphApi } from "../redux/store";
import { useVisibleAddress } from "../wallet/VisibleAddressContext";
import StreamRow, { StreamRowLoading } from "./StreamRow";
import { StreamScheduling } from "./StreamScheduling";

enum StreamTypeFilter {
  All,
  Incoming,
  Outgoing,
}

type StreamType = (Stream | PendingOutgoingStream) & StreamScheduling;

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
  const isBelowMd = useMediaQuery(theme.breakpoints.down("md"));

  const { visibleAddress } = useVisibleAddress();

  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [page, setPage] = useState(0);

  const [streamsFilter, setStreamsFilter] = useState<StreamFilter>({
    type: StreamTypeFilter.All,
  });

  const incomingStreamsQuery = subgraphApi.useStreamsQuery({
    chainId: network.id,
    filter: {
      receiver: visibleAddress,
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
    chainId: network.id,
    filter: {
      sender: visibleAddress,
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

  const { schedulings } = { schedulings: [] };
  // TODO(KK): Un-comment and handle when bringing back stream scheduling.
  // platformApi.useListSubscriptionsQuery(
  //   visibleAddress && network.platformUrl
  //     ? {
  //         account: getAddress(visibleAddress),
  //         chainId: network.id,
  //         baseUrl: network.platformUrl,
  //       }
  //     : skipToken,
  //   {
  //     selectFromResult: (x) => ({
  //       schedulings: x.data?.data ?? [],
  //     }),
  //   }
  // );

  const pendingOutgoingStreams =
    useAddressPendingOutgoingStreams(visibleAddress);

  const outgoingStreams = useMemo<(Stream | PendingOutgoingStream)[]>(() => {
    const queriedOutgoingStreams = outgoingStreamsQuery.data?.items ?? [];
    return [...queriedOutgoingStreams, ...pendingOutgoingStreams];
  }, [outgoingStreamsQuery.data, pendingOutgoingStreams, schedulings]);

  const streams = useMemo<StreamType[]>(() => {
    return [
      ...([StreamTypeFilter.All, StreamTypeFilter.Incoming].includes(
        streamsFilter.type
      )
        ? incomingStreamsQuery.data?.items || []
        : []),
      ...([StreamTypeFilter.All, StreamTypeFilter.Outgoing].includes(
        streamsFilter.type
      )
        ? outgoingStreams || []
        : []),
    ]
      .sort((s1, s2) => s2.updatedAtTimestamp - s1.updatedAtTimestamp)
      .sort((s1, s2) => {
        const stream1Active = s1.currentFlowRate !== "0";
        const stream2Active = s2.currentFlowRate !== "0";

        if (stream1Active && !stream2Active) return -1;
        if (!stream2Active && stream2Active) return 1;
        return 0;
      })
      .map((stream) => {
        const isStreamActive = stream.currentFlowRate !== "0";

        const streamScheduling = isStreamActive
          ? schedulings.find((x) => isActiveStreamSchedulingOrder(stream, x))
          : undefined;

        return mapStreamScheduling(stream, streamScheduling);
      });
  }, [incomingStreamsQuery.data, outgoingStreams, streamsFilter]);

  const handleChangePage = (_e: unknown, newPage: number) => setPage(newPage);

  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const setStreamTypeFilter = (type: StreamTypeFilter) => () => {
    setPage(0);
    setStreamsFilter({ ...streamsFilter, type });
  };

  const getFilterBtnColor = useCallback(
    (type: StreamTypeFilter) =>
      type === streamsFilter.type ? "primary" : "secondary",
    [streamsFilter.type]
  );

  const isLoading =
    streams.length === 0 &&
    (incomingStreamsQuery.isLoading || outgoingStreamsQuery.isLoading);

  return (
    <TableContainer
      component={Paper}
      sx={
        subTable
          ? {
              borderRadius: lastElement ? "0 0 20px 20px" : 0,
              borderTop: "none",
              borderLeft: "none",
              borderRight: "none",
              boxShadow: "none",
              ...(lastElement && { borderBottom: "none" }),
              ".MuiTablePagination-root": {
                background:
                  theme.palette.mode === "light"
                    ? "transparent"
                    : alpha(theme.palette.action.hover, 0.08),
              },
              [theme.breakpoints.down("md")]: {
                borderRadius: 0,
              },
            }
          : {
              [theme.breakpoints.down("md")]: {
                mx: -2,
                width: "auto",
                borderRadius: 0,
                border: "none",
                borderBottom: `1px solid ${theme.palette.divider}`,
                boxShadow: "none",
              },
            }
      }
    >
      <Table
        size={subTable ? "small" : "medium"}
        sx={{
          ...(lastElement && {
            borderTop: `1px solid ${theme.palette.divider}`,
          }),
          ...(subTable &&
            !isBelowMd && {
              ".MuiTableHead-root .MuiTableCell-root:first-of-type": {
                pl: 8.5,
              },
            }),
        }}
      >
        <TableHead translate="yes">
          <TableRow>
            <TableCell colSpan={6}>
              <Stack direction="row" alignItems="center" gap={1}>
                <Button
                  variant="textContained"
                  size={isBelowMd ? "small" : "medium"}
                  color={getFilterBtnColor(StreamTypeFilter.All)}
                  onClick={setStreamTypeFilter(StreamTypeFilter.All)}
                >
                  All (
                  {(incomingStreamsQuery.data?.items.length || 0) +
                    outgoingStreams.length}
                  )
                </Button>
                <Button
                  variant="textContained"
                  size={isBelowMd ? "small" : "medium"}
                  color={getFilterBtnColor(StreamTypeFilter.Incoming)}
                  onClick={setStreamTypeFilter(StreamTypeFilter.Incoming)}
                >
                  Incoming{" "}
                  {incomingStreamsQuery.isSuccess &&
                    `(${incomingStreamsQuery.data?.items.length})`}
                </Button>
                <Button
                  variant="textContained"
                  size={isBelowMd ? "small" : "medium"}
                  color={getFilterBtnColor(StreamTypeFilter.Outgoing)}
                  onClick={setStreamTypeFilter(StreamTypeFilter.Outgoing)}
                >
                  Outgoing{" "}
                  {outgoingStreamsQuery.isSuccess &&
                    `(${outgoingStreams.length})`}
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
          {!isBelowMd && (
            <TableRow>
              <TableCell>To / From</TableCell>
              <TableCell width="250">All Time Flow</TableCell>
              <TableCell width="250">Flow rate</TableCell>
              <TableCell width="25" sx={{ px: 1 }} />
              <TableCell width="200" sx={{ pl: 1 }}>
                Start / End Date
              </TableCell>
              <TableCell width="120px" align="center"></TableCell>
            </TableRow>
          )}
        </TableHead>
        <TableBody>
          {isLoading ? (
            <StreamRowLoading />
          ) : streams.length === 0 ? (
            <EmptyRow span={5} />
          ) : (
            streams
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((stream) => (
                <StreamRow key={stream.id} stream={stream} network={network} />
              ))
          )}
        </TableBody>
      </Table>
      {(streams.length > 5 || (!isBelowMd && streams.length <= 5)) && (
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={streams.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          sx={{
            ...(subTable ? { background: "transparent" } : {}),
            "> *": {
              visibility: streams.length <= 5 ? "hidden" : "visible",
            },
          }}
        />
      )}
    </TableContainer>
  );
};

export default memo(StreamsTable);
