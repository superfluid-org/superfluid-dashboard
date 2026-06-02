import { describe, expect, it } from 'vitest';
import {
  enrichPopupParams,
  enrichSignTransactionParams,
} from '../../src/features/wallet/superfluidWallet/enrichPopupRequest';

const wrapTxWithoutChainId = [
  {
    from: '0x2B0a000000000000000000000000000000f8b6',
    to: '0x0043d7c85C8b96a49A72A92C0B48CdC4720437d7',
    gasLimit: '0x30d40',
    maxFeePerGas: '0x59682f00',
    maxPriorityFeePerGas: '0x59682f00',
    nonce: '0x1',
    value: '0x0',
  },
];

describe('enrichSignTransactionParams', () => {
  it('injects chainId when missing (wagmi wrap flow)', () => {
    const result = enrichSignTransactionParams(
      wrapTxWithoutChainId,
      '0xaa37dc'
    ) as [Record<string, string>];

    expect(result[0].chainId).toBe('0xaa37dc');
    expect(result[0].gasLimit).toBe('0x30d40');
  });

  it('leaves params unchanged when chainId is already set', () => {
    const withChain = [{ ...wrapTxWithoutChainId[0], chainId: '0x1' }];
    expect(enrichSignTransactionParams(withChain, '0xaa37dc')).toEqual(withChain);
  });

  it('throws when chainId is missing and no fallback hex', () => {
    expect(() =>
      enrichSignTransactionParams(wrapTxWithoutChainId, undefined)
    ).toThrow(/chain ID/i);
  });
});

describe('enrichPopupParams', () => {
  it('only enriches eth_signTransaction', () => {
    expect(
      enrichPopupParams('eth_requestAccounts', [], '0xaa37dc')
    ).toEqual([]);

    const enriched = enrichPopupParams(
      'eth_signTransaction',
      wrapTxWithoutChainId,
      '0xaa37dc'
    ) as [Record<string, string>];
    expect(enriched[0].chainId).toBe('0xaa37dc');
  });
});
