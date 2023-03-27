import { createEntityAdapter, createSlice, isAllOf } from "@reduxjs/toolkit";
import { dateNowSeconds } from "../../utils/dateUtils";
import { rpcApi, transactionTracker } from "../redux/store";
import { PendingIndexSubscriptionApproval } from "./PendingIndexSubscriptionApprove";
import { PendingIndexSubscriptionRevoke } from "./PendingIndexSubscriptionRevoke";
import { PendingOutgoingStream } from "./PendingOutgoingStream";
import { PendingCreateTask, PendingDeleteTask } from "./PendingOutgoingTask";
import {
  PendingCreateTaskDeletion,
  PendingStreamCancellation,
} from "./PendingStreamCancellation";
import { PendingUpdate } from "./PendingUpdate";
import { PendingVestingSchedule } from "./PendingVestingSchedule";
import { PendingVestingScheduleDeletion as PendingVestingScheduleDelete } from "./PendingVestingScheduleDelete";

export const pendingUpdateAdapter = createEntityAdapter<PendingUpdate>({
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
    removeOne: pendingUpdateAdapter.removeOne,
    removeMany: pendingUpdateAdapter.removeMany,
  },
  extraReducers(builder) {
    builder.addMatcher(
      rpcApi.endpoints.deleteFlowWithScheduling.matchFulfilled,
      (state, action) => {
        const {
          chainId,
          hash: transactionHash,
          subTransactionTitles,
        } = action.payload;
        const { senderAddress, superTokenAddress, receiverAddress } =
          action.meta.arg.originalArgs;

        const pendingUpdates = [];

        if (subTransactionTitles.includes("Close Stream")) {
          const pendingFlowDeleteUpdate: PendingStreamCancellation = {
            chainId,
            transactionHash,
            senderAddress,
            receiverAddress,
            id: transactionHash,
            tokenAddress: superTokenAddress,
            pendingType: "FlowDelete",
            timestamp: dateNowSeconds(),
            relevantSubgraph: "Protocol",
          };
          pendingUpdates.push(pendingFlowDeleteUpdate);
        }

        if (subTransactionTitles.includes("Delete Schedule")) {
          const pendingCreateTaskDeleteUpdate: PendingCreateTaskDeletion = {
            chainId,
            transactionHash,
            senderAddress,
            receiverAddress,
            id: `${transactionHash}-CreateTaskDelete`,
            tokenAddress: superTokenAddress,
            pendingType: "CreateTaskDelete",
            timestamp: dateNowSeconds(),
            relevantSubgraph: "Scheduler",
          };
          pendingUpdates.push(pendingCreateTaskDeleteUpdate);
        }

        if (pendingUpdates.length > 0) {
          pendingUpdateAdapter.addMany(state, pendingUpdates);
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
          userDataBytes
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
            relevantSubgraph: "Protocol",
            userData: userDataBytes ?? "0x"
          };
          pendingUpdateAdapter.addOne(state, pendingUpdate);
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
          startTimestamp,
          endTimestamp,
        } = action.meta.arg.originalArgs;

        const timestamp = dateNowSeconds();

        const pendingUpdatesToAdd = [];

        if (subTransactionTitles.includes("Create Stream")) {
          if (senderAddress) {
            pendingUpdatesToAdd.push({
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
              relevantSubgraph: "Protocol",
            } as PendingOutgoingStream);
          }

          if (
            subTransactionTitles.includes("Modify Schedule") &&
            !startTimestamp
          ) {
            const pendingCreateTaskDeleteUpdate: PendingCreateTaskDeletion = {
              chainId,
              transactionHash,
              senderAddress,
              receiverAddress,
              id: `${transactionHash}-CreateTaskDelete`,
              tokenAddress: superTokenAddress,
              pendingType: "CreateTaskDelete",
              timestamp: dateNowSeconds(),
              relevantSubgraph: "Scheduler",
            };
            pendingUpdatesToAdd.push(pendingCreateTaskDeleteUpdate);
          }
        }

        if (subTransactionTitles.includes("Delete Schedule")) {
          const pendingCreateTaskDeleteUpdate: PendingCreateTaskDeletion = {
            chainId,
            transactionHash,
            senderAddress,
            receiverAddress,
            id: `${transactionHash}-CreateTaskDelete`,
            tokenAddress: superTokenAddress,
            pendingType: "CreateTaskDelete",
            timestamp: dateNowSeconds(),
            relevantSubgraph: "Scheduler",
          };
          pendingUpdatesToAdd.push(pendingCreateTaskDeleteUpdate);
        }

        if (subTransactionTitles.includes("Create Schedule")) {
          if (startTimestamp) {
            pendingUpdatesToAdd.push({
              pendingType: "CreateTaskCreate",
              __typename: "CreateTask",
              id: `${transactionHash}-CreateTaskCreate`,
              executionAt: startTimestamp.toString(),
              superToken: superTokenAddress,
              sender: senderAddress,
              receiver: receiverAddress,
              flowRate: flowRateWei,
              relevantSubgraph: "Scheduler",
              transactionHash,
              chainId,
              timestamp,
            } as PendingCreateTask);
          }

          if (endTimestamp) {
            pendingUpdatesToAdd.push({
              pendingType: "DeleteTaskCreate",
              __typename: "DeleteTask",
              id: `${transactionHash}-DeleteTaskCreate`,
              executionAt: endTimestamp.toString(),
              superToken: superTokenAddress,
              sender: senderAddress,
              receiver: receiverAddress,
              relevantSubgraph: "Scheduler",
              transactionHash,
              chainId,
              timestamp,
            } as PendingDeleteTask);
          }
        }

        if (pendingUpdatesToAdd.length > 0) {
          pendingUpdateAdapter.addMany(state, pendingUpdatesToAdd);
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
          relevantSubgraph: "Protocol",
        };
        pendingUpdateAdapter.addOne(state, pendingUpdate);
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
          relevantSubgraph: "Protocol",
        };
        pendingUpdateAdapter.addOne(state, pendingUpdate);
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
          relevantSubgraph: "Vesting",
        };
        pendingUpdateAdapter.addOne(state, pendingUpdate);
      }
    );
    builder.addMatcher(
      rpcApi.endpoints.deleteVestingSchedule.matchFulfilled,
      (state, action) => {
        const { chainId, hash: transactionHash } = action.payload;
        const { senderAddress, superTokenAddress, receiverAddress } =
          action.meta.arg.originalArgs;
        const pendingUpdate: PendingVestingScheduleDelete = {
          chainId,
          transactionHash,
          senderAddress,
          receiverAddress,
          id: transactionHash,
          superTokenAddress,
          pendingType: "VestingScheduleDelete",
          timestamp: dateNowSeconds(),
          relevantSubgraph: "Vesting",
        };
        pendingUpdateAdapter.addOne(state, pendingUpdate);
      }
    );
    builder.addMatcher(
      isAllOf(transactionTracker.actions.updateTransaction),
      (state, action) => {
        const transactionStatus = action.payload.changes.status;
        if (transactionStatus === "Succeeded") {
          const transactionId = action.payload.id;
          pendingUpdateAdapter.updateOne(state, {
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

        const entry = pendingUpdateAdapter
          .getSelectors()
          .selectById(state, action.payload.id);

        // Delete the pending update when Subgraph is synced or the transaction fails.
        if (
          (entry?.relevantSubgraph === "Protocol" && isSubgraphInSync) ||
          transactionStatus === "Failed" ||
          transactionStatus === "Unknown"
        ) {
          const transactionId = action.payload.id;
          pendingUpdateAdapter.removeOne(state, transactionId);
        }
      }
    );
  },
});

export const pendingUpdateSelectors = pendingUpdateAdapter.getSelectors();
