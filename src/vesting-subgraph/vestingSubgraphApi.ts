import { createApi, fakeBaseQuery } from "@reduxjs/toolkit/query/react";
import {
  findNetworkByChainId,
  networkDefinition,
} from "../features/network/networks";
import {
  getBuiltGraphSDK,
  GetVestingScheduleQuery,
  GetVestingScheduleQueryVariables,
  GetVestingSchedulesQuery,
  GetVestingSchedulesQueryVariables,
  PollQuery,
  PollQueryVariables,
} from "./.graphclient";

const tryGetBuiltGraphSdkForNetwork = (chainId: number) => {
  const network = findNetworkByChainId(chainId);
  if (network?.subgraphUrl) {
    return getBuiltGraphSDK({
      url: network.vestingSubgraphUrl,
    });
  }
};

export const vestingSubgraphApi = createApi({
  reducerPath: "superfluid_vesting",
  baseQuery: fakeBaseQuery(),
  tagTypes: ["GENERAL", "SPECIFIC"], // TODO(KK): Make SDK be able to invalidate another slice!
  refetchOnFocus: true,
  refetchOnReconnect: true,
  endpoints: (build) => ({
    getVestingSchedule: build.query<
      GetVestingScheduleQuery,
      { chainId: number } & GetVestingScheduleQueryVariables
    >({
      queryFn: async ({ chainId, ...variables }) => {
        const sdk = tryGetBuiltGraphSdkForNetwork(chainId);
        return {
          data: sdk
            ? await sdk.getVestingSchedule(variables)
            : { vestingSchedule: null },
        };
      },
      providesTags: (_result, _error, arg) => [
        {
          type: "GENERAL",
          id: arg.chainId,
        },
      ],
    }),
    getVestingSchedules: build.query<
      GetVestingSchedulesQuery,
      { chainId: number } & GetVestingSchedulesQueryVariables
    >({
      queryFn: async ({ chainId, ...variables }) => {
        const sdk = tryGetBuiltGraphSdkForNetwork(chainId);
        return {
          data: sdk
            ? await sdk.getVestingSchedules(variables)
            : { vestingSchedules: [] },
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
        return {
          data: await sdk.poll(variables),
        };
      },
    }),
  }),
});
