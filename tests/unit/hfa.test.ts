import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@turnkey/api-key-stamper', () => ({
  ApiKeyStamper: class {
    async stamp() {
      return { stampHeaderValue: 'mock-turnkey-stamp' };
    }
  },
}));

vi.mock('react-toastify', () => ({
  toast: {
    loading: vi.fn(() => 'toast-id'),
    update: vi.fn(),
  },
}));

vi.mock(
  '../../src/features/wallet/superfluidWallet/resolvePopupParams',
  () => ({
    resolvePopupParams: vi.fn(async () => [
      {
        from: '0x2b0a000000000000000000000000000000f8b6',
        to: '0x0043d7c85C8b96a49A72A92C0B48CdC4720437d7',
        chainId: '0xaa37dc',
        value: '0x0',
        data: '0x1234',
        gas: '0x30d40',
        maxFeePerGas: '0x59682f00',
        maxPriorityFeePerGas: '0xf4240',
        nonce: '0x1',
      },
    ]),
  })
);

class LocalStorageMock {
  private store = new Map<string, string>();

  getItem(key: string) {
    return this.store.get(key) ?? null;
  }

  setItem(key: string, value: string) {
    this.store.set(key, value);
  }

  removeItem(key: string) {
    this.store.delete(key);
  }

  clear() {
    this.store.clear();
  }
}

const storageKey = 'SF:HFA:dashboardRequester';
const walletAddress = '0x2b0a000000000000000000000000000000f8b6';

async function importHfa() {
  vi.resetModules();
  process.env.NEXT_PUBLIC_HFA_ENABLED = 'true';
  process.env.NEXT_PUBLIC_HFA_URL = 'https://hfa.example';
  process.env.NEXT_PUBLIC_TURNKEY_API_BASE_URL = 'https://turnkey.example';
  process.env.NEXT_PUBLIC_HFA_POLL_INTERVAL_MS = '1';
  process.env.NEXT_PUBLIC_HFA_POLL_TIMEOUT_MS = '50';
  return import('../../src/features/wallet/superfluidWallet/hfa');
}

function storeEnabledHfaState() {
  localStorage.setItem(
    storageKey,
    JSON.stringify({
      version: 1,
      enabled: true,
      hfaUrl: 'https://hfa.example',
      agentPublicKey:
        '030000000000000000000000000000000000000000000000000000000000000000',
      agentPrivateJwk: {
        kty: 'EC',
        crv: 'P-256',
        x: 'AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
        y: 'AQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQE',
        d: 'AgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgI',
      },
      setupSessionId: 'setup-1',
      walletAddress,
    })
  );
}

