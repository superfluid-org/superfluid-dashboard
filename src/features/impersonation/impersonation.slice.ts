import { createEntityAdapter, createSlice } from "@reduxjs/toolkit";
import { getAddress } from "../../utils/memoizedEthersUtils";

/**
 * Impersonation history entry
 */
export interface Impersonation {
  address: string;
  timestampMs: number;
}

const adapter = createEntityAdapter<Impersonation>({
  selectId: (x) => getAddress(x.address),
  sortComparer: (a, b) => {
    if (a.timestampMs > b.timestampMs) {
      return -1;
    }
    if (a.timestampMs < b.timestampMs) {
      return 1;
    }
    return 0;
  },
});

/**
 * Use-cases:
 * 1. impersonation history
 */
export const impersonationSlice = createSlice({
  name: "impersonations",
  initialState: adapter.getInitialState(),
  reducers: {
    impersonated: adapter.upsertOne,
  },
});

export const { impersonated } = impersonationSlice.actions;

export const impersonationSelectors = adapter.getSelectors();
