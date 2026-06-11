import { describe, expect, it } from 'vitest';
import {
  buildHfaNotificationPairingUrl,
  buildSetupSessionCompleteUrl,
  buildSetupSessionGetUrl,
  parseHfaSetupUrlParams,
} from './hfa-setup-client';
import {
  buildHfaCoApprovalPolicy,
  buildHfaSetupCompletePayload,
  resolveFirstEvmWalletAccount,
  runHfaTurnkeySetup,
} from './hfa-turnkey-setup';

describe('parseHfaSetupUrlParams', () => {
  it('accepts valid HFA setup URLs', () => {
    const parsed = parseHfaSetupUrlParams({
      session: 'session-123',
      hfa: encodeURIComponent('http://localhost:3000'),
    });
    expect(parsed.sessionId).toBe('session-123');
    expect(parsed.hfaBaseUrl).toBe('http://localhost:3000');
  });

  it('rejects invalid protocols', () => {
    expect(() =>
      parseHfaSetupUrlParams({
        session: 'session-123',
        hfa: encodeURIComponent('javascript:alert(1)'),
      })
    ).toThrow(/http or https/i);
  });
});

describe('HFA setup client URLs', () => {
  it('builds GET and complete URLs', () => {
    expect(buildSetupSessionGetUrl('http://localhost:3000', 'abc')).toBe(
      'http://localhost:3000/api/turnkey/hfa/setup-sessions/abc'
    );
    expect(buildSetupSessionCompleteUrl('http://localhost:3000', 'abc')).toBe(
      'http://localhost:3000/api/turnkey/hfa/setup-sessions/abc/complete'
    );
  });

  it('builds notification pairing URL for wallet handoff', () => {
    const wallet = '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266';
    expect(buildHfaNotificationPairingUrl('http://localhost:5712/', wallet)).toBe(
      `http://localhost:5712/?agent=${wallet}&from=hfa-setup&mode=relay`
    );
  });
});

describe('buildHfaCoApprovalPolicy', () => {
  it('requires both agent and provider user IDs', () => {
    const policy = buildHfaCoApprovalPolicy({
      walletAddress: '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266',
      agentUserId: 'agent-user',
      providerUserId: 'provider-user',
    });
    expect(policy.consensus).toContain("user.id == 'agent-user'");
    expect(policy.consensus).toContain("user.id == 'provider-user'");
    expect(policy.condition).toContain('ACTIVITY_TYPE_SIGN_TRANSACTION_V2');
    expect(policy.condition).toContain('eth.tx.from');
  });
});

describe('resolveFirstEvmWalletAccount', () => {
  it('returns the first EVM account', () => {
    expect(
      resolveFirstEvmWalletAccount([
        { accounts: [{ address: '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266' }] },
      ])
    ).toBe('0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266');
  });

  it('rejects missing accounts', () => {
    expect(() => resolveFirstEvmWalletAccount([])).toThrow(/No EVM wallet account/i);
  });
});

describe('runHfaTurnkeySetup', () => {
  it('creates delegated users, policy, and completion payload', async () => {
    const calls: string[] = [];
    const result = await runHfaTurnkeySetup({
      organizationId: 'org-1',
      wallets: [{ accounts: [{ address: '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266' }] }],
      agentPublicKey: '02' + 'a'.repeat(64),
      providerPublicKey: '03' + 'b'.repeat(64),
      fetchOrCreateP256ApiKeyUser: async ({ publicKey, createParams }) => {
        calls.push(`user:${publicKey}:${createParams?.userName ?? ''}`);
        return { userId: publicKey.startsWith('02') ? 'agent-user' : 'provider-user' };
      },
      fetchOrCreatePolicies: async ({ policies }) => {
        calls.push(`policies:${policies.length}`);
        return policies.map((policy, index) => ({
          ...policy,
          policyId: `policy-${index + 1}`,
        }));
      },
    });

    expect(result.agentUserId).toBe('agent-user');
    expect(result.providerUserId).toBe('provider-user');
    expect(result.policyIds).toEqual(['policy-1']);
    expect(calls).toEqual([
      'user:02' + 'a'.repeat(64) + ':HFA Agent',
      'user:03' + 'b'.repeat(64) + ':Superfluid HFA Provider',
      'policies:1',
    ]);

    const payload = buildHfaSetupCompletePayload({
      setupResult: result,
      agentPublicKey: '02' + 'a'.repeat(64),
      walletOrigin: 'http://localhost:3001',
    });
    expect(payload.walletOrigin).toBe('http://localhost:3001');
    expect(payload.policyIds).toEqual(['policy-1']);
  });
});
