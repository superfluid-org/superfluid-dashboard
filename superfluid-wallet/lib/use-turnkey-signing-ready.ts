'use client';

import { useTurnkey, ClientState } from '@turnkey/react-wallet-kit';
import { useEffect, useState } from 'react';

export type TurnkeySigningStatus = 'loading' | 'ready' | 'needs_auth' | 'error';

export type TurnkeySigningReadyState = {
  status: TurnkeySigningStatus;
  error: string | null;
};

/**
 * Resolves whether the popup can stamp a signing request.
 * - loading: Turnkey client or session restore in progress
 * - needs_auth: no valid session — show inline sign-in (do not send user to dashboard)
 * - ready: session + wallets available
 */
export function useTurnkeySigningReady(): TurnkeySigningReadyState {
  const { clientState, getSession, refreshWallets, wallets, session } =
    useTurnkey();
  const [state, setState] = useState<TurnkeySigningReadyState>({
    status: 'loading',
    error: null,
  });

  useEffect(() => {
    let cancelled = false;

    async function resolveStatus() {
      if (clientState === ClientState.Loading) {
        setState({ status: 'loading', error: null });
        return;
      }

      if (clientState === ClientState.Error) {
        setState({
          status: 'error',
          error: 'Wallet failed to initialize. Refresh and try again.',
        });
        return;
      }

      setState({ status: 'loading', error: null });

      try {
        const activeSession = session ?? (await getSession());
        if (cancelled) return;

        if (!activeSession) {
          setState({ status: 'needs_auth', error: null });
          return;
        }

        if (wallets.length === 0) {
          await refreshWallets();
        }
        if (cancelled) return;

        setState({ status: 'ready', error: null });
      } catch (error) {
        if (cancelled) return;
        setState({
          status: 'error',
          error:
            error instanceof Error
              ? error.message
              : 'Failed to restore wallet session',
        });
      }
    }

    void resolveStatus();

    return () => {
      cancelled = true;
    };
  }, [clientState, getSession, refreshWallets, wallets.length, session]);

  return state;
}
