import {
  GetVestingScheduleQuery
} from "../../vesting-subgraph/.graphclient";
import { dateNowSeconds } from "../../utils/dateUtils";
import { VestingVersion } from "../network/networks";

interface VestingStatus {
  title: string;
  isFinished: boolean;
  isCliff: boolean;
  canClaim: boolean;
  isStreaming: boolean;
  isError: boolean;
  isDeleted: boolean;
}

export const vestingStatuses = {
  ScheduledStart: {
    title: "Scheduled",
    isFinished: false,
    isCliff: false,
    canClaim: false,
    isStreaming: false,
    isError: false,
    isDeleted: false,
  },
  CliffPeriod: {
    title: "Cliff",
    isFinished: false,
    isCliff: true,
    canClaim: false,
    isStreaming: false,
    isError: false,
    isDeleted: false,
  },
  CliffAndFlowExecuted: {
    title: "Vesting",
    isFinished: false,
    isCliff: false,
    canClaim: false,
    isStreaming: true,
    isError: false,
    isDeleted: false,
  },
  CliffAndFlowExpired: {
    title: "Stream Error",
    isFinished: false,
    isCliff: false,
    canClaim: false,
    isStreaming: true,
    isError: true,
    isDeleted: false,
  },
  EndExecuted: {
    title: "Vested",
    isFinished: true,
    isCliff: false,
    canClaim: false,
    isStreaming: false,
    isError: false,
    isDeleted: false,
  },
  EndFailed: {
    title: "Cancel Error",
    isFinished: true,
    isCliff: false,
    canClaim: false,
    isStreaming: false,
    isError: true,
    isDeleted: false,
  },
  EndOverflowed: {
    title: "Overflow Error",
    isFinished: true,
    isCliff: false,
    canClaim: false,
    isStreaming: false,
    isError: true,
    isDeleted: false,
  },
  EndCompensationFailed: {
    title: "Transfer Error",
    isFinished: true,
    isCliff: false,
    canClaim: false,
    isStreaming: false,
    isError: true,
    isDeleted: false,
  },
  DeletedBeforeStart: {
    title: "Deleted",
    isFinished: true,
    isCliff: false,
    canClaim: false,
    isStreaming: false,
    isError: false,
    isDeleted: true,
  },
  DeletedAfterStart: {
    title: "Deleted",
    isFinished: true,
    isCliff: false,
    canClaim: false,
    isStreaming: false,
    isError: false,
    isDeleted: true,
  },
  Claimable: {
    title: "Unclaimed",
    isFinished: false,
    isCliff: false,
    canClaim: true,
    isStreaming: false,
    isError: false,
    isDeleted: false,
  },
  ClaimExpired: {
    title: "Claim Expired",
    isFinished: true,
    isCliff: false,
    canClaim: false,
    isStreaming: false,
    isError: true,
    isDeleted: false,
  },
} as const satisfies Record<string, VestingStatus>;

// Keep it serializable!
export interface VestingSchedule {
  id: string;
  superToken: string;
  sender: string;
  receiver: string;
  flowRate: string;
  createdAt: number;
  deletedAt?: number;
  startDate: number;
  cliffDate?: number;
  cliffAndFlowExecutedAt?: number;
  cliffAndFlowExpirationAt: number;
  cliffAndFlowDate: number;
  cliffAmount: string;
  endDate: number;
  endDateValidAt: number;
  endExecutedAt?: number;
  failedAt?: number;
  didEarlyEndCompensationFail?: boolean;
  earlyEndCompensation?: string;
  status: VestingStatus;
  claimValidityDate: number;
  claimedAt?: number;
  remainderAmount: string;
  version: VestingVersion;
  transactionHash: string;
  totalAmount: string;
}

export type SubgraphVestingSchedule = NonNullable<
  Required<GetVestingScheduleQuery>["vestingSchedule"]
>;

