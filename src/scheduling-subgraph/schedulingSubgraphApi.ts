import { miniSerializeError } from "@reduxjs/toolkit";
import { createApi, fakeBaseQuery } from "@reduxjs/toolkit/query/react";
import { getSerializeQueryArgs } from "@superfluid-finance/sdk-redux";
import { findNetworkByChainId } from "../features/network/networks";
import { Task } from "../vesting-subgraph/.graphclient";
import {
  getBuiltGraphSDK,
  GetTasksQuery,
  GetTasksQueryVariables,
  PollQuery,
  PollQueryVariables,
} from "./.graphclient";

const tryGetBuiltGraphSdkForNetwork = (chainId: number) => {
  const network = findNetworkByChainId(chainId);
  if (network?.flowSchedulerSubgraphUrl) {
    return getBuiltGraphSDK({
      url: network.flowSchedulerSubgraphUrl,
    });
  }
};

export const schedulingSubgraphApi = createApi({
  reducerPath: "superfluid_scheduling",
  baseQuery: fakeBaseQuery(),
  tagTypes: ["GENERAL", "SPECIFIC"], // TODO(KK): Make SDK be able to invalidate another slice!
  refetchOnFocus: true,
  refetchOnReconnect: true,
  keepUnusedDataFor: 180,
  serializeQueryArgs: getSerializeQueryArgs(),
  endpoints: (build) => ({
    // getVestingSchedule: build.query<
    //   { vestingSchedule: VestingSchedule | null },
    //   { chainId: number } & GetVestingScheduleQueryVariables
    // >({
    //   queryFn: async ({ chainId, ...variables }) => {
    //     const sdk = tryGetBuiltGraphSdkForNetwork(chainId);
    //     const subgraphVestingSchedule = sdk
    //       ? (await sdk.getVestingSchedule(variables)).vestingSchedule
    //       : null;
    //     return {
    //       data: {
    //         vestingSchedule: subgraphVestingSchedule
    //           ? mapSubgraphVestingSchedule(subgraphVestingSchedule)
    //           : null,
    //       },
    //     };
    //   },
    //   providesTags: (_result, _error, arg) => [
    //     {
    //       type: "GENERAL",
    //       id: arg.chainId,
    //     },
    //   ],
    // }),
    getTasks: build.query<
      GetTasksQuery,
      { chainId: number } & GetTasksQueryVariables
    >({
      queryFn: async ({ chainId, ...variables }) => {
        const sdk = tryGetBuiltGraphSdkForNetwork(chainId);
        const subgraphTasks = sdk ? (await sdk.getTasks(variables)).tasks : [];
        return {
          data: {
            tasks: subgraphTasks,
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
