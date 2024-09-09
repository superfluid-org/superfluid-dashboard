import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import config from "../../../utils/config";
import { allNetworks, findNetworkOrThrow } from "../../network/networks";

export type IsAccountWhitelistedApiResponse =
  /** status 200 Is User account whitelisted */ boolean;
export type IsAccountWhitelistedApiArg = {
  /** User Account address */
  account: string;
  chainId: number;
};

export const platformApi = createApi({
  tagTypes: ["GENERAL", "SPECIFIC"], // TODO(KK): Make SDK be able to invalidate another slice!
  baseQuery: fetchBaseQuery(),
  keepUnusedDataFor: 240,
  refetchOnMountOrArgChange: 120,
  refetchOnReconnect: true,
  endpoints: (build) => ({
    isAccountWhitelisted: build.query<
      IsAccountWhitelistedApiResponse,
      IsAccountWhitelistedApiArg
    >({
      queryFn: async ({ account, chainId }) => {
        const network = findNetworkOrThrow(allNetworks, chainId);
        const doesNetworkSupportAutomation = Boolean(network.autoWrapSubgraphUrl || network.flowSchedulerSubgraphUrl || network.vestingSubgraphUrl);
        if (!doesNetworkSupportAutomation) {
          return { data: false };
        }

        if (network.testnet) {
          return { data: true };
        }

        try {
          const response = await fetch(`${config.allowlistApiUrl}/api/allowlist/${account}/${chainId}`);
          const data = await response.json() as IsAccountWhitelistedApiResponse;
          return { data: data };
        } catch (error) {
          console.error("Error fetching whitelist status:", error);
          return { data: false  };
        }
      },
    }),
  }),
});
