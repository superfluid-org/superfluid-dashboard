import { SerializedError } from "@reduxjs/toolkit";

/**
 * Inspired by: https://redux-toolkit.js.org/rtk-query/api/created-api/hooks#signature-1
 */
export type UnknownMutationResult = {
  // Base query state
  originalArgs?: unknown; // Arguments passed to the latest mutation call. Not available if using the `fixedCacheKey` option
  data?: unknown; // Returned result if present
  error?: SerializedError; // Error result if present
  endpointName?: string; // The name of the given endpoint for the mutation
  fulfilledTimestamp?: number; // Timestamp for when the mutation was completed

  // Derived request status booleans
  isUninitialized: boolean; // Mutation has not been fired yet
  isLoading: boolean; // Mutation has been fired and is awaiting a response
  isSuccess: boolean; // Mutation has data from a successful call
  isError: boolean; // Mutation is currently in an "error" state
  startedTimeStamp?: number; // Timestamp for when the latest mutation was initiated

  reset: () => void; // A method to manually unsubscribe from the mutation call and reset the result to the uninitialized state
};

export default UnknownMutationResult;