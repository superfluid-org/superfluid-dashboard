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
import { PendingConnectToPool } from "./PendingConnectToPool";
import { PendingVestingScheduleClaim } from "./PendingVestingScheduleClaim";
import { BigNumber } from "ethers";
import { PendingVestingScheduleUpdate } from "./PendingVestingScheduleUpdate";

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
          userDataBytes,
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
            userData: userDataBytes ?? "0x",
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
          version
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
          version
        };
        pendingUpdateAdapter.addOne(state, pendingUpdate);
      }
    );
    builder.addMatcher(
      rpcApi.endpoints.createVestingScheduleFromAmountAndDuration.matchFulfilled,
      (state, action) => {
        const { chainId, hash: transactionHash } = action.payload;
        const {
          senderAddress,
          superTokenAddress,
          receiverAddress,
          startDateTimestamp,
          totalDurationInSeconds,
          cliffPeriodInSeconds,
          totalAmountWei
        } = action.meta.arg.originalArgs;
        const endDateTimestamp = startDateTimestamp + totalDurationInSeconds;
        const flowRate = BigNumber.from(totalAmountWei).div(totalDurationInSeconds);
        const pendingUpdate: PendingVestingSchedule = {
          chainId,
          transactionHash,
          senderAddress,
          receiverAddress,
          id: transactionHash,
          superTokenAddress,
          pendingType: "VestingScheduleCreate",
          timestamp: dateNowSeconds(),
          cliffDateTimestamp: startDateTimestamp + cliffPeriodInSeconds,
          cliffTransferAmountWei: BigNumber.from(cliffPeriodInSeconds).mul(flowRate).toString(),
          startDateTimestamp,
          endDateTimestamp,
          flowRateWei: flowRate.toString(),
          relevantSubgraph: "Vesting",
          version: "v2"
        };
        pendingUpdateAdapter.addOne(state, pendingUpdate);
      }
    );
    builder.addMatcher(
      rpcApi.endpoints.executeBatchVesting.matchFulfilled,
      (state, action) => {
        const { chainId, hash: transactionHash, signerAddress: senderAddress } = action.payload;

        const pendingUpdatesToAdd = [];
        const { params: vestingSchedules } = action.meta.arg.originalArgs;
        for (const [index, vestingSchedule] of vestingSchedules.entries()) {
          const {
            superToken,
            claimPeriod,
            cliffPeriod,
            startDate,
            receiver,
            totalAmount,
            totalDuration
          } = vestingSchedule;
          const endDateTimestamp = startDate + totalDuration;
          const flowRate = BigNumber.from(totalAmount).div(totalDuration);
          const pendingUpdate: PendingVestingSchedule = {
            chainId,
            transactionHash,
            senderAddress,
            receiverAddress: receiver,
            id: transactionHash + "-" + index,
            superTokenAddress: superToken,
            pendingType: "VestingScheduleCreate",
            timestamp: dateNowSeconds(),
            cliffDateTimestamp: startDate + cliffPeriod,
            cliffTransferAmountWei: BigNumber.from(cliffPeriod).mul(flowRate).toString(),
            startDateTimestamp: startDate,
            endDateTimestamp,
            flowRateWei: flowRate.toString(),
            relevantSubgraph: "Vesting",
            version: "v2"
          };
          pendingUpdatesToAdd.push(pendingUpdate);
        }

        if (pendingUpdatesToAdd.length > 0) {
          pendingUpdateAdapter.addMany(state, pendingUpdatesToAdd);
        }
      }
    );
    builder.addMatcher(
      rpcApi.endpoints.executeTranchUpdate.matchFulfilled,
      (state, action) => {
        const { chainId, hash: transactionHash, signerAddress: senderAddress } = action.payload;

        const pendingUpdatesToAdd = [];
        const { actionsToExecute } = action.meta.arg.originalArgs;
        const createVestingScheduleActions = actionsToExecute.filter(x => x.type === "create-vesting-schedule");
        const updateVestingScheduleActions = actionsToExecute.filter(x => x.type === "update-vesting-schedule");

        for (const [index, actions] of createVestingScheduleActions.entries()) {
          const {
            superToken,
            cliffPeriod,
            startDate,
            receiver,
            totalAmount,
            totalDuration,
            cliffAmount
          } = actions.payload;
          const endDateTimestamp = startDate + totalDuration;
          const flowRate = BigNumber.from(totalAmount).div(totalDuration);
          const pendingUpdate: PendingVestingSchedule = {
            chainId,
            transactionHash,
            senderAddress,
            receiverAddress: receiver,
            id: transactionHash + "-" + index,
            superTokenAddress: superToken,
            pendingType: "VestingScheduleCreate",
            timestamp: dateNowSeconds(),
            cliffDateTimestamp: startDate + cliffPeriod,
            cliffTransferAmountWei: cliffAmount,
            startDateTimestamp: startDate,
            endDateTimestamp,
            flowRateWei: flowRate.toString(),
            relevantSubgraph: "Vesting",
            version: "v3"
          };
          pendingUpdatesToAdd.push(pendingUpdate);
        }

        for (const [index, actions] of updateVestingScheduleActions.entries()) {
          const {
            superToken,
            receiver
          } = actions.payload;

          const pendingUpdate: PendingVestingScheduleUpdate = {
            chainId,
            transactionHash,
            senderAddress,
            receiverAddress: receiver,
            id: transactionHash + "-" + index,
            superTokenAddress: superToken,
            pendingType: "VestingScheduleUpdate",
            timestamp: dateNowSeconds(),
            relevantSubgraph: "Vesting",
            version: "v3"
          };

          pendingUpdatesToAdd.push(pendingUpdate);
        }

        if (pendingUpdatesToAdd.length > 0) {
          pendingUpdateAdapter.addMany(state, pendingUpdatesToAdd);
        }
      }
    );
    builder.addMatcher(
      rpcApi.endpoints.deleteVestingSchedule.matchFulfilled,
      (state, action) => {
        const { chainId, hash: transactionHash } = action.payload;
        const { senderAddress, superTokenAddress, receiverAddress, version } =
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
          version
        };
        pendingUpdateAdapter.addOne(state, pendingUpdate);
      }
    );
    builder.addMatcher(
      rpcApi.endpoints.claimVestingSchedule.matchFulfilled,
      (state, action) => {
        const { chainId, hash: transactionHash } = action.payload;
        const { senderAddress, superTokenAddress, receiverAddress } =
          action.meta.arg.originalArgs;
        const pendingUpdate: PendingVestingScheduleClaim = {
          chainId,
          transactionHash,
          senderAddress,
          receiverAddress,
          id: transactionHash,
          superTokenAddress,
          pendingType: "VestingScheduleClaim",
          timestamp: dateNowSeconds(),
          relevantSubgraph: "Vesting",
          version: "v2"
        };
        pendingUpdateAdapter.addOne(state, pendingUpdate);
      }
    );
    builder.addMatcher(
      rpcApi.endpoints.connectToPool.matchFulfilled,
      (state, action) => {
        const { chainId, hash: transactionHash } = action.payload;
        const { poolAddress, superTokenAddress } = action.meta.arg.originalArgs;

        // TODO: this needs an account address, IMO?

        const pendingUpdate: PendingConnectToPool = {
          pendingType: "ConnectToPool",
          chainId,
          transactionHash,
          id: transactionHash,
          poolAddress,
          superTokenAddress,
          timestamp: dateNowSeconds(),
          relevantSubgraph: "Protocol",
        };
        pendingUpdateAdapter.addOne(state, pendingUpdate);
      }
    );
    builder.addMatcher(
      rpcApi.endpoints.cancelDistributionStream.matchFulfilled,
      (state, action) => {
        const { chainId, hash: transactionHash } = action.payload;
        const { poolAddress, superTokenAddress, senderAddress } = action.meta.arg.originalArgs;

        const pendingDistributionStreamCancellation: PendingStreamCancellation = {
          chainId,
          transactionHash,
          senderAddress,
          receiverAddress: poolAddress,
          id: transactionHash,
          tokenAddress: superTokenAddress,
          pendingType: "FlowDelete",
          timestamp: dateNowSeconds(),
          relevantSubgraph: "Protocol",
        };

        pendingUpdateAdapter.addOne(state, pendingDistributionStreamCancellation);
      }
    );
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
