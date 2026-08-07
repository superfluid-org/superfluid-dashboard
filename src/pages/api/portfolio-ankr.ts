import type { NextApiRequest, NextApiResponse } from "next";
import {
  AnkrPortfolioAsset,
  AnkrPortfolioNft,
  AnkrPortfolioRequest,
  AnkrPortfolioResponse,
} from "../../features/portfolio/ankrPortfolio";

const ANKR_MULTICHAIN_URL = "https://rpc.ankr.com/multichain";
const REQUEST_TIMEOUT_MS = 30_000;
const NFT_PREVIEW_SIZE = 20;
const SUPPORTED_CHAINS = [
  "arbitrum",
  "avalanche",
  "base",
  "bsc",
  "eth",
  "gnosis",
  "optimism",
  "polygon",
  "scroll",
];

export const config = {
  maxDuration: 60,
};

interface AnkrJsonRpcResponse<T> {
  result?: T;
  error?: {
    code?: number;
    message?: string;
    data?: string;
  };
}

interface AnkrBalanceResult {
  assets?: Array<{
    balance?: string;
    balanceRawInteger?: string;
    balanceUsd?: string;
    blockchain?: string;
    contractAddress?: string;
    thumbnail?: string;
    tokenDecimals?: number;
    tokenName?: string;
    tokenPrice?: string;
    tokenSymbol?: string;
    tokenType?: string;
  }>;
  nextPageToken?: string;
  totalBalanceUsd?: string;
}

interface AnkrNftResult {
  assets?: Array<{
    blockchain?: string;
    collectionName?: string;
    contractAddress?: string;
    contractType?: string | number;
    imageUrl?: string;
    name?: string;
    quantity?: string;
    symbol?: string;
    tokenId?: string;
  }>;
  nextPageToken?: string;
}

interface AnkrInteractionsResult {
  blockchains?: string[];
}

class AnkrRequestError extends Error {
  constructor(message: string, readonly status = 502) {
    super(message);
  }
}

const parseNumber = (value: unknown): number | undefined => {
  if (typeof value !== "string" && typeof value !== "number") return undefined;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
};

const buildEndpoint = (): string | undefined => {
  const configuredUrl = process.env.ANKR_RPC_URL;
  if (configuredUrl) return configuredUrl;

  const apiKey = process.env.ANKR_TEST_KEY;
  return apiKey
    ? `${ANKR_MULTICHAIN_URL}/${encodeURIComponent(apiKey)}`
    : undefined;
};

const callAnkr = async <T>({
  endpoint,
  method,
  params,
}: {
  endpoint: string;
  method: string;
  params: Record<string, unknown>;
}): Promise<T> => {
  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      accept: "application/json",
      "content-type": "application/json",
    },
    body: JSON.stringify({ jsonrpc: "2.0", id: 1, method, params }),
    signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
  });

  let body: AnkrJsonRpcResponse<T> | undefined;
  try {
    body = (await response.json()) as AnkrJsonRpcResponse<T>;
  } catch {
    // The status-aware error below is more useful than a JSON parse exception.
  }

  if (!response.ok || body?.error || body?.result === undefined) {
    throw new AnkrRequestError(
      body?.error?.message || `Ankr responded with ${response.status}`,
      response.status === 401 || response.status === 403
        ? 401
        : response.status === 429
        ? 429
        : 502
    );
  }
  return body.result;
};

const mapAsset = (
  asset: NonNullable<AnkrBalanceResult["assets"]>[number],
  index: number
): AnkrPortfolioAsset => {
  const blockchain = asset.blockchain || "unknown";
  const tokenAddress = asset.contractAddress || undefined;
  const symbol = asset.tokenSymbol || "—";
  return {
    id: `${blockchain}-${tokenAddress || "native"}-${index}`,
    blockchain,
    tokenAddress,
    name: asset.tokenName || "Unknown asset",
    symbol,
    tokenType: asset.tokenType || (tokenAddress ? "ERC20" : "NATIVE"),
    decimals: asset.tokenDecimals ?? 18,
    balance: asset.balance || "0",
    balanceRaw: asset.balanceRawInteger || "0",
    priceUsd: parseNumber(asset.tokenPrice),
    valueUsd: parseNumber(asset.balanceUsd),
    thumbnail: asset.thumbnail || undefined,
  };
};

