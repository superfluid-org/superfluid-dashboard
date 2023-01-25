import { getUnixTime } from "date-fns";
import { BigNumber } from "ethers";
import { GetVestingScheduleQuery } from "../../vesting-subgraph/.graphclient";

export enum VestingStatusType {
  ScheduledStart = "Scheduled",
  CliffPeriod = "Cliff",
  CliffAndFlowExecuted = "Vesting",
  CliffAndFlowExpired = "Send Stream Error",
  EndExecuted = "Vested",
  EndFailed = "Stream Cancel Error",
  EndOverflowed = "Stream Overflow Error",
  EndCompensationFailed = "Transfer Error",
  DeletedBeforeStart = "Deleted",
  DeletedAfterStart = "Deleted",
}

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
  status: VestingStatusType;
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
      return VestingStatusType.DeletedAfterStart;
    }

    return VestingStatusType.DeletedBeforeStart;
  }

  if (failedAt) {
    return VestingStatusType.EndFailed;
  }

  if (didEarlyEndCompensationFail) {
    return VestingStatusType.EndCompensationFailed;
  }

  if (endExecutedAt) {
    if (endExecutedAt > endDate) {
      return VestingStatusType.EndOverflowed;
    }

    return VestingStatusType.EndExecuted;
  }

  if (cliffAndFlowExecutedAt) {
    return VestingStatusType.CliffAndFlowExecuted;
  }

  if (nowUnix > cliffAndFlowExpirationAt) {
    return VestingStatusType.CliffAndFlowExpired;
  }

  if (cliffDate) {
    if (nowUnix > cliffDate) {
      return VestingStatusType.CliffPeriod;
    }
  }

  return VestingStatusType.ScheduledStart;
};
