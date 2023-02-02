import { getUnixTime } from "date-fns";
import { GetVestingScheduleQuery } from "../../vesting-subgraph/.graphclient";

interface VestingStatus {
  title: string;
  isFinished: boolean;
  isCliff: boolean;
  isStreaming: boolean;
  isError: boolean;
  isDeleted: boolean;
}

export const vestingStatuses: Record<string, VestingStatus> = {
  ScheduledStart: {
    title: "Scheduled",
    isFinished: false,
    isCliff: false,
    isStreaming: false,
    isError: false,
    isDeleted: false,
  },
  CliffPeriod: {
    title: "Cliff",
    isFinished: false,
    isCliff: true,
    isStreaming: false,
    isError: false,
    isDeleted: false,
  },
  CliffAndFlowExecuted: {
    title: "Vesting",
    isFinished: false,
    isCliff: false,
    isStreaming: true,
    isError: false,
    isDeleted: false,
  },
  CliffAndFlowExpired: {
    title: "Stream Error",
    isFinished: false,
    isCliff: false,
    isStreaming: true,
    isError: true,
    isDeleted: false,
  },
  EndExecuted: {
    title: "Vested",
    isFinished: true,
    isCliff: false,
    isStreaming: false,
    isError: false,
    isDeleted: false,
  },
  EndFailed: {
    title: "Cancel Error",
    isFinished: true,
    isCliff: false,
    isStreaming: false,
    isError: true,
    isDeleted: false,
  },
  EndOverflowed: {
    title: "Overflow Error",
    isFinished: true,
    isCliff: false,
    isStreaming: false,
    isError: true,
    isDeleted: false,
  },
  EndCompensationFailed: {
    title: "Transfer Error",
    isFinished: true,
    isCliff: false,
    isStreaming: false,
    isError: true,
    isDeleted: false,
  },
  DeletedBeforeStart: {
    title: "Deleted",
    isFinished: true,
    isCliff: false,
    isStreaming: false,
    isError: false,
    isDeleted: true,
  },
  DeletedAfterStart: {
    title: "Deleted",
    isFinished: true,
    isCliff: false,
    isStreaming: false,
    isError: false,
    isDeleted: true,
  },
};

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
  } = vestingSchedule;
  const nowUnix = getUnixTime(new Date());

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
    if (endExecutedAt > endDate) {
      return vestingStatuses.EndOverflowed;
    }

    return vestingStatuses.EndExecuted;
  }

  if (cliffAndFlowExecutedAt) {
    return vestingStatuses.CliffAndFlowExecuted;
  }

  if (nowUnix > cliffAndFlowExpirationAt) {
    return vestingStatuses.CliffAndFlowExpired;
  }

  if (cliffDate) {
    if (nowUnix > cliffDate) {
      return vestingStatuses.CliffPeriod;
    }
  }

  return vestingStatuses.ScheduledStart;
};