const mapNft = (
  nft: NonNullable<AnkrNftResult["assets"]>[number],
  index: number
): AnkrPortfolioNft => ({
  id: `${nft.blockchain || "unknown"}-${nft.contractAddress || "unknown"}-${
    nft.tokenId || index
  }`,
  blockchain: nft.blockchain || "unknown",
  contractAddress: nft.contractAddress || "",
  contractType: String(nft.contractType || "NFT"),
  collectionName: nft.collectionName || undefined,
  name: nft.name || nft.collectionName || `NFT #${nft.tokenId || index}`,
  symbol: nft.symbol || undefined,
  tokenId: nft.tokenId || String(index),
  quantity: nft.quantity || undefined,
  imageUrl: nft.imageUrl || undefined,
});

export default async function handler(
  request: NextApiRequest,
  response: NextApiResponse<AnkrPortfolioResponse | { error: string }>
) {
  if (request.method !== "POST") {
    response.setHeader("Allow", "POST");
    return response.status(405).json({ error: "Method not allowed" });
  }

  const endpoint = buildEndpoint();
  if (!endpoint) {
    return response.status(503).json({ error: "Ankr is not configured" });
  }

  const { address } = request.body as Partial<AnkrPortfolioRequest>;
  if (typeof address !== "string" || !/^0x[0-9a-fA-F]{40}$/.test(address)) {
    return response.status(400).json({ error: "Invalid portfolio request" });
  }

  try {
    const [balanceResult, nftResult, interactionsResult] = await Promise.all([
      callAnkr<AnkrBalanceResult>({
        endpoint,
        method: "ankr_getAccountBalance",
        params: {
          blockchain: SUPPORTED_CHAINS,
          walletAddress: address,
          nativeFirst: true,
          onlyWhitelisted: true,
        },
      }),
      callAnkr<AnkrNftResult>({
        endpoint,
        method: "ankr_getNFTsByOwner",
        params: {
          blockchain: SUPPORTED_CHAINS,
          walletAddress: address,
          pageSize: NFT_PREVIEW_SIZE,
        },
      }).catch((error) => {
        console.warn("Ankr NFT preview request failed", error);
        return undefined;
      }),
      callAnkr<AnkrInteractionsResult>({
        endpoint,
        method: "ankr_getInteractions",
        params: { address },
      }).catch((error) => {
        console.warn("Ankr interaction request failed", error);
        return undefined;
      }),
    ]);

    const optionalFeaturesUnavailable: Array<"nfts" | "interactions"> = [];
    if (!nftResult) optionalFeaturesUnavailable.push("nfts");
    if (!interactionsResult) optionalFeaturesUnavailable.push("interactions");

    response.setHeader("Cache-Control", "private, no-store");
    return response.status(200).json({
      provider: "ankr",
      totalBalanceUsd: parseNumber(balanceResult.totalBalanceUsd) ?? 0,
      assets: (balanceResult.assets ?? [])
        .map(mapAsset)
        .sort(
          (first, second) => (second.valueUsd ?? -1) - (first.valueUsd ?? -1)
        ),
      nfts: (nftResult?.assets ?? []).map(mapNft),
      nftResultLimited: Boolean(nftResult?.nextPageToken),
      interactions: [...new Set(interactionsResult?.blockchains ?? [])],
      optionalFeaturesUnavailable,
    });
  } catch (error) {
    console.error("Ankr portfolio request failed", error);
    if (error instanceof AnkrRequestError) {
      return response.status(error.status).json({ error: error.message });
    }
    return response.status(502).json({ error: "Unable to reach Ankr" });
  }
}
