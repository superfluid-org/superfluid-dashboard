import { describe, expect, it } from 'vitest';
import {
  estimateMaxNetworkFeeGwei,
  normalizeEip1559Transaction,
  resolveGasLimit,
} from './normalize-rpc-transaction';

/** Shape observed from dashboard wrap on Optimism Sepolia (gas omitted, gasLimit set). */
const wrapLikeTransaction = {
  from: '0x2B0a000000000000000000000000000000f8b6' as const,
  to: '0x0043d7c85C8b96a49A72A92C0B48CdC4720437d7' as const,
  data: '0x1234abcd' as const,
  value: '0x2386f26fc10000' as const,
  nonce: '0x1' as const,
  chainId: '0xaa37dc' as const, // 11155420
  gasLimit: '0x30d40' as const, // 200000 — dashboard TabWrap override
  maxFeePerGas: '0x59682f00' as const,
  maxPriorityFeePerGas: '0x59682f00' as const,
};

/** Shape with EIP-1193 `gas` field (popup-wallet-demo / some wallets). */
const demoLikeTransaction = {
  ...wrapLikeTransaction,
  gas: wrapLikeTransaction.gasLimit,
};
delete (demoLikeTransaction as { gasLimit?: string }).gasLimit;

/** Broken shape that caused the runtime crash. */
const missingGasTransaction = {
  ...wrapLikeTransaction,
  gas: undefined,
  gasLimit: undefined,
};

describe('resolveGasLimit', () => {
  it('reads gasLimit when gas is absent (wagmi wrap flow)', () => {
    expect(resolveGasLimit(wrapLikeTransaction)).toBe(200000n);
  });

  it('prefers gas when both are present', () => {
    expect(resolveGasLimit({ ...wrapLikeTransaction, gas: '0x5208' })).toBe(21000n);
  });

  it('returns undefined when neither gas nor gasLimit is set', () => {
    expect(resolveGasLimit(missingGasTransaction)).toBeUndefined();
  });
});

describe('estimateMaxNetworkFeeGwei', () => {
  it('does not throw when gas is missing', () => {
    expect(estimateMaxNetworkFeeGwei(missingGasTransaction)).toBeNull();
  });

  it('computes fee when gasLimit is present', () => {
    expect(estimateMaxNetworkFeeGwei(wrapLikeTransaction)).toBeGreaterThan(0);
  });
});

describe('normalizeEip1559Transaction', () => {
  it('normalizes wrap-like payload with gasLimit', async () => {
    const normalized = await normalizeEip1559Transaction(wrapLikeTransaction);
    expect(normalized.gas).toBe(200000n);
    expect(normalized.chainId).toBe(11155420);
    expect(normalized.to).toBe(wrapLikeTransaction.to);
  });

  it('normalizes demo-like payload with gas', async () => {
    const normalized = await normalizeEip1559Transaction(demoLikeTransaction);
    expect(normalized.gas).toBe(200000n);
  });

  it('requires chainId', async () => {
    await expect(
      normalizeEip1559Transaction({ ...wrapLikeTransaction, chainId: undefined })
    ).rejects.toThrow(/chainId/i);
  });

  it('uses fallbackChainId when transaction omits chainId (wagmi wrap flow)', async () => {
    const normalized = await normalizeEip1559Transaction(
      { ...wrapLikeTransaction, chainId: undefined },
      { fallbackChainId: 11155420 }
    );
    expect(normalized.chainId).toBe(11155420);
  });
});
