import { miniSerializeError } from "@reduxjs/toolkit";
import { createApi, fakeBaseQuery } from "@reduxjs/toolkit/query/react";
import { getSerializeQueryArgs } from "@superfluid-finance/sdk-redux";
import { allNetworks, tryFindNetwork } from "../features/network/networks";
import {
  getBuiltGraphSDK,
  GetCreateTasksQuery,
  GetCreateTasksQueryVariables,
  GetDeleteTasksQuery,
  GetDeleteTasksQueryVariables,
  GetTasksQuery,
  GetTasksQueryVariables,
  PollQuery,
  PollQueryVariables,
} from "./.graphclient";

const tryGetBuiltGraphSdkForNetwork = (chainId: number) => {
  const network = tryFindNetwork(allNetworks, chainId);
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
    getCreateTasks: build.query<
      GetCreateTasksQuery,
      { chainId: number } & GetCreateTasksQueryVariables
    >({
      queryFn: async ({ chainId, ...variables }) => {
        const sdk = tryGetBuiltGraphSdkForNetwork(chainId);
        const createTasks = sdk
          ? (await sdk.getCreateTasks(variables)).createTasks
          : [];
        return {
          data: {
            createTasks,
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
    getDeleteTasks: build.query<
      GetDeleteTasksQuery,
      { chainId: number } & GetDeleteTasksQueryVariables
    >({
      queryFn: async ({ chainId, ...variables }) => {
        const sdk = tryGetBuiltGraphSdkForNetwork(chainId);
        const deleteTasks = sdk
          ? (await sdk.getDeleteTasks(variables)).deleteTasks
          : [];
        return {
          data: {
            deleteTasks,
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
