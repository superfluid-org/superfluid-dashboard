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
const LIFI_TOKENS_URL = "https://li.quest/v1/tokens";
const MAX_NETWORKS_PER_REQUEST = 5;
const MAX_PAGES_PER_REQUEST = 50;
const MIN_PORTFOLIO_VALUE_USD = 0.01;
const NATIVE_TOKEN_ADDRESS = "0x0000000000000000000000000000000000000000";
const LIFI_PRICE_CACHE_TTL_MS = 5 * 60 * 1000;

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

const nativeMetadataByChainId: Record<
  number,
  { name: string; symbol: string; decimals: number }
> = {
  1: { name: "Ether", symbol: "ETH", decimals: 18 },
  10: { name: "Ether", symbol: "ETH", decimals: 18 },
  56: { name: "BNB", symbol: "BNB", decimals: 18 },
  100: { name: "xDAI", symbol: "XDAI", decimals: 18 },
  137: { name: "POL", symbol: "POL", decimals: 18 },
  8453: { name: "Ether", symbol: "ETH", decimals: 18 },
  42161: { name: "Ether", symbol: "ETH", decimals: 18 },
  42220: { name: "Celo", symbol: "CELO", decimals: 18 },
  43113: { name: "Avalanche", symbol: "AVAX", decimals: 18 },
  43114: { name: "Avalanche", symbol: "AVAX", decimals: 18 },
  84532: { name: "Ether", symbol: "ETH", decimals: 18 },
  534351: { name: "Ether", symbol: "ETH", decimals: 18 },
  534352: { name: "Ether", symbol: "ETH", decimals: 18 },
  11155111: { name: "Sepolia Ether", symbol: "ETH", decimals: 18 },
  11155420: { name: "Sepolia Ether", symbol: "ETH", decimals: 18 },
};

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
    lastUpdatedAt?: string;
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

interface LifiToken {
  address: string;
  chainId: number;
  priceUSD?: string;
}

interface LifiTokensResponse {
  tokens?: Record<string, LifiToken[]>;
}

interface LifiPriceCache {
  cacheKey: string;
  expiresAt: number;
  prices: Map<string, number>;
}

let lifiPriceCache: LifiPriceCache | undefined;

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

const getLifiPrices = async (
  chainIds: number[]
): Promise<Map<string, number>> => {
  const cacheKey = [...chainIds]
    .sort((first, second) => first - second)
    .join(",");
  if (
    lifiPriceCache?.cacheKey === cacheKey &&
    lifiPriceCache.expiresAt > Date.now()
  ) {
    return lifiPriceCache.prices;
  }

  const requestUrl = new URL(LIFI_TOKENS_URL);
  requestUrl.searchParams.set("chains", cacheKey);
  requestUrl.searchParams.set("minPriceUSD", "0");
  const response = await fetch(requestUrl);
  if (!response.ok) {
    throw new Error(`LI.FI responded with ${response.status}`);
  }

  const body = (await response.json()) as LifiTokensResponse;
  const prices = new Map<string, number>();
  Object.values(body.tokens ?? {}).forEach((tokens) =>
    tokens.forEach(({ address, chainId, priceUSD }) => {
      const parsedPrice = priceUSD ? Number(priceUSD) : undefined;
      if (
        parsedPrice !== undefined &&
        Number.isFinite(parsedPrice) &&
        parsedPrice > 0
      ) {
        prices.set(`${chainId}-${address.toLowerCase()}`, parsedPrice);
      }
    })
  );

  lifiPriceCache = {
    cacheKey,
    expiresAt: Date.now() + LIFI_PRICE_CACHE_TTL_MS,
    prices,
  };
  return prices;
};

