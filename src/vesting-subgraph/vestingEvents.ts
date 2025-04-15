import { EventBase } from "@superfluid-finance/sdk-core"

export type AllVestingEvents = VestingCliffAndFlowExecutedEvent | VestingEndExecutedEvent | VestingEndFailedEvent | VestingScheduleCreatedEvent | VestingScheduleDeletedEvent | VestingScheduleUpdatedEvent | VestingClaimedEvent;

export interface VestingCliffAndFlowExecutedEvent extends EventBase {
    name: "VestingCliffAndFlowExecuted";
    superToken: string;
    sender: string;
    receiver: string;
    cliffAndFlowDate: number;
    flowRate: string;
    cliffAmount: string;
    flowDelayCompensation: string;
}

export interface VestingEndExecutedEvent extends EventBase {
    name: "VestingEndExecuted";
    superToken: string;
    sender: string;
    receiver: string;
    endDate: number;
    earlyEndCompensation: string;
    didCompensationFail: boolean;
}

export interface VestingEndFailedEvent extends EventBase {
    name: "VestingEndFailed";
    superToken: string;
    sender: string;
    receiver: string;
    endDate: number;
}

export interface VestingScheduleCreatedEvent extends EventBase {
    name: "VestingScheduleCreated";
    superToken: string;
    sender: string;
    receiver: string;
    startDate: number;
    cliffDate: number;
    flowRate: string;
    endDate: number;
    cliffAmount: string;
    claimValidityDate: number;
    remainderAmount: string;
}

export interface VestingScheduleDeletedEvent extends EventBase {
    name: "VestingScheduleDeleted";
    superToken: string;
    sender: string;
    receiver: string;
}

export interface VestingScheduleUpdatedEvent extends EventBase {
    name: "VestingScheduleUpdated";
    superToken: string;
    sender: string;
    receiver: string;

    oldEndDate: number;
    endDate: number;

    oldRemainderAmount: string;
    remainderAmount: string;

    oldFlowRate: string;
    flowRate: string;

    totalAmount: string;
    oldTotalAmount: string;

    settledAmount: string;
}

export interface VestingClaimedEvent extends EventBase {
    name: "VestingClaimed";
    superToken: string;
    sender: string;
    receiver: string;
    claimer: string;
}