export const mapSubgraphVestingSchedule = (
  vestingSchedule: SubgraphVestingSchedule
): VestingSchedule => {
  const mappedVestingSchedule = {
    ...vestingSchedule,
    createdAt: Number(vestingSchedule.createdAt),
    cliffAndFlowDate: Number(vestingSchedule.cliffAndFlowDate),
    cliffAndFlowExecutedAt: vestingSchedule.cliffAndFlowExecutedAt
      ? Number(vestingSchedule.cliffAndFlowExecutedAt)
      : undefined,
    deletedAt: vestingSchedule.deletedAt
      ? Number(vestingSchedule.deletedAt)
      : undefined,
    startDate: Number(vestingSchedule.startDate),
    cliffAndFlowExpirationAt: Number(vestingSchedule.cliffAndFlowExpirationAt),
    cliffDate: vestingSchedule.cliffDate
      ? Number(vestingSchedule.cliffDate)
      : undefined,
    failedAt: vestingSchedule.failedAt
      ? Number(vestingSchedule.failedAt)
      : undefined,
    endExecutedAt: vestingSchedule.endExecutedAt
      ? Number(vestingSchedule.endExecutedAt)
      : undefined,
    endDateValidAt: Number(vestingSchedule.endDateValidAt),
    endDate: Number(vestingSchedule.endDate),
    didEarlyEndCompensationFail: vestingSchedule.didEarlyEndCompensationFail,
    earlyEndCompensation: vestingSchedule.earlyEndCompensation,
    claimValidityDate: vestingSchedule.claimValidityDate
      ? Number(vestingSchedule.claimValidityDate)
      : 0,
    claimedAt: vestingSchedule.claimedAt
      ? Number(vestingSchedule.claimedAt)
      : undefined,
    remainderAmount: vestingSchedule.remainderAmount
      ? vestingSchedule.remainderAmount
      : "0",
    version: vestingSchedule.contractVersion,
    transactionHash: vestingSchedule.id.split("-")[0],
    totalAmount: vestingSchedule.totalAmount
  };
  return {
    ...mappedVestingSchedule,
    status: getVestingStatus(mappedVestingSchedule),
  };
};

const getVestingStatus = (vestingSchedule: Omit<VestingSchedule, "status">) => {
  const {
    deletedAt,
    failedAt,
    startDate,
    cliffDate,
    endDate,
    cliffAndFlowExecutedAt,
    cliffAndFlowExpirationAt,
    endExecutedAt,
    didEarlyEndCompensationFail,
    claimValidityDate,
    claimedAt
  } = vestingSchedule;
  const nowInSeconds = dateNowSeconds();
  const cliffAndFlowDate = cliffDate ? cliffDate : startDate;

  if (deletedAt) {
    if (deletedAt > startDate) {
      return vestingStatuses.DeletedAfterStart;
    }

    return vestingStatuses.DeletedBeforeStart;
  }

  if (failedAt) {
    return vestingStatuses.EndFailed;
  }

  if (didEarlyEndCompensationFail) {
    return vestingStatuses.EndCompensationFailed;
  }

  if (endExecutedAt) {
    if (claimedAt !== endExecutedAt) {
      if (endExecutedAt > endDate) {
        return vestingStatuses.EndOverflowed;
      }
    }

    return vestingStatuses.EndExecuted;
  }

  if (cliffAndFlowExecutedAt) {
    return vestingStatuses.CliffAndFlowExecuted;
  }

  if (claimValidityDate) {
    if (nowInSeconds > claimValidityDate) {
      return vestingStatuses.ClaimExpired;
    }

    if (nowInSeconds > cliffAndFlowDate && nowInSeconds < claimValidityDate) {
      return vestingStatuses.Claimable;
    }
  }

  if (nowInSeconds > cliffAndFlowExpirationAt) {
    return vestingStatuses.CliffAndFlowExpired;
  }

  if (cliffDate) {
    if (startDate < nowInSeconds && nowInSeconds < cliffAndFlowExpirationAt) {
      return vestingStatuses.CliffPeriod;
    }
  }

  return vestingStatuses.ScheduledStart;
};