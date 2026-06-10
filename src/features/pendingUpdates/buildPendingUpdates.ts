import { TransactionTitle } from "@superfluid-finance/sdk-redux";
import { dateNowSeconds } from "../../utils/dateUtils";
import { VestingVersion } from "../network/networkConstants";
import { PendingConnectToPool } from "./PendingConnectToPool";
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
import { PendingVestingScheduleClaim } from "./PendingVestingScheduleClaim";
import { PendingVestingScheduleDeletion } from "./PendingVestingScheduleDelete";
import { PendingVestingScheduleUpdate } from "./PendingVestingScheduleUpdate";

/**
 * Pure builders for the optimistic pending updates each write creates, keyed on the
 * transaction hash. Ported from the RTK Query `matchFulfilled` matchers that used to live in
 * `pendingUpdate.slice.ts` — the wagmi-hook write path creates pendings imperatively via
 * `trackTransaction` instead. The conditional logic is intentionally coupled to the
 * `subTransactionTitles` strings, exactly as the matchers were; removal stays driven by the
 * transactionTracker matchers in the slice.
 */

export function buildConnectToPoolPendingUpdate(
  hash: string,
  arg: {
    chainId: number;
    poolAddress: string;
    superTokenAddress: string;
  }
): PendingUpdate[] {
  const pendingUpdate: PendingConnectToPool = {
    pendingType: "ConnectToPool",
    chainId: arg.chainId,
    transactionHash: hash,
    id: hash,
    poolAddress: arg.poolAddress,
    superTokenAddress: arg.superTokenAddress,
    timestamp: dateNowSeconds(),
    relevantSubgraph: "Protocol",
  };
  return [pendingUpdate];
}

export function buildCancelDistributionStreamPendingUpdate(
  hash: string,
  arg: {
    chainId: number;
    superTokenAddress: string;
    senderAddress: string;
    poolAddress: string;
  }
): PendingUpdate[] {
  const pendingUpdate: PendingStreamCancellation = {
    chainId: arg.chainId,
    transactionHash: hash,
    senderAddress: arg.senderAddress,
    receiverAddress: arg.poolAddress,
    id: hash,
    tokenAddress: arg.superTokenAddress,
    pendingType: "FlowDelete",
    timestamp: dateNowSeconds(),
    relevantSubgraph: "Protocol",
  };
  return [pendingUpdate];
}

export function buildDeleteFlowWithSchedulingPendingUpdates(
  hash: string,
  arg: {
    chainId: number;
    superTokenAddress: string;
    senderAddress: string;
    receiverAddress: string;
  },
  subTransactionTitles: TransactionTitle[]
): PendingUpdate[] {
  const { chainId, superTokenAddress, senderAddress, receiverAddress } = arg;
  const pendingUpdates: PendingUpdate[] = [];

  if (subTransactionTitles.includes("Close Stream")) {
    const pendingFlowDeleteUpdate: PendingStreamCancellation = {
      chainId,
      transactionHash: hash,
      senderAddress,
      receiverAddress,
      id: hash,
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
      transactionHash: hash,
      senderAddress,
      receiverAddress,
      id: `${hash}-CreateTaskDelete`,
      tokenAddress: superTokenAddress,
      pendingType: "CreateTaskDelete",
      timestamp: dateNowSeconds(),
      relevantSubgraph: "Scheduler",
    };
    pendingUpdates.push(pendingCreateTaskDeleteUpdate);
  }

  return pendingUpdates;
}

