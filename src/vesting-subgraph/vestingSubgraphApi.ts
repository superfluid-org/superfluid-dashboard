import { createApi, fakeBaseQuery } from "@reduxjs/toolkit/query/react";
import { networkDefinition } from "../features/network/networks";
import {
  getBuiltGraphSDK,
  GetVestingScheduleQuery,
  GetVestingScheduleQueryVariables,
  GetVestingSchedulesQuery,
  GetVestingSchedulesQueryVariables,
  PollQuery,
  PollQueryVariables,
} from "./.graphclient";

const getBuiltGraphSdkForNetwork = (chainId: number) => {
  if (chainId === networkDefinition.goerli.id) {
    return getBuiltGraphSDK({
      url: "https://api.studio.thegraph.com/query/14557/vesting-scheduler/v0.0.18",
    });
  }
  throw new Error("Graph-SDK not found!");
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
        const sdk = getBuiltGraphSdkForNetwork(chainId);
        return {
          data: await sdk.getVestingSchedule(variables),
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
        const sdk = getBuiltGraphSdkForNetwork(chainId);
        return {
          data: await sdk.getVestingSchedules(variables),
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
        const sdk = getBuiltGraphSdkForNetwork(chainId);
        return {
          data: await sdk.poll(variables),
        };
      },
    }),
  }),
});
