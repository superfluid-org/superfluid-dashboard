import type { NextApiRequest, NextApiResponse } from "next";
import {
  MoralisDefiPosition,
  MoralisPortfolioAsset,
  MoralisPortfolioRequest,
  MoralisPortfolioResponse,
  MoralisPnlSummary,
} from "../../features/portfolio/moralisPortfolio";

const MORALIS_UNIVERSAL_API_URL = "https://api.moralis.com/v1";
const MORALIS_EVM_API_URL = "https://deep-index.moralis.io/api/v2.2";
const REQUEST_TIMEOUT_MS = 30_000;
const PAGE_SIZE = 100;
const PNL_CHAINS = [
  { slug: "eth", chainId: "0x1" },
  { slug: "base", chainId: "0x2105" },
  { slug: "polygon", chainId: "0x89" },
] as const;

export const config = {
  maxDuration: 60,
};

interface MoralisMeta {
  failedChains?: string[];
  unsupportedChains?: string[];
}

interface MoralisTokenResult {
  meta?: MoralisMeta;
  cursor?: string | null;
  result?: Array<{
    tokenAddress?: string | null;
    balanceRaw?: string;
    chainId?: string;
    name?: string;
    symbol?: string;
    decimals?: number;
    logo?: string | null;
    possibleSpam?: boolean;
    verifiedContract?: boolean;
    balance?: string;
    securityScore?: number | null;
    portfolioPercentage?: number | null;
    usdPrice?: number | null;
    usdPrice24hrPercentChange?: number | null;
    usdValue?: number | null;
    nativeToken?: boolean;
  }>;
}

interface MoralisDefiResult {
  meta?: MoralisMeta;
  cursor?: string | null;
  result?: Array<{
    chainId?: string;
    protocolId?: string;
    protocolName?: string;
    protocolUrl?: unknown;
    protocolLogo?: unknown;
    position?: {
      label?: string;
      tokens?: Array<{
        address?: unknown;
        name?: unknown;
        symbol?: unknown;
        balance?: unknown;
        balanceFormatted?: unknown;
        usdValue?: unknown;
        logo?: unknown;
      }>;
      balanceUsd?: unknown;
      unclaimedUsd?: unknown;
      details?: {
        type?: string;
        isDebt?: boolean;
        lending?: { healthFactor?: unknown };
        liquidity?: { poolAddress?: unknown };
      };
    };
  }>;
}

interface MoralisPnlResult {
  total_count_of_trades?: number;
  total_trade_volume?: string;
  total_realized_profit_usd?: string;
  total_realized_profit_percentage?: number;
  total_buys?: number;
  total_sells?: number;
}

class MoralisRequestError extends Error {
  constructor(message: string, readonly status = 502) {
    super(message);
  }
}

const asString = (value: unknown): string | undefined =>
  typeof value === "string" && value.length ? value : undefined;

const asNumber = (value: unknown): number | undefined => {
  if (typeof value !== "string" && typeof value !== "number") return undefined;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
};

const fetchMoralis = async <T>(url: URL, apiKey: string): Promise<T> => {
  const result = await fetch(url, {
    headers: {
      accept: "application/json",
      "X-API-Key": apiKey,
    },
    signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
  });

  let body: unknown;
  try {
    body = await result.json();
  } catch {
    body = undefined;
  }

  if (!result.ok) {
    const errorBody = body as { message?: string; error?: string } | undefined;
    throw new MoralisRequestError(
      errorBody?.message ||
        errorBody?.error ||
        `Moralis responded with ${result.status}`,
      result.status === 401 || result.status === 403
        ? 401
        : result.status === 429
        ? 429
        : 502
    );
  }

  return body as T;
};

interface OptionalResult<T> {
  data?: T;
  error?: string;
}

const fetchOptionalMoralis = async <T>(
  url: URL,
  apiKey: string,
  feature: string
): Promise<OptionalResult<T>> => {
  try {
    return { data: await fetchMoralis<T>(url, apiKey) };
  } catch (error) {
    console.warn(`Moralis ${feature} request failed`, error);
    return {
      error:
        error instanceof MoralisRequestError
          ? error.message
          : `Unable to load ${feature}`,
    };
  }
};

