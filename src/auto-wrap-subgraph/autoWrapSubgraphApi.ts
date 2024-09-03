import { miniSerializeError } from "@reduxjs/toolkit";
import { createApi, fakeBaseQuery } from "@reduxjs/toolkit/query/react";
import { getSerializeQueryArgs } from "@superfluid-finance/sdk-redux";
import { allNetworks, tryFindNetwork } from "../features/network/networks";
import { EMPTY_ARRAY } from "../utils/constants";

import {
  getBuiltGraphSDK,
  GetWrapScheduleQueryVariables,
  GetWrapSchedulesQueryVariables,
  PollQuery,
  PollQueryVariables,
} from "./.graphclient";
import {
  mapSubgraphWrapSchedule,
  WrapSchedule,
} from "../features/auto-wrap/types";

const tryGetBuiltGraphSdkForNetwork = (chainId: number) => {
  const network = tryFindNetwork(allNetworks, chainId);
  if (network?.autoWrapSubgraphUrl) {
    return getBuiltGraphSDK({
      url: network.autoWrapSubgraphUrl,
    });
  }
};

export const autoWrapSubgraphApi = createApi({
  reducerPath: "superfluid_auto_wrap",
  baseQuery: fakeBaseQuery(),
  tagTypes: ["GENERAL", "SPECIFIC"], // TODO(KK): Make SDK be able to invalidate another slice!
  keepUnusedDataFor: 180,
  refetchOnMountOrArgChange: 90,
  refetchOnReconnect: true,
  serializeQueryArgs: getSerializeQueryArgs(),
  endpoints: (build) => ({
    getWrapSchedule: build.query<
      { wrapSchedule: WrapSchedule | null },
      { chainId: number } & GetWrapScheduleQueryVariables
    >({
      queryFn: async ({ chainId, ...variables }) => {
        const sdk = tryGetBuiltGraphSdkForNetwork(chainId);
        const subgraphWrapSchedule = sdk
          ? (await sdk.getWrapSchedule(variables)).wrapSchedule
          : null;
        return {
          data: {
            wrapSchedule: subgraphWrapSchedule
              ? mapSubgraphWrapSchedule(subgraphWrapSchedule)
              : null,
          },
        };
      },
      providesTags: (_result, _error, arg) => [
        {
          type: "GENERAL",
          id: arg.chainId,
        },
      ],
    }),
    getWrapSchedules: build.query<
      { wrapSchedules: WrapSchedule[] },
      { chainId: number } & GetWrapSchedulesQueryVariables
    >({
      queryFn: async ({ chainId, ...variables }) => {
        const sdk = tryGetBuiltGraphSdkForNetwork(chainId);
        const subgraphWrapSchedules = sdk
          ? (await sdk.getWrapSchedules(variables)).wrapSchedules
          : EMPTY_ARRAY;
        return {
          data: {
            wrapSchedules: subgraphWrapSchedules.map(mapSubgraphWrapSchedule),
          },
        };
      },
      providesTags: (_result, _error, arg) => [
        {
          type: "GENERAL",
          id: arg.chainId,
        },
      ],
    }),
    poll: build.query<PollQuery, { chainId: number } & PollQueryVariables>({
      queryFn: async ({ chainId, ...variables }) => {
        const sdk = tryGetBuiltGraphSdkForNetwork(chainId);
        if (!sdk) {
          throw new Error("GraphSDK not available for network.");
        }
        try {
          return {
            data: await sdk.poll(variables),
          };
        } catch (e) {
          return {
            error: miniSerializeError(e),
          };
        }
      },
    }),
  }),
});
