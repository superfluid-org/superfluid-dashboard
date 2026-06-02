'use client';

import { useTurnkey, ClientState } from '@turnkey/react-wallet-kit';
import { useEffect, useState } from 'react';

export type TurnkeySigningReadyState = {
  isReady: boolean;
  isLoading: boolean;
  error: string | null;
};

/**
 * Turnkey stamps requests with the active session from storage. That restore is
 * async when the popup opens, so httpClient may exist before a session is available.
 */
export function useTurnkeySigningReady(): TurnkeySigningReadyState {
  const { clientState, getSession, refreshWallets, wallets } = useTurnkey();
  const [state, setState] = useState<TurnkeySigningReadyState>({
    isReady: false,
    isLoading: true,
    error: null,
  });

  useEffect(() => {
    let cancelled = false;

    async function ensureReady() {
      if (clientState === ClientState.Loading) {
        setState({ isReady: false, isLoading: true, error: null });
        return;
      }

      if (clientState === ClientState.Error) {
        setState({
          isReady: false,
          isLoading: false,
          error: 'Wallet failed to initialize. Refresh and try again.',
        });
        return;
      }

      setState({ isReady: false, isLoading: true, error: null });

      try {
        const activeSession = await getSession();
        if (cancelled) return;

        if (!activeSession) {
          setState({
            isReady: false,
            isLoading: false,
            error:
              'Wallet session expired or is still loading. Close this popup and reconnect from the dashboard.',
          });
          return;
        }

        if (wallets.length === 0) {
          await refreshWallets();
        }
        if (cancelled) return;

        setState({ isReady: true, isLoading: false, error: null });
      } catch (error) {
        if (cancelled) return;
        setState({
          isReady: false,
          isLoading: false,
          error:
            error instanceof Error
              ? error.message
              : 'Failed to restore wallet session',
        });
      }
    }

    void ensureReady();

    return () => {
      cancelled = true;
    };
  }, [clientState, getSession, refreshWallets, wallets.length]);

  return state;
}

export async function requireActiveTurnkeySession(
  getSession: () => Promise<unknown>
): Promise<void> {
  const activeSession = await getSession();
  if (!activeSession) {
    throw new Error(
      'No active wallet session. Close this popup and reconnect from the dashboard.'
    );
  }
}
