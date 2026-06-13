import { SerializedError } from "@reduxjs/toolkit";

/**
 * The Clear Macro relay path's in-flight stages, surfaced so the transaction dialog can
 * narrate them ("preparing" = on-chain reads, "awaiting-signature" = wallet prompt is the
 * blocker, "relaying" = signed, polling the relay provider). Unset on the normal write path.
 */
export type RelayPhase = "preparing" | "awaiting-signature" | "relaying";

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

  reset: () => void; // A method to manually unsubscribe from the mutation call and reset the result to the uninitialized state
};

export default MutationResult;