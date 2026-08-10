import { FC, useCallback, useEffect, useRef } from "react";
import { useStore } from "react-redux";
import { useQuery } from "@tanstack/react-query";
import { Hex } from "viem";
import { toast } from "react-toastify";
import { Button, Stack, Typography } from "@mui/material";
import { transactionTrackerSelectors } from "@superfluid-finance/sdk-redux";
import {
  reduxPersistor,
  RootState,
  useAppDispatch,
  useAppSelector,
} from "../redux/store";
import { trackTransaction } from "../transactions/trackTransaction";
import {
  cancelRelayExecution,
  ClearMacroRelayError,
  createRelayExecution,
  getFinalTransactionHash,
  getRelayExecution,
  isRenderableMessageLink,
  type CreateRelayExecutionBody,
  type RelayExecution,
} from "./relayApi";
import { describeTerminalRelayState } from "./relayStateCopy";
import { getSafeMessage } from "./safeMessageLookup";
import { SafeRelayPendingToast } from "./SafeRelayPendingToast";
import {
  PendingRelayIntent,
  RecoveringRelayExecution,
  relayRecoveryActions,
  selectPendingRelayIntents,
  selectRecoveringRelayExecutions,
  decodeRelayIntentDisplayMeta,
} from "./relayRecovery.slice";

const RECOVERY_POLL_INTERVAL_MS = 2_000;
/**
 * Polling cadence while a Safe's owners are still approving. A co-signer round takes hours or
 * days, so 2s would be tens of thousands of pointless requests; the interval drops back to
 * `RECOVERY_POLL_INTERVAL_MS` the moment the state advances to `pending`/`submitted`, where
 * things move in seconds again.
 */
const AWAITING_AUTHORIZATION_POLL_INTERVAL_MS = 30_000;
/**
 * Seconds past the payload's on-chain `validBefore` that we keep polling: covers a tx already in
 * the mempool landing just after the window, plus provider status lag and client clock skew.
 * After this the forwarder rejects the payload, so it genuinely can no longer land.
 */
const GRACE_SECONDS = 180;
/**
 * How long a provider outage may continue before we stop polling and stop nagging.
 *
 * Note what this bound does NOT do: it does not release the write guards. An earlier design
 * deleted the entry here, which — against a 72 hour validity window — silently reopened the
 * exact `transfer` / `upgrade` / `downgrade` double-spend the guards exist to prevent. The
 * entry is demoted to a passive tombstone instead, and only `validBefore + grace`, a positive
 * answer, or the user's explicit override releases it.
 */
const UNREACHABLE_TOMBSTONE_MS = 24 * 60 * 60 * 1000;
/** How many times a pre-POST intent is replayed before we surface it to the user instead. */
const MAX_INTENT_REPLAY_ATTEMPTS = 5;

/**
 * App-level background poller for Clear Macro relay executions that the live write mutation
 * couldn't see through to terminal — a 120s poll timeout, a closed tab, a reload, or (for a
 * Safe) a multi-day wait for co-signers. Mounted once (post-rehydration) in `ReduxProviderCore`.
 *
 * See `docs/plans/clear-macro-relay-integration.md` ("Post-signature timeout recovery") and
 * `docs/plans/clear-macro-safe-authorization.md`.
 */
export const ClearMacroRelayRecovery: FC = () => {
  const dispatch = useAppDispatch();
  const reclaimedRef = useRef(false);

  // Any persisted entry that survived to this mount has no live owner anymore (its mutation/page
  // is gone), so hand them all to the background poller. Runs once.
  useEffect(() => {
    if (reclaimedRef.current) return;
    reclaimedRef.current = true;
    dispatch(relayRecoveryActions.reclaimOnLoad());
  }, [dispatch]);

  const recovering = useAppSelector(selectRecoveringRelayExecutions);
  const pendingIntents = useAppSelector(selectPendingRelayIntents);

  return (
    <>
      {pendingIntents
        // Only intents nothing owns anymore. An intent whose own mutation is still running its
        // POST must not be replayed — that would fire a duplicate concurrent create on every
        // single Safe authorization, which is the opposite of recovering an unanswered one.
        .filter((intent) => intent.ownership === "recovering")
        .map((intent) => (
          <PendingIntentReplayer key={intent.clientRequestId} intent={intent} />
        ))}
      {recovering.map((entry) => (
        <RelayRecoveryWatcher key={entry.executionId} entry={entry} />
      ))}
    </>
  );
};

