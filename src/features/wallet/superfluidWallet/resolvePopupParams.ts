import { enrichPopupParams } from './enrichPopupRequest';
import { prepareSignTransactionParams } from './prepareSignTransactionParams';

export async function resolvePopupParams(
  method: string,
  params: unknown,
  chainIdHex: `0x${string}` | undefined,
  getRpcUrlForChain: (chainId: number) => string
): Promise<unknown> {
  if (method !== 'eth_signTransaction') {
    return enrichPopupParams(method, params, chainIdHex);
  }

  const fallbackChainId = chainIdHex
    ? Number.parseInt(chainIdHex, 16)
    : undefined;
  if (fallbackChainId === undefined || Number.isNaN(fallbackChainId)) {
    throw new Error(
      'No chain ID available. Select a network in the dashboard and retry.'
    );
  }

  return prepareSignTransactionParams(params, {
    fallbackChainId,
    rpcUrl: getRpcUrlForChain(fallbackChainId),
  });
}
