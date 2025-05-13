import { skipToken, SkipToken } from "@reduxjs/toolkit/query";
import { Stream } from "@superfluid-finance/sdk-core";
import { StreamQuery } from "@superfluid-finance/sdk-redux";
import { fromUnixTime } from "date-fns";
import { allNetworks, tryFindNetwork } from "../features/network/networks";
import { PendingOutgoingStream } from "../features/pendingUpdates/PendingOutgoingStream";
import { PendingCreateTask } from "../features/pendingUpdates/PendingOutgoingTask";
import { rpcApi, subgraphApi } from "../features/redux/store";
import { StreamScheduling } from "../features/streamsTable/StreamScheduling";
import { CreateTask } from "../scheduling-subgraph/.graphclient";
import { vestingSubgraphApi } from "../vesting-subgraph/vestingSubgraphApi";
import { PoolDistributionStream } from "../features/streamsTable/StreamsTable";

export interface ScheduledStream
  extends Omit<
    Stream,
    "createdAtBlockNumber" | "updatedAtBlockNumber" | "tokenSymbol" | "deposit"
  > { }

export interface PendingScheduledStream
  extends ScheduledStream,
  Pick<PendingCreateTask, "pendingType" | "hasTransactionSucceeded"> { }

export const useScheduledStream = (
  arg: Omit<StreamQuery, "block"> | SkipToken
) => {
  const streamQuery = subgraphApi.useStreamQuery(arg);
  const stream = streamQuery.data;

  const isSkip = arg === skipToken;
  const network = isSkip ? undefined : tryFindNetwork(allNetworks, arg.chainId);
  const isStreamActive = stream && stream.currentFlowRate !== "0";

  const { flowSchedulerScheduling } = rpcApi.useGetFlowScheduleQuery(
    stream && network?.flowSchedulerContractAddress && isStreamActive
      ? {
        chainId: network.id,
        receiverAddress: stream.receiver,
        senderAddress: stream.sender,
        superTokenAddress: stream.token,
      }
      : skipToken,
    {
      selectFromResult: (queryResult) => {
        return {
          flowSchedulerScheduling: queryResult.currentData
        }
      }
    }
  );

  const { mostLikelyAssociatedVestingSchedule } = vestingSubgraphApi.useGetVestingSchedulesQuery(
    stream && network ? {
      chainId: network.id,
      where: {
        superToken: stream.token,
        receiver: stream.receiver,
        cliffAndFlowDate_lte: stream.createdAtTimestamp.toString(),
        endDate_gt: stream.createdAtTimestamp.toString()
      },
      orderBy: "createdAt",
      orderDirection: "desc"
    } : skipToken,
    {
      selectFromResult: (queryResult) => {
        // Filter out the deleted schedules because it's currently not possible to filter by `null` with SDK-redux.
        const vestingSchedules = (queryResult.currentData?.vestingSchedules ?? []).filter(x => !x.deletedAt);
        
        // If there is a vesting schedule completely in sync with the stream, assume that as the most likely associated one.
        // Otherwise, effectively pick the latest created vesting schedule.
        const mostLikelyAssociatedVestingSchedule = vestingSchedules.find(x => x.cliffAndFlowExecutedAt === stream!.createdAtTimestamp) ?? vestingSchedules[0];

        return {
          mostLikelyAssociatedVestingSchedule
        }
      }
    }
  );

  const mostRelevantSchedulerData = {
    startDate: flowSchedulerScheduling?.startDate,
    endDate:  getNonZeroMathMinWithPossibleUndefined(flowSchedulerScheduling?.endDate, mostLikelyAssociatedVestingSchedule?.endDateValidAt)
  };

  return subgraphApi.useStreamQuery(arg, {
    refetchOnFocus: true, // Re-fetch list view more often where there might be something incoming.
    selectFromResult: (x) => ({
      ...x,
      data: x.data
        ? mapStreamScheduling(
          x.data,
          mostRelevantSchedulerData?.startDate,
          mostRelevantSchedulerData?.endDate,
          mostLikelyAssociatedVestingSchedule?.id
        )
        : x.data,
      currentData: x.currentData
        ? mapStreamScheduling(
          x.currentData,
          mostRelevantSchedulerData?.startDate,
          mostRelevantSchedulerData?.endDate,
          mostLikelyAssociatedVestingSchedule?.id
        )
        : x.currentData,
    }),
  });
};

function getNonZeroMathMinWithPossibleUndefined(a?: number, b?: number): number | undefined {
  if (a === undefined && b === undefined) return undefined;

  a = a || Infinity;
  b = b || Infinity;

  const minValue = Math.min(a, b);
  return minValue === Infinity ? undefined : minValue;
}

export const mapStreamScheduling = <
  T extends
  | Stream
  | PendingOutgoingStream
  | ScheduledStream
  | PendingScheduledStream
  | PoolDistributionStream
>(
  stream: T,
  scheduledUnixStart?: number | null,
  scheduledUnixEnd?: number | null,
  mostLikelyAssociatedVestingScheduleId?: string | null
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
    mostLikelyAssociatedVestingScheduleId: mostLikelyAssociatedVestingScheduleId ?? undefined
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
