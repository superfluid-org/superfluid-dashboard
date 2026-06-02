'use client';

import { TurnkeyProvider, type TurnkeyProviderConfig } from '@turnkey/react-wallet-kit';

const organizationId = process.env.NEXT_PUBLIC_ORGANIZATION_ID?.trim();
const authProxyConfigId = process.env.NEXT_PUBLIC_AUTH_PROXY_CONFIG_ID?.trim();

const defaultWallet = {
  walletName: 'Default Wallet',
  walletAccounts: [
    {
      curve: 'CURVE_SECP256K1' as const,
      pathFormat: 'PATH_FORMAT_BIP32' as const,
      path: "m/44'/60'/0'/0/0",
      addressFormat: 'ADDRESS_FORMAT_ETHEREUM' as const,
    },
  ],
};

const turnkeyConfig: TurnkeyProviderConfig = {
  organizationId: organizationId ?? '',
  authProxyConfigId: authProxyConfigId ?? '',
  apiBaseUrl: process.env.NEXT_PUBLIC_API_BASE_URL || 'https://api.turnkey.com',
  authProxyUrl:
    process.env.NEXT_PUBLIC_AUTH_PROXY_BASE_URL || 'https://authproxy.turnkey.com',
  auth: {
    autoRefreshSession: true,
    createSuborgParams: {
      emailOtpAuth: { customWallet: defaultWallet },
      smsOtpAuth: { customWallet: defaultWallet },
      passkeyAuth: { customWallet: defaultWallet },
      walletAuth: { customWallet: defaultWallet },
      oauth: { customWallet: defaultWallet },
    },
  },
  ui: {
    supressMissingStylesError: true,
    renderModalInProvider: true,
  },
};

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <TurnkeyProvider
      config={turnkeyConfig}
      callbacks={{
        onError: (error) => console.error('Turnkey error:', error),
      }}
    >
      {children}
    </TurnkeyProvider>
  );
}
