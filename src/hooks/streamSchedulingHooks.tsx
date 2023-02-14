import { skipToken, SkipToken } from "@reduxjs/toolkit/dist/query";
import { Stream } from "@superfluid-finance/sdk-core";
import { StreamQuery } from "@superfluid-finance/sdk-redux";
import { findNetworkByChainId } from "../features/network/networks";
import { PendingOutgoingStream } from "../features/pendingUpdates/PendingOutgoingStream";
import { rpcApi, subgraphApi } from "../features/redux/store";
import { StreamScheduling } from "../features/streamsTable/StreamScheduling";

export const useScheduledStream = (
  arg: Omit<StreamQuery, "block"> | SkipToken
) => {
  const streamQuery = subgraphApi.useStreamQuery(arg);
  const stream = streamQuery.data;

  const isSkip = arg === skipToken;
  const network = isSkip ? undefined : findNetworkByChainId(arg.chainId);

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

export const mapStreamScheduling = <T extends Stream | PendingOutgoingStream>(
  stream: T,
  startDate?: number | null,
  endDate?: number | null
): T & StreamScheduling => {
  const isStreamActive = stream.currentFlowRate !== "0";

  const endDateScheduled =
    isStreamActive && endDate ? new Date(endDate) : undefined;

  const startDateScheduled =
    isStreamActive && startDate ? new Date(startDate) : undefined;

  return {
    ...stream,
    endDateScheduled,
    endDate:
      endDateScheduled ??
      (!isStreamActive
        ? new Date(stream.updatedAtTimestamp * 1000)
        : undefined),
    startDateScheduled,
    startDate: startDateScheduled ?? new Date(stream.createdAtTimestamp * 1000),
  };
};
