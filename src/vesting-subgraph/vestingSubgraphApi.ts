import { miniSerializeError } from "@reduxjs/toolkit";
import { createApi, fakeBaseQuery } from "@reduxjs/toolkit/query/react";
import { getSerializeQueryArgs } from "@superfluid-finance/sdk-redux";
import { allNetworks, tryFindNetwork } from "../features/network/networks";
import {
  mapSubgraphVestingSchedule,
  VestingSchedule,
} from "../features/vesting/types";
import {
  getBuiltGraphSDK,
  GetVestingScheduleQueryVariables,
  GetVestingSchedulesQueryVariables,
  PollQuery,
  PollQueryVariables,
} from "./.graphclient";

const tryGetBuiltGraphSdkForNetwork = (chainId: number) => {
  const network = tryFindNetwork(allNetworks, chainId);
  if (network?.vestingSubgraphUrl) {
    return getBuiltGraphSDK({
      url: network.vestingSubgraphUrl,
    });
  }
};

export const vestingSubgraphApi = createApi({
  reducerPath: "superfluid_vesting",
  baseQuery: fakeBaseQuery(),
  tagTypes: ["GENERAL", "SPECIFIC"], // TODO(KK): Make SDK be able to invalidate another slice!
  keepUnusedDataFor: 180,
  refetchOnMountOrArgChange: 90,
  refetchOnReconnect: true,
  serializeQueryArgs: getSerializeQueryArgs(),
  endpoints: (build) => ({
    getVestingSchedule: build.query<
      { vestingSchedule: VestingSchedule | null },
      { chainId: number } & GetVestingScheduleQueryVariables
    >({
      queryFn: async ({ chainId, ...variables }) => {
        const sdk = tryGetBuiltGraphSdkForNetwork(chainId);
        const subgraphVestingSchedule = sdk
          ? (await sdk.getVestingSchedule(variables)).vestingSchedule
          : null;
        return {
          data: {
            vestingSchedule: subgraphVestingSchedule
              ? mapSubgraphVestingSchedule(subgraphVestingSchedule)
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
    getVestingSchedules: build.query<
      { vestingSchedules: VestingSchedule[] },
      { chainId: number } & GetVestingSchedulesQueryVariables
    >({
      queryFn: async ({ chainId, ...variables }) => {
        const sdk = tryGetBuiltGraphSdkForNetwork(chainId);
        const subgraphVestingSchedules = sdk
          ? (await sdk.getVestingSchedules(variables)).vestingSchedules
          : [];
        return {
          data: {
            vestingSchedules: subgraphVestingSchedules.map(
              mapSubgraphVestingSchedule
            ),
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