const mapToken = (
  token: AlchemyToken,
  lifiPrices: Map<string, number>,
  includeNativeTokens: boolean
): PortfolioToken | null => {
  const chainId = chainIdByAlchemyNetwork[token.network];
  const nativeToken = !token.tokenAddress;
  const tokenAddress =
    token.tokenAddress?.toLowerCase() ?? NATIVE_TOKEN_ADDRESS;
  const metadata = token.tokenMetadata;
  const nativeMetadata = nativeToken
    ? nativeMetadataByChainId[chainId]
    : undefined;

  if (
    !chainId ||
    (nativeToken && !includeNativeTokens) ||
    token.error ||
    !hasBalance(token.tokenBalance)
  ) {
    return null;
  }

  const usdPrice = token.tokenPrices?.find(
    ({ currency }) => currency.toLowerCase() === "usd"
  );
  const priceUsd = usdPrice?.value;
  const parsedAlchemyPrice = priceUsd ? Number(priceUsd) : undefined;
  const alchemyPrice =
    parsedAlchemyPrice !== undefined &&
    Number.isFinite(parsedAlchemyPrice) &&
    parsedAlchemyPrice > 0
      ? parsedAlchemyPrice
      : undefined;
  const tokenId = `${chainId}-${tokenAddress}`;
  const effectivePrice = alchemyPrice ?? lifiPrices.get(tokenId);
  const isTrusted = trustedTokenIds.has(tokenId);
  const valueUsd =
    effectivePrice !== undefined
      ? new Decimal(
          utils.formatUnits(token.tokenBalance, metadata?.decimals ?? 18)
        ).mul(effectivePrice)
      : undefined;
  const hasMeaningfulValue = valueUsd?.gte(MIN_PORTFOLIO_VALUE_USD) ?? false;

  // Alchemy returns every non-zero airdrop, including thousands of spam tokens.
  // Keep holdings valued by either provider plus the maintained token list.
  if (!hasMeaningfulValue && !isTrusted) return null;

  return {
    chainId,
    tokenAddress,
    balance: token.tokenBalance,
    decimals: metadata?.decimals ?? nativeMetadata?.decimals ?? 18,
    name: metadata?.name || nativeMetadata?.name || "Unknown token",
    symbol:
      metadata?.symbol ||
      nativeMetadata?.symbol ||
      `${tokenAddress.slice(0, 6)}…`,
    logoURI: metadata?.logo || undefined,
    priceUsd: effectivePrice,
    priceUpdatedAt: usdPrice?.lastUpdatedAt,
    valueUsd: valueUsd && valueUsd.isFinite() ? valueUsd.toNumber() : undefined,
    nativeToken,
  };
};

const fetchNetworkChunk = async ({
  apiKey,
  address,
  networks,
  includeNativeTokens,
}: {
  apiKey: string;
  address: string;
  networks: string[];
  includeNativeTokens: boolean;
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
          includeNativeTokens,
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

  const {
    address,
    chainIds,
    includeNativeTokens = false,
  } = request.body as Partial<PortfolioTokensRequest>;
  if (
    typeof address !== "string" ||
    !/^0x[0-9a-fA-F]{40}$/.test(address) ||
    !Array.isArray(chainIds) ||
    chainIds.some((chainId) => !Number.isInteger(chainId)) ||
    typeof includeNativeTokens !== "boolean"
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
  const [results, lifiPrices] = await Promise.all([
    Promise.allSettled(
      networkChunks.map((networkChunk) =>
        fetchNetworkChunk({
          apiKey,
          address,
          networks: networkChunk.map(({ network }) => network),
          includeNativeTokens,
        }).then((tokens) => ({ tokens, networkChunk }))
      )
    ),
    supported.length > 0
      ? getLifiPrices(supported.map(({ chainId }) => chainId)).catch(
          (error) => {
            console.error("LI.FI portfolio pricing request failed", error);
            return new Map<string, number>();
          }
        )
      : Promise.resolve(new Map<string, number>()),
  ]);

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
    const mapped = mapToken(token, lifiPrices, includeNativeTokens);
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
