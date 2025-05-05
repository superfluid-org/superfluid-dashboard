import { VestingScheduleEventsQuery } from "./.graphclient";
import * as events from "./vestingEvents";

export const mapAllVestingEvents = (
    queryEvents: VestingScheduleEventsQuery["events"]
): events.AllVestingEvents[] => {
    return queryEvents.map((x) => {
        switch (x.__typename) {
            case "VestingCliffAndFlowExecutedEvent":
                return typeGuard<events.VestingCliffAndFlowExecutedEvent>({
                    name: "VestingCliffAndFlowExecuted",
                    id: x.id,
                    blockNumber: Number(x.blockNumber),
                    transactionHash: x.transactionHash,
                    gasPrice: x.gasPrice,
                    order: Number(x.order),
                    timestamp: Number(x.timestamp),
                    logIndex: Number(x.logIndex),
                    superToken: x.superToken,
                    sender: x.sender,
                    receiver: x.receiver,
                    cliffAndFlowDate: Number(x.cliffAndFlowDate),
                    flowRate: x.flowRate,
                    cliffAmount: x.cliffAmount,
                    flowDelayCompensation: x.flowDelayCompensation,
                });
            case "VestingEndExecutedEvent":
                return typeGuard<events.VestingEndExecutedEvent>({
                    name: "VestingEndExecuted",
                    id: x.id,
                    blockNumber: Number(x.blockNumber),
                    transactionHash: x.transactionHash,
                    order: Number(x.order),
                    timestamp: Number(x.timestamp),
                    gasPrice: x.gasPrice,
                    logIndex: Number(x.logIndex),
                    superToken: x.superToken,
                    sender: x.sender,
                    receiver: x.receiver,
                    endDate: Number(x.endDate),
                    earlyEndCompensation: x.earlyEndCompensation,
                    didCompensationFail: x.didCompensationFail,
                });
            case "VestingEndFailedEvent":
                return typeGuard<events.VestingEndFailedEvent>({
                    name: "VestingEndFailed",
                    id: x.id,
                    blockNumber: Number(x.blockNumber),
                    transactionHash: x.transactionHash,
                    gasPrice: x.gasPrice,
                    order: Number(x.order),
                    timestamp: Number(x.timestamp),
                    logIndex: Number(x.logIndex),
                    superToken: x.superToken,
                    sender: x.sender,
                    receiver: x.receiver,
                    endDate: Number(x.endDate),
                });
            case "VestingScheduleCreatedEvent":
                return typeGuard<events.VestingScheduleCreatedEvent>({
                    name: "VestingScheduleCreated",
                    id: x.id,
                    blockNumber: Number(x.blockNumber),
                    transactionHash: x.transactionHash,
                    gasPrice: x.gasPrice,
                    order: Number(x.order),
                    timestamp: Number(x.timestamp),
                    logIndex: Number(x.logIndex),
                    superToken: x.superToken,
                    sender: x.sender,
                    receiver: x.receiver,
                    startDate: Number(x.startDate),
                    cliffDate: Number(x.cliffDate),
                    flowRate: x.flowRate,
                    endDate: Number(x.endDate),
                    cliffAmount: x.cliffAmount,
                    claimValidityDate: Number(x.claimValidityDate),
                    remainderAmount: x.remainderAmount,
                });
            case "VestingScheduleDeletedEvent":
                return typeGuard<events.VestingScheduleDeletedEvent>({
                    name: "VestingScheduleDeleted",
                    id: x.id,
                    blockNumber: Number(x.blockNumber),
                    transactionHash: x.transactionHash,
                    gasPrice: x.gasPrice,
                    order: Number(x.order),
                    timestamp: Number(x.timestamp),
                    logIndex: Number(x.logIndex),
                    superToken: x.superToken,
                    sender: x.sender,
                    receiver: x.receiver,
                });
            case "VestingScheduleUpdatedEvent":
                return typeGuard<events.VestingScheduleUpdatedEvent>({
                    name: "VestingScheduleUpdated",
                    id: x.id,
                    blockNumber: Number(x.blockNumber),
                    transactionHash: x.transactionHash,
                    gasPrice: x.gasPrice,
                    order: Number(x.order),
                    timestamp: Number(x.timestamp),
                    logIndex: Number(x.logIndex),
                    superToken: x.superToken,
                    sender: x.sender,
                    receiver: x.receiver,
                    oldEndDate: Number(x.oldEndDate),
                    endDate: Number(x.endDate),
                    oldRemainderAmount: x.oldRemainderAmount,
                    remainderAmount: x.remainderAmount,
                    oldFlowRate: x.oldFlowRate,
                    flowRate: x.flowRate,
                    totalAmount: x.totalAmount,
                    oldTotalAmount: x.oldTotalAmount,
                    settledAmount: x.settledAmount,
                });
            case "VestingClaimedEvent":
                return typeGuard<events.VestingClaimedEvent>({
                    name: "VestingClaimed",
                    id: x.id,
                    blockNumber: Number(x.blockNumber),
                    transactionHash: x.transactionHash,
                    gasPrice: x.gasPrice,
                    order: Number(x.order),
                    timestamp: Number(x.timestamp),
                    logIndex: Number(x.logIndex),
                    superToken: x.superToken,
                    sender: x.sender,
                    receiver: x.receiver,
                    claimer: x.claimer,
                });
            default:
                throw new Error(`Unknown event type: ${x.__typename}`);
        }
    });
};

export const typeGuard = <T>(obj: T) => obj;