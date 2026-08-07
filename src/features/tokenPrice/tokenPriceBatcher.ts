const CMS_PRICES_URL = "https://cms.superfluid.pro/prices";
const BATCH_DELAY_MS = 50;
const MAX_BATCH_SIZE = 50;

export interface CmsPriceResult {
  chainId: number;
  address: string;
  symbol: string | null;
  priceUsd: string | null;
  fetchedAt: string;
  method: "classic" | "onchain" | "none";
}

interface PendingCallback {
  resolve: (value: CmsPriceResult) => void;
  reject: (error: Error) => void;
}

interface PendingBatch {
  entries: Map<string, PendingCallback[]>;
  timer: ReturnType<typeof setTimeout>;
}

const pendingBatches = new Map<number, PendingBatch>();

async function flush(chainId: number): Promise<void> {
  const batch = pendingBatches.get(chainId);
  if (!batch) return;
  pendingBatches.delete(chainId);

  const allAddresses = Array.from(batch.entries.keys());

  // Chunk into groups of MAX_BATCH_SIZE
  const chunks: string[][] = [];
  for (let i = 0; i < allAddresses.length; i += MAX_BATCH_SIZE) {
    chunks.push(allAddresses.slice(i, i + MAX_BATCH_SIZE));
  }

  try {
    const chunkResults = await Promise.all(
      chunks.map(async (addresses) => {
        const response = await fetch(`${CMS_PRICES_URL}/${chainId}/current`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ addresses }),
        });
        if (!response.ok) {
          throw new Error(`CMS batch request failed: ${response.status}`);
        }
        return response.json() as Promise<CmsPriceResult[]>;
      })
    );

    const results = chunkResults.flat();
    const resultMap = new Map(
      results.map((r) => [r.address.toLowerCase(), r])
    );

    for (const [address, callbacks] of batch.entries) {
      const result = resultMap.get(address);
      if (result && result.priceUsd != null && result.method !== "none") {
        for (const cb of callbacks) cb.resolve(result);
      } else {
        const error = new Error(`No price available for ${address}`);
        for (const cb of callbacks) cb.reject(error);
      }
    }
  } catch (error) {
    const err =
      error instanceof Error ? error : new Error("Batch fetch failed");
    for (const [, callbacks] of batch.entries) {
      for (const cb of callbacks) cb.reject(err);
    }
  }
}

export function fetchTokenPriceBatched(
  chainId: number,
  address: string
): Promise<CmsPriceResult> {
  const normalizedAddress = address.toLowerCase();

  return new Promise<CmsPriceResult>((resolve, reject) => {
    let batch = pendingBatches.get(chainId);
    if (!batch) {
      batch = {
        entries: new Map(),
        timer: setTimeout(() => flush(chainId), BATCH_DELAY_MS),
      };
      pendingBatches.set(chainId, batch);
    }

    const callbacks = batch.entries.get(normalizedAddress);
    if (callbacks) {
      callbacks.push({ resolve, reject });
    } else {
      batch.entries.set(normalizedAddress, [{ resolve, reject }]);
    }
  });
}
