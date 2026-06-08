'use client';

import { useTurnkey } from '@turnkey/react-wallet-kit';
import { Loader2 } from 'lucide-react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { AuthButton } from '@/components/auth';
import { TurnkeyIcon } from '@/components/icons';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  completeHfaSetupSession,
  fetchHfaSetupSession,
  parseHfaSetupUrlParams,
  type HfaSetupSession,
} from '@/lib/hfa-setup-client';
import {
  buildHfaSetupCompletePayload,
  runHfaTurnkeySetup,
} from '@/lib/hfa-turnkey-setup';
import { useTurnkeySigningReady } from '@/lib/use-turnkey-signing-ready';

type SetupPageState =
  | 'loading_setup'
  | 'needs_auth'
  | 'ready'
  | 'submitting'
  | 'success'
  | 'error';

function deriveInteractiveState(options: {
  setupSession: HfaSetupSession | null;
  signingStatus: ReturnType<typeof useTurnkeySigningReady>['status'];
  signingError: string | null;
}): SetupPageState {
  const { setupSession, signingStatus, signingError } = options;
  if (!setupSession) return 'loading_setup';
  if (setupSession.status === 'completed') return 'success';
  if (signingStatus === 'loading') return 'loading_setup';
  if (signingStatus === 'error') return 'error';
  return signingStatus === 'needs_auth' ? 'needs_auth' : 'ready';
}

