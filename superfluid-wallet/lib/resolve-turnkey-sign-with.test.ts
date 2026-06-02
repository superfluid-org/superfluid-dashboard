import { describe, expect, it } from 'vitest';
import { getAddress } from 'viem';
import {
  resolveTurnkeyOrganizationId,
  resolveTurnkeySignWith,
} from './resolve-turnkey-sign-with';

describe('resolveTurnkeySignWith', () => {
  it('returns the exact Turnkey address when case differs', () => {
    const signWith = resolveTurnkeySignWith(
      '0xabcdefabcdefabcdefabcdefabcdefabcdefabcd',
      [
        {
          accounts: [
            { address: '0xAbCdEfAbCdEfAbCdEfAbCdEfAbCdEfAbCdEfAbCd' },
          ],
        },
      ]
    );

    expect(signWith).toBe('0xAbCdEfAbCdEfAbCdEfAbCdEfAbCdEfAbCdEfAbCd');
  });

  it('checksums when no wallet match exists', () => {
    const lowercase = '0xabcdefabcdefabcdefabcdefabcdefabcdefabcd';
    expect(resolveTurnkeySignWith(lowercase, [])).toBe(getAddress(lowercase));
  });
});

describe('resolveTurnkeyOrganizationId', () => {
  it('prefers the active session org', () => {
    expect(
      resolveTurnkeyOrganizationId('session-org', 'url-org')
    ).toBe('session-org');
  });

  it('falls back to the URL org', () => {
    expect(resolveTurnkeyOrganizationId(undefined, 'url-org')).toBe('url-org');
  });
});
