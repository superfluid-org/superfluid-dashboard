import { type Address, type Hex, hexToBigInt } from 'viem';

/** Raw JSON-RPC transaction fields from wagmi / viem (field names vary). */
export type RpcTransactionInput = {
  from: Address;
  to?: Address;
  gas?: Hex;
  gasLimit?: Hex;
  gasPrice?: Hex;
  maxFeePerGas?: Hex;
  maxPriorityFeePerGas?: Hex;
  nonce?: Hex | number;
  value?: Hex;
  chainId?: Hex | number;
  data?: Hex;
  type?: Hex | number;
};

export type NormalizedEip1559Transaction = {
  from: Address;
  to: Address;
  gas: bigint;
  maxFeePerGas: bigint;
  maxPriorityFeePerGas: bigint;
  nonce: number;
  value: bigint;
  chainId: number;
  data?: Hex;
};

const SUPERFLUID_RPC_BY_CHAIN_ID: Record<number, string> = {
  1: 'https://rpc-endpoints.superfluid.dev/eth-mainnet',
  10: 'https://rpc-endpoints.superfluid.dev/optimism-mainnet',
  56: 'https://rpc-endpoints.superfluid.dev/bsc-mainnet',
  100: 'https://rpc-endpoints.superfluid.dev/xdai-mainnet',
  137: 'https://rpc-endpoints.superfluid.dev/polygon-mainnet',
  8453: 'https://rpc-endpoints.superfluid.dev/base-mainnet',
  42161: 'https://rpc-endpoints.superfluid.dev/arbitrum-one',
  43113: 'https://rpc-endpoints.superfluid.dev/avalanche-fuji',
  43114: 'https://rpc-endpoints.superfluid.dev/avalanche-c',
  11155111: 'https://rpc-endpoints.superfluid.dev/eth-sepolia',
  11155420: 'https://rpc-endpoints.superfluid.dev/optimism-sepolia',
  84532: 'https://rpc-endpoints.superfluid.dev/base-sepolia',
};

export function resolveRpcUrl(chainId: number): string | undefined {
  return SUPERFLUID_RPC_BY_CHAIN_ID[chainId];
}

function toHexBigInt(value: Hex | number | undefined, field: string): bigint | undefined {
  if (value === undefined || value === null) return undefined;
  if (typeof value === 'number') return BigInt(value);
  if (typeof value === 'string' && value.startsWith('0x')) return hexToBigInt(value as Hex);
  throw new Error(`Invalid ${field}: expected hex or number`);
}

function requireHexBigInt(
  value: Hex | number | undefined,
  field: string
): bigint {
  const parsed = toHexBigInt(value, field);
  if (parsed === undefined) {
    throw new Error(`Transaction is missing ${field}`);
  }
  return parsed;
}

/** Read gas from `gas` or legacy `gasLimit` (wagmi/viem use both). */
export function resolveGasLimit(transaction: RpcTransactionInput): bigint | undefined {
  return toHexBigInt(transaction.gas ?? transaction.gasLimit, 'gas');
}

export function resolveChainId(transaction: RpcTransactionInput): number | undefined {
  const parsed = toHexBigInt(transaction.chainId, 'chainId');
  return parsed === undefined ? undefined : Number(parsed);
}

export function estimateMaxNetworkFeeGwei(transaction: RpcTransactionInput): number | null {
  const gas = resolveGasLimit(transaction);
  const maxFeePerGas = toHexBigInt(transaction.maxFeePerGas, 'maxFeePerGas');
  if (gas === undefined || maxFeePerGas === undefined) return null;
  return Number(formatGweiSafe(gas * maxFeePerGas));
}

function formatGweiSafe(wei: bigint): string {
  // Avoid importing formatGwei in tests that only need bigint math
  const gwei = Number(wei) / 1e9;
  return gwei.toString();
}

export type NormalizeTransactionOptions = {
  fallbackChainId?: number;
  /** Test hook: override on-chain fee estimation. */
  estimateFees?: (
    chainId: number
  ) => Promise<{ maxFeePerGas: bigint; maxPriorityFeePerGas: bigint }>;
};

async function createSuperfluidPublicClient(chainId: number) {
  const rpcUrl = resolveRpcUrl(chainId);
  if (!rpcUrl) {
    throw new Error(`No RPC URL configured for chainId ${chainId}`);
  }

  const { createPublicClient, http } = await import('viem');
  const { defineChain } = await import('viem/utils');

  const chain = defineChain({
    id: chainId,
    name: `chain-${chainId}`,
    nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
    rpcUrls: { default: { http: [rpcUrl] } },
  });

  return createPublicClient({ chain, transport: http(rpcUrl) });
}

async function resolveEip1559Fees(
  chainId: number,
  transaction: RpcTransactionInput,
  estimateFees?: NormalizeTransactionOptions['estimateFees']
): Promise<{ maxFeePerGas: bigint; maxPriorityFeePerGas: bigint }> {
  const maxFeePerGas = toHexBigInt(transaction.maxFeePerGas, 'maxFeePerGas');
  const maxPriorityFeePerGas = toHexBigInt(
    transaction.maxPriorityFeePerGas,
    'maxPriorityFeePerGas'
  );

  if (maxFeePerGas !== undefined && maxPriorityFeePerGas !== undefined) {
    return { maxFeePerGas, maxPriorityFeePerGas };
  }

  const fees = estimateFees
    ? await estimateFees(chainId)
    : await (async () => {
        const client = await createSuperfluidPublicClient(chainId);
        const { estimateFeesPerGas } = await import('viem/actions');
        return estimateFeesPerGas(client, { type: 'eip1559' });
      })();

  return {
    maxFeePerGas: maxFeePerGas ?? fees.maxFeePerGas,
    maxPriorityFeePerGas: maxPriorityFeePerGas ?? fees.maxPriorityFeePerGas,
  };
}

export async function normalizeEip1559Transaction(
  transaction: RpcTransactionInput,
  options?: NormalizeTransactionOptions
): Promise<NormalizedEip1559Transaction> {
  if (!transaction.to) {
    throw new Error('Transaction is missing to');
  }

  const chainId =
    resolveChainId(transaction) ?? options?.fallbackChainId;
  if (chainId === undefined) {
    throw new Error(
      'Transaction is missing chainId. Select a network in the dashboard and retry.'
    );
  }

  let gas = resolveGasLimit(transaction);
  if (gas === undefined) {
    const client = await createSuperfluidPublicClient(chainId);
    const { estimateGas } = await import('viem/actions');
    gas = await estimateGas(client, {
      account: transaction.from,
      to: transaction.to,
      data: transaction.data,
      value: toHexBigInt(transaction.value, 'value') ?? 0n,
    });
  }

  if (gas === undefined) {
    throw new Error('Transaction is missing gas');
  }

  const { maxFeePerGas, maxPriorityFeePerGas } = await resolveEip1559Fees(
    chainId,
    transaction,
    options?.estimateFees
  );

  return {
    from: transaction.from,
    to: transaction.to,
    gas,
    maxFeePerGas,
    maxPriorityFeePerGas,
    nonce: Number(requireHexBigInt(transaction.nonce, 'nonce')),
    value: toHexBigInt(transaction.value, 'value') ?? 0n,
    chainId,
    data: transaction.data,
  };
}
