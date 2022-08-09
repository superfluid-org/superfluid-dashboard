import {
  createEntityAdapter,
  createSlice,
  isAllOf,
  isAnyOf,
} from "@reduxjs/toolkit";
import { Matcher } from "@reduxjs/toolkit/dist/tsHelpers";
import { dateNowSeconds } from "../../utils/dateUtils";
import { rpcApi, subgraphApi, transactionTracker } from "../redux/store";
import { PendingIndexSubscriptionApproval } from "./PendingIndexSubscriptionApproval";
import { PendingOutgoingStream } from "./PendingOutgoingStream";
import { PendingStreamCancellation } from "./PendingStreamCancellation";
import { PendingUpdate } from "./PendingUpdate";

const adapter = createEntityAdapter<PendingUpdate>({
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
  initialState: adapter.getInitialState(),
  reducers: {},
  extraReducers(builder) {
    builder.addMatcher(
      rpcApi.endpoints.flowDelete.matchFulfilled,
      (state, action) => {
        const { chainId, hash: transactionHash } = action.payload;
        const { senderAddress, superTokenAddress, receiverAddress } =
          action.meta.arg.originalArgs;
        if (senderAddress) {
          const pendingUpdate: PendingStreamCancellation = {
            chainId,
            transactionHash,
            senderAddress,
            receiverAddress,
            id: transactionHash,
            tokenAddress: superTokenAddress,
            pendingType: "FlowDelete",
            timestamp: dateNowSeconds(),
          };
          adapter.addOne(state, pendingUpdate);
        }
      }
    ),
      builder.addMatcher(
        rpcApi.endpoints.flowCreate.matchFulfilled,
        (state, action) => {
          const { chainId, hash: transactionHash } = action.payload;
          const {
            senderAddress,
            superTokenAddress,
            receiverAddress,
            flowRateWei,
          } = action.meta.arg.originalArgs;
          if (senderAddress) {
            const timestamp = dateNowSeconds();
            const pendingUpdate: PendingOutgoingStream = {
              pendingType: "FlowCreate",
              chainId,
              transactionHash,
              id: transactionHash,
              timestamp: timestamp,
              createdAtTimestamp: timestamp,
              updatedAtTimestamp: timestamp,
              sender: senderAddress,
              receiver: receiverAddress,
              token: superTokenAddress,
              streamedUntilUpdatedAt: "0",
              currentFlowRate: flowRateWei,
            };
            adapter.addOne(state, pendingUpdate);
          }
        }
      ),
      builder.addMatcher(
        rpcApi.endpoints.indexSubscriptionApprove.matchFulfilled,
        (state, action) => {
          const { chainId, hash: transactionHash } = action.payload;
          const { indexId, publisherAddress, superTokenAddress } =
            action.meta.arg.originalArgs;
          const pendingUpdate: PendingIndexSubscriptionApproval = {
            pendingType: "IndexSubscriptionApprove",
            chainId,
            transactionHash,
            id: transactionHash,
            indexId,
            publisherAddress,
            superTokenAddress,
            timestamp: dateNowSeconds(),
          };
          adapter.addOne(state, pendingUpdate);
        }
      ),
      builder.addMatcher(
        isAllOf(transactionTracker.actions.updateTransaction),
        (state, action) => {
          const transactionStatus = action.payload.changes.status;
          if (transactionStatus === "Succeeded") {
            const transactionId = action.payload.id;
            adapter.updateOne(state, {
              id: transactionId,
              changes: {
                hasTransactionSucceeded: true,
              },
            });
          }
        }
      );
    builder.addMatcher(
      isAllOf(transactionTracker.actions.updateTransaction, subgraphApi.endpoints.),
      (state, action) => {
        const transactionStatus = action.payload.changes.status;
        const isSubgraphInSync = action.payload.changes.isSubgraphInSync;

        // Delete the pending update when Subgraph is synced or the transaction fails.
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

export const pendingUpdateSelectors = adapter.getSelectors();
