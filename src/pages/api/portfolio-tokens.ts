import type { NextApiRequest, NextApiResponse } from "next";
import { extendedSuperTokenList } from "@superfluid-finance/tokenlist";
import Decimal from "decimal.js";
import { utils } from "ethers";
import {
  PortfolioToken,
  PortfolioTokensRequest,
  PortfolioTokensResponse,
} from "../../features/portfolio/portfolioTokens";

const ALCHEMY_PORTFOLIO_URL = "https://api.g.alchemy.com/data/v1";
const MAX_NETWORKS_PER_REQUEST = 5;
const MAX_PAGES_PER_REQUEST = 50;
const MIN_PORTFOLIO_VALUE_USD = 0.01;

export const config = {
  maxDuration: 60,
};

const trustedTokenIds = new Set(
  extendedSuperTokenList.tokens.map(
    ({ chainId, address }) => `${chainId}-${address.toLowerCase()}`
  )
);

const alchemyNetworkByChainId: Record<number, string> = {
  1: "eth-mainnet",
  10: "opt-mainnet",
  56: "bnb-mainnet",
  100: "gnosis-mainnet",
  137: "polygon-mainnet",
  8453: "base-mainnet",
  42161: "arb-mainnet",
  42220: "celo-mainnet",
  43113: "avax-fuji",
  43114: "avax-mainnet",
  84532: "base-sepolia",
  534351: "scroll-sepolia",
  534352: "scroll-mainnet",
  11155111: "eth-sepolia",
  11155420: "opt-sepolia",
};

const chainIdByAlchemyNetwork = Object.fromEntries(
  Object.entries(alchemyNetworkByChainId).map(([chainId, network]) => [
    network,
    Number(chainId),
  ])
) as Record<string, number>;

// Alchemy currently normalizes Polygon's requested network name in responses.
chainIdByAlchemyNetwork["matic-mainnet"] = 137;

interface AlchemyToken {
  network: string;
  tokenAddress: string | null;
  tokenBalance: string;
  tokenMetadata?: {
    decimals?: number | null;
    logo?: string | null;
    name?: string | null;
    symbol?: string | null;
  };
  tokenPrices?: Array<{
    currency: string;
    value: string;
  }>;
  error?: string;
}

interface AlchemyResponse {
  data?: {
    tokens?: AlchemyToken[];
    pageKey?: string;
  };
  error?: {
    message?: string;
  };
}

const chunk = <T>(items: T[], size: number): T[][] => {
  const chunks: T[][] = [];
  for (let index = 0; index < items.length; index += size) {
    chunks.push(items.slice(index, index + size));
  }
  return chunks;
};

const hasBalance = (balance: string): boolean => {
  try {
    return BigInt(balance) !== 0n;
  } catch {
    return false;
  }
};

const mapToken = (token: AlchemyToken): PortfolioToken | null => {
  const chainId = chainIdByAlchemyNetwork[token.network];
  const tokenAddress = token.tokenAddress?.toLowerCase();
  const metadata = token.tokenMetadata;

  if (
    !chainId ||
    !tokenAddress ||
    token.error ||
    !hasBalance(token.tokenBalance)
  ) {
    return null;
  }

  const priceUsd = token.tokenPrices?.find(
    ({ currency }) => currency.toLowerCase() === "usd"
  )?.value;
  const parsedPrice = priceUsd ? Number(priceUsd) : undefined;
  const hasPrice =
    parsedPrice !== undefined &&
    Number.isFinite(parsedPrice) &&
    parsedPrice > 0;
  const isTrusted = trustedTokenIds.has(`${chainId}-${tokenAddress}`);
  const valueUsd = hasPrice
    ? new Decimal(
        utils.formatUnits(token.tokenBalance, metadata?.decimals ?? 18)
      ).mul(parsedPrice!)
    : undefined;
  const hasMeaningfulValue = valueUsd?.gte(MIN_PORTFOLIO_VALUE_USD) ?? false;

  // Alchemy returns every non-zero airdrop, including thousands of spam
  // tokens for some wallets. Keep meaningful holdings plus the maintained list.
  if (!hasMeaningfulValue && !isTrusted) return null;

  return {
    chainId,
    tokenAddress,
    balance: token.tokenBalance,
    decimals: metadata?.decimals ?? 18,
    name: metadata?.name || "Unknown token",
    symbol: metadata?.symbol || `${tokenAddress.slice(0, 6)}…`,
    logoURI: metadata?.logo || undefined,
    priceUsd: hasPrice ? parsedPrice : undefined,
    valueUsd: valueUsd && valueUsd.isFinite() ? valueUsd.toNumber() : undefined,
  };
};

