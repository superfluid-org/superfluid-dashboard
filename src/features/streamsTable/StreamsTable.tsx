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
import { Address, PoolDistributor, Stream } from "@superfluid-finance/sdk-core";
import { getUnixTime } from "date-fns";
import { FC, memo, useCallback, useEffect, useMemo, useState } from "react";
import {
  mapCreateTaskToScheduledStream,
  mapStreamScheduling,
  ScheduledStream,
} from "../../hooks/streamSchedulingHooks";
import { CreateTask } from "../../scheduling-subgraph/.graphclient";
import { schedulingSubgraphApi } from "../../scheduling-subgraph/schedulingSubgraphApi";
import { EmptyRow } from "../common/EmptyRow";
import { Network } from "../network/networks";
import {
  PendingOutgoingStream,
  useAddressPendingOutgoingStreams,
} from "../pendingUpdates/PendingOutgoingStream";
import {
  PendingCreateTask,
  useAddressPendingOutgoingTasks,
} from "../pendingUpdates/PendingOutgoingTask";
import { subgraphApi } from "../redux/store";
import { useVisibleAddress } from "../wallet/VisibleAddressContext";
import StreamRow, { StreamRowLoading } from "./StreamRow";
import { StreamScheduling } from "./StreamScheduling";
import { EMPTY_ARRAY } from "../../utils/constants";

enum StreamTypeFilter {
  All,
  Incoming,
  Outgoing,
}

export type PoolDistributionStream = PoolDistributor & {
  currentFlowRate: string;
  sender: string;
  token: string;
  receiver: string;
  streamedUntilUpdatedAt: string;
};

