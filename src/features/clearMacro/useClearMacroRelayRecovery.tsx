import { FC, useCallback, useEffect, useRef } from "react";
import { useStore } from "react-redux";
import { useQuery } from "@tanstack/react-query";
import { Hex } from "viem";
import { toast } from "react-toastify";
import { transactionTrackerSelectors } from "@superfluid-finance/sdk-redux";
import {
  RootState,
  useAppDispatch,
  useAppSelector,
} from "../redux/store";
import { trackTransaction } from "../transactions/trackTransaction";
import { getFinalTransactionHash, getRelayExecution } from "./relayApi";
import {
  RecoveringRelayExecution,
  relayRecoveryActions,
  selectRecoveringRelayExecutions,
} from "./relayRecovery.slice";

const RECOVERY_POLL_INTERVAL_MS = 2_000;
/**
 * Seconds past the payload's on-chain `validBefore` that we keep polling: covers a tx already in
 * the mempool landing just after the window, plus provider status lag and client clock skew.
 * After this the forwarder rejects the payload, so it genuinely can no longer land.
 */
const GRACE_SECONDS = 180;

/**
 * App-level background poller for Clear Macro relay executions that the live write mutation
 * couldn't see through to terminal — a 120s poll timeout, a closed tab, or a reload. Mounted
 * once (post-rehydration) in `ReduxProviderCore`. On mount it claims every persisted execution
 * for recovery, then runs one `<RelayRecoveryWatcher>` per `recovering` entry which polls to
 * terminal and registers a late success via `trackTransaction`.
 *
 * See `docs/plans/clear-macro-relay-integration.md` ("Post-signature timeout recovery").
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

  return (
    <>
      {recovering.map((entry) => (
        <RelayRecoveryWatcher key={entry.executionId} entry={entry} />
      ))}
    </>
  );
};

const RelayRecoveryWatcher: FC<{ entry: RecoveringRelayExecution }> = ({
  entry,
}) => {
  const dispatch = useAppDispatch();
  const store = useStore<RootState>();
  const { executionId } = entry;
  const deadlineMs = (entry.validBefore + GRACE_SECONDS) * 1000;
  // Guards single resolution: the data effect and the deadline effect can race.
  const resolvedRef = useRef(false);

  // Sticky "don't retry" toast while unresolved; dismissed when the entry resolves and this
  // watcher unmounts.
  useEffect(() => {
    const toastId = `relay-recovery-${executionId}`;
    toast.info(
      `A gasless transaction is still being confirmed — please don't retry. (execution ${executionId})`,
      { toastId, autoClose: false, position: "bottom-right" }
    );
    return () => toast.dismiss(toastId);
  }, [executionId]);

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
      dispatch(relayRecoveryActions.resolveAndRemove(executionId));
      toast.success("Your gasless transaction was confirmed.", {
        position: "bottom-right",
      });
    },
    [dispatch, store, entry, executionId]
  );

  const resolveUnsuccessful = useCallback(() => {
    if (resolvedRef.current) return;
    resolvedRef.current = true;
    dispatch(relayRecoveryActions.resolveAndRemove(executionId));
    toast.error(
      `A gasless transaction could not be confirmed (execution ${executionId}). It is safe to try again.`,
      { position: "bottom-right" }
    );
  }, [dispatch, executionId]);

  const query = useQuery({
    queryKey: ["clearMacroRelayRecovery", executionId],
    queryFn: () => getRelayExecution(executionId),
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
      return RECOVERY_POLL_INTERVAL_MS;
    },
    refetchOnWindowFocus: false,
    gcTime: 0,
    retry: 2,
  });

  // Apply the resolution rules as data arrives.
  useEffect(() => {
    const data = query.data;
    if (!data) return;
    dispatch(
      relayRecoveryActions.updateState({
        executionId,
        lastKnownState: data.state,
      })
    );
    if (!data.terminal) return;
    if (data.state === "succeeded") {
      const hash = getFinalTransactionHash(data);
      if (hash) resolveSucceeded(hash);
      // else: succeeded but no hash yet — refetchInterval keeps polling until it appears.
    } else {
      resolveUnsuccessful();
    }
  }, [query.data, dispatch, executionId, resolveSucceeded, resolveUnsuccessful]);

  // Deadline: after `validBefore + grace` the payload can no longer land on-chain. Do a final GET
  // and resolve — but only EXPIRE on a CONFIRMED non-success. If the provider is unreachable at
  // the deadline we must NOT expire (a tx may have already landed during the outage and would be
  // orphaned); keep retrying at a low frequency until we get a definitive answer.
  useEffect(() => {
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
        // Confirmed non-success past the validity window: the payload can no longer land.
        resolveUnsuccessful();
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
  }, [deadlineMs, executionId, resolveSucceeded, resolveUnsuccessful]);

  return null;
};
