import sfMetadata from "@superfluid-finance/metadata";
import { extendedSuperTokenList } from "@superfluid-finance/tokenlist";
import Decimal from "decimal.js";
import { utils } from "ethers";
import type { NextApiRequest, NextApiResponse } from "next";
import {
  PortfolioToken,
  PortfolioTokensRequest,
  PortfolioTokensResponse,
} from "../../features/portfolio/portfolioTokens";

const ARCHIVE_RPC_DOMAIN = "arpc.x.superfluid.dev";
const LIFI_TOKENS_URL = "https://li.quest/v1/tokens";
const MAX_PAGES_PER_REQUEST = 50;
const MAX_METADATA_BATCH_SIZE = 100;
const MIN_PORTFOLIO_VALUE_USD = 0.01;
const LIFI_PRICE_CACHE_TTL_MS = 5 * 60 * 1000;

export const config = {
  maxDuration: 60,
};

interface TokenDisplayMetadata {
  decimals?: number;
  logoURI?: string;
  name?: string;
  symbol?: string;
}

const trustedTokensById = new Map<string, TokenDisplayMetadata>(
  extendedSuperTokenList.tokens.map((token) => [
    `${token.chainId}-${token.address.toLowerCase()}`,
    {
      decimals: token.decimals,
      logoURI: token.logoURI,
      name: token.name,
      symbol: token.symbol,
    },
  ])
);

interface ArchiveNetwork {
  chainId: number;
  name: string;
  rpcUrl: string;
}

interface JsonRpcRequest {
  jsonrpc: "2.0";
  id: number;
  method: string;
  params: unknown[];
}

interface JsonRpcResponse<T> {
  jsonrpc?: string;
  id?: number | string | null;
  result?: T;
  error?: {
    code?: number;
    message?: string;
  };
}

interface ArchiveTokenBalance {
  contractAddress?: string | null;
  tokenBalance?: string | null;
}

interface ArchiveTokenBalancesResult {
  tokenBalances?: ArchiveTokenBalance[];
  pageKey?: string;
}

interface ArchiveTokenMetadata {
  decimals?: number | null;
  logo?: string | null;
  name?: string | null;
  symbol?: string | null;
}

interface ArchiveToken {
  chainId: number;
  tokenAddress: string;
  tokenBalance: string;
  tokenMetadata?: TokenDisplayMetadata;
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

const getArchiveNetwork = (chainId: number): ArchiveNetwork | undefined => {
  const networkName = sfMetadata.getNetworkByChainId(chainId)?.name;
  if (!networkName || !/^[a-z0-9-]+$/.test(networkName)) return undefined;

  return {
    chainId,
    name: networkName,
    rpcUrl: `https://${networkName}.${ARCHIVE_RPC_DOMAIN}`,
  };
};

const getRpcErrorMessage = <T>(body: JsonRpcResponse<T>, fallback: string) =>
  body.error?.message || fallback;

const callArchiveRpc = async <T>({
  rpcUrl,
  method,
  params,
}: {
  rpcUrl: string;
  method: string;
  params: unknown[];
}): Promise<T> => {
  const rpcResponse = await fetch(rpcUrl, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      jsonrpc: "2.0",
      id: 1,
      method,
      params,
    } satisfies JsonRpcRequest),
  });
  const body = (await rpcResponse.json()) as JsonRpcResponse<T>;

  if (!rpcResponse.ok || body.error) {
    throw new Error(
      getRpcErrorMessage(
        body,
        `Archive RPC responded with ${rpcResponse.status}`
      )
    );
  }
  if (!("result" in body)) {
    throw new Error(`Archive RPC returned no result for ${method}`);
  }

  return body.result as T;
};

const callArchiveRpcBatch = async <T>({
  rpcUrl,
  requests,
}: {
  rpcUrl: string;
  requests: JsonRpcRequest[];
}): Promise<JsonRpcResponse<T>[]> => {
  const rpcResponse = await fetch(rpcUrl, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(requests),
  });
  const body = (await rpcResponse.json()) as
    | JsonRpcResponse<T>[]
    | JsonRpcResponse<never>;

  if (!rpcResponse.ok || !Array.isArray(body)) {
    throw new Error(
      Array.isArray(body)
        ? `Archive RPC responded with ${rpcResponse.status}`
        : getRpcErrorMessage(
            body,
            `Archive RPC responded with ${rpcResponse.status}`
          )
    );
  }

  return body;
};

