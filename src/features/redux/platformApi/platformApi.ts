import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import config from "../../../utils/config";
import { allNetworks, findNetworkOrThrow } from "../../network/networks";
import {
  PortfolioTokensRequest,
  PortfolioTokensResponse,
} from "../../portfolio/portfolioTokens";
import {
  ERC20TransferHistoryRequest,
  ERC20TransferHistoryResponse,
} from "../../portfolio/erc20TransferHistory";
import {
  ZerionPortfolioRequest,
  ZerionPortfolioResponse,
} from "../../portfolio/zerionPortfolio";
import {
  AnkrPortfolioRequest,
  AnkrPortfolioResponse,
} from "../../portfolio/ankrPortfolio";
import {
  MoralisPortfolioRequest,
  MoralisPortfolioResponse,
} from "../../portfolio/moralisPortfolio";
import {
  AlchemyActivityRequest,
  AlchemyActivityResponse,
  AlchemyNftRequest,
  AlchemyNftResponse,
} from "../../portfolio/alchemyPortfolio";
import {
  ERC20BalanceHistoryRequest,
  ERC20BalanceHistoryResponse,
} from "../../portfolio/erc20BalanceHistory";

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
    portfolioTokens: build.query<
      PortfolioTokensResponse,
      PortfolioTokensRequest
    >({
      query: (body) => ({
        url: "/api/portfolio-tokens",
        method: "POST",
        body,
      }),
    }),
    alchemyWalletActivity: build.query<
      AlchemyActivityResponse,
      AlchemyActivityRequest
    >({
      query: (body) => ({
        url: "/api/alchemy-wallet-activity",
        method: "POST",
        body,
      }),
      keepUnusedDataFor: 120,
    }),
    alchemyNfts: build.query<AlchemyNftResponse, AlchemyNftRequest>({
      query: (body) => ({
        url: "/api/alchemy-nfts",
        method: "POST",
        body,
      }),
      keepUnusedDataFor: 300,
    }),
    zerionPortfolio: build.query<
      ZerionPortfolioResponse,
      ZerionPortfolioRequest
    >({
      query: (body) => ({
        url: "/api/portfolio-zerion",
        method: "POST",
        body,
      }),
      keepUnusedDataFor: 120,
    }),
    ankrPortfolio: build.query<AnkrPortfolioResponse, AnkrPortfolioRequest>({
      query: (body) => ({
        url: "/api/portfolio-ankr",
        method: "POST",
        body,
      }),
      keepUnusedDataFor: 120,
    }),
    moralisPortfolio: build.query<
      MoralisPortfolioResponse,
      MoralisPortfolioRequest
    >({
      query: (body) => ({
        url: "/api/portfolio-moralis",
        method: "POST",
        body,
      }),
      keepUnusedDataFor: 120,
    }),
    erc20TransferHistory: build.query<
      ERC20TransferHistoryResponse,
      ERC20TransferHistoryRequest
    >({
      query: (body) => ({
        url: "/api/erc20-transfer-history",
        method: "POST",
        body,
      }),
      keepUnusedDataFor: 60,
    }),
    erc20BalanceHistory: build.query<
      ERC20BalanceHistoryResponse,
      ERC20BalanceHistoryRequest
    >({
      query: (body) => ({
        url: "/api/erc20-balance-history",
        method: "POST",
        body,
      }),
      keepUnusedDataFor: 120,
    }),
    isAccountWhitelisted: build.query<
      IsAccountWhitelistedApiResponse,
      IsAccountWhitelistedApiArg
    >({
      queryFn: async ({ account, chainId }) => {
        const network = findNetworkOrThrow(allNetworks, chainId);
        const doesNetworkSupportAutomation = Boolean(
          network.autoWrapSubgraphUrl ||
            network.flowSchedulerSubgraphUrl ||
            network.vestingSubgraphUrl
        );
        if (!doesNetworkSupportAutomation) {
          return { data: false };
        }

        if (network.testnet) {
          return { data: true };
        }

        try {
          const response = await fetch(
            `${config.allowlistApiUrl}/api/allowlist/${account}/${chainId}`
          );
          const data =
            (await response.json()) as IsAccountWhitelistedApiResponse;
          return { data: data };
        } catch (error) {
          console.error("Error fetching whitelist status:", error);
          return { data: false };
        }
      },
    }),
  }),
});
