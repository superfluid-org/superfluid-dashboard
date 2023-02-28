import { skipToken, SkipToken } from "@reduxjs/toolkit/dist/query";
import { Stream } from "@superfluid-finance/sdk-core";
import { StreamQuery } from "@superfluid-finance/sdk-redux";
import { fromUnixTime, isAfter } from "date-fns";
import { allNetworks, tryFindNetwork } from "../features/network/networks";
import { PendingOutgoingStream } from "../features/pendingUpdates/PendingOutgoingStream";
import { rpcApi, subgraphApi } from "../features/redux/store";
import { StreamScheduling } from "../features/streamsTable/StreamScheduling";
import { CreateTask } from "../scheduling-subgraph/.graphclient";

export interface ScheduledStream
  extends Omit<
    Stream,
    "createdAtBlockNumber" | "updatedAtBlockNumber" | "tokenSymbol" | "deposit"
  > {}

export const useScheduledStream = (
  arg: Omit<StreamQuery, "block"> | SkipToken
) => {
  const streamQuery = subgraphApi.useStreamQuery(arg);
  const stream = streamQuery.data;

  const isSkip = arg === skipToken;
  const network = isSkip ? undefined : tryFindNetwork(allNetworks, arg.chainId);

  const scheduleResponse = rpcApi.useScheduledDatesQuery(
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
  T extends Stream | PendingOutgoingStream | ScheduledStream
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

  const isActive =
    isAfter(startDate, new Date()) && stream.currentFlowRate !== "0";

  return {
    ...stream,
    endDateScheduled,
    endDate:
      endDateScheduled ??
      (!isActive ? fromUnixTime(stream.updatedAtTimestamp) : undefined),
    startDateScheduled,
    startDate,
  };
};

export const mapCreateTaskToScheduledStream = (
  createTask: CreateTask
): ScheduledStream => {
  return {
    id: createTask.id,
    createdAtTimestamp: Number(createTask.executionAt),
    updatedAtTimestamp: Number(createTask.executionAt),
    currentFlowRate: createTask.flowRate,
    streamedUntilUpdatedAt: "0",
    receiver: createTask.receiver,
    sender: createTask.sender,
    token: createTask.superToken,

    // createdAtBlockNumber: BlockNumber;
    // updatedAtBlockNumber: BlockNumber;
    // tokenSymbol: "",
    // deposit: createTask.startDate,
  };
};