describe('dashboard HFA helpers', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    vi.stubGlobal('localStorage', new LocalStorageMock());
    vi.stubGlobal('crypto', {
      subtle: {
        generateKey: vi.fn(async () => ({
          privateKey: 'private-key',
          publicKey: 'public-key',
        })),
        exportKey: vi.fn(async () => ({
          kty: 'EC',
          crv: 'P-256',
          x: 'AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
          y: 'AQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQE',
          d: 'AgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgI',
        })),
        importKey: vi.fn(async () => 'imported-private-key'),
        sign: vi.fn(async () => new Uint8Array(64).fill(1).buffer),
      },
    });
    vi.stubGlobal('fetch', vi.fn());
  });

  it('normalizes a prepared transaction to the one-action HFA intent', async () => {
    const { preparedTransactionToHfaIntent } = await importHfa();

    expect(
      preparedTransactionToHfaIntent({
        to: '0x0043d7c85C8b96a49A72A92C0B48CdC4720437d7',
        chainId: '0xaa37dc',
        value: '0x2a',
        data: '0x1234',
      })
    ).toEqual({
      actions: [
        {
          chainId: 11155420,
          to: '0x0043d7c85C8b96a49A72A92C0B48CdC4720437d7',
          value: '42',
          data: '0x1234',
        },
      ],
    });
  });

  it('starts setup and stores the returned setup session', async () => {
    const fetchMock = vi.mocked(fetch);
    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        setupSessionId: 'setup-1',
        status: 'pending',
        setupUrl: 'https://wallet.example/hfa/setup?session=setup-1',
      }),
    } as Response);
    const { startDashboardHfaSetup, getDashboardHfaState } = await importHfa();

    const state = await startDashboardHfaSetup({
      connectedWalletAddress: walletAddress,
    });

    expect(fetchMock).toHaveBeenCalledWith(
      'https://hfa.example/api/turnkey/hfa/setup-sessions',
      expect.objectContaining({
        method: 'POST',
        body: expect.stringContaining('Superfluid Dashboard'),
      })
    );
    expect(state.setupSessionId).toBe('setup-1');
    expect(getDashboardHfaState()?.enabled).toBe(false);
  });

  it('marks HFA enabled after setup status is completed', async () => {
    storeEnabledHfaState();
    localStorage.setItem(
      storageKey,
      JSON.stringify({
        ...JSON.parse(localStorage.getItem(storageKey)!),
        enabled: false,
      })
    );
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        setupSessionId: 'setup-1',
        status: 'completed',
        walletAddress: '0x2b0a000000000000000000000000000000f8b6',
      }),
    } as Response);
    const { refreshDashboardHfaSetupStatus } = await importHfa();

    await expect(
      refreshDashboardHfaSetupStatus(walletAddress)
    ).resolves.toMatchObject({
      enabled: true,
      walletAddress: '0x2b0a000000000000000000000000000000f8b6',
    });
  });

  it('only treats HFA as ready for the wallet that completed setup', async () => {
    storeEnabledHfaState();
    const { isDashboardHfaReady } = await importHfa();

    expect(
      isDashboardHfaReady('0x2b0a000000000000000000000000000000f8b6')
    ).toBe(true);
    expect(
      isDashboardHfaReady('0x0000000000000000000000000000000000000001')
    ).toBe(false);
    expect(isDashboardHfaReady()).toBe(false);
  });

  it('does not treat HFA as ready when stored state lacks a wallet address', async () => {
    storeEnabledHfaState();
    const stored = JSON.parse(localStorage.getItem(storageKey)!);
    delete stored.walletAddress;
    localStorage.setItem(storageKey, JSON.stringify(stored));
    const { isDashboardHfaReady } = await importHfa();

    expect(
      isDashboardHfaReady('0x2b0a000000000000000000000000000000f8b6')
    ).toBe(false);
  });

  it('submits a prepared transaction through the mocked HFA flow', async () => {
    storeEnabledHfaState();
    const fetchMock = vi.mocked(fetch);
    fetchMock
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          draftId: 'draft-1',
          subOrganizationId: 'org-1',
          intent: { actions: [] },
          turnkeyTransaction: {
            signWith: '0x2b0a000000000000000000000000000000f8b6',
            unsignedTransaction: '0xabc',
          },
        }),
      } as Response)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          activity: {
            id: 'activity-1',
            fingerprint: 'fingerprint-1',
            status: 'ACTIVITY_STATUS_CONSENSUS_NEEDED',
          },
        }),
      } as Response)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          requestId: 'request-1',
          status: 'pending_human',
          txHash: null,
          error: null,
        }),
      } as Response)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          requestId: 'request-1',
          status: 'executed',
          txHash: '0xhash',
          error: null,
        }),
      } as Response);

    const { submitTransactionThroughHfa } = await importHfa();

    await expect(
      submitTransactionThroughHfa([{ from: walletAddress }], {
        chainIdHex: '0xaa37dc',
        getRpcUrlForChain: () => 'https://rpc.example',
        connectedWalletAddress: walletAddress,
      })
    ).resolves.toBe('0xhash');

    expect(fetchMock).toHaveBeenNthCalledWith(
      1,
      'https://hfa.example/api/turnkey/drafts',
      expect.objectContaining({
        method: 'POST',
        body: expect.stringContaining('"chainId":11155420'),
      })
    );
    expect(fetchMock).toHaveBeenNthCalledWith(
      2,
      'https://turnkey.example/public/v1/submit/sign_transaction',
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({ 'x-stamp': 'mock-turnkey-stamp' }),
      })
    );
  });

  it('detects inconsistent agent keys', async () => {
    storeEnabledHfaState();
    const stored = JSON.parse(localStorage.getItem(storageKey)!);
    stored.agentPublicKey = '03'.padEnd(66, '2');
    localStorage.setItem(storageKey, JSON.stringify(stored));
    const { dashboardHfaAgentKeysMatch, isDashboardHfaReady } =
      await importHfa();

    expect(dashboardHfaAgentKeysMatch(stored)).toBe(false);
    expect(
      isDashboardHfaReady('0x2b0a000000000000000000000000000000f8b6')
    ).toBe(false);
  });

  it('rejects HFA submission when the prepared transaction sender mismatches setup', async () => {
    storeEnabledHfaState();
    const { submitTransactionThroughHfa } = await importHfa();
    const { resolvePopupParams } = await import(
      '../../src/features/wallet/superfluidWallet/resolvePopupParams'
    );
    vi.mocked(resolvePopupParams).mockResolvedValueOnce([
      {
        from: '0x0000000000000000000000000000000000000001',
        to: '0x0043d7c85C8b96a49A72A92C0B48CdC4720437d7',
        chainId: '0xaa37dc',
        value: '0x0',
        data: '0x1234',
      },
    ]);

    await expect(
      submitTransactionThroughHfa(
        [{ from: '0x0000000000000000000000000000000000000001' }],
        {
          chainIdHex: '0xaa37dc',
          getRpcUrlForChain: () => 'https://rpc.example',
          connectedWalletAddress: walletAddress,
        }
      )
    ).rejects.toThrow('HFA setup does not match the transaction sender');
    expect(fetch).not.toHaveBeenCalled();
  });

  it('rejects refresh when setup was completed for a different wallet', async () => {
    storeEnabledHfaState();
    localStorage.setItem(
      storageKey,
      JSON.stringify({
        ...JSON.parse(localStorage.getItem(storageKey)!),
        enabled: false,
      })
    );
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        setupSessionId: 'setup-1',
        status: 'completed',
        walletAddress: '0x0000000000000000000000000000000000000001',
      }),
    } as Response);
    const { refreshDashboardHfaSetupStatus } = await importHfa();

    await expect(refreshDashboardHfaSetupStatus(walletAddress)).rejects.toThrow(
      'HFA setup was completed for a different wallet'
    );
  });

  it('clears HFA state when wallet disconnects', async () => {
    storeEnabledHfaState();
    const { syncDashboardHfaWithWallet, getDashboardHfaState } =
      await importHfa();

    syncDashboardHfaWithWallet(undefined);

    expect(getDashboardHfaState()).toBeNull();
  });

  it('unbinds enabled HFA when the connected wallet address changes', async () => {
    storeEnabledHfaState();
    const {
      syncDashboardHfaWithWallet,
      getDashboardHfaState,
      isDashboardHfaReady,
    } = await importHfa();

    syncDashboardHfaWithWallet('0x0000000000000000000000000000000000000001');

    expect(getDashboardHfaState()?.enabled).toBe(false);
    expect(getDashboardHfaState()?.walletAddress).toBeUndefined();
    expect(isDashboardHfaReady(walletAddress)).toBe(false);
  });

  it('clears pending setup when the connected wallet address changes', async () => {
    storeEnabledHfaState();
    const stored = JSON.parse(localStorage.getItem(storageKey)!);
    localStorage.setItem(
      storageKey,
      JSON.stringify({
        ...stored,
        enabled: false,
        walletAddress: walletAddress,
      })
    );
    const { syncDashboardHfaWithWallet, getDashboardHfaState } =
      await importHfa();

    syncDashboardHfaWithWallet('0x0000000000000000000000000000000000000001');

    expect(getDashboardHfaState()?.setupSessionId).toBeUndefined();
    expect(getDashboardHfaState()?.setupUrl).toBeUndefined();
  });
});
