import { createEntityAdapter, createSlice } from "@reduxjs/toolkit";
import { getAddress } from "../../utils/memoizedEthersUtils";

export interface Impersonation {
  address: string;
  timestampMs: number;
}

const adapter = createEntityAdapter<Impersonation>({
  selectId: (x) => getAddress(x.address),
  sortComparer: (x) => x.timestampMs,
});

export const impersonationSlice = createSlice({
  name: "impersonations",
  initialState: adapter.getInitialState(),
  reducers: {
    impersonated: adapter.upsertOne,
  },
});

export const { impersonated } = impersonationSlice.actions;

export const impersonationSelectors = adapter.getSelectors();
