import { createEntityAdapter, createSlice, isAllOf } from "@reduxjs/toolkit";
import { dateNowSeconds } from "../../utils/dateUtils";
import { rpcApi, transactionTracker } from "../redux/store";
import { PendingIndexSubscriptionApproval } from "./PendingIndexSubscriptionApprove";
import { PendingIndexSubscriptionRevoke } from "./PendingIndexSubscriptionRevoke";
import { PendingOutgoingStream } from "./PendingOutgoingStream";
import { PendingStreamCancellation } from "./PendingStreamCancellation";
import { PendingUpdate } from "./PendingUpdate";
import { PendingVestingSchedule } from "./PendingVestingSchedule";
import { PendingVestingScheduleDeletion as PendingVestingScheduleDelete } from "./PendingVestingScheduleDelete";

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
    );
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
    );
    builder.addMatcher(
      rpcApi.endpoints.upsertFlowWithScheduling.matchFulfilled,
      (state, action) => {
        const {
          chainId,
          hash: transactionHash,
          subTransactionTitles,
        } = action.payload;
        const {
          senderAddress,
          superTokenAddress,
          receiverAddress,
          flowRateWei,
        } = action.meta.arg.originalArgs;

        if (subTransactionTitles.includes("Create Stream")) {
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
      }
    );
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
    );
    builder.addMatcher(
      rpcApi.endpoints.indexSubscriptionRevoke.matchFulfilled,
      (state, action) => {
        const { chainId, hash: transactionHash } = action.payload;
        const { indexId, publisherAddress, superTokenAddress } =
          action.meta.arg.originalArgs;
        const pendingUpdate: PendingIndexSubscriptionRevoke = {
          pendingType: "IndexSubscriptionRevoke",
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
    );
    builder.addMatcher(
      rpcApi.endpoints.createVestingSchedule.matchFulfilled,
      (state, action) => {
        const { chainId, hash: transactionHash } = action.payload;
        const {
          senderAddress,
          superTokenAddress,
          receiverAddress,
          startDateTimestamp,
          cliffDateTimestamp,
          cliffTransferAmountWei,
          endDateTimestamp,
          flowRateWei,
        } = action.meta.arg.originalArgs;
          const pendingUpdate: PendingVestingSchedule = {
            chainId,
            transactionHash,
            senderAddress,
            receiverAddress,
            id: transactionHash,
            superTokenAddress,
            pendingType: "VestingScheduleCreate",
            timestamp: dateNowSeconds(),
            cliffDateTimestamp,
            cliffTransferAmountWei,
            startDateTimestamp,
            endDateTimestamp,
            flowRateWei,
          };
          adapter.addOne(state, pendingUpdate);
      }
    );
    builder.addMatcher(
      rpcApi.endpoints.deleteVestingSchedule.matchFulfilled,
      (state, action) => {
        const { chainId, hash: transactionHash } = action.payload;
        const {
          senderAddress,
          superTokenAddress,
          receiverAddress,
        } = action.meta.arg.originalArgs;
          const pendingUpdate: PendingVestingScheduleDelete = {
            chainId,
            transactionHash,
            senderAddress,
            receiverAddress,
            id: transactionHash,
            superTokenAddress,
            pendingType: "VestingScheduleDelete",
            timestamp: dateNowSeconds(),
          };
          adapter.addOne(state, pendingUpdate);
      }
    );
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
      isAllOf(transactionTracker.actions.updateTransaction),
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
