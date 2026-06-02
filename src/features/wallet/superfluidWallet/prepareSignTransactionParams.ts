import {
  type Address,
  type Hex,
  createPublicClient,
  hexToBigInt,
  http,
} from 'viem';
import { prepareTransactionRequest } from 'viem/actions';
import { numberToHex } from 'viem/utils';

/** Partial JSON-RPC tx from sdk-redux / wagmi before Superfluid Wallet signing. */
export type RpcTransactionLike = Record<string, unknown> & {
  from: Address;
  to?: Address;
  gas?: Hex;
  gasLimit?: Hex;
  maxFeePerGas?: Hex;
  maxPriorityFeePerGas?: Hex;
  nonce?: Hex | number;
  value?: Hex;
  chainId?: Hex | number;
  data?: Hex;
};

function toOptionalBigInt(value: unknown, field: string): bigint | undefined {
  if (value === undefined || value === null) return undefined;
  if (typeof value === 'number') return BigInt(value);
  if (typeof value === 'string' && value.startsWith('0x')) {
    return hexToBigInt(value as Hex);
  }
  throw new Error(`Invalid ${field}: expected hex or number`);
}

export function resolveChainIdFromTransaction(
  transaction: RpcTransactionLike,
  fallbackChainId?: number
): number {
  const parsed = toOptionalBigInt(transaction.chainId, 'chainId');
  if (parsed !== undefined) return Number(parsed);
  if (fallbackChainId !== undefined) return fallbackChainId;
  throw new Error(
    'No chain ID available. Select a network in the dashboard and retry.'
  );
}

export type PreparedRpcTransaction = Record<string, string>;

export type PrepareTransactionRequestFn = (
  client: ReturnType<typeof createPublicClient>,
  request: Parameters<typeof prepareTransactionRequest>[1]
) => ReturnType<typeof prepareTransactionRequest>;

/**
 * Complete an EIP-1559 transaction before opening the Superfluid Wallet popup.
 * Mirrors popup-wallet-demo's usePrepareTransactionRequest, but only on this connector path.
 */
export async function prepareSignTransactionParams(
  params: unknown,
  options: {
    fallbackChainId?: number;
    rpcUrl: string;
    prepareRequest?: PrepareTransactionRequestFn;
  }
): Promise<[PreparedRpcTransaction]> {
  const txParams = params as [RpcTransactionLike?] | undefined;
  const transaction = txParams?.[0];
  if (!transaction) {
    throw new Error('Missing transaction for eth_signTransaction');
  }
  if (!transaction.from) {
    throw new Error('Transaction is missing from');
  }
  if (!transaction.to) {
    throw new Error('Transaction is missing to');
  }

  const chainId = resolveChainIdFromTransaction(
    transaction,
    options.fallbackChainId
  );
  const client = createPublicClient({ transport: http(options.rpcUrl) });
  const prepare = options.prepareRequest ?? prepareTransactionRequest;

  const prepared = await prepare(client, {
    account: transaction.from,
    to: transaction.to,
    data: transaction.data,
    value: toOptionalBigInt(transaction.value, 'value'),
    gas: toOptionalBigInt(transaction.gas ?? transaction.gasLimit, 'gas'),
    maxFeePerGas: toOptionalBigInt(transaction.maxFeePerGas, 'maxFeePerGas'),
    maxPriorityFeePerGas: toOptionalBigInt(
      transaction.maxPriorityFeePerGas,
      'maxPriorityFeePerGas'
    ),
    nonce:
      toOptionalBigInt(transaction.nonce, 'nonce') !== undefined
        ? Number(toOptionalBigInt(transaction.nonce, 'nonce'))
        : undefined,
    chainId,
    type: 'eip1559',
  });

  if (
    prepared.gas === undefined ||
    prepared.maxFeePerGas === undefined ||
    prepared.maxPriorityFeePerGas === undefined ||
    prepared.nonce === undefined
  ) {
    throw new Error('Failed to prepare a complete EIP-1559 transaction');
  }

  const rpcTx: PreparedRpcTransaction = {
    from: transaction.from,
    to: prepared.to as string,
    gas: numberToHex(prepared.gas),
    maxFeePerGas: numberToHex(prepared.maxFeePerGas),
    maxPriorityFeePerGas: numberToHex(prepared.maxPriorityFeePerGas),
    nonce: numberToHex(BigInt(prepared.nonce)),
    value: prepared.value !== undefined ? numberToHex(prepared.value) : '0x0',
    chainId: numberToHex(BigInt(chainId)),
  };

  if (prepared.data) {
    rpcTx.data = prepared.data;
  }

  return [rpcTx];
}
