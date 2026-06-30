import {
  createEntityAdapter,
  createSelector,
  createSlice,
  PayloadAction,
} from "@reduxjs/toolkit";
import { TransactionTitle } from "@superfluid-finance/sdk-redux";
import type { RootState } from "../redux/store";
import { ClearMacroActionKind } from "./dashboardClearMacro";
import { RelayExecutionState } from "./relayApi";

/** Minimal JSON value type — what may be persisted in `extraData`. */
export type JsonValue =
  | string
  | number
  | boolean
  | null
  | JsonValue[]
  | { [key: string]: JsonValue };

/**
 * Strips anything redux-persist can't round-trip (bigint, functions, undefined, symbols) so a
 * persisted recovery entry never breaks rehydration. Bigints become decimal strings (lossless
 * for our `extraData`, which only ever carries display metadata, not write args).
 */
export function toJsonSafe(value: unknown): JsonValue | undefined {
  if (value === undefined) return undefined;
  try {
    return JSON.parse(
      JSON.stringify(value, (_key, val) =>
        typeof val === "bigint" ? val.toString() : val
      )
    ) as JsonValue;
  } catch {
    return undefined;
  }
}

/** Whether a live mutation is still polling this execution (`live`) or it has been handed off
 * to the background recovery poller (`recovering`). */
export type RelayRecoveryOwnership = "live" | "recovering";
export type RelayRecoveryOutcome = "succeeded" | "failed" | "expired";

/**
 * One signed Clear Macro relay execution, persisted the moment it is created so its outcome is
 * never lost to a 120s poll timeout, a closed tab, or a reload. See
 * `docs/plans/clear-macro-relay-integration.md` ("Post-signature timeout recovery").
 */
export interface RecoveringRelayExecution {
  /** Relay provider execution id — the stable handle to poll (`GET /v1/relay-executions/{id}`). */
  executionId: string;
  chainId: number;
  signerAddress: string;
  /** Unix seconds; the relay's echoed `validity.validBefore` (validated finite at registration). */
  validBefore: number;
  title: TransactionTitle;
  subTransactionTitles?: TransactionTitle[];
  /** JSON-sanitized snapshot of the write's `extraData` (no bigint/functions). */
  extraData?: JsonValue;
  actionKind: ClearMacroActionKind;
  /** Unix ms; used for sorting and as a `validBefore` fallback. */
  createdAt: number;
  lastKnownState?: RelayExecutionState;
  ownership: RelayRecoveryOwnership;
  outcome?: RelayRecoveryOutcome;
}

export const relayRecoveryAdapter = createEntityAdapter<
  RecoveringRelayExecution,
  string
>({
  selectId: (x) => x.executionId,
  sortComparer: (a, b) => b.createdAt - a.createdAt,
});

export const relayRecoverySlice = createSlice({
  name: "relayRecovery",
  initialState: relayRecoveryAdapter.getInitialState(),
  reducers: {
    /** Registered by the live write mutation right after the relay POST, before polling. */
    registerLive: (
      state,
      action: PayloadAction<Omit<RecoveringRelayExecution, "ownership" | "outcome">>
    ) => {
      const { validBefore, createdAt } = action.payload;
      // Guard the recovery deadline against a missing/malformed `validity.validBefore` (NaN, 0,
      // negative): fall back to the signed payload's 600s validity window from creation time.
      const safeValidBefore =
        Number.isFinite(validBefore) && validBefore > 0
          ? validBefore
          : Math.floor(createdAt / 1000) + 600;
      relayRecoveryAdapter.upsertOne(state, {
        ...action.payload,
        validBefore: safeValidBefore,
        ownership: "live",
      });
    },
    updateState: (
      state,
      action: PayloadAction<{
        executionId: string;
        lastKnownState: RelayExecutionState;
      }>
    ) => {
      const entity = state.entities[action.payload.executionId];
      // No-op when unchanged — the poller calls this every 2s and the slice is persisted, so a
      // blind write would churn localStorage and reset downstream effects on every tick.
      if (entity && entity.lastKnownState !== action.payload.lastKnownState) {
        relayRecoveryAdapter.updateOne(state, {
          id: action.payload.executionId,
          changes: { lastKnownState: action.payload.lastKnownState },
        });
      }
    },
    /** Live mutation gave up (120s timeout) — the background poller now owns this execution. */
    handOffToRecovery: (state, action: PayloadAction<string>) => {
      if (state.entities[action.payload]) {
        relayRecoveryAdapter.updateOne(state, {
          id: action.payload,
          changes: { ownership: "recovering" },
        });
      }
    },
    /**
     * On app load, any persisted entry's owning mutation/page is gone, so claim every `live`
     * entry for the background poller.
     */
    reclaimOnLoad: (state) => {
      const updates = (state.ids as string[])
        .filter((id) => state.entities[id]?.ownership === "live")
        .map((id) => ({ id, changes: { ownership: "recovering" as const } }));
      if (updates.length) relayRecoveryAdapter.updateMany(state, updates);
    },
    /** Terminal (tracked / failed / expired) — drop the entry. */
    resolveAndRemove: (state, action: PayloadAction<string>) => {
      relayRecoveryAdapter.removeOne(state, action.payload);
    },
  },
});

export const relayRecoveryActions = relayRecoverySlice.actions;

export const relayRecoverySelectors = relayRecoveryAdapter.getSelectors(
  (state: RootState) => state.relayRecovery
);

/** Memoized list of executions the background poller owns (`recovering`). */
export const selectRecoveringRelayExecutions = createSelector(
  relayRecoverySelectors.selectAll,
  (all) => all.filter((e) => e.ownership === "recovering")
);

export default relayRecoverySlice.reducer;
