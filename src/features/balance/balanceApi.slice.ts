import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { Address } from "@superfluid-finance/sdk-core";
import config from "../../utils/config";
import { allNetworks, findNetworkOrThrow, Network } from "../network/networks";
import type { paths } from "./balanceApi.generated";

type BalanceSnapshotsJson =
  paths["/v1/accounts/{account}/tokens/{token}/balance-snapshots"]["get"]["responses"]["200"]["content"]["application/json"];

export type BalanceHistoryPoint = BalanceSnapshotsJson["points"][number];
export type BalanceHistoryResponse = BalanceSnapshotsJson;

type MovementsJson =
  paths["/v1/accounts/{account}/tokens/{token}/movements"]["get"]["responses"]["200"]["content"]["application/json"];

export type Movement = MovementsJson["movements"][number];
type MovementsResponse = MovementsJson;

interface BalanceHistoryArgs {
  chainId: number;
  account: Address;
  token: Address;
  startTimestamp: number;
  endTimestamp?: number;
  points?: number;
}

interface FirstMovementArgs {
  chainId: number;
  account: Address;
  token: Address;
}

const getSuperfluidCanonicalSlug = (network: Network): string => {
  const url = network.rpcUrls.superfluid?.http?.[0];
  if (!url) {
    throw new Error(`No Superfluid RPC URL for chain ${network.id}`);
  }
  return new URL(url).pathname.replace(/^\/+/, "");
};

const balanceApi = createApi({
  reducerPath: "balance",
  baseQuery: fetchBaseQuery({
    baseUrl: config.balanceApi,
    timeout: 15_000,
  }),
  endpoints: (builder) => ({
    firstMovementTimestamp: builder.query<number | null, FirstMovementArgs>({
      query: ({ chainId, account, token }) => {
        const network = findNetworkOrThrow(allNetworks, chainId);
        return {
          url: `/v1/accounts/${account.toLowerCase()}/tokens/${token.toLowerCase()}/movements`,
          params: {
            chain: getSuperfluidCanonicalSlug(network),
            sort: "asc",
            limit: "1",
          },
        };
      },
      transformResponse: (response: MovementsResponse) => {
        const first = response.movements[0];
        return first ? Number(first.timestamp) : null;
      },
    }),
    balanceHistory: builder.query<BalanceHistoryResponse, BalanceHistoryArgs>({
      query: ({ chainId, account, token, startTimestamp, endTimestamp, points }) => {
        const network = findNetworkOrThrow(allNetworks, chainId);
        const chain = getSuperfluidCanonicalSlug(network);
        const params: Record<string, string> = {
          chain,
          startTimestamp: startTimestamp.toString(),
        };
        if (endTimestamp !== undefined) params.endTimestamp = endTimestamp.toString();
        if (points !== undefined) params.points = points.toString();
        return {
          url: `/v1/accounts/${account.toLowerCase()}/tokens/${token.toLowerCase()}/balance-snapshots`,
          params,
        };
      },
    }),
  }),
});

export default balanceApi;
