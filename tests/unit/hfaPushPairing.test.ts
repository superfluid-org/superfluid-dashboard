import { beforeEach, describe, expect, it, vi } from 'vitest';

async function importPairing(options?: { mobilePairingUrl?: string }) {
  vi.resetModules();
  process.env.NEXT_PUBLIC_HFA_ENABLED = 'true';
  process.env.NEXT_PUBLIC_HFA_URL = 'http://localhost:5712';
  if (options?.mobilePairingUrl) {
    process.env.NEXT_PUBLIC_HFA_MOBILE_PAIRING_URL = options.mobilePairingUrl;
  } else {
    delete process.env.NEXT_PUBLIC_HFA_MOBILE_PAIRING_URL;
  }
  return import('../../src/features/wallet/superfluidWallet/hfaPushPairing');
}

describe('HFA push pairing URLs', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('builds local pairing URL from dashboard HFA config', async () => {
    const { buildLocalHfaNotificationPairingUrl, isLocalhostHfaUrl } =
      await importPairing();
    const wallet = '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266';
    const url = buildLocalHfaNotificationPairingUrl(wallet);

    expect(url).toBe(
      `http://localhost:5712/?agent=${wallet}&from=hfa-setup&mode=relay`
    );
    expect(isLocalhostHfaUrl(url)).toBe(true);
  });

  it('uses mobile pairing URL override when configured', async () => {
    const { buildMobileHfaNotificationPairingUrl, isLocalhostHfaUrl } =
      await importPairing({
        mobilePairingUrl: 'https://hfa.staging.example',
      });
    const wallet = '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266';
    const url = buildMobileHfaNotificationPairingUrl(wallet);

    expect(url).toBe(
      `https://hfa.staging.example/?agent=${wallet}&from=hfa-setup&mode=relay`
    );
    expect(isLocalhostHfaUrl(url)).toBe(false);
  });
});
