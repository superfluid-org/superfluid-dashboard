import type { NextApiRequest, NextApiResponse } from "next";
import {
  ERC20TransferHistoryCursor,
  ERC20TransferHistoryItem,
  ERC20TransferHistoryRequest,
  ERC20TransferHistoryResponse,
} from "../../features/portfolio/erc20TransferHistory";

const MAX_TRANSFERS_PER_DIRECTION = "0x19";

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
  43113: "avax-fuji",
  534352: "scroll-mainnet",
  84532: "base-sepolia",
  534351: "scroll-sepolia",
  11155111: "eth-sepolia",
  11155420: "opt-sepolia",
};

interface AlchemyTransfer {
  uniqueId?: string;
  hash?: string;
  blockNum?: string;
  from?: string;
  to?: string;
  metadata?: {
    blockTimestamp?: string;
  };
  rawContract?: {
    value?: string | null;
    decimal?: string | null;
  };
}

interface AlchemyTransferResponse {
  result?: {
    transfers?: AlchemyTransfer[];
    pageKey?: string;
  };
  error?: {
    message?: string;
  };
}

interface DirectionResult {
  transfers: ERC20TransferHistoryItem[];
  pageKey: string | null;
}

const isAddress = (value: unknown): value is string =>
  typeof value === "string" && /^0x[0-9a-fA-F]{40}$/.test(value);

const isCursor = (value: unknown): value is ERC20TransferHistoryCursor => {
  if (!value || typeof value !== "object") return false;
  const cursor = value as Partial<ERC20TransferHistoryCursor>;
  return [cursor.incoming, cursor.outgoing].every(
    (pageKey) =>
      pageKey === null ||
      (typeof pageKey === "string" && pageKey.length > 0 && pageKey.length < 500)
  );
};

const mapTransfer = (
  transfer: AlchemyTransfer
): ERC20TransferHistoryItem | null => {
  if (
    !transfer.hash ||
    !transfer.blockNum ||
    !transfer.from ||
    !transfer.to ||
    !transfer.metadata?.blockTimestamp
  ) {
    return null;
  }

  const rawValue = transfer.rawContract?.value || "0x0";
  const rawDecimals = transfer.rawContract?.decimal;
  const parsedDecimals = rawDecimals
    ? Number.parseInt(rawDecimals, 16)
    : undefined;

  return {
    id:
      transfer.uniqueId ||
      `${transfer.hash}-${transfer.blockNum}-${transfer.from}-${transfer.to}-${rawValue}`,
    transactionHash: transfer.hash,
    blockNumber: transfer.blockNum,
    timestamp: transfer.metadata.blockTimestamp,
    from: transfer.from.toLowerCase(),
    to: transfer.to.toLowerCase(),
    rawValue,
    decimals:
      parsedDecimals !== undefined && Number.isFinite(parsedDecimals)
        ? parsedDecimals
        : undefined,
  };
};

const fetchTransfers = async ({
  apiKey,
  network,
  address,
  tokenAddress,
  direction,
  pageKey,
}: {
  apiKey: string;
  network: string;
  address: string;
  tokenAddress: string;
  direction: "incoming" | "outgoing";
  pageKey?: string;
}): Promise<DirectionResult> => {
  const response = await fetch(
    `https://${network}.g.alchemy.com/v2/${apiKey}`,
    {
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
            category: ["erc20"],
            contractAddresses: [tokenAddress],
            excludeZeroValue: false,
            withMetadata: true,
            order: "desc",
            maxCount: MAX_TRANSFERS_PER_DIRECTION,
            ...(direction === "incoming"
              ? { toAddress: address }
              : { fromAddress: address }),
            ...(pageKey ? { pageKey } : {}),
          },
        ],
      }),
    }
  );

  const body = (await response.json()) as AlchemyTransferResponse;
  if (!response.ok || body.error) {
    throw new Error(
      body.error?.message || `Alchemy responded with ${response.status}`
    );
  }

  return {
    transfers: (body.result?.transfers ?? []).flatMap((transfer) => {
      const mapped = mapTransfer(transfer);
      return mapped ? [mapped] : [];
    }),
    pageKey: body.result?.pageKey || null,
  };
};

export default async function handler(
  request: NextApiRequest,
  response: NextApiResponse<
    ERC20TransferHistoryResponse | { error: string }
  >
) {
  if (request.method !== "POST") {
    response.setHeader("Allow", "POST");
    return response.status(405).json({ error: "Method not allowed" });
  }

  const apiKey = process.env.ALCHEMY_TEST_KEY;
  if (!apiKey) {
    return response.status(503).json({ error: "Alchemy is not configured" });
  }

  const { address, tokenAddress, chainId, cursor } =
    request.body as Partial<ERC20TransferHistoryRequest>;
  if (
    !isAddress(address) ||
    !isAddress(tokenAddress) ||
    !Number.isInteger(chainId) ||
    (cursor !== undefined && !isCursor(cursor))
  ) {
    return response.status(400).json({ error: "Invalid transfer-history request" });
  }

  const network = alchemyNetworkByChainId[chainId!];
  if (!network) {
    return response.status(400).json({ error: "Network is not supported by Alchemy" });
  }

  try {
    const shouldFetchIncoming = cursor === undefined || cursor.incoming !== null;
    const shouldFetchOutgoing = cursor === undefined || cursor.outgoing !== null;
    const [incoming, outgoing] = await Promise.all([
      shouldFetchIncoming
        ? fetchTransfers({
            apiKey,
            network,
            address,
            tokenAddress,
            direction: "incoming",
            pageKey: cursor?.incoming || undefined,
          })
        : Promise.resolve<DirectionResult>({ transfers: [], pageKey: null }),
      shouldFetchOutgoing
        ? fetchTransfers({
            apiKey,
            network,
            address,
            tokenAddress,
            direction: "outgoing",
            pageKey: cursor?.outgoing || undefined,
          })
        : Promise.resolve<DirectionResult>({ transfers: [], pageKey: null }),
    ]);

    const transfersById = new Map<string, ERC20TransferHistoryItem>();
    [...incoming.transfers, ...outgoing.transfers].forEach((transfer) =>
      transfersById.set(transfer.id, transfer)
    );
    const transfers = [...transfersById.values()].sort(
      (first, second) =>
        Date.parse(second.timestamp) - Date.parse(first.timestamp)
    );
    const nextCursor = {
      incoming: incoming.pageKey,
      outgoing: outgoing.pageKey,
    };

    response.setHeader("Cache-Control", "private, no-store");
    return response.status(200).json({
      transfers,
      cursor: nextCursor,
      hasMore: Boolean(nextCursor.incoming || nextCursor.outgoing),
    });
  } catch (error) {
    console.error("Alchemy ERC-20 transfer-history request failed", error);
    return response.status(502).json({ error: "Unable to load transfer history" });
  }
}