const fetchNetworkChunk = async ({
  apiKey,
  address,
  networks,
}: {
  apiKey: string;
  address: string;
  networks: string[];
}): Promise<AlchemyToken[]> => {
  const tokens: AlchemyToken[] = [];
  let pageKey: string | undefined;
  const seenPageKeys = new Set<string>();

  for (let page = 0; page < MAX_PAGES_PER_REQUEST; page += 1) {
    const response = await fetch(
      `${ALCHEMY_PORTFOLIO_URL}/${apiKey}/assets/tokens/by-address`,
      {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          addresses: [{ address, networks }],
          withMetadata: true,
          withPrices: true,
          includeNativeTokens: false,
          includeErc20Tokens: true,
          ...(pageKey ? { pageKey } : {}),
        }),
      }
    );

    const body = (await response.json()) as AlchemyResponse;
    if (!response.ok) {
      throw new Error(
        body.error?.message || `Alchemy responded with ${response.status}`
      );
    }

    tokens.push(...(body.data?.tokens ?? []));
    const nextPageKey = body.data?.pageKey;
    if (!nextPageKey || seenPageKeys.has(nextPageKey)) break;

    seenPageKeys.add(nextPageKey);
    pageKey = nextPageKey;
  }

  return tokens;
};

export default async function handler(
  request: NextApiRequest,
  response: NextApiResponse<PortfolioTokensResponse | { error: string }>
) {
  if (request.method !== "POST") {
    response.setHeader("Allow", "POST");
    return response.status(405).json({ error: "Method not allowed" });
  }

  const apiKey = process.env.ALCHEMY_TEST_KEY;
  if (!apiKey) {
    return response.status(503).json({ error: "Alchemy is not configured" });
  }

  const { address, chainIds } = request.body as Partial<PortfolioTokensRequest>;
  if (
    typeof address !== "string" ||
    !/^0x[0-9a-fA-F]{40}$/.test(address) ||
    !Array.isArray(chainIds) ||
    chainIds.some((chainId) => !Number.isInteger(chainId))
  ) {
    return response.status(400).json({ error: "Invalid portfolio request" });
  }

  const uniqueChainIds = [...new Set(chainIds)];
  const supported = uniqueChainIds.flatMap((chainId) => {
    const network = alchemyNetworkByChainId[chainId];
    return network ? [{ chainId, network }] : [];
  });
  const fallbackChainIds = uniqueChainIds.filter(
    (chainId) => !alchemyNetworkByChainId[chainId]
  );

  const networkChunks = chunk(supported, MAX_NETWORKS_PER_REQUEST);
  const results = await Promise.allSettled(
    networkChunks.map((networkChunk) =>
      fetchNetworkChunk({
        apiKey,
        address,
        networks: networkChunk.map(({ network }) => network),
      }).then((tokens) => ({ tokens, networkChunk }))
    )
  );

  const alchemyTokens: AlchemyToken[] = [];
  results.forEach((result, index) => {
    if (result.status === "fulfilled") {
      alchemyTokens.push(...result.value.tokens);
      return;
    }

    const failedChunk = networkChunks[index];
    fallbackChainIds.push(...failedChunk.map(({ chainId }) => chainId));
    console.error("Alchemy portfolio request failed", result.reason);
  });

  const tokensById = new Map<string, PortfolioToken>();
  alchemyTokens.forEach((token) => {
    const mapped = mapToken(token);
    if (mapped) {
      tokensById.set(`${mapped.chainId}-${mapped.tokenAddress}`, mapped);
    }
  });

  response.setHeader("Cache-Control", "private, no-store");
  return response.status(200).json({
    tokens: [...tokensById.values()].sort(
      (first, second) =>
        first.chainId - second.chainId ||
        (second.valueUsd ?? -1) - (first.valueUsd ?? -1) ||
        first.symbol.localeCompare(second.symbol)
    ),
    fallbackChainIds: [...new Set(fallbackChainIds)],
  });
}
