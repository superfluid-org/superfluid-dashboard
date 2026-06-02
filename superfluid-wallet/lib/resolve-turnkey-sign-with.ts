import { type Address, getAddress } from 'viem';

type TurnkeyWalletLike = {
  accounts: Array<{ address?: string | null }>;
};

/**
 * Turnkey signWith is case-sensitive. Resolve the exact wallet account address
 * from the active session rather than the caller-supplied checksummed/lowercase form.
 */
export function resolveTurnkeySignWith(
  requestedAddress: Address,
  wallets: TurnkeyWalletLike[]
): Address | undefined {
  const normalizedRequested = requestedAddress.toLowerCase();

  for (const wallet of wallets) {
    for (const account of wallet.accounts) {
      if (
        account.address &&
        account.address.toLowerCase() === normalizedRequested
      ) {
        return account.address as Address;
      }
    }
  }

  try {
    return getAddress(requestedAddress);
  } catch {
    return undefined;
  }
}

export function resolveTurnkeyOrganizationId(
  sessionOrgId: string | undefined,
  fallbackOrgId: string | undefined
): string | undefined {
  return sessionOrgId || fallbackOrgId || undefined;
}