const fetchTokenBalances = async ({
  address,
  rpcUrl,
}: {
  address: string;
  rpcUrl: string;
}) => {
  const balancesByAddress = new Map<string, string>();
  const seenPageKeys = new Set<string>();
  let pageKey: string | undefined;

  for (let page = 0; page < MAX_PAGES_PER_REQUEST; page += 1) {
    const params: unknown[] = [address, "erc20"];
    if (pageKey) params.push({ pageKey });

    const result = await callArchiveRpc<ArchiveTokenBalancesResult>({
      rpcUrl,
      method: "alchemy_getTokenBalances",
      params,
    });

    (result.tokenBalances ?? []).forEach(
      ({ contractAddress, tokenBalance }) => {
        const normalizedAddress = contractAddress?.toLowerCase();
        if (
          normalizedAddress &&
          /^0x[0-9a-f]{40}$/.test(normalizedAddress) &&
          tokenBalance &&
          hasBalance(tokenBalance)
        ) {
          balancesByAddress.set(normalizedAddress, tokenBalance);
        }
      }
    );

    const nextPageKey = result.pageKey;
    if (!nextPageKey || seenPageKeys.has(nextPageKey)) break;

    seenPageKeys.add(nextPageKey);
    pageKey = nextPageKey;
  }

  return balancesByAddress;
};

const fetchTokenMetadata = async ({
  rpcUrl,
  tokenAddresses,
}: {
  rpcUrl: string;
  tokenAddresses: string[];
}): Promise<Map<string, TokenDisplayMetadata>> => {
  const metadataByAddress = new Map<string, TokenDisplayMetadata>();

  for (const tokenChunk of chunk(tokenAddresses, MAX_METADATA_BATCH_SIZE)) {
    const addressByRequestId = new Map<number, string>();
    const requests = tokenChunk.map((tokenAddress, index) => {
      const id = index + 1;
      addressByRequestId.set(id, tokenAddress);
      return {
        jsonrpc: "2.0" as const,
        id,
        method: "alchemy_getTokenMetadata",
        params: [tokenAddress],
      };
    });
    const responses = await callArchiveRpcBatch<ArchiveTokenMetadata>({
      rpcUrl,
      requests,
    });

    responses.forEach((response) => {
      const requestId = Number(response.id);
      const tokenAddress = addressByRequestId.get(requestId);
      const metadata = response.result;
      if (!tokenAddress || !metadata || response.error) return;

      const decimals =
        typeof metadata.decimals === "number" &&
        Number.isInteger(metadata.decimals) &&
        metadata.decimals >= 0
          ? metadata.decimals
          : undefined;
      metadataByAddress.set(tokenAddress, {
        decimals,
        logoURI: metadata.logo || undefined,
        name: metadata.name || undefined,
        symbol: metadata.symbol || undefined,
      });
    });
  }

  return metadataByAddress;
};

const fetchNetworkTokens = async ({
  address,
  network,
}: {
  address: string;
  network: ArchiveNetwork;
}): Promise<ArchiveToken[]> => {
  const balancesByAddress = await fetchTokenBalances({
    address,
    rpcUrl: network.rpcUrl,
  });
  const tokenAddresses = [...balancesByAddress.keys()];
  const metadataByAddress = tokenAddresses.length
    ? await fetchTokenMetadata({
        rpcUrl: network.rpcUrl,
        tokenAddresses,
      })
    : new Map<string, TokenDisplayMetadata>();

  return tokenAddresses.map((tokenAddress) => ({
    chainId: network.chainId,
    tokenAddress,
    tokenBalance: balancesByAddress.get(tokenAddress)!,
    tokenMetadata: metadataByAddress.get(tokenAddress),
  }));
};

const fetchLifiPrices = async (
  chainIds: number[]
): Promise<Map<string, number>> => {
  const requestUrl = new URL(LIFI_TOKENS_URL);
  requestUrl.searchParams.set("chains", chainIds.join(","));
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

  return prices;
};

