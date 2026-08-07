import { createEntityAdapter, createSlice, isAllOf } from "@reduxjs/toolkit";
import { transactionTracker } from "../redux/store";
import { PendingUpdate } from "./PendingUpdate";

export const pendingUpdateAdapter = createEntityAdapter<PendingUpdate, string>({
  selectId: (x) => x.id,
  sortComparer: (a, b) => {
    if (a.timestamp > b.timestamp) {
      return -1;
    }
    if (a.timestamp < b.timestamp) {
      return 1;
    }
    return 0;
  },
});

export const pendingUpdateSlice = createSlice({
  name: "pendingUpdates",
  initialState: pendingUpdateAdapter.getInitialState(),
  reducers: {
    // `addOne` lets writes that bypass the RTK Query mutation pattern (e.g. wagmi-hook
    // based writes via `trackTransaction`) create an optimistic pending update directly.
    // Removal stays driven by the transactionTracker matchers below.
    addOne: pendingUpdateAdapter.addOne,
    removeOne: pendingUpdateAdapter.removeOne,
    removeMany: pendingUpdateAdapter.removeMany,
  },
  extraReducers(builder) {
    builder.addMatcher(
      isAllOf(transactionTracker.actions.updateTransaction),
      (state, action) => {
        const transactionStatus = action.payload.changes.status;
        if (transactionStatus === "Succeeded") {
          const entries = pendingUpdateAdapter
            .getSelectors()
            .selectAll(state)
            .filter(x => x.id === action.payload.id || x.transactionHash.toLowerCase() === action.payload.id.toString().toLowerCase());

          const idsToUpdate = [];
          for (const entry of entries) {
            idsToUpdate.push(entry.id);
          }

          if (idsToUpdate.length > 0) {
            pendingUpdateAdapter.updateMany(state,
              idsToUpdate.map(id => ({
                id,
                changes: {
                  hasTransactionSucceeded: true,
                },
              }))
            );
          }
        }
      }
    );
    builder.addMatcher(
      isAllOf(transactionTracker.actions.updateTransaction),
      (state, action) => {
        const transactionStatus = action.payload.changes.status;
        const isSubgraphInSync = action.payload.changes.isSubgraphInSync;

        const entries = pendingUpdateAdapter
          .getSelectors()
          .selectAll(state)
          .filter(x => x.id === action.payload.id || x.transactionHash.toLowerCase() === action.payload.id.toString().toLowerCase());

        const idsToRemove = [];
        for (const entry of entries) {
          // Delete the pending update when Subgraph is synced or the transaction fails.
          if (
            (entry?.relevantSubgraph === "Protocol" && isSubgraphInSync) ||
            transactionStatus === "Failed" ||
            transactionStatus === "Unknown"
          ) {
            idsToRemove.push(entry.id);
          }
        }

        if (idsToRemove.length > 0) {
          pendingUpdateAdapter.removeMany(state, idsToRemove);
        }
      }
    );
  },
});

export const pendingUpdateSelectors = pendingUpdateAdapter.getSelectors();
