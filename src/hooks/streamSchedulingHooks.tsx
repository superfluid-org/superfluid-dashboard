import { skipToken, SkipToken } from "@reduxjs/toolkit/dist/query";
import { Stream } from "@superfluid-finance/sdk-core";
import { StreamQuery } from "@superfluid-finance/sdk-redux";
import { findNetworkByChainId } from "../features/network/networks";
import { PendingOutgoingStream } from "../features/pendingUpdates/PendingOutgoingStream";
import { platformApi } from "../features/redux/platformApi/platformApi";
import { Subscription } from "../features/redux/platformApi/platformApiTemplate";
import { subgraphApi } from "../features/redux/store";
import { StreamScheduling } from "../features/streamsTable/StreamScheduling";
import { getAddress } from "../utils/memoizedEthersUtils";

export const useScheduledStream = (
  arg: Omit<StreamQuery, "block"> | SkipToken
) => {
  const streamQuery = subgraphApi.useStreamQuery(arg);
  const stream = streamQuery.data;

  const isSkip = arg === skipToken;
  const network = isSkip ? undefined : findNetworkByChainId(arg.chainId);

  const { schedulings } = platformApi.useListSubscriptionsQuery(
    stream && network?.platformUrl
      ? {
          account: getAddress(stream.sender),
          chainId: network.id,
          baseUrl: network.platformUrl,
        }
      : skipToken,
    {
      selectFromResult: (x) => ({
        schedulings: x.currentData?.data ?? [],
      }),
    }
  );

  const isStreamActive = stream && stream.currentFlowRate !== "0";
  const streamScheduling = isStreamActive
    ? schedulings.find((x) => isActiveStreamSchedulingOrder(stream, x))
    : undefined;

  return subgraphApi.useStreamQuery(arg, {
    selectFromResult: (x) => ({
      ...x,
      data: x.data ? mapStreamScheduling(x.data, streamScheduling) : x.data,
      currentData: x.currentData
        ? mapStreamScheduling(x.currentData, streamScheduling)
        : x.currentData,
    }),
  });
};

export const mapStreamScheduling = <T extends Stream | PendingOutgoingStream>(
  stream: T,
  streamScheduling?: Subscription
): T & StreamScheduling => {
  const isStreamActive = stream.currentFlowRate !== "0";
  const startDateScheduled = undefined;
  const endDateScheduled =
    isStreamActive && streamScheduling?.meta_data?.end_date
      ? new Date(streamScheduling.meta_data.end_date)
      : undefined;

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

export const isActiveStreamSchedulingOrder = (
  stream: {
    sender: string;
    token: string;
    receiver: string;
  },
  subscription: Subscription
) =>
  subscription.type === "SCHEDULED_FLOW_CREATE" &&
  subscription.is_subscribed &&
  subscription.account?.toLowerCase() === stream.sender.toLowerCase() &&
  subscription.meta_data?.token?.toLowerCase() === stream.token.toLowerCase() &&
  subscription.meta_data?.receiver?.toLowerCase() ===
    stream.receiver.toLowerCase();
