import { createEntityAdapter, createSlice, isAllOf } from "@reduxjs/toolkit";
import { transactionTracker } from "../redux/store";
import { PendingOutgoingStream } from "./PendingOutgoingStream";

export interface PendingUpdate {
  /**
   * Keep it the same as the tracked transaction ID.
   */
  id: string;
  type: "OutgoingStream";
}

const adapter = createEntityAdapter<PendingOutgoingStream>({
  selectId: (x) => x.id,
  sortComparer: (a, b) => {
    if (a.updatedAtTimestamp > b.updatedAtTimestamp) {
      return -1;
    }
    if (a.updatedAtTimestamp < b.updatedAtTimestamp) {
      return 1;
    }
    return 0;
  },
});

export const pendingUpdateSlice = createSlice({
  name: "pendingUpdates",
  initialState: adapter.getInitialState(),
  reducers: {
    addPendingOutgoingStream: adapter.addOne,
  },
  extraReducers(builder) {
    builder.addMatcher(
      isAllOf(transactionTracker.actions.updateTransaction),
      (state, action) => {
        const transactionStatus = action.payload.changes.status;
        const isSubgraphInSync = action.payload.changes.isSubgraphInSync;

        // Remove the pending stream when Subgraph is synced or the transaction fails.
        if (
          isSubgraphInSync ||
          transactionStatus === "Failed" ||
          transactionStatus === "Unknown"
        ) {
          const transactionId = action.payload.id;
          adapter.removeOne(state, transactionId);
        }
      }
    );
  },
});

export const { addPendingOutgoingStream } = pendingUpdateSlice.actions;

export const pendingUpdateSelectors = adapter.getSelectors();
