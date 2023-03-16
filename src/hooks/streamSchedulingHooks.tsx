import { skipToken, SkipToken } from "@reduxjs/toolkit/dist/query";
import { Stream } from "@superfluid-finance/sdk-core";
import { StreamQuery } from "@superfluid-finance/sdk-redux";
import { fromUnixTime } from "date-fns";
import { allNetworks, tryFindNetwork } from "../features/network/networks";
import { PendingOutgoingStream } from "../features/pendingUpdates/PendingOutgoingStream";
import { PendingCreateTask } from "../features/pendingUpdates/PendingOutgoingTask";
import { rpcApi, subgraphApi } from "../features/redux/store";
import { StreamScheduling } from "../features/streamsTable/StreamScheduling";
import { CreateTask } from "../scheduling-subgraph/.graphclient";

export interface ScheduledStream
  extends Omit<
    Stream,
    "createdAtBlockNumber" | "updatedAtBlockNumber" | "tokenSymbol" | "deposit"
  > {}

export interface PendingScheduledStream
  extends ScheduledStream,
    Pick<PendingCreateTask, "pendingType" | "hasTransactionSucceeded"> {}

export const useScheduledStream = (
  arg: Omit<StreamQuery, "block"> | SkipToken
) => {
  const streamQuery = subgraphApi.useStreamQuery(arg);
  const stream = streamQuery.data;

  const isSkip = arg === skipToken;
  const network = isSkip ? undefined : tryFindNetwork(allNetworks, arg.chainId);

  const scheduleResponse = rpcApi.useGetFlowScheduleQuery(
    stream && network?.flowSchedulerContractAddress
      ? {
          chainId: network.id,
          receiverAddress: stream.receiver,
          senderAddress: stream.sender,
          superTokenAddress: stream.token,
        }
      : skipToken
  );

  const isStreamActive = stream && stream.currentFlowRate !== "0";
  const streamScheduling = isStreamActive ? scheduleResponse.data : undefined;

  return subgraphApi.useStreamQuery(arg, {
    refetchOnFocus: true, // Re-fetch list view more often where there might be something incoming.
    selectFromResult: (x) => ({
      ...x,
      data: x.data
        ? mapStreamScheduling(
            x.data,
            streamScheduling?.startDate,
            streamScheduling?.endDate
          )
        : x.data,
      currentData: x.currentData
        ? mapStreamScheduling(
            x.currentData,
            streamScheduling?.startDate,
            streamScheduling?.endDate
          )
        : x.currentData,
    }),
  });
};

export const mapStreamScheduling = <
  T extends
    | Stream
    | PendingOutgoingStream
    | ScheduledStream
    | PendingScheduledStream
>(
  stream: T,
  scheduledUnixStart?: number | null,
  scheduledUnixEnd?: number | null
): T & StreamScheduling => {
  const startDateScheduled = scheduledUnixStart
    ? fromUnixTime(scheduledUnixStart)
    : undefined;
  const endDateScheduled = scheduledUnixEnd
    ? fromUnixTime(scheduledUnixEnd)
    : undefined;

  const startDate =
    startDateScheduled ?? fromUnixTime(stream.createdAtTimestamp);

  const isActive = stream.currentFlowRate !== "0";

  return {
    ...stream,
    startDateScheduled,
    startDate,
    endDateScheduled,
    endDate: isActive
      ? endDateScheduled
      : fromUnixTime(stream.updatedAtTimestamp),
  };
};

export const mapCreateTaskToScheduledStream = (
  createTask: CreateTask | PendingCreateTask
): ScheduledStream | PendingScheduledStream => {
  const baseScheduledStream = {
    id: createTask.id,
    createdAtTimestamp: Number(createTask.executionAt),
    updatedAtTimestamp: Number(createTask.executionAt),
    currentFlowRate: createTask.flowRate,
    streamedUntilUpdatedAt: "0",
    receiver: createTask.receiver,
    sender: createTask.sender,
    token: createTask.superToken,
  };

  if ((createTask as PendingCreateTask).pendingType) {
    return {
      ...baseScheduledStream,
      pendingType: (createTask as PendingCreateTask).pendingType,
      hasTransactionSucceeded: (createTask as PendingCreateTask)
        .hasTransactionSucceeded,
    } as PendingScheduledStream;
  }

  return baseScheduledStream as ScheduledStream;
};
