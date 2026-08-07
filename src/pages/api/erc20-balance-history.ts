import type { NextApiRequest, NextApiResponse } from "next";
import {
  ERC20BalanceHistoryRequest,
  ERC20BalanceHistoryResponse,
} from "../../features/portfolio/erc20BalanceHistory";

const REQUEST_TIMEOUT_MS = 30_000;
const MAX_SNAPSHOT_BLOCKS = 24;

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

interface JsonRpcBalanceResponse {
  id: number;
  result?: string;
  error?: { message?: string };
}

interface JsonRpcBatchError {
  error?: { message?: string };
}

class BalanceHistoryError extends Error {}

const balanceOfCallData = (address: string) =>
  `0x70a08231${address.toLowerCase().slice(2).padStart(64, "0")}`;

const parseRpcBalance = (value: string | undefined): string | undefined => {
  if (!value || value === "0x") return value === "0x" ? "0" : undefined;
  try {
    return BigInt(value).toString();
  } catch {
    return undefined;
  }
};

export default async function handler(
  request: NextApiRequest,
  response: NextApiResponse<ERC20BalanceHistoryResponse | { error: string }>
) {
  if (request.method !== "POST") {
    response.setHeader("Allow", "POST");
    return response.status(405).json({ error: "Method not allowed" });
  }
  const apiKey = process.env.ALCHEMY_TEST_KEY;
  if (!apiKey) {
    return response.status(503).json({ error: "Alchemy is not configured" });
  }
  const { address, tokenAddress, chainId, samples } =
    request.body as Partial<ERC20BalanceHistoryRequest>;
  if (
    typeof address !== "string" ||
    !/^0x[0-9a-fA-F]{40}$/.test(address) ||
    typeof tokenAddress !== "string" ||
    !/^0x[0-9a-fA-F]{40}$/.test(tokenAddress) ||
    !Number.isInteger(chainId) ||
    !alchemyNetworkByChainId[chainId!] ||
    !Array.isArray(samples) ||
    samples.length > MAX_SNAPSHOT_BLOCKS ||
    samples.some(
      (sample) =>
        !sample ||
        !/^0x[0-9a-fA-F]+$/.test(sample.blockNumber) ||
        Number.isNaN(Date.parse(sample.timestamp))
    )
  ) {
    return response
      .status(400)
      .json({ error: "Invalid balance-history request" });
  }

  const endpoint = `https://${
    alchemyNetworkByChainId[chainId!]
  }.g.alchemy.com/v2/${apiKey}`;
  try {
    const timestampsByBlock = new Map(
      samples.map(({ blockNumber, timestamp }) => [blockNumber, timestamp])
    );
    const blocks = [...timestampsByBlock.keys()]
      .sort((first, second) =>
        BigInt(first) > BigInt(second)
          ? -1
          : BigInt(first) < BigInt(second)
          ? 1
          : 0
      )
      .slice(0, MAX_SNAPSHOT_BLOCKS);
    const blockTags = [...blocks, "latest"];
    const rpcResult = await fetch(endpoint, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(
        blockTags.map((block, index) => ({
          jsonrpc: "2.0",
          id: index,
          method: "eth_call",
          params: [
            { to: tokenAddress, data: balanceOfCallData(address) },
            block,
          ],
        }))
      ),
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    });
    const rpcBody = (await rpcResult.json()) as
      | JsonRpcBalanceResponse[]
      | JsonRpcBatchError;
    if (!rpcResult.ok || !Array.isArray(rpcBody)) {
      throw new BalanceHistoryError(
        !Array.isArray(rpcBody) && rpcBody.error?.message
          ? rpcBody.error.message
          : `Alchemy balance snapshots responded with ${rpcResult.status}`
      );
    }
    const firstRpcError = rpcBody.find(({ error }) => error)?.error?.message;
    if (firstRpcError) {
      throw new BalanceHistoryError(firstRpcError);
    }
    const resultById = new Map(rpcBody.map((item) => [item.id, item]));
    const now = new Date().toISOString();
    const points = blockTags.flatMap((block, index) => {
      const balance = parseRpcBalance(resultById.get(index)?.result);
      const timestamp = block === "latest" ? now : timestampsByBlock.get(block);
      return balance !== undefined && timestamp
        ? [{ blockNumber: block, timestamp, balance }]
        : [];
    });

    response.setHeader("Cache-Control", "private, max-age=60");
    return response.status(200).json({
      points: points.sort(
        (first, second) =>
          Date.parse(first.timestamp) - Date.parse(second.timestamp)
      ),
      sampledTransferBlocks: blocks.length,
    });
  } catch (error) {
    const message =
      error instanceof BalanceHistoryError
        ? error.message
        : "Unable to load ERC-20 balance history";
    return response.status(502).json({ error: message });
  }
}