/**
 * Resolves a pre-POST intent whose create request was never answered.
 *
 * The provider deduplicates on the signed authorization intent, so replaying the byte-identical
 * body either returns the execution the original POST created (200) or creates it now (202).
 * Either way the intent is promoted — UNLESS a cancel was requested in the meantime, in which
 * case the replay exists purely to obtain the id so it can be cancelled. Promoting a cancelled
 * intent as a healthy one is exactly the resurrection this flag prevents.
 */
const PendingIntentReplayer: FC<{ intent: PendingRelayIntent }> = ({
  intent,
}) => {
  const dispatch = useAppDispatch();
  const store = useStore<RootState>();
  const startedRef = useRef(false);

  const expiryMs = (intent.validBefore + GRACE_SECONDS) * 1000;
  // The effect must NOT depend on the whole intent: it dispatches `countIntentReplayAttempt`,
  // which replaces the object, which would tear down the effect mid-POST and discard the
  // result — burning an attempt per reload without ever promoting or cancelling. Depend on the
  // stable id, and read anything mutable back from the store when it is actually needed.
  const { clientRequestId } = intent;
  const intentRef = useRef(intent);
  intentRef.current = intent;

  useEffect(() => {
    if (startedRef.current) return;
    startedRef.current = true;

    let cancelled = false;

    const run = async () => {
      const current = intentRef.current;
      // Past its own validity window the payload can no longer land, so whatever became of the
      // POST, the guards this intent holds are meaningless. Without this an intent whose create
      // was never answered would hold Guard A and Guard B forever — the same
      // never-release-on-uncertainty failure the tombstone bound exists to avoid, in the one
      // place that has no execution id to tombstone.
      if (Date.now() > expiryMs) {
        dispatch(relayRecoveryActions.clearPendingIntent(clientRequestId));
        await reduxPersistor.flush();
        return;
      }
      if (current.replayAttempts >= MAX_INTENT_REPLAY_ATTEMPTS) {
        // Out of attempts but still inside the window: keep the intent (and its guards), and
        // say so, because the user is otherwise blocked from that action with no explanation
        // and no record of the message hash to check in Safe.
        toast.warning(
          `A gasless request couldn't be confirmed with the service. If you approved it in Safe it may still go through, so this action stays blocked until ${new Date(
            expiryMs
          ).toLocaleString()}. Safe message: ${intent.safeMessageHash}`,
          {
            toastId: `relay-intent-stuck-${clientRequestId}`,
            autoClose: false,
            position: "bottom-right",
          }
        );
        return;
      }
      dispatch(relayRecoveryActions.countIntentReplayAttempt(clientRequestId));

      let body: CreateRelayExecutionBody;
      try {
        body = JSON.parse(current.postBody) as CreateRelayExecutionBody;
      } catch {
        // Unreplayable — but NOT evidence that nothing exists. The intent is written before the
        // POST precisely because that POST may have committed an execution whose response we
        // lost, and the double spend runs through the provider, not through the id. So the
        // guards stay armed until the payload can no longer land; only the expiry above clears
        // it. Burn the attempts so the stuck-intent notice appears instead of retrying a body
        // that will never parse.
        for (let i = current.replayAttempts; i < MAX_INTENT_REPLAY_ATTEMPTS; i++) {
          dispatch(relayRecoveryActions.countIntentReplayAttempt(clientRequestId));
        }
        await reduxPersistor.flush();
        return;
      }

      let execution: RelayExecution;
      try {
        execution = await createRelayExecution(body);
      } catch {
        // Still unanswered, or refused. Leave the intent in place — it keeps the guards armed
        // and will be retried on the next load, up to the attempt cap.
        return;
      }
      if (cancelled) return;

      // Promote FIRST, unconditionally — including when a cancel is pending. The execution now
      // demonstrably exists, and the recovery entry is what carries its write guards and its
      // Cancel affordance from here on. Clearing the intent without promoting would drop both.
      const display = decodeRelayIntentDisplayMeta(current.displayMeta);
      dispatch(
        relayRecoveryActions.registerLive({
          // Nothing owns this — it must land as `recovering` or no watcher would poll it and
          // no pending surface would appear until some later reload happened to reclaim it.
          ownership: "recovering",
          executionId: execution.id,
          chainId: current.chainId,
          signerAddress: current.signerAddress,
          validBefore: Number(execution.validity.validBefore),
          fallbackValidityWindowSeconds: Math.max(
            0,
            current.validBefore - Math.floor(current.createdAt / 1000)
          ),
          title: display?.title ?? "Gasless Transaction",
          subTransactionTitles: display?.subTransactionTitles,
          extraData: display?.extraData,
          actionKind: current.actionKind,
          createdAt: current.createdAt,
          authorizationType: "safeMessageV1",
          safeMessageHash: current.safeMessageHash,
          // Validated even here: it is persisted and later rendered as a link.
          messageLink: isRenderableMessageLink(
            execution.authorization?.messageLink
          )
            ? execution.authorization?.messageLink
            : undefined,
          actionFingerprint: current.actionFingerprint || undefined,
          clientRequestId,
          // Read back from the store, not from the render-time snapshot: a cancel may have been
          // requested while this POST was in flight.
          cancelRequested:
            store.getState().relayRecovery.pendingIntents[clientRequestId]
              ?.cancelRequested ?? current.cancelRequested,
        })
      );
      await reduxPersistor.flush();

      const cancelWanted =
        store.getState().relayRecovery.entities[execution.id]?.cancelRequested;
      if (!cancelWanted) return;

      // A cancel was decided before this execution had an id — the whole reason the flag is
      // durable. Carry it out now. If it does NOT succeed the entry stays exactly as it is,
      // guards armed, and the user can retry the cancel from its pending toast; releasing on an
      // unconfirmed cancel is the double-spend this guards against.
      try {
        await cancelRelayExecution(execution.id);
        dispatch(relayRecoveryActions.releaseGuard(execution.id));
        dispatch(relayRecoveryActions.resolveAndRemove(execution.id));
        await reduxPersistor.flush();
      } catch {
        // Left armed deliberately.
      }
    };

    void run();
    // Also expire it while the tab stays open, so a long-lived session releases the guards at
    // the same moment a reload would.
    const timer = setTimeout(
      () => {
        dispatch(relayRecoveryActions.clearPendingIntent(clientRequestId));
      },
      Math.max(0, expiryMs - Date.now())
    );
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [dispatch, store, clientRequestId, expiryMs]);

  return null;
};

const RelayRecoveryWatcher: FC<{ entry: RecoveringRelayExecution }> = ({
  entry,
}) => {
  const dispatch = useAppDispatch();
  const store = useStore<RootState>();
  const { executionId } = entry;
  const deadlineMs = (entry.validBefore + GRACE_SECONDS) * 1000;
  const isSafe = entry.authorizationType === "safeMessageV1";
  const isTombstoned = entry.tombstonedAt != null;
  // Guards single resolution: the data effect and the deadline effect can race.
  const resolvedRef = useRef(false);

  // When the provider first became unreachable in this run, for the tombstone bound.
  const unreachableSinceRef = useRef<number | undefined>(undefined);

  // How many owners have signed, for the pending copy. Fetched ONCE per mount, never polled:
  // the Transaction Service allows about 5000 requests per 30 days per IP, and this only
  // sharpens wording — "waiting for the other owners (1 of 3 approved)" instead of the hedged
  // version that still has to allow for the user having declined. Its failure is invisible by
  // design and falls back to that hedged copy.
  const proposalQuery = useQuery({
    queryKey: ["safeMessageProposal", entry.chainId, entry.safeMessageHash],
    queryFn: () => getSafeMessage(entry.chainId, entry.safeMessageHash!),
    enabled: isSafe && !isTombstoned && !!entry.safeMessageHash,
    staleTime: Infinity,
    refetchOnWindowFocus: false,
    retry: false,
  });
  const confirmations =
    proposalQuery.data?.status === "found"
      ? proposalQuery.data.confirmations
      : undefined;

  // The pending surface. A Safe wait gets the rich version — expiry, execution id, Review in
  // Safe, Cancel — because the old string ("still being confirmed, please don't retry") is
  // wrong on both halves for a multi-day co-signer round. A tombstoned entry shows nothing:
  // polling and nagging have stopped, only the guard remains.
  useEffect(() => {
    if (isTombstoned) return;
    const toastId = `relay-recovery-${executionId}`;
    if (isSafe) {
      const body = (
        <SafeRelayPendingToast
          executionId={executionId}
          clientRequestId={entry.clientRequestId}
          validBefore={entry.validBefore}
          messageLink={entry.messageLink}
          threshold={entry.safeThreshold}
          confirmations={confirmations}
        />
      );
      // `toast.info` with an existing id is a NO-OP, so the confirmation count and the Safe
      // link would never appear once they resolve. Update in place when it already exists.
      if (toast.isActive(toastId)) {
        toast.update(toastId, { render: body });
      } else {
        toast.info(body, {
          toastId,
          autoClose: false,
          position: "bottom-right",
          closeOnClick: false,
        });
      }
    } else {
      toast.info(
        `A gasless transaction is still being confirmed. Please don't retry. (execution ${executionId})`,
        { toastId, autoClose: false, position: "bottom-right" }
      );
    }
    return () => toast.dismiss(toastId);
  }, [
    executionId,
    isSafe,
    isTombstoned,
    entry.clientRequestId,
    entry.validBefore,
    entry.messageLink,
    entry.safeThreshold,
    confirmations,
  ]);

  const resolveSucceeded = useCallback(
    (hash: Hex) => {
      if (resolvedRef.current) return;
      resolvedRef.current = true;
      // Idempotent: the in-session mutation path (or a prior watcher render) may have already
      // tracked this hash; registering it again would be a no-op upsert, but skip anyway.
      const alreadyTracked = transactionTrackerSelectors.selectById(
        store.getState(),
        hash
      );
      if (!alreadyTracked) {
        // No optimistic pending updates on the recovery path — they need a live builder + the
        // (then-unknown) hash. The drawer entry + RPC/subgraph refetch reconcile the UI.
        dispatch(
          trackTransaction({
            hash,
            chainId: entry.chainId,
            signerAddress: entry.signerAddress,
            title: entry.title,
            extraData: {
              ...(entry.subTransactionTitles
                ? { subTransactionTitles: entry.subTransactionTitles }
                : {}),
              ...((entry.extraData as Record<string, unknown> | undefined) ??
                {}),
              clearMacroExecutionId: executionId,
            },
          })
        );
      }
      // A confirmed terminal state is a positive answer, so the guards go with the entry.
      dispatch(relayRecoveryActions.releaseGuard(executionId));
      dispatch(relayRecoveryActions.resolveAndRemove(executionId));
      toast.success("Your gasless transaction was confirmed.", {
        position: "bottom-right",
      });
    },
    [dispatch, store, entry, executionId]
  );

  /**
   * A CONFIRMED terminal state other than success. Positive knowledge, so the guards release
   * and the entry goes — and the copy names the actual state instead of collapsing every
   * outcome into "could not be confirmed, safe to try again", which is wrong for a cancel and
   * misleading for a revert.
   */
  const resolveTerminal = useCallback(
    (execution: RelayExecution) => {
      if (resolvedRef.current) return;
      resolvedRef.current = true;
      const copy = describeTerminalRelayState(
        execution.state,
        execution.error?.code,
        executionId
      );
      dispatch(relayRecoveryActions.releaseGuard(executionId));
      dispatch(relayRecoveryActions.resolveAndRemove(executionId));
      const notify = copy.severity === "error" ? toast.error : toast.info;
      notify(`${copy.title}. ${copy.body}`, { position: "bottom-right" });
    },
    [dispatch, executionId]
  );

  /**
   * Stop polling and stop nagging, but KEEP the guard. Used when the outcome is unobservable
   * rather than known: a long provider outage, or a 404 that only tells us the execution is
   * not visible to us. Client scoping on the provider is not established, so a 404 is not proof
   * the execution does not exist somewhere — it stays guarded until it can no longer land.
   */
  const tombstone = useCallback(
    (reason: "not-found" | "unreachable") => {
      if (resolvedRef.current) return;
      resolvedRef.current = true;
      dispatch(
        relayRecoveryActions.tombstone({ executionId, at: Date.now(), reason })
      );
    },
    [dispatch, executionId]
  );

  const query = useQuery({
    queryKey: ["clearMacroRelayRecovery", executionId],
    queryFn: () => getRelayExecution(executionId),
    enabled: !isTombstoned,
    refetchInterval: (q) => {
      if (Date.now() > deadlineMs) return false;
      const data = q.state.data;
      if (data?.terminal) {
        // Mirror the live poll's invariant: `succeeded` is only resolvable once a final hash is
        // present; until then keep polling (the relay may surface it shortly).
        if (data.state === "succeeded" && !getFinalTransactionHash(data)) {
          return RECOVERY_POLL_INTERVAL_MS;
        }
        return false;
      }
      if (data?.state === "awaiting_authorization") {
        return AWAITING_AUTHORIZATION_POLL_INTERVAL_MS;
      }
      // No data at all means we have never reached the provider in this run — most likely an
      // outage, which the tombstone bound lets run for 24 hours. Hammering at 2s there would be
      // tens of thousands of failing requests; back off to the awaiting-authorization cadence
      // until something answers. A live entry that has data polls fast, as before.
      if (!data) return AWAITING_AUTHORIZATION_POLL_INTERVAL_MS;
      return RECOVERY_POLL_INTERVAL_MS;
    },
    // A co-signer confirming happens in another tab or on another device, so returning to the
    // dashboard is the strongest signal we get that something may have changed.
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
    gcTime: 0,
    retry: 2,
  });

  // Apply the resolution rules as data arrives.
  useEffect(() => {
    const data = query.data;
    if (!data) return;
    unreachableSinceRef.current = undefined;
    dispatch(
      relayRecoveryActions.updateState({
        executionId,
        lastKnownState: data.state,
        lastKnownTerminal: data.terminal,
      })
    );
    if (!data.terminal) return;
    if (data.state === "succeeded") {
      const hash = getFinalTransactionHash(data);
      if (hash) resolveSucceeded(hash);
      // else: succeeded but no hash yet — refetchInterval keeps polling until it appears.
    } else {
      resolveTerminal(data);
    }
  }, [query.data, dispatch, executionId, resolveSucceeded, resolveTerminal]);

  // Errors: distinguish a CONFIRMED 404 (the execution is not visible to us and never will be)
  // from an unreachable provider (we know nothing). Only the former stops polling promptly, and
  // NEITHER releases a guard.
  useEffect(() => {
    const error = query.error;
    if (!error) return;
    if (error instanceof ClearMacroRelayError && error.status === 404) {
      toast.error(
        `A gasless transaction could not be found (execution ${executionId}). If you have the ID, keep it — this action stays blocked until the request can no longer run.`,
        { position: "bottom-right" }
      );
      tombstone("not-found");
      return;
    }
    const now = Date.now();
    unreachableSinceRef.current ??= now;
    if (now - unreachableSinceRef.current > UNREACHABLE_TOMBSTONE_MS) {
      tombstone("unreachable");
    }
  }, [query.error, executionId, tombstone]);

  // Expiry, for a tombstone the provider ANSWERED about (404) — and only that one.
  //
  // NOTE: the plan is self-contradictory here. §10.2 says a guard releases only on a positive
  // answer and "never on a timeout, a deadline, a 5xx, or an unreachable provider", and then
  // says a tombstone "expires on its own at `validBefore + grace`". Those cannot both hold for
  // an unreachable-provider tombstone: passing `validBefore` proves the payload cannot land in
  // future, not that it never landed during the outage, so releasing there is releasing on a
  // timeout. The narrower reading is implemented: a 404 tombstone expires (we got an answer,
  // and the payload can no longer land), an unreachable one does not and waits for a positive
  // answer or the user's explicit override. Flagged for Kaspar.
  const canExpire = entry.tombstoneReason === "not-found";
  useEffect(() => {
    if (!isTombstoned || !canExpire) return;
    const untilExpiry = deadlineMs - Date.now();
    if (untilExpiry <= 0) {
      dispatch(relayRecoveryActions.resolveAndRemove(executionId));
      return;
    }
    const timer = setTimeout(
      () => dispatch(relayRecoveryActions.resolveAndRemove(executionId)),
      untilExpiry
    );
    return () => clearTimeout(timer);
  }, [deadlineMs, dispatch, executionId, isTombstoned, canExpire]);

  // Deadline: after `validBefore + grace` do a final GET. Only a CONFIRMED answer resolves —
  // an unreachable provider must never expire the entry, because a transaction may have landed
  // during the outage and would be orphaned.
  useEffect(() => {
    if (isTombstoned) return;
    let cancelled = false;
    let timer: ReturnType<typeof setTimeout>;
    const RETRY_MS = 60_000;

    const runFinalCheck = async () => {
      if (cancelled) return;
      try {
        const data = await getRelayExecution(executionId);
        if (cancelled) return;
        if (data.state === "succeeded") {
          const hash = getFinalTransactionHash(data);
          if (hash) {
            resolveSucceeded(hash);
            return;
          }
          // Succeeded but the hash hasn't surfaced — check again shortly.
          timer = setTimeout(() => void runFinalCheck(), RETRY_MS);
          return;
        }
        if (data.terminal) {
          resolveTerminal(data);
          return;
        }
        // NOT terminal past the window — most importantly `submitted`, a transaction that may
        // still be in the mempool. Resolving here would both lose the outcome and invite a
        // retry that double-executes. Keep watching.
        timer = setTimeout(() => void runFinalCheck(), RETRY_MS);
      } catch {
        // Provider unreachable — do NOT expire (would risk orphaning a landed tx). Retry later.
        if (!cancelled) timer = setTimeout(() => void runFinalCheck(), RETRY_MS);
      }
    };

    timer = setTimeout(
      () => void runFinalCheck(),
      Math.max(0, deadlineMs - Date.now())
    );
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [
    deadlineMs,
    executionId,
    isTombstoned,
    resolveSucceeded,
    resolveTerminal,
  ]);

  // The manual override. A permanently unreachable provider would otherwise keep this action
  // blocked until the window closes with nothing the user can do about it. Deliberately worded
  // as the acknowledged risk it is: releasing while the request could still run is exactly the
  // double-spend the guard exists to prevent.
  useEffect(() => {
    // Only the unreachable tombstone needs the override — the 404 one expires by itself.
    if (!isTombstoned || !isSafe || canExpire) return;
    const toastId = `relay-tombstone-${executionId}`;
    toast.warning(
      <Stack sx={{ gap: 1 }} data-cy="safe-relay-tombstone-toast">
        <Typography variant="body2" translate="yes">
          A gasless request can&apos;t be checked right now, so this action stays
          blocked until it expires.
        </Typography>
        <Typography variant="caption" translate="no">
          {executionId}
        </Typography>
        <Button
          size="small"
          color="warning"
          data-cy="safe-relay-force-release"
          onClick={() => {
            dispatch(relayRecoveryActions.releaseGuard(executionId));
            dispatch(relayRecoveryActions.resolveAndRemove(executionId));
          }}
        >
          I&apos;ve confirmed in Safe that this won&apos;t execute — release it
        </Button>
      </Stack>,
      { toastId, autoClose: false, position: "bottom-right", closeOnClick: false }
    );
    return () => toast.dismiss(toastId);
  }, [dispatch, executionId, isSafe, isTombstoned, canExpire]);

  return null;
};
