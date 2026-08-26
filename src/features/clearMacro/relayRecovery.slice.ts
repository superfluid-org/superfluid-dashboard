import {
  createEntityAdapter,
  createSelector,
  createSlice,
  EntityState,
  PayloadAction,
} from "@reduxjs/toolkit";
import { TransactionTitle } from "@superfluid-finance/sdk-redux";
import type { RootState } from "../redux/store";
import { ClearMacroActionKind } from "./dashboardClearMacro";
import { RelayExecutionState } from "./relayApi";

declare module "@superfluid-finance/sdk-redux" {
  interface TransactionTitleOverrides {
    /**
     * Last-resort title for a recovered gasless execution whose persisted display metadata
     * could not be read back. The execution is live and must still be promoted — losing the
     * drawer label is far better than dropping an entry that carries the write guards.
     */
    "Gasless Transaction": true;
  }
}

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
 * Whether this entry still blocks writes that could double-execute its action.
 *
 * `active` is the safe default and releases ONLY on a positive answer — a confirmed terminal
 * state, or a cancel that returned 2xx. Never on a timeout, a deadline, a 5xx, or an
 * unreachable provider: until the payload can no longer land, a direct write of the same
 * action can still be executed a second time by the relay.
 */
export type RelayGuardState = "active" | "released";

/**
 * One Clear Macro relay execution, persisted the moment it is created so its outcome is
 * never lost to a 120s poll timeout, a closed tab, or a reload. See
 * `docs/plans/clear-macro-relay-integration.md` ("Post-signature timeout recovery") and
 * `docs/plans/clear-macro-safe-authorization.md`.
 *
 * Every Safe-specific field is optional so entries persisted by an earlier build stay valid
 * on rehydrate. An entry with no `authorizationType` is an EOA execution and carries no
 * guards — see `selectRelayWriteGuards`.
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
  /**
   * The `terminal` flag from the last response, persisted alongside the state. The resource
   * carries its own terminality, so we never hardcode a list of terminal states — but the
   * guard must still be decidable from persisted data when the provider is unreachable.
   */
  lastKnownTerminal?: boolean;
  ownership: RelayRecoveryOwnership;
  outcome?: RelayRecoveryOutcome;

  // --- Safe authorization (absent on EOA entries) ---

  /** Set only for Safe-authorized executions; its presence is what arms the write guards. */
  authorizationType?: "safeMessageV1";
  /** The locally-derived Safe message hash the provider polls, and our tx-service lookup key. */
  safeMessageHash?: string;
  /** Provider-returned deep link to the Safe message. Validated HTTPS at registration. */
  messageLink?: string;
  safeThreshold?: number;
  /** Canonical identity of the action, for the double-spend guard. See `actionFingerprint.ts`. */
  actionFingerprint?: string;
  /**
   * A cancel was decided before an execution id was known, or before the DELETE succeeded.
   * Durable so the pre-POST replay path resolves the intent by cancelling it rather than
   * resurrecting it as a live entry. Cleared only by a confirmed cancel or a terminal state.
   */
  cancelRequested?: boolean;
  guardState: RelayGuardState;
  /** The pre-POST intent this was promoted from, if any. */
  clientRequestId?: string;
  /**
   * Unix ms at which polling and user-facing nagging stopped while the guard stayed armed
   * (provider unreachable for a long time, or a confirmed 404).
   */
  tombstonedAt?: number;
  /**
   * Why it was tombstoned — which decides whether it may expire on its own.
   *
   * `not-found`: the provider ANSWERED 404. The execution is not visible to us and never will
   * be, and past `validBefore + grace` the payload cannot land either, so the guard has nothing
   * left to protect and expires.
   *
   * `unreachable`: we got no answer at all. Expiry proves the payload cannot land in FUTURE; it
   * does not prove it never landed during the outage. Releasing on that would be releasing on a
   * timeout, which is the one thing the guard must never do — so it holds until a positive
   * answer or the user's explicit override.
   */
  tombstoneReason?: "not-found" | "unreachable";
}

/**
 * A relay execution the dashboard intended to create, persisted BEFORE the POST.
 *
 * Two things depend on it existing before any network call can fail. First, an unanswered
 * POST is ambiguous — the provider may well have committed the execution — so the recovery
 * path replays the byte-identical body and relies on server-side dedup to return the original
 * rather than creating a second one. Nothing in `postBody` may be regenerated, which is why
 * the whole body is stored verbatim rather than rebuilt from parts. Second, the write guards
 * are armed from this moment, not from the create response.
 */