export function buildUpsertFlowWithSchedulingPendingUpdates(
  hash: string,
  arg: {
    chainId: number;
    superTokenAddress: string;
    senderAddress: string;
    receiverAddress: string;
    flowRateWei: string;
    startTimestamp?: number | null;
    endTimestamp?: number | null;
  },
  subTransactionTitles: TransactionTitle[]
): PendingUpdate[] {
  const {
    chainId,
    superTokenAddress,
    senderAddress,
    receiverAddress,
    flowRateWei,
    startTimestamp,
    endTimestamp,
  } = arg;

  const timestamp = dateNowSeconds();
  const pendingUpdates: PendingUpdate[] = [];

  if (subTransactionTitles.includes("Create Stream")) {
    if (senderAddress) {
      pendingUpdates.push({
        pendingType: "FlowCreate",
        chainId,
        transactionHash: hash,
        id: hash,
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

    if (subTransactionTitles.includes("Modify Schedule") && !startTimestamp) {
      const pendingCreateTaskDeleteUpdate: PendingCreateTaskDeletion = {
        chainId,
        transactionHash: hash,
        senderAddress,
        receiverAddress,
        id: `${hash}-CreateTaskDelete`,
        tokenAddress: superTokenAddress,
        pendingType: "CreateTaskDelete",
        timestamp: dateNowSeconds(),
        relevantSubgraph: "Scheduler",
      };
      pendingUpdates.push(pendingCreateTaskDeleteUpdate);
    }
  }

  if (subTransactionTitles.includes("Delete Schedule")) {
    const pendingCreateTaskDeleteUpdate: PendingCreateTaskDeletion = {
      chainId,
      transactionHash: hash,
      senderAddress,
      receiverAddress,
      id: `${hash}-CreateTaskDelete`,
      tokenAddress: superTokenAddress,
      pendingType: "CreateTaskDelete",
      timestamp: dateNowSeconds(),
      relevantSubgraph: "Scheduler",
    };
    pendingUpdates.push(pendingCreateTaskDeleteUpdate);
  }

  if (subTransactionTitles.includes("Create Schedule")) {
    if (startTimestamp) {
      pendingUpdates.push({
        pendingType: "CreateTaskCreate",
        __typename: "CreateTask",
        id: `${hash}-CreateTaskCreate`,
        executionAt: startTimestamp.toString(),
        superToken: superTokenAddress,
        sender: senderAddress,
        receiver: receiverAddress,
        flowRate: flowRateWei,
        relevantSubgraph: "Scheduler",
        transactionHash: hash,
        chainId,
        timestamp,
      } as PendingCreateTask);
    }

    if (endTimestamp) {
      pendingUpdates.push({
        pendingType: "DeleteTaskCreate",
        __typename: "DeleteTask",
        id: `${hash}-DeleteTaskCreate`,
        executionAt: endTimestamp.toString(),
        superToken: superTokenAddress,
        sender: senderAddress,
        receiver: receiverAddress,
        relevantSubgraph: "Scheduler",
        transactionHash: hash,
        chainId,
        timestamp,
      } as PendingDeleteTask);
    }
  }

  return pendingUpdates;
}

export function buildIndexSubscriptionApprovePendingUpdate(
  hash: string,
  arg: {
    chainId: number;
    indexId: string;
    publisherAddress: string;
    superTokenAddress: string;
  }
): PendingUpdate[] {
  const pendingUpdate: PendingIndexSubscriptionApproval = {
    pendingType: "IndexSubscriptionApprove",
    chainId: arg.chainId,
    transactionHash: hash,
    id: hash,
    indexId: arg.indexId,
    publisherAddress: arg.publisherAddress,
    superTokenAddress: arg.superTokenAddress,
    timestamp: dateNowSeconds(),
    relevantSubgraph: "Protocol",
  };
  return [pendingUpdate];
}

export function buildIndexSubscriptionRevokePendingUpdate(
  hash: string,
  arg: {
    chainId: number;
    indexId: string;
    publisherAddress: string;
    superTokenAddress: string;
  }
): PendingUpdate[] {
  const pendingUpdate: PendingIndexSubscriptionRevoke = {
    pendingType: "IndexSubscriptionRevoke",
    chainId: arg.chainId,
    transactionHash: hash,
    id: hash,
    indexId: arg.indexId,
    publisherAddress: arg.publisherAddress,
    superTokenAddress: arg.superTokenAddress,
    timestamp: dateNowSeconds(),
    relevantSubgraph: "Protocol",
  };
  return [pendingUpdate];
}

export function buildCreateVestingScheduleFromAmountAndDurationPendingUpdate(
  hash: string,
  arg: {
    chainId: number;
    superTokenAddress: string;
    senderAddress: string;
    receiverAddress: string;
    startDateTimestamp: number;
    totalDurationInSeconds: number;
    cliffPeriodInSeconds: number;
    totalAmountWei: string;
    version: "v3";
  }
): PendingUpdate[] {
  const endDateTimestamp = arg.startDateTimestamp + arg.totalDurationInSeconds;
  const flowRate = BigInt(arg.totalAmountWei) / BigInt(arg.totalDurationInSeconds);
  const pendingUpdate: PendingVestingSchedule = {
    chainId: arg.chainId,
    transactionHash: hash,
    senderAddress: arg.senderAddress,
    receiverAddress: arg.receiverAddress,
    id: hash,
    superTokenAddress: arg.superTokenAddress,
    pendingType: "VestingScheduleCreate",
    timestamp: dateNowSeconds(),
    cliffDateTimestamp: arg.startDateTimestamp + arg.cliffPeriodInSeconds,
    cliffTransferAmountWei: (BigInt(arg.cliffPeriodInSeconds) * flowRate).toString(),
    startDateTimestamp: arg.startDateTimestamp,
    endDateTimestamp,
    flowRateWei: flowRate.toString(),
    relevantSubgraph: "Vesting",
    version: arg.version,
  };
  return [pendingUpdate];
}

export interface BatchVestingSchedulePendingArg {
  superToken: string;
  cliffPeriod: number;
  startDate: number;
  receiver: string;
  totalAmount: string;
  totalDuration: number;
}

export function buildExecuteBatchVestingPendingUpdates(
  hash: string,
  arg: {
    chainId: number;
    senderAddress: string;
    vestingSchedules: BatchVestingSchedulePendingArg[];
    version: "v3";
  }
): PendingUpdate[] {
  const pendingUpdates: PendingUpdate[] = [];

  for (const [index, vestingSchedule] of arg.vestingSchedules.entries()) {
    const { superToken, cliffPeriod, startDate, receiver, totalAmount, totalDuration } =
      vestingSchedule;
    const endDateTimestamp = startDate + totalDuration;
    const flowRate = BigInt(totalAmount) / BigInt(totalDuration);
    const pendingUpdate: PendingVestingSchedule = {
      chainId: arg.chainId,
      transactionHash: hash,
      senderAddress: arg.senderAddress,
      receiverAddress: receiver,
      id: hash + "-" + index,
      superTokenAddress: superToken,
      pendingType: "VestingScheduleCreate",
      timestamp: dateNowSeconds(),
      cliffDateTimestamp: startDate + cliffPeriod,
      cliffTransferAmountWei: (BigInt(cliffPeriod) * flowRate).toString(),
      startDateTimestamp: startDate,
      endDateTimestamp,
      flowRateWei: flowRate.toString(),
      relevantSubgraph: "Vesting",
      version: arg.version,
    };
    pendingUpdates.push(pendingUpdate);
  }

  return pendingUpdates;
}

export interface TranchUpdatePendingActionArg {
  type:
    | "create-vesting-schedule"
    | "update-vesting-schedule"
    | "end-vesting-schedule-now"
    | "delete-vesting-schedule"
    | (string & {});
  payload: {
    superToken: string;
    receiver: string;
    cliffPeriod?: number;
    startDate?: number;
    totalAmount?: string;
    totalDuration?: number;
    cliffAmount?: string;
  };
}

export function buildExecuteTranchUpdatePendingUpdates(
  hash: string,
  arg: {
    chainId: number;
    senderAddress: string;
    actionsToExecute: TranchUpdatePendingActionArg[];
  }
): PendingUpdate[] {
  const { chainId, senderAddress, actionsToExecute } = arg;
  const pendingUpdates: PendingUpdate[] = [];

  const createVestingScheduleActions = actionsToExecute.filter(
    (x) => x.type === "create-vesting-schedule"
  );
  const deleteVestingScheduleActions = actionsToExecute.filter(
    (x) => x.type === "delete-vesting-schedule"
  );
  const updateVestingScheduleActions = actionsToExecute.filter(
    (x) => x.type === "update-vesting-schedule" || x.type === "end-vesting-schedule-now"
  );

  for (const [index, action] of createVestingScheduleActions.entries()) {
    const { superToken, cliffPeriod, startDate, receiver, totalAmount, totalDuration, cliffAmount } =
      action.payload;
    const endDateTimestamp = (startDate ?? 0) + (totalDuration ?? 0);
    const flowRate = BigInt(totalAmount ?? "0") / BigInt(totalDuration ?? 1);
    const pendingUpdate: PendingVestingSchedule = {
      chainId,
      transactionHash: hash,
      senderAddress,
      receiverAddress: receiver,
      id: hash + "-" + index,
      superTokenAddress: superToken,
      pendingType: "VestingScheduleCreate",
      timestamp: dateNowSeconds(),
      cliffDateTimestamp: (startDate ?? 0) + (cliffPeriod ?? 0),
      cliffTransferAmountWei: cliffAmount ?? "0",
      startDateTimestamp: startDate ?? 0,
      endDateTimestamp,
      flowRateWei: flowRate.toString(),
      relevantSubgraph: "Vesting",
      version: "v3",
    };
    pendingUpdates.push(pendingUpdate);
  }

  for (const [index, action] of updateVestingScheduleActions.entries()) {
    const { superToken, receiver } = action.payload;
    const pendingUpdate: PendingVestingScheduleUpdate = {
      chainId,
      transactionHash: hash,
      senderAddress,
      receiverAddress: receiver,
      id: hash + "-" + index,
      superTokenAddress: superToken,
      pendingType: "VestingScheduleUpdate",
      timestamp: dateNowSeconds(),
      relevantSubgraph: "Vesting",
      version: "v3",
    };
    pendingUpdates.push(pendingUpdate);
  }

  for (const [index, action] of deleteVestingScheduleActions.entries()) {
    const { superToken, receiver } = action.payload;
    const pendingUpdate: PendingVestingScheduleDeletion = {
      chainId,
      transactionHash: hash,
      senderAddress,
      receiverAddress: receiver,
      id: hash + "-" + index,
      superTokenAddress: superToken,
      pendingType: "VestingScheduleDelete",
      timestamp: dateNowSeconds(),
      relevantSubgraph: "Vesting",
      version: "v3",
    };
    pendingUpdates.push(pendingUpdate);
  }

  return pendingUpdates;
}

export function buildDeleteVestingSchedulePendingUpdate(
  hash: string,
  arg: {
    chainId: number;
    superTokenAddress: string;
    senderAddress: string;
    receiverAddress: string;
    version: VestingVersion;
  }
): PendingUpdate[] {
  const pendingUpdate: PendingVestingScheduleDeletion = {
    chainId: arg.chainId,
    transactionHash: hash,
    senderAddress: arg.senderAddress,
    receiverAddress: arg.receiverAddress,
    id: hash,
    superTokenAddress: arg.superTokenAddress,
    pendingType: "VestingScheduleDelete",
    timestamp: dateNowSeconds(),
    relevantSubgraph: "Vesting",
    version: arg.version,
  };
  return [pendingUpdate];
}

export function buildClaimVestingSchedulePendingUpdate(
  hash: string,
  arg: {
    chainId: number;
    superTokenAddress: string;
    senderAddress: string;
    receiverAddress: string;
    version: "v2" | "v3";
  }
): PendingUpdate[] {
  const pendingUpdate: PendingVestingScheduleClaim = {
    chainId: arg.chainId,
    transactionHash: hash,
    senderAddress: arg.senderAddress,
    receiverAddress: arg.receiverAddress,
    id: hash,
    superTokenAddress: arg.superTokenAddress,
    pendingType: "VestingScheduleClaim",
    timestamp: dateNowSeconds(),
    relevantSubgraph: "Vesting",
    version: arg.version,
  };
  return [pendingUpdate];
}
