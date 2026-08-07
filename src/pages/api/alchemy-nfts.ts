import type { NextApiRequest, NextApiResponse } from "next";
import {
  AlchemyNftItem,
  AlchemyNftRequest,
  AlchemyNftResponse,
} from "../../features/portfolio/alchemyPortfolio";

const ALCHEMY_PORTFOLIO_URL = "https://api.g.alchemy.com/data/v1";
const MAX_NETWORKS = 10;
const PAGE_SIZE = 40;
const REQUEST_TIMEOUT_MS = 30_000;

export const config = {
  maxDuration: 60,
};

const alchemyNetworkByChainId: Record<number, string> = {
  1: "eth-mainnet",
  10: "opt-mainnet",
  56: "bnb-mainnet",
  100: "gnosis-mainnet",
  137: "polygon-mainnet",
  8453: "base-mainnet",
  42161: "arb-mainnet",
  42220: "celo-mainnet",
  43114: "avax-mainnet",
  534352: "scroll-mainnet",
};
interface AlchemyNftBody {
  data?: {
    ownedNfts?: Array<{
      network?: string;
      address?: string;
      tokenId?: string;
      tokenType?: string;
      name?: string;
      description?: string;
      image?: { thumbnailUrl?: string; cachedUrl?: string; pngUrl?: string };
      acquiredAt?: { blockTimestamp?: string };
      contract?: {
        address?: string;
        isSpam?: string | boolean;
        openseaMetadata?: {
          floorPrice?: number;
          collectionName?: string;
          imageUrl?: string;
        };
      };
      collection?: { name?: string };
    }>;
    totalCount?: number;
    pageKey?: string;
  };
  error?: { message?: string };
}

class AlchemyNftError extends Error {}

const fetchNetwork = async ({
  address,
  apiKey,
  chainId,
}: {
  address: string;
  apiKey: string;
  chainId: number;
}) => {
  const result = await fetch(
    `${ALCHEMY_PORTFOLIO_URL}/${apiKey}/assets/nfts/by-address`,
    {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        addresses: [
          {
            address,
            networks: [alchemyNetworkByChainId[chainId]],
            excludeFilters: ["SPAM"],
            spamConfidenceLevel: "VERY_HIGH",
          },
        ],
        withMetadata: true,
        pageSize: PAGE_SIZE,
        orderBy: "transferTime",
        sortOrder: "desc",
      }),
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    }
  );
  const body = (await result.json()) as AlchemyNftBody;
  if (!result.ok || body.error) {
    throw new AlchemyNftError(
      body.error?.message || `Alchemy responded with ${result.status}`
    );
  }
  return body.data;
};

export default async function handler(
  request: NextApiRequest,
  response: NextApiResponse<AlchemyNftResponse | { error: string }>
) {
  if (request.method !== "POST") {
    response.setHeader("Allow", "POST");
    return response.status(405).json({ error: "Method not allowed" });
  }
  const apiKey = process.env.ALCHEMY_TEST_KEY;
  if (!apiKey) {
    return response.status(503).json({ error: "Alchemy is not configured" });
  }
  const { address, chainIds } = request.body as Partial<AlchemyNftRequest>;
  if (
    typeof address !== "string" ||
    !/^0x[0-9a-fA-F]{40}$/.test(address) ||
    !Array.isArray(chainIds) ||
    chainIds.length === 0 ||
    chainIds.length > MAX_NETWORKS ||
    chainIds.some((chainId) => !alchemyNetworkByChainId[chainId])
  ) {
    return response.status(400).json({ error: "Invalid NFT request" });
  }

  const results = await Promise.all(
    chainIds.map(async (chainId) => {
      try {
        return {
          status: "fulfilled" as const,
          chainId,
          data: await fetchNetwork({ address, apiKey, chainId }),
        };
      } catch (error) {
        return {
          status: "rejected" as const,
          chainId,
          message:
            error instanceof Error
              ? error.message
              : "Alchemy NFT request failed",
        };
      }
    })
  );

  const nfts = results.flatMap((result) => {
    if (result.status !== "fulfilled") return [];
    return (result.data?.ownedNfts ?? []).flatMap((nft) => {
      const contractAddress = nft.contract?.address || nft.address;
      if (!contractAddress || !nft.tokenId) return [];
      const item: AlchemyNftItem = {
        id: `${result.chainId}-${contractAddress.toLowerCase()}-${nft.tokenId}`,
        chainId: result.chainId,
        contractAddress: contractAddress.toLowerCase(),
        tokenId: nft.tokenId,
        tokenType: nft.tokenType || "NFT",
        name: nft.name || `Token #${nft.tokenId}`,
        description: nft.description || undefined,
        imageUrl:
          nft.image?.thumbnailUrl ||
          nft.image?.cachedUrl ||
          nft.image?.pngUrl ||
          undefined,
        collectionName:
          nft.collection?.name ||
          nft.contract?.openseaMetadata?.collectionName ||
          undefined,
        collectionImageUrl:
          nft.contract?.openseaMetadata?.imageUrl || undefined,
        acquiredAt: nft.acquiredAt?.blockTimestamp || undefined,
        floorPrice: nft.contract?.openseaMetadata?.floorPrice,
        isSpam:
          nft.contract?.isSpam === true || nft.contract?.isSpam === "true",
      };
      return [item];
    });
  });

  response.setHeader("Cache-Control", "private, max-age=60");
  return response.status(200).json({
    nfts,
    totalCount: results.reduce(
      (total, result) =>
        result.status === "fulfilled"
          ? total + (result.data?.totalCount ?? 0)
          : total,
      0
    ),
    truncated: results.some(
      (result) => result.status === "fulfilled" && Boolean(result.data?.pageKey)
    ),
    failures: results.flatMap((result) =>
      result.status === "rejected"
        ? [{ chainId: result.chainId, message: result.message }]
        : []
    ),
  });
}
