import { describe, expect, it, vi } from 'vitest';
import {
  prepareSignTransactionParams,
  resolveChainIdFromTransaction,
} from '../../src/features/wallet/superfluidWallet/prepareSignTransactionParams';

const wrapLikePartial = [
  {
    from: '0x2B0a000000000000000000000000000000f8b6',
    to: '0x0043d7c85C8b96a49A72A92C0B48CdC4720437d7',
    gasLimit: '0x30d40',
    nonce: '0x1',
    value: '0x0',
    data: '0x1234abcd',
  },
];

describe('resolveChainIdFromTransaction', () => {
  it('uses fallback when tx omits chainId', () => {
    expect(
      resolveChainIdFromTransaction(wrapLikePartial[0], 11155420)
    ).toBe(11155420);
  });
});

describe('prepareSignTransactionParams', () => {
  it('fills missing fee fields via prepareTransactionRequest', async () => {
    const prepareRequest = vi.fn(async () => ({
      to: wrapLikePartial[0].to,
      gas: 200000n,
      maxFeePerGas: 1500000000n,
      maxPriorityFeePerGas: 1000000n,
      nonce: 1,
      value: 0n,
      data: '0x1234abcd',
      type: 'eip1559' as const,
      chainId: 11155420,
    }));

    const [prepared] = await prepareSignTransactionParams(wrapLikePartial, {
      fallbackChainId: 11155420,
      rpcUrl: 'https://rpc-endpoints.superfluid.dev/optimism-sepolia',
      prepareRequest,
    });

    expect(prepareRequest).toHaveBeenCalledOnce();
    expect(prepared.chainId).toBe('0xaa37dc');
    expect(prepared.gas).toBe('0x30d40');
    expect(prepared.maxFeePerGas).toBe('0x59682f00');
    expect(prepared.maxPriorityFeePerGas).toBe('0xf4240');
    expect(prepared.to).toBe(wrapLikePartial[0].to);
  });
});
