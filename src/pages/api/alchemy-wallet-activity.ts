import type { NextApiRequest, NextApiResponse } from "next";
import {
  AlchemyActivityItem,
  AlchemyActivityRequest,
  AlchemyActivityResponse,
} from "../../features/portfolio/alchemyPortfolio";

const MAX_NETWORKS = 3;
const MAX_TRANSFERS_PER_DIRECTION = "0x19";
const REQUEST_TIMEOUT_MS = 30_000;

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

interface AlchemyTransfer {
  uniqueId?: string;
  hash?: string;
  blockNum?: string;
  from?: string;
  to?: string;
  value?: number | string | null;
  asset?: string | null;
  category?: string;
  erc721TokenId?: string | null;
  erc1155Metadata?: Array<{ tokenId?: string; value?: string }> | null;
  metadata?: { blockTimestamp?: string };
  rawContract?: {
    address?: string | null;
  };
}

interface AlchemyTransferResponse {
  result?: { transfers?: AlchemyTransfer[]; pageKey?: string };
  error?: { message?: string };
}

class AlchemyActivityError extends Error {}

const fetchDirection = async ({
  apiKey,
  network,
  address,
  direction,
}: {
  apiKey: string;
  network: string;
  address: string;
  direction: "incoming" | "outgoing";
}): Promise<{ transfers: AlchemyTransfer[]; truncated: boolean }> => {
  const result = await fetch(`https://${network}.g.alchemy.com/v2/${apiKey}`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      jsonrpc: "2.0",
      id: 1,
      method: "alchemy_getAssetTransfers",
      params: [
        {
          fromBlock: "0x0",
          toBlock: "latest",
          category: ["external", "erc20", "erc721", "erc1155"],
          excludeZeroValue: false,
          withMetadata: true,
          order: "desc",
          maxCount: MAX_TRANSFERS_PER_DIRECTION,
          ...(direction === "incoming"
            ? { toAddress: address }
            : { fromAddress: address }),
        },
      ],
    }),
    signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
  });
  const body = (await result.json()) as AlchemyTransferResponse;
  if (!result.ok || body.error) {
    throw new AlchemyActivityError(
      body.error?.message || `Alchemy responded with ${result.status}`
    );
  }
  return {
    transfers: body.result?.transfers ?? [],
    truncated: Boolean(body.result?.pageKey),
  };
};

const mapTransfer = ({
  transfer,
  chainId,
  account,
}: {
  transfer: AlchemyTransfer;
  chainId: number;
  account: string;
}): AlchemyActivityItem | undefined => {
  const from = transfer.from?.toLowerCase();
  const to = transfer.to?.toLowerCase();
  if (
    !transfer.hash ||
    !transfer.blockNum ||
    !from ||
    !to ||
    !transfer.metadata?.blockTimestamp
  ) {
    return undefined;
  }
  const lowerAccount = account.toLowerCase();
  const direction =
    from === lowerAccount && to === lowerAccount
      ? "self"
      : from === lowerAccount
      ? "sent"
      : "received";
  const tokenId =
    transfer.erc721TokenId ||
    transfer.erc1155Metadata?.[0]?.tokenId ||
    undefined;

  return {
    id:
      transfer.uniqueId ||
      `${chainId}-${transfer.hash}-${transfer.category || "transfer"}-${
        tokenId || transfer.rawContract?.address || "native"
      }`,
    chainId,
    transactionHash: transfer.hash,
    blockNumber: transfer.blockNum,
    timestamp: transfer.metadata.blockTimestamp,
    from,
    to,
    direction,
    category: transfer.category || "transfer",
    asset:
      transfer.asset || (transfer.category === "external" ? "Native" : "Token"),
    value:
      transfer.value === null || transfer.value === undefined
        ? undefined
        : String(transfer.value),
    tokenAddress: transfer.rawContract?.address?.toLowerCase() || undefined,
    tokenId,
  };
};

export default async function handler(
  request: NextApiRequest,
  response: NextApiResponse<AlchemyActivityResponse | { error: string }>
) {
  if (request.method !== "POST") {
    response.setHeader("Allow", "POST");
    return response.status(405).json({ error: "Method not allowed" });
  }
  const apiKey = process.env.ALCHEMY_TEST_KEY;
  if (!apiKey) {
    return response.status(503).json({ error: "Alchemy is not configured" });
  }
  const { address, chainIds } = request.body as Partial<AlchemyActivityRequest>;
  if (
    typeof address !== "string" ||
    !/^0x[0-9a-fA-F]{40}$/.test(address) ||
    !Array.isArray(chainIds) ||
    chainIds.length === 0 ||
    chainIds.length > MAX_NETWORKS ||
    chainIds.some((chainId) => !alchemyNetworkByChainId[chainId])
  ) {
    return response.status(400).json({ error: "Invalid activity request" });
  }

  try {
    const results = await Promise.all(
      chainIds.flatMap((chainId) => {
        const network = alchemyNetworkByChainId[chainId];
        return (["incoming", "outgoing"] as const).map(async (direction) => ({
          chainId,
          ...(await fetchDirection({ apiKey, network, address, direction })),
        }));
      })
    );
    const byId = new Map<string, AlchemyActivityItem>();
    results.forEach(({ chainId, transfers }) =>
      transfers.forEach((transfer) => {
        const mapped = mapTransfer({ transfer, chainId, account: address });
        if (mapped) byId.set(mapped.id, mapped);
      })
    );
    response.setHeader("Cache-Control", "private, max-age=30");
    return response.status(200).json({
      activity: [...byId.values()].sort(
        (first, second) =>
          Date.parse(second.timestamp) - Date.parse(first.timestamp)
      ),
      truncated: results.some(({ truncated }) => truncated),
    });
  } catch (error) {
    const message =
      error instanceof AlchemyActivityError
        ? error.message
        : "Unable to load Alchemy activity";
    return response.status(502).json({ error: message });
  }
}
