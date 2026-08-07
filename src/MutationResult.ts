import { SerializedError } from "@reduxjs/toolkit";

/**
 * The Clear Macro relay path's in-flight stages, surfaced so the transaction dialog can
 * narrate them ("preparing" = on-chain reads, "awaiting-signature" = wallet prompt is the
 * blocker, "relaying" = signed, polling the relay provider). "fallback" = the relay was
 * attempted but the action wasn't eligible, so the write is proceeding as a normal self-pay
 * transaction (the user pays network fees). "relay-status-unknown" = the signed payload was
 * accepted by the relay but the 120s poll timed out; the outcome is NOT known yet (the tx may
 * still land), so it must NOT be shown as a hard failure and the user must NOT retry — the
 * background poller keeps resolving it. Unset on the plain (never-relayed) write path.
 */
export type RelayPhase =
  | "preparing"
  | "awaiting-signature"
  | "relaying"
  | "fallback"
  | "relay-status-unknown"
  // "safe-awaiting-authorization" = the relay accepted the request and the Safe's owners still
  // have to approve it, which can legitimately take days. Like "relay-status-unknown" this is
  // NOT a failure and must never be rendered as one — but unlike it, the outcome is not
  // "unknown": the request is simply open, the tab can be closed, and the user has a Cancel.
  | "safe-awaiting-authorization";

/**
 * Inspired by: https://redux-toolkit.js.org/rtk-query/api/created-api/hooks#signature-1
 */
export type MutationResult<T = unknown> = {
  // Base query state
  originalArgs?: unknown; // Arguments passed to the latest mutation call. Not available if using the `fixedCacheKey` option
  data?: T; // Returned result if present
  error?: SerializedError; // Error result if present
  endpointName?: string; // The name of the given endpoint for the mutation
  fulfilledTimestamp?: number; // Timestamp for when the mutation was completed

  // Derived request status booleans
  isUninitialized: boolean; // Mutation has not been fired yet
  isLoading: boolean; // Mutation has been fired and is awaiting a response
  isSuccess: boolean; // Mutation has data from a successful call
  isError: boolean; // Mutation is currently in an "error" state
  startedTimeStamp?: number; // Timestamp for when the latest mutation was initiated
  relayPhase?: RelayPhase; // Set only while/after the write went through the Clear Macro relay
  // Set alongside relayPhase === "relay-status-unknown". Carries the relay execution id for the
  // dialog (serialized mutation errors drop custom fields, so it can't be read off `error`).
  relayStatusUnknown?: { executionId: string };
  // Set alongside relayPhase === "safe-awaiting-authorization", for the same reason as above:
  // the dialog needs the execution id and the expiry, and serialized errors drop custom fields.
  safeAwaitingAuthorization?: { executionId: string; validBefore: number };

  reset: () => void; // A method to manually unsubscribe from the mutation call and reset the result to the uninitialized state
};

export default MutationResult;