type StreamType = (Stream | PendingOutgoingStream | ScheduledStream | PoolDistributionStream) &
  StreamScheduling;

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

  const [refetchOnFocus, setRefetchOnFocus] = useState(true);

  const humaFinanceOperatedStreamsQuery =
    subgraphApi.useFindStreamIdsWhereHumaIsOperatorQuery(
      network.humaFinance && visibleAddress
        ? {
          chainId: network.id,
          flowOperatorAddress: network.humaFinance.nftAddress,
          receiverAddress: visibleAddress,
        }
        : skipToken
    );

  const incomingStreamsQuery = subgraphApi.useStreamsQuery(
    {
      chainId: network.id,
      filter: {
        receiver: visibleAddress,
        token: tokenAddress,
      },
      pagination: {
        take: Infinity
      },
    },
    {
      refetchOnFocus: refetchOnFocus, // Re-fetch list view more often where there might be something incoming.
    }
  );

  const outgoingPoolDistributionStreamsQuery = subgraphApi.usePoolDistributorsQuery(
    {
      chainId: network.id,
      filter: {
        account: visibleAddress,
        pool_: {
          token: tokenAddress,
        }
      },
      pagination: {
        take: Infinity
      }
    }
  );

  const outgoingPoolDistributionStreams = useMemo<PoolDistributionStream[]>(() => {
    if (!outgoingPoolDistributionStreamsQuery.data) {
      return [];
    }

    return outgoingPoolDistributionStreamsQuery.data.items.map((item) => {
      return {
        ...item,
        currentFlowRate: item.flowRate,
        sender: item.account,
        token: item.token,
        receiver: item.pool,
        streamedUntilUpdatedAt: item.totalAmountDistributedUntilUpdatedAt
      }
    })
  }, [outgoingPoolDistributionStreamsQuery.data])

  const outgoingStreamsQuery = subgraphApi.useStreamsQuery(
    {
      chainId: network.id,
      filter: {
        sender: visibleAddress,
        token: tokenAddress,
      },
      pagination: {
        take: Infinity
      }
    }
  );

  const { activeTasks } = schedulingSubgraphApi.useGetTasksQuery(
    visibleAddress && network.flowSchedulerSubgraphUrl
      ? {
        chainId: network.id,
        orderBy: "executionAt",
        orderDirection: "asc",
        where: {
          or: [
            {
              superToken: tokenAddress.toLowerCase(),
              sender: visibleAddress.toLowerCase(),
              cancelledAt: null,
              executedAt: null,
            },
            {
              superToken: tokenAddress.toLowerCase(),
              receiver: visibleAddress.toLowerCase(),
              cancelledAt: null,
              executedAt: null,
            },
          ],
        },
      }
      : skipToken,
    {
      refetchOnFocus: true,
      selectFromResult: (response) => {
        const unixNow = getUnixTime(new Date());

        return {
          activeTasks: response.data?.tasks?.filter(
            (task) =>
              (!task.expirationAt && Number(task.executionAt) > unixNow) ||
              Number(task.expirationAt) > unixNow
          ) ?? EMPTY_ARRAY,
        };
      },
    }
  );

  const pendingOutgoingStreams = useAddressPendingOutgoingStreams(
    visibleAddress,
    tokenAddress
  );

  const pendingTasks = useAddressPendingOutgoingTasks(
    visibleAddress,
    tokenAddress
  );

  const allTasks = useMemo(
    () => [
      ...pendingTasks,
      // Filtering out CreateTasks that should be overridden by new pending stream to prevent duplicate stream rows.
      ...activeTasks.filter(
        (pendingTask) =>
          pendingTask.__typename !== "CreateTask" ||
          !pendingOutgoingStreams.some(
            (pendingOutgoingStream) =>
              pendingOutgoingStream.sender.toLowerCase() ===
              pendingTask.sender.toLowerCase() &&
              pendingOutgoingStream.receiver.toLowerCase() ===
              pendingTask.receiver.toLowerCase() &&
              pendingOutgoingStream.token.toLowerCase() ===
              pendingTask.superToken.toLowerCase()
          )
      ),
    ],
    [activeTasks, pendingTasks, pendingOutgoingStreams]
  );

  const scheduledIncomingStreams = useMemo(
    () =>
      allTasks
        .filter(
          (task) =>
            task.receiver.toLowerCase() === visibleAddress?.toLowerCase()
        )
        .filter((task) => task.__typename === "CreateTask")
        .map((task) =>
          mapCreateTaskToScheduledStream(task as unknown as CreateTask)
        ),
    [allTasks, visibleAddress]
  );

  const incomingStreams = useMemo(() => {
    const queriedIncomingStreams = incomingStreamsQuery.data?.items ?? [];
    return [...queriedIncomingStreams, ...scheduledIncomingStreams];
  }, [incomingStreamsQuery.data, scheduledIncomingStreams]);

  const scheduledOutgoingStreams = useMemo(
    () =>
      allTasks
        .filter(
          (task) => task.sender.toLowerCase() === visibleAddress?.toLowerCase()
        )
        .filter((task) => task.__typename === "CreateTask")
        .map((task) =>
          mapCreateTaskToScheduledStream(task as CreateTask | PendingCreateTask)
        ),
    [allTasks, visibleAddress]
  );

  const outgoingStreams = useMemo<
    (Stream | PendingOutgoingStream | ScheduledStream | PoolDistributionStream)[]
  >(() => {
    const queriedOutgoingStreams = outgoingStreamsQuery.data?.items ?? [];
    return [
      ...queriedOutgoingStreams,
      ...outgoingPoolDistributionStreams,
      ...pendingOutgoingStreams,
      ...scheduledOutgoingStreams,
    ];
  }, [
    outgoingStreamsQuery.data,
    outgoingPoolDistributionStreams,
    pendingOutgoingStreams,
    scheduledOutgoingStreams,
  ]);

  const streams = useMemo<StreamType[]>(() => {
    return [...incomingStreams, ...outgoingStreams]
      .map((stream) => {
        const isActive = stream.currentFlowRate !== "0";

        const relevantTasks = isActive
          ? allTasks.filter(
            (task) =>
              task.sender.toLowerCase() === stream.sender.toLowerCase() &&
              task.receiver.toLowerCase() === stream.receiver.toLowerCase() &&
              task.superToken.toLowerCase() === stream.token.toLowerCase()
          )
          : [];

        const createTask = relevantTasks.find(
          (task) => task.__typename === "CreateTask"
        );
        const deleteTask = relevantTasks.find(
          (task) => task.__typename === "DeleteTask"
        );

        const hasScheduledStart =
          createTask &&
          Number(createTask.executionAt) === stream.createdAtTimestamp;

        return mapStreamScheduling(
          stream,
          hasScheduledStart ? Number(createTask.executionAt) : undefined,
          !!deleteTask ? Number(deleteTask.executionAt) : undefined
        );
      })
      .sort((s1, s2) => s2.updatedAtTimestamp - s1.updatedAtTimestamp)
      .sort((s1, s2) => {
        const stream1Active = s1.currentFlowRate !== "0";
        const stream2Active = s2.currentFlowRate !== "0";

        if (stream1Active && !stream2Active) return -1;
        if (!stream1Active && stream2Active) return 1;
        return 0;
      });
  }, [incomingStreams, outgoingStreams, allTasks]);

  useEffect(() => {
    // don't refetch when there's a bunch of streams
    if (streams.length > 500 && refetchOnFocus) {
      setRefetchOnFocus(false);
    }
  }, [streams, refetchOnFocus]);

  const filteredStreams = useMemo(() => {
    switch (streamsFilter.type) {
      case StreamTypeFilter.Incoming: {
        return streams.filter(
          (stream) =>
            stream.receiver.toLowerCase() === visibleAddress?.toLowerCase()
        );
      }
      case StreamTypeFilter.Outgoing: {
        return streams.filter(
          (stream) =>
            stream.sender.toLowerCase() === visibleAddress?.toLowerCase()
        );
      }
      default:
        return streams;
    }
  }, [streams, visibleAddress, streamsFilter]);

  const handleChangePage = (_e: unknown, newPage: number) => setPage(newPage);

  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const newRowsPerPage = rowsPerPage === -1 ? filteredStreams.length : parseInt(event.target.value, 10);
    setRowsPerPage(newRowsPerPage);
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
    filteredStreams.length === 0 &&
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
                  All ({streams.length})
                </Button>
                <Button
                  variant="textContained"
                  size={isBelowMd ? "small" : "medium"}
                  color={getFilterBtnColor(StreamTypeFilter.Incoming)}
                  onClick={setStreamTypeFilter(StreamTypeFilter.Incoming)}
                >
                  Incoming{" "}
                  {incomingStreamsQuery.isSuccess &&
                    `(${incomingStreams.length})`}
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
          ) : filteredStreams.length === 0 ? (
            <EmptyRow span={5} />
          ) : (
            filteredStreams
              .slice(page * rowsPerPage, (page + 1) * rowsPerPage)
              .map((stream) => (
                <StreamRow
                  key={stream.id}
                  stream={stream}
                  network={network}
                  isHumaFinanceOperatedStream={(
                    humaFinanceOperatedStreamsQuery.data || []
                  ).some((id) => stream.id === id)}
                />
              ))
          )}
        </TableBody>
      </Table>
      {(filteredStreams.length > 5 ||
        (!isBelowMd && filteredStreams.length <= 5)) && (
          <TablePagination
            rowsPerPageOptions={[5, 10, 25, 100]}
            component="div"
            count={filteredStreams.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            sx={{
              ...(subTable ? { background: "transparent" } : {}),
              "> *": {
                visibility: filteredStreams.length <= 5 ? "hidden" : "visible",
              },
            }}
          />
        )}
    </TableContainer>
  );
};

export default memo(StreamsTable);
