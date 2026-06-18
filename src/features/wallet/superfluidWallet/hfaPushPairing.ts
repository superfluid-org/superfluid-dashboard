import appConfig from '../../../utils/config';

export function buildHfaNotificationPairingUrl(
  hfaBaseUrl: string,
  walletAddress: string,
): string {
  const base = hfaBaseUrl.replace(/\/$/, '');
  const params = new URLSearchParams({
    agent: walletAddress,
    from: 'hfa-setup',
    mode: 'relay',
  });
  return `${base}/?${params.toString()}`;
}

export function resolveHfaMobilePairingBaseUrl(hfaBaseUrl: string): string {
  const override = appConfig.hfa.mobilePairingUrl;
  return (override || hfaBaseUrl).replace(/\/$/, '');
}

export function buildMobileHfaNotificationPairingUrl(
  walletAddress: string,
): string {
  return buildHfaNotificationPairingUrl(
    resolveHfaMobilePairingBaseUrl(appConfig.hfa.url),
    walletAddress
  );
}

export function buildLocalHfaNotificationPairingUrl(
  walletAddress: string,
): string {
  return buildHfaNotificationPairingUrl(appConfig.hfa.url, walletAddress);
}

export function isLocalhostHfaUrl(url: string): boolean {
  try {
    const { hostname } = new URL(url);
    return hostname === 'localhost' || hostname === '127.0.0.1';
  } catch {
    return false;
  }
}