const getLifiPrices = async (
  chainIds: number[]
): Promise<Map<string, number>> => {
  const sortedChainIds = [...new Set(chainIds)].sort(
    (first, second) => first - second
  );
  const cacheKey = sortedChainIds.join(",");
  if (
    lifiPriceCache?.cacheKey === cacheKey &&
    lifiPriceCache.expiresAt > Date.now()
  ) {
    return lifiPriceCache.prices;
  }

  let prices: Map<string, number>;
  try {
    prices = await fetchLifiPrices(sortedChainIds);
  } catch (error) {
    if (sortedChainIds.length === 1) throw error;

    prices = new Map<string, number>();
    const perChainResults = await Promise.allSettled(
      sortedChainIds.map(async (chainId) => ({
        chainId,
        prices: await fetchLifiPrices([chainId]),
      }))
    );
    perChainResults.forEach((result, index) => {
      if (result.status === "fulfilled") {
        result.value.prices.forEach((price, tokenId) =>
          prices.set(tokenId, price)
        );
      } else {
        console.warn(
          `LI.FI portfolio pricing failed for chain ${sortedChainIds[index]}`,
          result.reason
        );
      }
    });
  }

  lifiPriceCache = {
    cacheKey,
    expiresAt: Date.now() + LIFI_PRICE_CACHE_TTL_MS,
    prices,
  };
  return prices;
};

const mapToken = (
  token: ArchiveToken,
  lifiPrices: Map<string, number>
): PortfolioToken | null => {
  const tokenId = `${token.chainId}-${token.tokenAddress}`;
  const trustedMetadata = trustedTokensById.get(tokenId);
  const metadata = token.tokenMetadata;
  const decimals = metadata?.decimals ?? trustedMetadata?.decimals ?? 18;
  const effectivePrice = lifiPrices.get(tokenId);
  const valueUsd =
    effectivePrice !== undefined
      ? new Decimal(utils.formatUnits(token.tokenBalance, decimals)).mul(
          effectivePrice
        )
      : undefined;
  const hasMeaningfulValue = valueUsd?.gte(MIN_PORTFOLIO_VALUE_USD) ?? false;

  // Token discovery returns every non-zero airdrop, including spam. Keep
  // valued holdings plus assets maintained in the Superfluid token list.
  if (!hasMeaningfulValue && !trustedMetadata) return null;

  return {
    chainId: token.chainId,
    tokenAddress: token.tokenAddress,
    balance: token.tokenBalance,
    decimals,
    name: metadata?.name || trustedMetadata?.name || "Unknown token",
    symbol:
      metadata?.symbol ||
      trustedMetadata?.symbol ||
      `${token.tokenAddress.slice(0, 6)}…`,
    logoURI: metadata?.logoURI || trustedMetadata?.logoURI,
    priceUsd: effectivePrice,
    valueUsd: valueUsd && valueUsd.isFinite() ? valueUsd.toNumber() : undefined,
  };
};

export default async function handler(
  request: NextApiRequest,
  response: NextApiResponse<PortfolioTokensResponse | { error: string }>
) {
  if (request.method !== "POST") {
    response.setHeader("Allow", "POST");
    return response.status(405).json({ error: "Method not allowed" });
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
  const archiveNetworks = uniqueChainIds.flatMap((chainId) => {
    const network = getArchiveNetwork(chainId);
    return network ? [network] : [];
  });
  const fallbackChainIds = uniqueChainIds.filter(
    (chainId) => !getArchiveNetwork(chainId)
  );

  const [results, lifiPrices] = await Promise.all([
    Promise.allSettled(
      archiveNetworks.map((network) =>
        fetchNetworkTokens({ address, network }).then((tokens) => ({
          network,
          tokens,
        }))
      )
    ),
    archiveNetworks.length > 0
      ? getLifiPrices(archiveNetworks.map(({ chainId }) => chainId)).catch(
          (error) => {
            console.error("LI.FI portfolio pricing request failed", error);
            return new Map<string, number>();
          }
        )
      : Promise.resolve(new Map<string, number>()),
  ]);

  const archiveTokens: ArchiveToken[] = [];
  results.forEach((result, index) => {
    if (result.status === "fulfilled") {
      archiveTokens.push(...result.value.tokens);
      return;
    }

    const failedNetwork = archiveNetworks[index];
    fallbackChainIds.push(failedNetwork.chainId);
    console.error(
      `Archive portfolio request failed for ${failedNetwork.name}`,
      result.reason
    );
  });

  const tokensById = new Map<string, PortfolioToken>();
  archiveTokens.forEach((token) => {
    const mapped = mapToken(token, lifiPrices);
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