const mapAsset = (
  asset: NonNullable<MoralisTokenResult["result"]>[number],
  index: number
): MoralisPortfolioAsset => {
  const chainId = asset.chainId || "unknown";
  const tokenAddress = asset.tokenAddress || undefined;
  return {
    id: `${chainId}-${tokenAddress || "native"}-${index}`,
    chainId,
    tokenAddress,
    name: asset.name || "Unknown asset",
    symbol: asset.symbol || "—",
    decimals: asset.decimals ?? 18,
    balance: asset.balance || "0",
    balanceRaw: asset.balanceRaw || "0",
    priceUsd: asNumber(asset.usdPrice),
    valueUsd: asNumber(asset.usdValue),
    changePercent24h: asNumber(asset.usdPrice24hrPercentChange),
    portfolioPercentage: asNumber(asset.portfolioPercentage),
    logo: asset.logo || undefined,
    nativeToken: asset.nativeToken ?? !tokenAddress,
    possibleSpam: asset.possibleSpam ?? false,
    verifiedContract: asset.verifiedContract ?? false,
    securityScore: asNumber(asset.securityScore),
  };
};

const inferPositionType = (
  item: NonNullable<MoralisDefiResult["result"]>[number]
): string => {
  const position = item.position;
  const details = position?.details;
  if (details?.isDebt) return "borrowed";
  if (position?.label) return position.label;
  if (details?.type) return details.type;
  if (details?.liquidity) return "liquidity";
  if (details?.lending) return "lending";

  const searchable = [
    item.protocolId,
    item.protocolName,
    ...(position?.tokens ?? []).flatMap(({ name, symbol }) => [name, symbol]),
  ]
    .filter((value): value is string => typeof value === "string")
    .join(" ")
    .toLowerCase();
  return searchable.includes("stak") ? "staked" : "defi";
};

const mapDefiPosition = (
  item: NonNullable<MoralisDefiResult["result"]>[number],
  index: number
): MoralisDefiPosition => {
  const position = item.position;
  const isDebt = position?.details?.isDebt ?? false;
  const rawValue = asNumber(position?.balanceUsd);
  const valueUsd =
    rawValue === undefined
      ? undefined
      : isDebt
      ? -Math.abs(rawValue)
      : rawValue;
  return {
    id: `${item.chainId || "unknown"}-${
      item.protocolId || "protocol"
    }-${index}`,
    chainId: item.chainId || "unknown",
    protocolId: item.protocolId || "unknown",
    protocolName: item.protocolName || "Unknown protocol",
    protocolLogo: asString(item.protocolLogo),
    protocolUrl: asString(item.protocolUrl),
    positionType: inferPositionType(item),
    valueUsd,
    unclaimedUsd: asNumber(position?.unclaimedUsd),
    isDebt,
    healthFactor: asNumber(position?.details?.lending?.healthFactor),
    tokens: (position?.tokens ?? []).map((token, tokenIndex) => ({
      address: asString(token.address),
      name: asString(token.name) || `Asset ${tokenIndex + 1}`,
      symbol: asString(token.symbol) || "—",
      balance:
        asString(token.balanceFormatted) || asString(token.balance) || "0",
      valueUsd: asNumber(token.usdValue),
      logo: asString(token.logo),
    })),
  };
};

const sumNumbers = (values: Array<number | undefined>): number | undefined => {
  const available = values.filter(
    (value): value is number => value !== undefined
  );
  return available.length
    ? available.reduce((total, value) => total + value, 0)
    : undefined;
};

const mapPnl = (
  results: Array<{ chainId: string; result: MoralisPnlResult }>
): MoralisPnlSummary => ({
  period: "all",
  chainIds: results.map(({ chainId }) => chainId),
  totalTrades: results.reduce(
    (total, { result }) => total + (result.total_count_of_trades ?? 0),
    0
  ),
  totalTradeVolumeUsd: sumNumbers(
    results.map(({ result }) => asNumber(result.total_trade_volume))
  ),
  realizedProfitUsd: sumNumbers(
    results.map(({ result }) => asNumber(result.total_realized_profit_usd))
  ),
  realizedProfitPercent:
    results.length === 1
      ? asNumber(results[0].result.total_realized_profit_percentage)
      : undefined,
  buys: results.reduce(
    (total, { result }) => total + (result.total_buys ?? 0),
    0
  ),
  sells: results.reduce(
    (total, { result }) => total + (result.total_sells ?? 0),
    0
  ),
});