export interface PendingRelayIntent {
  /** Generated once, pre-POST, and never regenerated — the dedup key for the replay. */
  clientRequestId: string;
  /**
   * `live` while the mutation that created this intent is still running its own POST;
   * `recovering` once nothing owns it anymore.
   *
   * Without this the background replayer, which is always mounted and reacts the instant the
   * intent is persisted, fires a SECOND create concurrently with the original — turning the
   * recovery path for an unanswered POST into a duplicate request on every single run, and
   * leaning on the provider's dedup being atomic under two concurrent identical creates.
   */
  ownership: RelayRecoveryOwnership;
  chainId: number;
  signerAddress: string;
  safeMessageHash: string;
  /** Unix seconds. */
  validBefore: number;
  /**
   * The exact serialized JSON POST body, replayed byte-for-byte. Stored as the string rather
   * than a parsed object so nothing — key order, number formatting, a persist round-trip — can
   * change between the original request and its replay: the provider deduplicates on the
   * signed authorization intent, and the replay is only safe while it is identical.
   */
  postBody: string;
  actionFingerprint: string;
  cancelRequested: boolean;
  actionKind: ClearMacroActionKind;
  /** Unix ms. */
  createdAt: number;
  /** Number of replay attempts already spent, so recovery can bound them across reloads. */
  replayAttempts: number;
  /**
   * The drawer-facing fields (`title`, `subTransactionTitles`, `extraData`) this intent will
   * carry onto its recovery entry, serialized. Opaque cargo from the intent's point of view —
   * it neither reads nor merges them, it just hands them over at promotion.
   *
   * Serialized rather than nested for the same reason `postBody` is: `extraData` is typed as
   * the recursive `JsonValue`, and drafting that inside a slice's extra state exceeds
   * TypeScript's instantiation depth. Encode and decode through the helpers below so the
   * typing is enforced at the boundary instead.
   */
  displayMeta: string;
}

/** The drawer-facing fields an intent carries until it becomes a recovery entry. */
export interface RelayIntentDisplayMeta {
  title: TransactionTitle;
  subTransactionTitles?: TransactionTitle[];
  extraData?: JsonValue;
}

export const encodeRelayIntentDisplayMeta = (
  meta: RelayIntentDisplayMeta
): string => JSON.stringify(meta);

/** Returns `undefined` if the persisted value is unparseable — never throws on rehydrate. */
export const decodeRelayIntentDisplayMeta = (
  encoded: string
): RelayIntentDisplayMeta | undefined => {
  try {
    const parsed = JSON.parse(encoded) as RelayIntentDisplayMeta;
    return parsed && typeof parsed.title === "string" ? parsed : undefined;
  } catch {
    return undefined;
  }
};

export const relayRecoveryAdapter = createEntityAdapter<
  RecoveringRelayExecution,
  string
>({
  selectId: (x) => x.executionId,
  sortComparer: (a, b) => b.createdAt - a.createdAt,
});

export type RegisterLiveRelayExecutionPayload = Omit<
  RecoveringRelayExecution,
  "ownership" | "outcome" | "guardState"
> & {
  /** Defaults to `live`. Background promotion passes `recovering` — nothing owns it. */
  ownership?: RelayRecoveryOwnership;
  /** The validity window the caller built, used only if `validBefore` is unusable. */
  fallbackValidityWindowSeconds: number;
};

/**
 * `validity.validBefore` arrives as a string off the wire and is `Number()`-ed by the caller,
 * so a missing or malformed field lands here as NaN/0/negative. Falling back to a fixed 600s
 * would force-resolve a Safe entry roughly ten minutes into what may be a 72-hour wait, so the
 * window comes from the caller — which is the only place that knows which one it built.
 */
const resolveValidBefore = (
  validBefore: number,
  createdAt: number,
  fallbackWindowSeconds: number
) =>
  Number.isFinite(validBefore) && validBefore > 0
    ? validBefore
    : Math.floor(createdAt / 1000) + fallbackWindowSeconds;

/**
 * Named explicitly rather than left to inference: `getInitialState`'s inferred intersection of
 * `EntityState` with the extra slice state makes TypeScript re-instantiate the adapter's
 * generics through `RecoveringRelayExecution` on every adapter call, which exceeds its
 * instantiation depth limit.
 */
export type RelayRecoveryState = EntityState<RecoveringRelayExecution, string> & {
  /** Pre-POST intents, keyed by `clientRequestId`. */
  pendingIntents: Record<string, PendingRelayIntent>;
};

