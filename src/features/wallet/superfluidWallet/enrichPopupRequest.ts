/**
 * Pure helpers for popup wallet RPC requests (unit-testable).
 */

export function enrichSignTransactionParams(
  params: unknown,
  chainIdHex: `0x${string}` | undefined
): unknown {
  const txParams = params as [Record<string, unknown>?] | undefined;
  const transaction = txParams?.[0];
  if (!transaction) return params;

  if (transaction.chainId !== undefined && transaction.chainId !== null) {
    return params;
  }

  if (!chainIdHex) {
    throw new Error(
      'No chain ID available. Select a network in the dashboard and retry.'
    );
  }

  return [{ ...transaction, chainId: chainIdHex }];
}

export function enrichPopupParams(
  method: string,
  params: unknown,
  chainIdHex: `0x${string}` | undefined
): unknown {
  if (method === 'eth_signTransaction') {
    return enrichSignTransactionParams(params, chainIdHex);
  }
  return params;
}