export default async function handler(
  request: NextApiRequest,
  response: NextApiResponse<MoralisPortfolioResponse | { error: string }>
) {
  if (request.method !== "POST") {
    response.setHeader("Allow", "POST");
    return response.status(405).json({ error: "Method not allowed" });
  }

  const { address } = request.body as Partial<MoralisPortfolioRequest>;
  if (typeof address !== "string" || !/^0x[0-9a-fA-F]{40}$/.test(address)) {
    return response.status(400).json({ error: "Invalid portfolio request" });
  }

  const apiKey = process.env.MORALIS_TEST_KEY;
  if (!apiKey) {
    return response.status(503).json({ error: "Moralis is not configured" });
  }

  const encodedAddress = encodeURIComponent(address);
  const tokenUrl = new URL(
    `${MORALIS_UNIVERSAL_API_URL}/wallets/${encodedAddress}/tokens`
  );
  tokenUrl.searchParams.set("chains", "mainnets");
  tokenUrl.searchParams.set("limit", String(PAGE_SIZE));

  const defiUrl = new URL(
    `${MORALIS_UNIVERSAL_API_URL}/wallets/${encodedAddress}/defi/positions`
  );
  defiUrl.searchParams.set("limit", String(PAGE_SIZE));

  const pnlUrls = PNL_CHAINS.map(({ slug, chainId }) => {
    const url = new URL(
      `${MORALIS_EVM_API_URL}/wallets/${encodedAddress}/profitability/summary`
    );
    url.searchParams.set("chain", slug);
    url.searchParams.set("days", "all");
    return { chainId, slug, url };
  });

  try {
    const [tokenResult, defiAttempt, pnlAttempts] = await Promise.all([
      fetchMoralis<MoralisTokenResult>(tokenUrl, apiKey),
      fetchOptionalMoralis<MoralisDefiResult>(
        defiUrl,
        apiKey,
        "DeFi positions"
      ),
      Promise.all(
        pnlUrls.map(async ({ chainId, slug, url }) => ({
          chainId,
          slug,
          ...(await fetchOptionalMoralis<MoralisPnlResult>(
            url,
            apiKey,
            `${slug} P&L`
          )),
        }))
      ),
    ]);

    const defiResult = defiAttempt.data;
    const pnlResults = pnlAttempts.flatMap(({ chainId, data }) =>
      data ? [{ chainId, result: data }] : []
    );
    const pnlErrors = pnlAttempts.flatMap(({ slug, error }) =>
      error ? [`${slug}: ${error}`] : []
    );

    const assets = (tokenResult.result ?? [])
      .map(mapAsset)
      .sort(
        (first, second) => (second.valueUsd ?? -1) - (first.valueUsd ?? -1)
      );
    const defiPositions = (defiResult?.result ?? [])
      .map(mapDefiPosition)
      .sort(
        (first, second) => (second.valueUsd ?? -1) - (first.valueUsd ?? -1)
      );
    const optionalFeaturesUnavailable: Array<"defi" | "pnl"> = [];
    if (!defiResult) optionalFeaturesUnavailable.push("defi");
    if (!pnlResults.length) optionalFeaturesUnavailable.push("pnl");
    const optionalFeatureErrors: Partial<Record<"defi" | "pnl", string>> = {};
    if (defiAttempt.error) optionalFeatureErrors.defi = defiAttempt.error;
    if (pnlErrors.length) optionalFeatureErrors.pnl = pnlErrors.join(" · ");

    response.setHeader("Cache-Control", "private, no-store");
    return response.status(200).json({
      provider: "moralis",
      totalBalanceUsd: assets.reduce(
        (total, asset) =>
          total + (asset.possibleSpam ? 0 : asset.valueUsd ?? 0),
        0
      ),
      defiValueUsd: defiPositions.reduce(
        (total, position) => total + (position.valueUsd ?? 0),
        0
      ),
      assets,
      defiPositions,
      pnl: pnlResults.length ? mapPnl(pnlResults) : undefined,
      failedChains: Array.from(
        new Set([
          ...(tokenResult.meta?.failedChains ?? []),
          ...(defiResult?.meta?.failedChains ?? []),
        ])
      ),
      unsupportedChains: Array.from(
        new Set([
          ...(tokenResult.meta?.unsupportedChains ?? []),
          ...(defiResult?.meta?.unsupportedChains ?? []),
        ])
      ),
      tokenResultLimited: Boolean(tokenResult.cursor),
      defiResultLimited: Boolean(defiResult?.cursor),
      optionalFeaturesUnavailable,
      optionalFeatureErrors,
    });
  } catch (error) {
    if (error instanceof MoralisRequestError) {
      return response.status(error.status).json({ error: error.message });
    }
    console.error("Moralis portfolio request failed", error);
    return response
      .status(502)
      .json({ error: "Moralis portfolio request failed" });
  }
}