const initialRelayRecoveryState: RelayRecoveryState =
  relayRecoveryAdapter.getInitialState({
    pendingIntents: {} as Record<string, PendingRelayIntent>,
  });

/**
 * See the note at `setOne` below — a depth-limit workaround, not a widening. The parameter is
 * deliberately `object` so TypeScript stops trying to structurally match the mutable draft of
 * our intersection state against the adapter's `S extends EntityState<T, Id>` constraint.
 */
const asEntityState = (state: object) =>
  state as EntityState<RecoveringRelayExecution, string>;

export const relayRecoverySlice = createSlice({
  name: "relayRecovery",
  initialState: initialRelayRecoveryState,
  reducers: {
    /** Registered by the live write mutation right after the relay POST, before polling. */
    registerLive: (
      state,
      action: PayloadAction<RegisterLiveRelayExecutionPayload>
    ) => {
      const { fallbackValidityWindowSeconds, ...entry } = action.payload;
      const entity: RecoveringRelayExecution = {
        ...entry,
        validBefore: resolveValidBefore(
          entry.validBefore,
          entry.createdAt,
          fallbackValidityWindowSeconds
        ),
        ownership: entry.ownership ?? "live",
        guardState: "active",
        // Carry a cancel decided while the POST was in flight ONTO the entity, in the same
        // reducer that deletes the intent holding it. Re-establishing it in a later dispatch
        // would lose the decision if anything interrupted the two, and the whole point of the
        // flag is that it survives exactly that.
        cancelRequested:
          entry.cancelRequested ??
          (entry.clientRequestId
            ? state.pendingIntents[entry.clientRequestId]?.cancelRequested
            : undefined),
      };
      // `setOne`, not `upsertOne`: the payload is a complete entity, and registration is the
      // start of an execution's life, so replacing beats shallow-merging leftovers onto it.
      //
      // The cast narrows the draft to the plain `EntityState` the adapter is generic over.
      // Matching `S extends EntityState<T, Id>` against a draft of the intersection with our
      // extra slice state re-instantiates the adapter's generics deeply enough to exceed
      // TypeScript's instantiation limit. Nothing is widened — only the extra key is dropped.
      relayRecoveryAdapter.setOne(asEntityState(state), entity);
      // The intent is now represented by a real execution — stop replaying its POST.
      if (entry.clientRequestId) {
        delete state.pendingIntents[entry.clientRequestId];
      }
    },
    updateState: (
      state,
      action: PayloadAction<{
        executionId: string;
        lastKnownState: RelayExecutionState;
        lastKnownTerminal: boolean;
      }>
    ) => {
      const entity = state.entities[action.payload.executionId];
      // No-op when unchanged — the poller calls this every 2s and the slice is persisted, so a
      // blind write would churn localStorage and reset downstream effects on every tick.
      if (
        entity &&
        (entity.lastKnownState !== action.payload.lastKnownState ||
          entity.lastKnownTerminal !== action.payload.lastKnownTerminal)
      ) {
        relayRecoveryAdapter.updateOne(asEntityState(state), {
          id: action.payload.executionId,
          changes: {
            lastKnownState: action.payload.lastKnownState,
            lastKnownTerminal: action.payload.lastKnownTerminal,
          },
        });
      }
    },

    /** Persisted before the POST — see `PendingRelayIntent`. */
    registerPendingIntent: (state, action: PayloadAction<PendingRelayIntent>) => {
      state.pendingIntents[action.payload.clientRequestId] = action.payload;
    },
    countIntentReplayAttempt: (state, action: PayloadAction<string>) => {
      const intent = state.pendingIntents[action.payload];
      if (intent) intent.replayAttempts += 1;
    },
    clearPendingIntent: (state, action: PayloadAction<string>) => {
      delete state.pendingIntents[action.payload];
    },
    /** The live mutation is done with this intent without having resolved it. */
    handIntentToRecovery: (state, action: PayloadAction<string>) => {
      const intent = state.pendingIntents[action.payload];
      if (intent) intent.ownership = "recovering";
    },
    /**
     * A cancel was decided. Durable, and set BEFORE the DELETE is attempted, so a cancel that
     * races the POST (steps 6 and 7 of the Safe flow run concurrently) is honoured by whichever
     * path learns the execution id first — and so the replay path never resurrects it.
     */
    requestCancel: (
      state,
      action: PayloadAction<{ executionId?: string; clientRequestId?: string }>
    ) => {
      const { executionId, clientRequestId } = action.payload;
      if (executionId && state.entities[executionId]) {
        state.entities[executionId].cancelRequested = true;
      }
      if (clientRequestId && state.pendingIntents[clientRequestId]) {
        state.pendingIntents[clientRequestId].cancelRequested = true;
      }
    },
    /**
     * Release the write guards. Dispatch ONLY on a positive answer: a confirmed terminal state,
     * a cancel that returned 2xx, an expiry past which the payload can no longer land, or the
     * user's explicit acknowledged override. Never on a timeout or an unreachable provider.
     */
    releaseGuard: (state, action: PayloadAction<string>) => {
      const entity = state.entities[action.payload];
      if (entity) {
        entity.guardState = "released";
        entity.cancelRequested = false;
      }
    },
    /**
     * Stop polling and stop nagging, but keep the guard armed. The entry survives as a passive
     * tombstone until `validBefore + grace` or until a later poll gets a positive answer.
     */
    tombstone: (
      state,
      action: PayloadAction<{
        executionId: string;
        at: number;
        reason: "not-found" | "unreachable";
      }>
    ) => {
      const entity = state.entities[action.payload.executionId];
      if (entity && !entity.tombstonedAt) {
        entity.tombstonedAt = action.payload.at;
        entity.tombstoneReason = action.payload.reason;
        entity.ownership = "recovering";
      }
    },
    /** Live mutation gave up (120s timeout) — the background poller now owns this execution. */
    handOffToRecovery: (state, action: PayloadAction<string>) => {
      if (state.entities[action.payload]) {
        relayRecoveryAdapter.updateOne(asEntityState(state), {
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
      if (updates.length) relayRecoveryAdapter.updateMany(asEntityState(state), updates);
      // Same reasoning for pre-POST intents: a persisted intent that survived to this mount
      // has no live mutation behind it, so its POST is genuinely unanswered and replayable.
      for (const intent of Object.values(state.pendingIntents)) {
        intent.ownership = "recovering";
      }
    },
    /**
     * Terminal (tracked / failed / expired) — drop the entry.
     *
     * Removing an entry releases its guards implicitly, so for a Safe entry this is only
     * correct once the outcome is positively known. Where the outcome is merely unobservable
     * (a confirmed 404, a long-unreachable provider) use `tombstone` instead.
     */
    resolveAndRemove: (state, action: PayloadAction<string>) => {
      relayRecoveryAdapter.removeOne(asEntityState(state), action.payload);
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

export const selectPendingRelayIntents = createSelector(
  (state: RootState) => state.relayRecovery.pendingIntents,
  (intents) => Object.values(intents)
);

/**
 * What a pending gasless intent blocks. Both guards are best-effort and per-browser: they live
 * in redux-persist, so another tab with separate storage, another device, or another owner of
 * the same Safe can still create a colliding intent. Provider-side nonce exclusion is the
 * intended real mechanism; this is the interim.
 */
export interface RelayWriteGuard {
  chainId: number;
  signerAddress: string;
  /**
   * Guard B's identity. `undefined` means we cannot identify the action, so only Guard A (the
   * nonce-collision guard) applies.
   */
  actionFingerprint?: string;
  /** For copy and for the cancel affordance; absent while the POST is still in flight. */
  executionId?: string;
  clientRequestId?: string;
  validBefore: number;
}

/**
 * Every unresolved Safe intent that still blocks writes — armed pre-POST intents plus
 * executions whose guard has not been positively released.
 *
 * Deliberately excludes EOA entries (no `authorizationType`). EOA executions carry a ten
 * minute window and no action fingerprint, and guarding them would block a normal user's
 * direct writes for ten minutes after every gasless send — a regression, not a safety win.
 * The EOA path keeps its long-standing narrated gasless-to-paid fallback.
 */
export const selectRelayWriteGuards = createSelector(
  relayRecoverySelectors.selectAll,
  selectPendingRelayIntents,
  (executions, intents): RelayWriteGuard[] => [
    ...intents.map((intent) => ({
      chainId: intent.chainId,
      signerAddress: intent.signerAddress,
      actionFingerprint: intent.actionFingerprint,
      clientRequestId: intent.clientRequestId,
      validBefore: intent.validBefore,
    })),
    ...executions
      .filter(
        (e) => e.authorizationType === "safeMessageV1" && e.guardState === "active"
      )
      .map((e) => ({
        chainId: e.chainId,
        signerAddress: e.signerAddress,
        actionFingerprint: e.actionFingerprint,
        executionId: e.executionId,
        clientRequestId: e.clientRequestId,
        validBefore: e.validBefore,
      })),
  ]
);

export default relayRecoverySlice.reducer;