export default function HfaSetupPage() {
  const searchParams = useSearchParams();
  const { session, wallets, fetchOrCreateP256ApiKeyUser, fetchOrCreatePolicies } =
    useTurnkey();
  const signingReady = useTurnkeySigningReady();
  const [pageState, setPageState] = useState<SetupPageState>('loading_setup');
  const [setupSession, setSetupSession] = useState<HfaSetupSession | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const fetchedSessionKeyRef = useRef<string | null>(null);

  const parsedUrl = useMemo(() => {
    try {
      return parseHfaSetupUrlParams({
        session: searchParams.get('session'),
        hfa: searchParams.get('hfa'),
      });
    } catch (error) {
      return {
        error: error instanceof Error ? error.message : 'Invalid setup URL',
      };
    }
  }, [searchParams]);

  const reloadSetupSession = useCallback(async () => {
    if ('error' in parsedUrl) {
      setErrorMessage(parsedUrl.error);
      setPageState('error');
      return;
    }

    setPageState('loading_setup');
    setErrorMessage(null);
    try {
      const loaded = await fetchHfaSetupSession(
        parsedUrl.hfaBaseUrl,
        parsedUrl.sessionId
      );
      setSetupSession(loaded);
      fetchedSessionKeyRef.current = `${parsedUrl.hfaBaseUrl}:${parsedUrl.sessionId}`;
      setPageState(
        deriveInteractiveState({
          setupSession: loaded,
          signingStatus: signingReady.status,
          signingError: signingReady.error,
        })
      );
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : 'Failed to load setup session'
      );
      setPageState('error');
    }
  }, [parsedUrl, signingReady.error, signingReady.status]);

  useEffect(() => {
    if ('error' in parsedUrl) {
      setErrorMessage(parsedUrl.error);
      setPageState('error');
      return;
    }

    const fetchKey = `${parsedUrl.hfaBaseUrl}:${parsedUrl.sessionId}`;
    if (fetchedSessionKeyRef.current === fetchKey) return;

    let cancelled = false;
    setPageState('loading_setup');
    setErrorMessage(null);

    void fetchHfaSetupSession(parsedUrl.hfaBaseUrl, parsedUrl.sessionId)
      .then((loaded) => {
        if (cancelled) return;
        fetchedSessionKeyRef.current = fetchKey;
        setSetupSession(loaded);
      })
      .catch((error: unknown) => {
        if (cancelled) return;
        setErrorMessage(
          error instanceof Error ? error.message : 'Failed to load setup session'
        );
        setPageState('error');
      });

    return () => {
      cancelled = true;
    };
  }, [parsedUrl]);

  useEffect(() => {
    if ('error' in parsedUrl) return;
    if (!setupSession) return;

    if (setupSession.status === 'expired') {
      setErrorMessage('Setup session expired');
      setPageState('error');
      return;
    }

    const nextState = deriveInteractiveState({
      setupSession,
      signingStatus: signingReady.status,
      signingError: signingReady.error,
    });
    setPageState(nextState);
    if (nextState === 'error' && signingReady.error) {
      setErrorMessage(signingReady.error);
    }
  }, [parsedUrl, setupSession, signingReady.error, signingReady.status]);

  const handleEnableHfa = async () => {
    if ('error' in parsedUrl || !setupSession || setupSession.status !== 'pending') {
      return;
    }
    if (!session?.organizationId) {
      setErrorMessage('Turnkey session is not available');
      setPageState('error');
      return;
    }

    setPageState('submitting');
    setErrorMessage(null);

    try {
      const setupResult = await runHfaTurnkeySetup({
        organizationId: session.organizationId,
        wallets,
        agentPublicKey: setupSession.agentPublicKey,
        providerPublicKey: setupSession.providerPublicKey,
        fetchOrCreateP256ApiKeyUser,
        fetchOrCreatePolicies: fetchOrCreatePolicies as Parameters<
          typeof runHfaTurnkeySetup
        >[0]['fetchOrCreatePolicies'],
      });

      const completed = await completeHfaSetupSession(
        parsedUrl.hfaBaseUrl,
        parsedUrl.sessionId,
        buildHfaSetupCompletePayload({
          setupResult,
          agentPublicKey: setupSession.agentPublicKey,
          walletOrigin: window.location.origin,
        })
      );

      setSetupSession(completed);
      setPageState('success');
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : 'Failed to enable HFA. You can retry safely.'
      );
      setPageState('error');
    }
  };

  const walletAddress =
    setupSession && setupSession.status === 'completed'
      ? setupSession.walletAddress
      : wallets.flatMap((wallet) => wallet.accounts.map((account) => account.address)).find(
          (address) => address && address.startsWith('0x')
        );

  const displayError =
    pageState === 'error'
      ? errorMessage ?? signingReady.error
      : null;

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 p-4">
      <TurnkeyIcon className="h-auto w-40" />
      <Card className="w-full max-w-lg border-neutral-800 bg-zinc-900/40">
        <CardHeader>
          <CardTitle>Enable HFA for this Superfluid Wallet</CardTitle>
          <CardDescription>
            This lets your agent prepare transactions for this wallet. Transactions
            still require Human-First Approval before Superfluid HFA co-signs them.
            The agent cannot sign alone, and Superfluid HFA cannot sign alone.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {pageState === 'loading_setup' && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              {setupSession ? 'Restoring wallet session…' : 'Loading setup session…'}
            </div>
          )}

          {pageState === 'needs_auth' && (
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">
                Sign in with email OTP to continue HFA setup.
              </p>
              <AuthButton variant="unlock" />
            </div>
          )}

          {(pageState === 'ready' || pageState === 'submitting') && setupSession?.status === 'pending' && (
            <div className="space-y-3 text-sm">
              <div>
                <span className="text-muted-foreground">Wallet:</span>{' '}
                <code>{walletAddress ?? '—'}</code>
              </div>
              <div>
                <span className="text-muted-foreground">Agent:</span>{' '}
                {setupSession.agentLabel ?? setupSession.agentPublicKey.slice(0, 16) + '…'}
              </div>
              <div>
                <span className="text-muted-foreground">Provider:</span> Superfluid HFA
              </div>
            </div>
          )}

          {pageState === 'success' && (
            <p className="text-sm text-green-500">
              HFA is enabled for this wallet. You can return to your agent.
            </p>
          )}

          {displayError && (
            <p className="text-sm text-red-500">{displayError}</p>
          )}
        </CardContent>
        <CardFooter className="flex gap-2">
          {pageState === 'ready' && (
            <Button onClick={handleEnableHfa} className="w-full">
              Enable HFA
            </Button>
          )}
          {pageState === 'submitting' && (
            <Button disabled className="w-full">
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Enabling HFA…
            </Button>
          )}
          {pageState === 'error' && setupSession?.status === 'pending' && (
            <Button onClick={() => void reloadSetupSession()} variant="secondary" className="w-full">
              Retry
            </Button>
          )}
        </CardFooter>
      </Card>
    </main>
  );
}
