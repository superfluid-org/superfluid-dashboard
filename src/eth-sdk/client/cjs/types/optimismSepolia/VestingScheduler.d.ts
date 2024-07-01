import type { BaseContract, BigNumber, BigNumberish, BytesLike, CallOverrides, ContractTransaction, Overrides, PopulatedTransaction, Signer, utils } from "ethers";
import type { FunctionFragment, Result, EventFragment } from "@ethersproject/abi";
import type { Listener, Provider } from "@ethersproject/providers";
import type { TypedEventFilter, TypedEvent, TypedListener, OnEvent, PromiseOrValue } from "../common";
export declare namespace IVestingSchedulerV2 {
    type VestingScheduleStruct = {
        cliffAndFlowDate: PromiseOrValue<BigNumberish>;
        endDate: PromiseOrValue<BigNumberish>;
        flowRate: PromiseOrValue<BigNumberish>;
        cliffAmount: PromiseOrValue<BigNumberish>;
        remainderAmount: PromiseOrValue<BigNumberish>;
        claimValidityDate: PromiseOrValue<BigNumberish>;
    };
    type VestingScheduleStructOutput = [
        number,
        number,
        BigNumber,
        BigNumber,
        BigNumber,
        number
    ] & {
        cliffAndFlowDate: number;
        endDate: number;
        flowRate: BigNumber;
        cliffAmount: BigNumber;
        remainderAmount: BigNumber;
        claimValidityDate: number;
    };
    type ScheduleCreationParamsStruct = {
        superToken: PromiseOrValue<string>;
        receiver: PromiseOrValue<string>;
        startDate: PromiseOrValue<BigNumberish>;
        claimValidityDate: PromiseOrValue<BigNumberish>;
        cliffDate: PromiseOrValue<BigNumberish>;
        flowRate: PromiseOrValue<BigNumberish>;
        cliffAmount: PromiseOrValue<BigNumberish>;
        endDate: PromiseOrValue<BigNumberish>;
        remainderAmount: PromiseOrValue<BigNumberish>;
    };
    type ScheduleCreationParamsStructOutput = [
        string,
        string,
        number,
        number,
        number,
        BigNumber,
        BigNumber,
        number,
        BigNumber
    ] & {
        superToken: string;
        receiver: string;
        startDate: number;
        claimValidityDate: number;
        cliffDate: number;
        flowRate: BigNumber;
        cliffAmount: BigNumber;
        endDate: number;
        remainderAmount: BigNumber;
    };
}
export declare namespace VestingSchedulerV2 {
    type ScheduleAggregateStruct = {
        superToken: PromiseOrValue<string>;
        sender: PromiseOrValue<string>;
        receiver: PromiseOrValue<string>;
        id: PromiseOrValue<BytesLike>;
        schedule: IVestingSchedulerV2.VestingScheduleStruct;
    };
    type ScheduleAggregateStructOutput = [
        string,
        string,
        string,
        string,
        IVestingSchedulerV2.VestingScheduleStructOutput
    ] & {
        superToken: string;
        sender: string;
        receiver: string;
        id: string;
        schedule: IVestingSchedulerV2.VestingScheduleStructOutput;
    };
}
export interface VestingSchedulerInterface extends utils.Interface {
    functions: {
        "END_DATE_VALID_BEFORE()": FunctionFragment;
        "MIN_VESTING_DURATION()": FunctionFragment;
        "START_DATE_VALID_AFTER()": FunctionFragment;
        "VERSION()": FunctionFragment;
        "_getVestingScheduleAggregate(address,address,address)": FunctionFragment;
        "afterAgreementCreated(address,address,bytes32,bytes,bytes,bytes)": FunctionFragment;
        "afterAgreementTerminated(address,address,bytes32,bytes,bytes,bytes)": FunctionFragment;
        "afterAgreementUpdated(address,address,bytes32,bytes,bytes,bytes)": FunctionFragment;
        "beforeAgreementCreated(address,address,bytes32,bytes,bytes)": FunctionFragment;
        "beforeAgreementTerminated(address,address,bytes32,bytes,bytes)": FunctionFragment;
        "beforeAgreementUpdated(address,address,bytes32,bytes,bytes)": FunctionFragment;
        "cfaV1()": FunctionFragment;
        "createAndExecuteVestingScheduleFromAmountAndDuration(address,address,uint256,uint32,bytes)": FunctionFragment;
        "createAndExecuteVestingScheduleFromAmountAndDuration(address,address,uint256,uint32)": FunctionFragment;
        "createClaimableVestingSchedule(address,address,uint32,uint32,uint32,int96,uint256,uint32,bytes)": FunctionFragment;
        "createClaimableVestingSchedule(address,address,uint32,uint32,uint32,int96,uint256,uint32)": FunctionFragment;
        "createClaimableVestingScheduleFromAmountAndDuration(address,address,uint256,uint32,uint32,uint32)": FunctionFragment;
        "createClaimableVestingScheduleFromAmountAndDuration(address,address,uint256,uint32,uint32,uint32,uint32)": FunctionFragment;
        "createClaimableVestingScheduleFromAmountAndDuration(address,address,uint256,uint32,uint32)": FunctionFragment;
        "createClaimableVestingScheduleFromAmountAndDuration(address,address,uint256,uint32,uint32,uint32,uint32,bytes)": FunctionFragment;
        "createVestingSchedule(address,address,uint32,uint32,int96,uint256,uint32,bytes)": FunctionFragment;
        "createVestingSchedule(address,address,uint32,uint32,int96,uint256,uint32)": FunctionFragment;
        "createVestingScheduleFromAmountAndDuration(address,address,uint256,uint32)": FunctionFragment;
        "createVestingScheduleFromAmountAndDuration(address,address,uint256,uint32,uint32,uint32,bytes)": FunctionFragment;
        "createVestingScheduleFromAmountAndDuration(address,address,uint256,uint32,uint32,uint32)": FunctionFragment;
        "createVestingScheduleFromAmountAndDuration(address,address,uint256,uint32,uint32)": FunctionFragment;
        "deleteVestingSchedule(address,address,bytes)": FunctionFragment;
        "executeCliffAndFlow(address,address,address)": FunctionFragment;
        "executeEndVesting(address,address,address)": FunctionFragment;
        "getCreateVestingScheduleParamsFromAmountAndDuration(address,address,uint256,uint32,uint32,uint32,uint32)": FunctionFragment;
        "getMaximumNeededTokenAllowance(address,address,address)": FunctionFragment;
        "getMaximumNeededTokenAllowance((uint32,uint32,int96,uint256,uint96,uint32))": FunctionFragment;
        "getVestingSchedule(address,address,address)": FunctionFragment;
        "updateVestingSchedule(address,address,uint32,bytes)": FunctionFragment;
        "vestingSchedules(bytes32)": FunctionFragment;
    };
    getFunction(nameOrSignatureOrTopic: "END_DATE_VALID_BEFORE" | "MIN_VESTING_DURATION" | "START_DATE_VALID_AFTER" | "VERSION" | "_getVestingScheduleAggregate" | "afterAgreementCreated" | "afterAgreementTerminated" | "afterAgreementUpdated" | "beforeAgreementCreated" | "beforeAgreementTerminated" | "beforeAgreementUpdated" | "cfaV1" | "createAndExecuteVestingScheduleFromAmountAndDuration(address,address,uint256,uint32,bytes)" | "createAndExecuteVestingScheduleFromAmountAndDuration(address,address,uint256,uint32)" | "createClaimableVestingSchedule(address,address,uint32,uint32,uint32,int96,uint256,uint32,bytes)" | "createClaimableVestingSchedule(address,address,uint32,uint32,uint32,int96,uint256,uint32)" | "createClaimableVestingScheduleFromAmountAndDuration(address,address,uint256,uint32,uint32,uint32)" | "createClaimableVestingScheduleFromAmountAndDuration(address,address,uint256,uint32,uint32,uint32,uint32)" | "createClaimableVestingScheduleFromAmountAndDuration(address,address,uint256,uint32,uint32)" | "createClaimableVestingScheduleFromAmountAndDuration(address,address,uint256,uint32,uint32,uint32,uint32,bytes)" | "createVestingSchedule(address,address,uint32,uint32,int96,uint256,uint32,bytes)" | "createVestingSchedule(address,address,uint32,uint32,int96,uint256,uint32)" | "createVestingScheduleFromAmountAndDuration(address,address,uint256,uint32)" | "createVestingScheduleFromAmountAndDuration(address,address,uint256,uint32,uint32,uint32,bytes)" | "createVestingScheduleFromAmountAndDuration(address,address,uint256,uint32,uint32,uint32)" | "createVestingScheduleFromAmountAndDuration(address,address,uint256,uint32,uint32)" | "deleteVestingSchedule" | "executeCliffAndFlow" | "executeEndVesting" | "getCreateVestingScheduleParamsFromAmountAndDuration" | "getMaximumNeededTokenAllowance(address,address,address)" | "getMaximumNeededTokenAllowance((uint32,uint32,int96,uint256,uint96,uint32))" | "getVestingSchedule" | "updateVestingSchedule" | "vestingSchedules"): FunctionFragment;
    encodeFunctionData(functionFragment: "END_DATE_VALID_BEFORE", values?: undefined): string;
    encodeFunctionData(functionFragment: "MIN_VESTING_DURATION", values?: undefined): string;
    encodeFunctionData(functionFragment: "START_DATE_VALID_AFTER", values?: undefined): string;
    encodeFunctionData(functionFragment: "VERSION", values?: undefined): string;
    encodeFunctionData(functionFragment: "_getVestingScheduleAggregate", values: [
        PromiseOrValue<string>,
        PromiseOrValue<string>,
        PromiseOrValue<string>
    ]): string;
    encodeFunctionData(functionFragment: "afterAgreementCreated", values: [
        PromiseOrValue<string>,
        PromiseOrValue<string>,
        PromiseOrValue<BytesLike>,
        PromiseOrValue<BytesLike>,
        PromiseOrValue<BytesLike>,
        PromiseOrValue<BytesLike>
    ]): string;
    encodeFunctionData(functionFragment: "afterAgreementTerminated", values: [
        PromiseOrValue<string>,
        PromiseOrValue<string>,
        PromiseOrValue<BytesLike>,
        PromiseOrValue<BytesLike>,
        PromiseOrValue<BytesLike>,
        PromiseOrValue<BytesLike>
    ]): string;
    encodeFunctionData(functionFragment: "afterAgreementUpdated", values: [
        PromiseOrValue<string>,
        PromiseOrValue<string>,
        PromiseOrValue<BytesLike>,
        PromiseOrValue<BytesLike>,
        PromiseOrValue<BytesLike>,
        PromiseOrValue<BytesLike>
    ]): string;
    encodeFunctionData(functionFragment: "beforeAgreementCreated", values: [
        PromiseOrValue<string>,
        PromiseOrValue<string>,
        PromiseOrValue<BytesLike>,
        PromiseOrValue<BytesLike>,
        PromiseOrValue<BytesLike>
    ]): string;
    encodeFunctionData(functionFragment: "beforeAgreementTerminated", values: [
        PromiseOrValue<string>,
        PromiseOrValue<string>,
        PromiseOrValue<BytesLike>,
        PromiseOrValue<BytesLike>,
        PromiseOrValue<BytesLike>
    ]): string;
    encodeFunctionData(functionFragment: "beforeAgreementUpdated", values: [
        PromiseOrValue<string>,
        PromiseOrValue<string>,
        PromiseOrValue<BytesLike>,
        PromiseOrValue<BytesLike>,
        PromiseOrValue<BytesLike>
    ]): string;
    encodeFunctionData(functionFragment: "cfaV1", values?: undefined): string;
    encodeFunctionData(functionFragment: "createAndExecuteVestingScheduleFromAmountAndDuration(address,address,uint256,uint32,bytes)", values: [
        PromiseOrValue<string>,
        PromiseOrValue<string>,
        PromiseOrValue<BigNumberish>,
        PromiseOrValue<BigNumberish>,
        PromiseOrValue<BytesLike>
    ]): string;
    encodeFunctionData(functionFragment: "createAndExecuteVestingScheduleFromAmountAndDuration(address,address,uint256,uint32)", values: [
        PromiseOrValue<string>,
        PromiseOrValue<string>,
        PromiseOrValue<BigNumberish>,
        PromiseOrValue<BigNumberish>
    ]): string;
    encodeFunctionData(functionFragment: "createClaimableVestingSchedule(address,address,uint32,uint32,uint32,int96,uint256,uint32,bytes)", values: [
        PromiseOrValue<string>,
        PromiseOrValue<string>,
        PromiseOrValue<BigNumberish>,
        PromiseOrValue<BigNumberish>,
        PromiseOrValue<BigNumberish>,
        PromiseOrValue<BigNumberish>,
        PromiseOrValue<BigNumberish>,
        PromiseOrValue<BigNumberish>,
        PromiseOrValue<BytesLike>
    ]): string;
    encodeFunctionData(functionFragment: "createClaimableVestingSchedule(address,address,uint32,uint32,uint32,int96,uint256,uint32)", values: [
        PromiseOrValue<string>,
        PromiseOrValue<string>,
        PromiseOrValue<BigNumberish>,
        PromiseOrValue<BigNumberish>,
        PromiseOrValue<BigNumberish>,
        PromiseOrValue<BigNumberish>,
        PromiseOrValue<BigNumberish>,
        PromiseOrValue<BigNumberish>
    ]): string;
    encodeFunctionData(functionFragment: "createClaimableVestingScheduleFromAmountAndDuration(address,address,uint256,uint32,uint32,uint32)", values: [
        PromiseOrValue<string>,
        PromiseOrValue<string>,
        PromiseOrValue<BigNumberish>,
        PromiseOrValue<BigNumberish>,
        PromiseOrValue<BigNumberish>,
        PromiseOrValue<BigNumberish>
    ]): string;
    encodeFunctionData(functionFragment: "createClaimableVestingScheduleFromAmountAndDuration(address,address,uint256,uint32,uint32,uint32,uint32)", values: [
        PromiseOrValue<string>,
        PromiseOrValue<string>,
        PromiseOrValue<BigNumberish>,
        PromiseOrValue<BigNumberish>,
        PromiseOrValue<BigNumberish>,
        PromiseOrValue<BigNumberish>,
        PromiseOrValue<BigNumberish>
    ]): string;
    encodeFunctionData(functionFragment: "createClaimableVestingScheduleFromAmountAndDuration(address,address,uint256,uint32,uint32)", values: [
        PromiseOrValue<string>,
        PromiseOrValue<string>,
        PromiseOrValue<BigNumberish>,
        PromiseOrValue<BigNumberish>,
        PromiseOrValue<BigNumberish>
    ]): string;
    encodeFunctionData(functionFragment: "createClaimableVestingScheduleFromAmountAndDuration(address,address,uint256,uint32,uint32,uint32,uint32,bytes)", values: [
        PromiseOrValue<string>,
        PromiseOrValue<string>,
        PromiseOrValue<BigNumberish>,
        PromiseOrValue<BigNumberish>,
        PromiseOrValue<BigNumberish>,
        PromiseOrValue<BigNumberish>,
        PromiseOrValue<BigNumberish>,
        PromiseOrValue<BytesLike>
    ]): string;
    encodeFunctionData(functionFragment: "createVestingSchedule(address,address,uint32,uint32,int96,uint256,uint32,bytes)", values: [
        PromiseOrValue<string>,
        PromiseOrValue<string>,
        PromiseOrValue<BigNumberish>,
        PromiseOrValue<BigNumberish>,
        PromiseOrValue<BigNumberish>,
        PromiseOrValue<BigNumberish>,
        PromiseOrValue<BigNumberish>,
        PromiseOrValue<BytesLike>
    ]): string;
    encodeFunctionData(functionFragment: "createVestingSchedule(address,address,uint32,uint32,int96,uint256,uint32)", values: [
        PromiseOrValue<string>,
        PromiseOrValue<string>,
        PromiseOrValue<BigNumberish>,
        PromiseOrValue<BigNumberish>,
        PromiseOrValue<BigNumberish>,
        PromiseOrValue<BigNumberish>,
        PromiseOrValue<BigNumberish>
    ]): string;
    encodeFunctionData(functionFragment: "createVestingScheduleFromAmountAndDuration(address,address,uint256,uint32)", values: [
        PromiseOrValue<string>,
        PromiseOrValue<string>,
        PromiseOrValue<BigNumberish>,
        PromiseOrValue<BigNumberish>
    ]): string;
    encodeFunctionData(functionFragment: "createVestingScheduleFromAmountAndDuration(address,address,uint256,uint32,uint32,uint32,bytes)", values: [
        PromiseOrValue<string>,
        PromiseOrValue<string>,
        PromiseOrValue<BigNumberish>,
        PromiseOrValue<BigNumberish>,
        PromiseOrValue<BigNumberish>,
        PromiseOrValue<BigNumberish>,
        PromiseOrValue<BytesLike>
    ]): string;
    encodeFunctionData(functionFragment: "createVestingScheduleFromAmountAndDuration(address,address,uint256,uint32,uint32,uint32)", values: [
        PromiseOrValue<string>,
        PromiseOrValue<string>,
        PromiseOrValue<BigNumberish>,
        PromiseOrValue<BigNumberish>,
        PromiseOrValue<BigNumberish>,
        PromiseOrValue<BigNumberish>
    ]): string;
    encodeFunctionData(functionFragment: "createVestingScheduleFromAmountAndDuration(address,address,uint256,uint32,uint32)", values: [
        PromiseOrValue<string>,
        PromiseOrValue<string>,
        PromiseOrValue<BigNumberish>,
        PromiseOrValue<BigNumberish>,
        PromiseOrValue<BigNumberish>
    ]): string;
    encodeFunctionData(functionFragment: "deleteVestingSchedule", values: [
        PromiseOrValue<string>,
        PromiseOrValue<string>,
        PromiseOrValue<BytesLike>
    ]): string;
    encodeFunctionData(functionFragment: "executeCliffAndFlow", values: [
        PromiseOrValue<string>,
        PromiseOrValue<string>,
        PromiseOrValue<string>
    ]): string;
    encodeFunctionData(functionFragment: "executeEndVesting", values: [
        PromiseOrValue<string>,
        PromiseOrValue<string>,
        PromiseOrValue<string>
    ]): string;
    encodeFunctionData(functionFragment: "getCreateVestingScheduleParamsFromAmountAndDuration", values: [
        PromiseOrValue<string>,
        PromiseOrValue<string>,
        PromiseOrValue<BigNumberish>,
        PromiseOrValue<BigNumberish>,
        PromiseOrValue<BigNumberish>,
        PromiseOrValue<BigNumberish>,
        PromiseOrValue<BigNumberish>
    ]): string;
    encodeFunctionData(functionFragment: "getMaximumNeededTokenAllowance(address,address,address)", values: [
        PromiseOrValue<string>,
        PromiseOrValue<string>,
        PromiseOrValue<string>
    ]): string;
    encodeFunctionData(functionFragment: "getMaximumNeededTokenAllowance((uint32,uint32,int96,uint256,uint96,uint32))", values: [IVestingSchedulerV2.VestingScheduleStruct]): string;
    encodeFunctionData(functionFragment: "getVestingSchedule", values: [
        PromiseOrValue<string>,
        PromiseOrValue<string>,
        PromiseOrValue<string>
    ]): string;
    encodeFunctionData(functionFragment: "updateVestingSchedule", values: [
        PromiseOrValue<string>,
        PromiseOrValue<string>,
        PromiseOrValue<BigNumberish>,
        PromiseOrValue<BytesLike>
    ]): string;
    encodeFunctionData(functionFragment: "vestingSchedules", values: [PromiseOrValue<BytesLike>]): string;
    decodeFunctionResult(functionFragment: "END_DATE_VALID_BEFORE", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "MIN_VESTING_DURATION", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "START_DATE_VALID_AFTER", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "VERSION", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "_getVestingScheduleAggregate", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "afterAgreementCreated", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "afterAgreementTerminated", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "afterAgreementUpdated", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "beforeAgreementCreated", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "beforeAgreementTerminated", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "beforeAgreementUpdated", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "cfaV1", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "createAndExecuteVestingScheduleFromAmountAndDuration(address,address,uint256,uint32,bytes)", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "createAndExecuteVestingScheduleFromAmountAndDuration(address,address,uint256,uint32)", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "createClaimableVestingSchedule(address,address,uint32,uint32,uint32,int96,uint256,uint32,bytes)", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "createClaimableVestingSchedule(address,address,uint32,uint32,uint32,int96,uint256,uint32)", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "createClaimableVestingScheduleFromAmountAndDuration(address,address,uint256,uint32,uint32,uint32)", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "createClaimableVestingScheduleFromAmountAndDuration(address,address,uint256,uint32,uint32,uint32,uint32)", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "createClaimableVestingScheduleFromAmountAndDuration(address,address,uint256,uint32,uint32)", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "createClaimableVestingScheduleFromAmountAndDuration(address,address,uint256,uint32,uint32,uint32,uint32,bytes)", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "createVestingSchedule(address,address,uint32,uint32,int96,uint256,uint32,bytes)", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "createVestingSchedule(address,address,uint32,uint32,int96,uint256,uint32)", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "createVestingScheduleFromAmountAndDuration(address,address,uint256,uint32)", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "createVestingScheduleFromAmountAndDuration(address,address,uint256,uint32,uint32,uint32,bytes)", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "createVestingScheduleFromAmountAndDuration(address,address,uint256,uint32,uint32,uint32)", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "createVestingScheduleFromAmountAndDuration(address,address,uint256,uint32,uint32)", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "deleteVestingSchedule", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "executeCliffAndFlow", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "executeEndVesting", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "getCreateVestingScheduleParamsFromAmountAndDuration", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "getMaximumNeededTokenAllowance(address,address,address)", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "getMaximumNeededTokenAllowance((uint32,uint32,int96,uint256,uint96,uint32))", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "getVestingSchedule", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "updateVestingSchedule", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "vestingSchedules", data: BytesLike): Result;
    events: {
        "VestingClaimed(address,address,address,address)": EventFragment;
        "VestingCliffAndFlowExecuted(address,address,address,uint32,int96,uint256,uint256)": EventFragment;
        "VestingEndExecuted(address,address,address,uint32,uint256,bool)": EventFragment;
        "VestingEndFailed(address,address,address,uint32)": EventFragment;
        "VestingScheduleCreated(address,address,address,uint32,uint32,int96,uint32,uint256,uint32,uint96)": EventFragment;
        "VestingScheduleDeleted(address,address,address)": EventFragment;
        "VestingScheduleUpdated(address,address,address,uint32,uint32,uint96)": EventFragment;
    };
    getEvent(nameOrSignatureOrTopic: "VestingClaimed"): EventFragment;
    getEvent(nameOrSignatureOrTopic: "VestingCliffAndFlowExecuted"): EventFragment;
    getEvent(nameOrSignatureOrTopic: "VestingEndExecuted"): EventFragment;
    getEvent(nameOrSignatureOrTopic: "VestingEndFailed"): EventFragment;
    getEvent(nameOrSignatureOrTopic: "VestingScheduleCreated"): EventFragment;
    getEvent(nameOrSignatureOrTopic: "VestingScheduleDeleted"): EventFragment;
    getEvent(nameOrSignatureOrTopic: "VestingScheduleUpdated"): EventFragment;
}
export interface VestingClaimedEventObject {
    superToken: string;
    sender: string;
    receiver: string;
    claimer: string;
}
export type VestingClaimedEvent = TypedEvent<[
    string,
    string,
    string,
    string
], VestingClaimedEventObject>;
export type VestingClaimedEventFilter = TypedEventFilter<VestingClaimedEvent>;
export interface VestingCliffAndFlowExecutedEventObject {
    superToken: string;
    sender: string;
    receiver: string;
    cliffAndFlowDate: number;
    flowRate: BigNumber;
    cliffAmount: BigNumber;
    flowDelayCompensation: BigNumber;
}
export type VestingCliffAndFlowExecutedEvent = TypedEvent<[
    string,
    string,
    string,
    number,
    BigNumber,
    BigNumber,
    BigNumber
], VestingCliffAndFlowExecutedEventObject>;
export type VestingCliffAndFlowExecutedEventFilter = TypedEventFilter<VestingCliffAndFlowExecutedEvent>;
export interface VestingEndExecutedEventObject {
    superToken: string;
    sender: string;
    receiver: string;
    endDate: number;
    earlyEndCompensation: BigNumber;
    didCompensationFail: boolean;
}
export type VestingEndExecutedEvent = TypedEvent<[
    string,
    string,
    string,
    number,
    BigNumber,
    boolean
], VestingEndExecutedEventObject>;
export type VestingEndExecutedEventFilter = TypedEventFilter<VestingEndExecutedEvent>;
export interface VestingEndFailedEventObject {
    superToken: string;
    sender: string;
    receiver: string;
    endDate: number;
}
export type VestingEndFailedEvent = TypedEvent<[
    string,
    string,
    string,
    number
], VestingEndFailedEventObject>;
export type VestingEndFailedEventFilter = TypedEventFilter<VestingEndFailedEvent>;
export interface VestingScheduleCreatedEventObject {
    superToken: string;
    sender: string;
    receiver: string;
    startDate: number;
    cliffDate: number;
    flowRate: BigNumber;
    endDate: number;
    cliffAmount: BigNumber;
    claimValidityDate: number;
    remainderAmount: BigNumber;
}
export type VestingScheduleCreatedEvent = TypedEvent<[
    string,
    string,
    string,
    number,
    number,
    BigNumber,
    number,
    BigNumber,
    number,
    BigNumber
], VestingScheduleCreatedEventObject>;
export type VestingScheduleCreatedEventFilter = TypedEventFilter<VestingScheduleCreatedEvent>;
export interface VestingScheduleDeletedEventObject {
    superToken: string;
    sender: string;
    receiver: string;
}
export type VestingScheduleDeletedEvent = TypedEvent<[
    string,
    string,
    string
], VestingScheduleDeletedEventObject>;
export type VestingScheduleDeletedEventFilter = TypedEventFilter<VestingScheduleDeletedEvent>;
export interface VestingScheduleUpdatedEventObject {
    superToken: string;
    sender: string;
    receiver: string;
    oldEndDate: number;
    endDate: number;
    remainderAmount: BigNumber;
}
export type VestingScheduleUpdatedEvent = TypedEvent<[
    string,
    string,
    string,
    number,
    number,
    BigNumber
], VestingScheduleUpdatedEventObject>;
export type VestingScheduleUpdatedEventFilter = TypedEventFilter<VestingScheduleUpdatedEvent>;
export interface VestingScheduler extends BaseContract {
    connect(signerOrProvider: Signer | Provider | string): this;
    attach(addressOrName: string): this;
    deployed(): Promise<this>;
    interface: VestingSchedulerInterface;
    queryFilter<TEvent extends TypedEvent>(event: TypedEventFilter<TEvent>, fromBlockOrBlockhash?: string | number | undefined, toBlock?: string | number | undefined): Promise<Array<TEvent>>;
    listeners<TEvent extends TypedEvent>(eventFilter?: TypedEventFilter<TEvent>): Array<TypedListener<TEvent>>;
    listeners(eventName?: string): Array<Listener>;
    removeAllListeners<TEvent extends TypedEvent>(eventFilter: TypedEventFilter<TEvent>): this;
    removeAllListeners(eventName?: string): this;
    off: OnEvent<this>;
    on: OnEvent<this>;
    once: OnEvent<this>;
    removeListener: OnEvent<this>;
    functions: {
        END_DATE_VALID_BEFORE(overrides?: CallOverrides): Promise<[number]>;
        MIN_VESTING_DURATION(overrides?: CallOverrides): Promise<[number]>;
        START_DATE_VALID_AFTER(overrides?: CallOverrides): Promise<[number]>;
        VERSION(overrides?: CallOverrides): Promise<[string]>;
        _getVestingScheduleAggregate(superToken: PromiseOrValue<string>, sender: PromiseOrValue<string>, receiver: PromiseOrValue<string>, overrides?: CallOverrides): Promise<[VestingSchedulerV2.ScheduleAggregateStructOutput]>;
        afterAgreementCreated(arg0: PromiseOrValue<string>, arg1: PromiseOrValue<string>, arg2: PromiseOrValue<BytesLike>, arg3: PromiseOrValue<BytesLike>, arg4: PromiseOrValue<BytesLike>, arg5: PromiseOrValue<BytesLike>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<ContractTransaction>;
        afterAgreementTerminated(arg0: PromiseOrValue<string>, arg1: PromiseOrValue<string>, arg2: PromiseOrValue<BytesLike>, arg3: PromiseOrValue<BytesLike>, arg4: PromiseOrValue<BytesLike>, arg5: PromiseOrValue<BytesLike>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<ContractTransaction>;
        afterAgreementUpdated(arg0: PromiseOrValue<string>, arg1: PromiseOrValue<string>, arg2: PromiseOrValue<BytesLike>, arg3: PromiseOrValue<BytesLike>, arg4: PromiseOrValue<BytesLike>, arg5: PromiseOrValue<BytesLike>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<ContractTransaction>;
        beforeAgreementCreated(arg0: PromiseOrValue<string>, arg1: PromiseOrValue<string>, arg2: PromiseOrValue<BytesLike>, arg3: PromiseOrValue<BytesLike>, arg4: PromiseOrValue<BytesLike>, overrides?: CallOverrides): Promise<[string]>;
        beforeAgreementTerminated(arg0: PromiseOrValue<string>, arg1: PromiseOrValue<string>, arg2: PromiseOrValue<BytesLike>, arg3: PromiseOrValue<BytesLike>, arg4: PromiseOrValue<BytesLike>, overrides?: CallOverrides): Promise<[string]>;
        beforeAgreementUpdated(arg0: PromiseOrValue<string>, arg1: PromiseOrValue<string>, arg2: PromiseOrValue<BytesLike>, arg3: PromiseOrValue<BytesLike>, arg4: PromiseOrValue<BytesLike>, overrides?: CallOverrides): Promise<[string]>;
        cfaV1(overrides?: CallOverrides): Promise<[string, string] & {
            host: string;
            cfa: string;
        }>;
        "createAndExecuteVestingScheduleFromAmountAndDuration(address,address,uint256,uint32,bytes)"(superToken: PromiseOrValue<string>, receiver: PromiseOrValue<string>, totalAmount: PromiseOrValue<BigNumberish>, totalDuration: PromiseOrValue<BigNumberish>, ctx: PromiseOrValue<BytesLike>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<ContractTransaction>;
        "createAndExecuteVestingScheduleFromAmountAndDuration(address,address,uint256,uint32)"(superToken: PromiseOrValue<string>, receiver: PromiseOrValue<string>, totalAmount: PromiseOrValue<BigNumberish>, totalDuration: PromiseOrValue<BigNumberish>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<ContractTransaction>;
        "createClaimableVestingSchedule(address,address,uint32,uint32,uint32,int96,uint256,uint32,bytes)"(superToken: PromiseOrValue<string>, receiver: PromiseOrValue<string>, startDate: PromiseOrValue<BigNumberish>, claimValidityDate: PromiseOrValue<BigNumberish>, cliffDate: PromiseOrValue<BigNumberish>, flowRate: PromiseOrValue<BigNumberish>, cliffAmount: PromiseOrValue<BigNumberish>, endDate: PromiseOrValue<BigNumberish>, ctx: PromiseOrValue<BytesLike>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<ContractTransaction>;
        "createClaimableVestingSchedule(address,address,uint32,uint32,uint32,int96,uint256,uint32)"(superToken: PromiseOrValue<string>, receiver: PromiseOrValue<string>, startDate: PromiseOrValue<BigNumberish>, claimValidityDate: PromiseOrValue<BigNumberish>, cliffDate: PromiseOrValue<BigNumberish>, flowRate: PromiseOrValue<BigNumberish>, cliffAmount: PromiseOrValue<BigNumberish>, endDate: PromiseOrValue<BigNumberish>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<ContractTransaction>;
        "createClaimableVestingScheduleFromAmountAndDuration(address,address,uint256,uint32,uint32,uint32)"(superToken: PromiseOrValue<string>, receiver: PromiseOrValue<string>, totalAmount: PromiseOrValue<BigNumberish>, totalDuration: PromiseOrValue<BigNumberish>, claimPeriod: PromiseOrValue<BigNumberish>, cliffPeriod: PromiseOrValue<BigNumberish>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<ContractTransaction>;
        "createClaimableVestingScheduleFromAmountAndDuration(address,address,uint256,uint32,uint32,uint32,uint32)"(superToken: PromiseOrValue<string>, receiver: PromiseOrValue<string>, totalAmount: PromiseOrValue<BigNumberish>, totalDuration: PromiseOrValue<BigNumberish>, claimPeriod: PromiseOrValue<BigNumberish>, cliffPeriod: PromiseOrValue<BigNumberish>, startDate: PromiseOrValue<BigNumberish>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<ContractTransaction>;
        "createClaimableVestingScheduleFromAmountAndDuration(address,address,uint256,uint32,uint32)"(superToken: PromiseOrValue<string>, receiver: PromiseOrValue<string>, totalAmount: PromiseOrValue<BigNumberish>, totalDuration: PromiseOrValue<BigNumberish>, claimPeriod: PromiseOrValue<BigNumberish>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<ContractTransaction>;
        "createClaimableVestingScheduleFromAmountAndDuration(address,address,uint256,uint32,uint32,uint32,uint32,bytes)"(superToken: PromiseOrValue<string>, receiver: PromiseOrValue<string>, totalAmount: PromiseOrValue<BigNumberish>, totalDuration: PromiseOrValue<BigNumberish>, claimPeriod: PromiseOrValue<BigNumberish>, cliffPeriod: PromiseOrValue<BigNumberish>, startDate: PromiseOrValue<BigNumberish>, ctx: PromiseOrValue<BytesLike>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<ContractTransaction>;
        "createVestingSchedule(address,address,uint32,uint32,int96,uint256,uint32,bytes)"(superToken: PromiseOrValue<string>, receiver: PromiseOrValue<string>, startDate: PromiseOrValue<BigNumberish>, cliffDate: PromiseOrValue<BigNumberish>, flowRate: PromiseOrValue<BigNumberish>, cliffAmount: PromiseOrValue<BigNumberish>, endDate: PromiseOrValue<BigNumberish>, ctx: PromiseOrValue<BytesLike>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<ContractTransaction>;
        "createVestingSchedule(address,address,uint32,uint32,int96,uint256,uint32)"(superToken: PromiseOrValue<string>, receiver: PromiseOrValue<string>, startDate: PromiseOrValue<BigNumberish>, cliffDate: PromiseOrValue<BigNumberish>, flowRate: PromiseOrValue<BigNumberish>, cliffAmount: PromiseOrValue<BigNumberish>, endDate: PromiseOrValue<BigNumberish>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<ContractTransaction>;
        "createVestingScheduleFromAmountAndDuration(address,address,uint256,uint32)"(superToken: PromiseOrValue<string>, receiver: PromiseOrValue<string>, totalAmount: PromiseOrValue<BigNumberish>, totalDuration: PromiseOrValue<BigNumberish>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<ContractTransaction>;
        "createVestingScheduleFromAmountAndDuration(address,address,uint256,uint32,uint32,uint32,bytes)"(superToken: PromiseOrValue<string>, receiver: PromiseOrValue<string>, totalAmount: PromiseOrValue<BigNumberish>, totalDuration: PromiseOrValue<BigNumberish>, cliffPeriod: PromiseOrValue<BigNumberish>, startDate: PromiseOrValue<BigNumberish>, ctx: PromiseOrValue<BytesLike>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<ContractTransaction>;
        "createVestingScheduleFromAmountAndDuration(address,address,uint256,uint32,uint32,uint32)"(superToken: PromiseOrValue<string>, receiver: PromiseOrValue<string>, totalAmount: PromiseOrValue<BigNumberish>, totalDuration: PromiseOrValue<BigNumberish>, cliffPeriod: PromiseOrValue<BigNumberish>, startDate: PromiseOrValue<BigNumberish>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<ContractTransaction>;
        "createVestingScheduleFromAmountAndDuration(address,address,uint256,uint32,uint32)"(superToken: PromiseOrValue<string>, receiver: PromiseOrValue<string>, totalAmount: PromiseOrValue<BigNumberish>, totalDuration: PromiseOrValue<BigNumberish>, cliffPeriod: PromiseOrValue<BigNumberish>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<ContractTransaction>;
        deleteVestingSchedule(superToken: PromiseOrValue<string>, receiver: PromiseOrValue<string>, ctx: PromiseOrValue<BytesLike>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<ContractTransaction>;
        executeCliffAndFlow(superToken: PromiseOrValue<string>, sender: PromiseOrValue<string>, receiver: PromiseOrValue<string>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<ContractTransaction>;
        executeEndVesting(superToken: PromiseOrValue<string>, sender: PromiseOrValue<string>, receiver: PromiseOrValue<string>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<ContractTransaction>;
        getCreateVestingScheduleParamsFromAmountAndDuration(superToken: PromiseOrValue<string>, receiver: PromiseOrValue<string>, totalAmount: PromiseOrValue<BigNumberish>, totalDuration: PromiseOrValue<BigNumberish>, cliffPeriod: PromiseOrValue<BigNumberish>, startDate: PromiseOrValue<BigNumberish>, claimPeriod: PromiseOrValue<BigNumberish>, overrides?: CallOverrides): Promise<[
            IVestingSchedulerV2.ScheduleCreationParamsStructOutput
        ] & {
            result: IVestingSchedulerV2.ScheduleCreationParamsStructOutput;
        }>;
        "getMaximumNeededTokenAllowance(address,address,address)"(superToken: PromiseOrValue<string>, sender: PromiseOrValue<string>, receiver: PromiseOrValue<string>, overrides?: CallOverrides): Promise<[BigNumber]>;
        "getMaximumNeededTokenAllowance((uint32,uint32,int96,uint256,uint96,uint32))"(schedule: IVestingSchedulerV2.VestingScheduleStruct, overrides?: CallOverrides): Promise<[BigNumber]>;
        getVestingSchedule(superToken: PromiseOrValue<string>, sender: PromiseOrValue<string>, receiver: PromiseOrValue<string>, overrides?: CallOverrides): Promise<[IVestingSchedulerV2.VestingScheduleStructOutput]>;
        updateVestingSchedule(superToken: PromiseOrValue<string>, receiver: PromiseOrValue<string>, endDate: PromiseOrValue<BigNumberish>, ctx: PromiseOrValue<BytesLike>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<ContractTransaction>;
        vestingSchedules(arg0: PromiseOrValue<BytesLike>, overrides?: CallOverrides): Promise<[
            number,
            number,
            BigNumber,
            BigNumber,
            BigNumber,
            number
        ] & {
            cliffAndFlowDate: number;
            endDate: number;
            flowRate: BigNumber;
            cliffAmount: BigNumber;
            remainderAmount: BigNumber;
            claimValidityDate: number;
        }>;
    };
    END_DATE_VALID_BEFORE(overrides?: CallOverrides): Promise<number>;
    MIN_VESTING_DURATION(overrides?: CallOverrides): Promise<number>;
    START_DATE_VALID_AFTER(overrides?: CallOverrides): Promise<number>;
    VERSION(overrides?: CallOverrides): Promise<string>;
    _getVestingScheduleAggregate(superToken: PromiseOrValue<string>, sender: PromiseOrValue<string>, receiver: PromiseOrValue<string>, overrides?: CallOverrides): Promise<VestingSchedulerV2.ScheduleAggregateStructOutput>;
    afterAgreementCreated(arg0: PromiseOrValue<string>, arg1: PromiseOrValue<string>, arg2: PromiseOrValue<BytesLike>, arg3: PromiseOrValue<BytesLike>, arg4: PromiseOrValue<BytesLike>, arg5: PromiseOrValue<BytesLike>, overrides?: Overrides & {
        from?: PromiseOrValue<string>;
    }): Promise<ContractTransaction>;
    afterAgreementTerminated(arg0: PromiseOrValue<string>, arg1: PromiseOrValue<string>, arg2: PromiseOrValue<BytesLike>, arg3: PromiseOrValue<BytesLike>, arg4: PromiseOrValue<BytesLike>, arg5: PromiseOrValue<BytesLike>, overrides?: Overrides & {
        from?: PromiseOrValue<string>;
    }): Promise<ContractTransaction>;
    afterAgreementUpdated(arg0: PromiseOrValue<string>, arg1: PromiseOrValue<string>, arg2: PromiseOrValue<BytesLike>, arg3: PromiseOrValue<BytesLike>, arg4: PromiseOrValue<BytesLike>, arg5: PromiseOrValue<BytesLike>, overrides?: Overrides & {
        from?: PromiseOrValue<string>;
    }): Promise<ContractTransaction>;
    beforeAgreementCreated(arg0: PromiseOrValue<string>, arg1: PromiseOrValue<string>, arg2: PromiseOrValue<BytesLike>, arg3: PromiseOrValue<BytesLike>, arg4: PromiseOrValue<BytesLike>, overrides?: CallOverrides): Promise<string>;
    beforeAgreementTerminated(arg0: PromiseOrValue<string>, arg1: PromiseOrValue<string>, arg2: PromiseOrValue<BytesLike>, arg3: PromiseOrValue<BytesLike>, arg4: PromiseOrValue<BytesLike>, overrides?: CallOverrides): Promise<string>;
    beforeAgreementUpdated(arg0: PromiseOrValue<string>, arg1: PromiseOrValue<string>, arg2: PromiseOrValue<BytesLike>, arg3: PromiseOrValue<BytesLike>, arg4: PromiseOrValue<BytesLike>, overrides?: CallOverrides): Promise<string>;
    cfaV1(overrides?: CallOverrides): Promise<[string, string] & {
        host: string;
        cfa: string;
    }>;
    "createAndExecuteVestingScheduleFromAmountAndDuration(address,address,uint256,uint32,bytes)"(superToken: PromiseOrValue<string>, receiver: PromiseOrValue<string>, totalAmount: PromiseOrValue<BigNumberish>, totalDuration: PromiseOrValue<BigNumberish>, ctx: PromiseOrValue<BytesLike>, overrides?: Overrides & {
        from?: PromiseOrValue<string>;
    }): Promise<ContractTransaction>;
    "createAndExecuteVestingScheduleFromAmountAndDuration(address,address,uint256,uint32)"(superToken: PromiseOrValue<string>, receiver: PromiseOrValue<string>, totalAmount: PromiseOrValue<BigNumberish>, totalDuration: PromiseOrValue<BigNumberish>, overrides?: Overrides & {
        from?: PromiseOrValue<string>;
    }): Promise<ContractTransaction>;
    "createClaimableVestingSchedule(address,address,uint32,uint32,uint32,int96,uint256,uint32,bytes)"(superToken: PromiseOrValue<string>, receiver: PromiseOrValue<string>, startDate: PromiseOrValue<BigNumberish>, claimValidityDate: PromiseOrValue<BigNumberish>, cliffDate: PromiseOrValue<BigNumberish>, flowRate: PromiseOrValue<BigNumberish>, cliffAmount: PromiseOrValue<BigNumberish>, endDate: PromiseOrValue<BigNumberish>, ctx: PromiseOrValue<BytesLike>, overrides?: Overrides & {
        from?: PromiseOrValue<string>;
    }): Promise<ContractTransaction>;
    "createClaimableVestingSchedule(address,address,uint32,uint32,uint32,int96,uint256,uint32)"(superToken: PromiseOrValue<string>, receiver: PromiseOrValue<string>, startDate: PromiseOrValue<BigNumberish>, claimValidityDate: PromiseOrValue<BigNumberish>, cliffDate: PromiseOrValue<BigNumberish>, flowRate: PromiseOrValue<BigNumberish>, cliffAmount: PromiseOrValue<BigNumberish>, endDate: PromiseOrValue<BigNumberish>, overrides?: Overrides & {
        from?: PromiseOrValue<string>;
    }): Promise<ContractTransaction>;
    "createClaimableVestingScheduleFromAmountAndDuration(address,address,uint256,uint32,uint32,uint32)"(superToken: PromiseOrValue<string>, receiver: PromiseOrValue<string>, totalAmount: PromiseOrValue<BigNumberish>, totalDuration: PromiseOrValue<BigNumberish>, claimPeriod: PromiseOrValue<BigNumberish>, cliffPeriod: PromiseOrValue<BigNumberish>, overrides?: Overrides & {
        from?: PromiseOrValue<string>;
    }): Promise<ContractTransaction>;
    "createClaimableVestingScheduleFromAmountAndDuration(address,address,uint256,uint32,uint32,uint32,uint32)"(superToken: PromiseOrValue<string>, receiver: PromiseOrValue<string>, totalAmount: PromiseOrValue<BigNumberish>, totalDuration: PromiseOrValue<BigNumberish>, claimPeriod: PromiseOrValue<BigNumberish>, cliffPeriod: PromiseOrValue<BigNumberish>, startDate: PromiseOrValue<BigNumberish>, overrides?: Overrides & {
        from?: PromiseOrValue<string>;
    }): Promise<ContractTransaction>;
    "createClaimableVestingScheduleFromAmountAndDuration(address,address,uint256,uint32,uint32)"(superToken: PromiseOrValue<string>, receiver: PromiseOrValue<string>, totalAmount: PromiseOrValue<BigNumberish>, totalDuration: PromiseOrValue<BigNumberish>, claimPeriod: PromiseOrValue<BigNumberish>, overrides?: Overrides & {
        from?: PromiseOrValue<string>;
    }): Promise<ContractTransaction>;
    "createClaimableVestingScheduleFromAmountAndDuration(address,address,uint256,uint32,uint32,uint32,uint32,bytes)"(superToken: PromiseOrValue<string>, receiver: PromiseOrValue<string>, totalAmount: PromiseOrValue<BigNumberish>, totalDuration: PromiseOrValue<BigNumberish>, claimPeriod: PromiseOrValue<BigNumberish>, cliffPeriod: PromiseOrValue<BigNumberish>, startDate: PromiseOrValue<BigNumberish>, ctx: PromiseOrValue<BytesLike>, overrides?: Overrides & {
        from?: PromiseOrValue<string>;
    }): Promise<ContractTransaction>;
    "createVestingSchedule(address,address,uint32,uint32,int96,uint256,uint32,bytes)"(superToken: PromiseOrValue<string>, receiver: PromiseOrValue<string>, startDate: PromiseOrValue<BigNumberish>, cliffDate: PromiseOrValue<BigNumberish>, flowRate: PromiseOrValue<BigNumberish>, cliffAmount: PromiseOrValue<BigNumberish>, endDate: PromiseOrValue<BigNumberish>, ctx: PromiseOrValue<BytesLike>, overrides?: Overrides & {
        from?: PromiseOrValue<string>;
    }): Promise<ContractTransaction>;
    "createVestingSchedule(address,address,uint32,uint32,int96,uint256,uint32)"(superToken: PromiseOrValue<string>, receiver: PromiseOrValue<string>, startDate: PromiseOrValue<BigNumberish>, cliffDate: PromiseOrValue<BigNumberish>, flowRate: PromiseOrValue<BigNumberish>, cliffAmount: PromiseOrValue<BigNumberish>, endDate: PromiseOrValue<BigNumberish>, overrides?: Overrides & {
        from?: PromiseOrValue<string>;
    }): Promise<ContractTransaction>;
    "createVestingScheduleFromAmountAndDuration(address,address,uint256,uint32)"(superToken: PromiseOrValue<string>, receiver: PromiseOrValue<string>, totalAmount: PromiseOrValue<BigNumberish>, totalDuration: PromiseOrValue<BigNumberish>, overrides?: Overrides & {
        from?: PromiseOrValue<string>;
    }): Promise<ContractTransaction>;
    "createVestingScheduleFromAmountAndDuration(address,address,uint256,uint32,uint32,uint32,bytes)"(superToken: PromiseOrValue<string>, receiver: PromiseOrValue<string>, totalAmount: PromiseOrValue<BigNumberish>, totalDuration: PromiseOrValue<BigNumberish>, cliffPeriod: PromiseOrValue<BigNumberish>, startDate: PromiseOrValue<BigNumberish>, ctx: PromiseOrValue<BytesLike>, overrides?: Overrides & {
        from?: PromiseOrValue<string>;
    }): Promise<ContractTransaction>;
    "createVestingScheduleFromAmountAndDuration(address,address,uint256,uint32,uint32,uint32)"(superToken: PromiseOrValue<string>, receiver: PromiseOrValue<string>, totalAmount: PromiseOrValue<BigNumberish>, totalDuration: PromiseOrValue<BigNumberish>, cliffPeriod: PromiseOrValue<BigNumberish>, startDate: PromiseOrValue<BigNumberish>, overrides?: Overrides & {
        from?: PromiseOrValue<string>;
    }): Promise<ContractTransaction>;
    "createVestingScheduleFromAmountAndDuration(address,address,uint256,uint32,uint32)"(superToken: PromiseOrValue<string>, receiver: PromiseOrValue<string>, totalAmount: PromiseOrValue<BigNumberish>, totalDuration: PromiseOrValue<BigNumberish>, cliffPeriod: PromiseOrValue<BigNumberish>, overrides?: Overrides & {
        from?: PromiseOrValue<string>;
    }): Promise<ContractTransaction>;
    deleteVestingSchedule(superToken: PromiseOrValue<string>, receiver: PromiseOrValue<string>, ctx: PromiseOrValue<BytesLike>, overrides?: Overrides & {
        from?: PromiseOrValue<string>;
    }): Promise<ContractTransaction>;
    executeCliffAndFlow(superToken: PromiseOrValue<string>, sender: PromiseOrValue<string>, receiver: PromiseOrValue<string>, overrides?: Overrides & {
        from?: PromiseOrValue<string>;
    }): Promise<ContractTransaction>;
    executeEndVesting(superToken: PromiseOrValue<string>, sender: PromiseOrValue<string>, receiver: PromiseOrValue<string>, overrides?: Overrides & {
        from?: PromiseOrValue<string>;
    }): Promise<ContractTransaction>;
    getCreateVestingScheduleParamsFromAmountAndDuration(superToken: PromiseOrValue<string>, receiver: PromiseOrValue<string>, totalAmount: PromiseOrValue<BigNumberish>, totalDuration: PromiseOrValue<BigNumberish>, cliffPeriod: PromiseOrValue<BigNumberish>, startDate: PromiseOrValue<BigNumberish>, claimPeriod: PromiseOrValue<BigNumberish>, overrides?: CallOverrides): Promise<IVestingSchedulerV2.ScheduleCreationParamsStructOutput>;
    "getMaximumNeededTokenAllowance(address,address,address)"(superToken: PromiseOrValue<string>, sender: PromiseOrValue<string>, receiver: PromiseOrValue<string>, overrides?: CallOverrides): Promise<BigNumber>;
    "getMaximumNeededTokenAllowance((uint32,uint32,int96,uint256,uint96,uint32))"(schedule: IVestingSchedulerV2.VestingScheduleStruct, overrides?: CallOverrides): Promise<BigNumber>;
    getVestingSchedule(superToken: PromiseOrValue<string>, sender: PromiseOrValue<string>, receiver: PromiseOrValue<string>, overrides?: CallOverrides): Promise<IVestingSchedulerV2.VestingScheduleStructOutput>;
    updateVestingSchedule(superToken: PromiseOrValue<string>, receiver: PromiseOrValue<string>, endDate: PromiseOrValue<BigNumberish>, ctx: PromiseOrValue<BytesLike>, overrides?: Overrides & {
        from?: PromiseOrValue<string>;
    }): Promise<ContractTransaction>;
    vestingSchedules(arg0: PromiseOrValue<BytesLike>, overrides?: CallOverrides): Promise<[
        number,
        number,
        BigNumber,
        BigNumber,
        BigNumber,
        number
    ] & {
        cliffAndFlowDate: number;
        endDate: number;
        flowRate: BigNumber;
        cliffAmount: BigNumber;
        remainderAmount: BigNumber;
        claimValidityDate: number;
    }>;
    callStatic: {
        END_DATE_VALID_BEFORE(overrides?: CallOverrides): Promise<number>;
        MIN_VESTING_DURATION(overrides?: CallOverrides): Promise<number>;
        START_DATE_VALID_AFTER(overrides?: CallOverrides): Promise<number>;
        VERSION(overrides?: CallOverrides): Promise<string>;
        _getVestingScheduleAggregate(superToken: PromiseOrValue<string>, sender: PromiseOrValue<string>, receiver: PromiseOrValue<string>, overrides?: CallOverrides): Promise<VestingSchedulerV2.ScheduleAggregateStructOutput>;
        afterAgreementCreated(arg0: PromiseOrValue<string>, arg1: PromiseOrValue<string>, arg2: PromiseOrValue<BytesLike>, arg3: PromiseOrValue<BytesLike>, arg4: PromiseOrValue<BytesLike>, arg5: PromiseOrValue<BytesLike>, overrides?: CallOverrides): Promise<string>;
        afterAgreementTerminated(arg0: PromiseOrValue<string>, arg1: PromiseOrValue<string>, arg2: PromiseOrValue<BytesLike>, arg3: PromiseOrValue<BytesLike>, arg4: PromiseOrValue<BytesLike>, arg5: PromiseOrValue<BytesLike>, overrides?: CallOverrides): Promise<string>;
        afterAgreementUpdated(arg0: PromiseOrValue<string>, arg1: PromiseOrValue<string>, arg2: PromiseOrValue<BytesLike>, arg3: PromiseOrValue<BytesLike>, arg4: PromiseOrValue<BytesLike>, arg5: PromiseOrValue<BytesLike>, overrides?: CallOverrides): Promise<string>;
        beforeAgreementCreated(arg0: PromiseOrValue<string>, arg1: PromiseOrValue<string>, arg2: PromiseOrValue<BytesLike>, arg3: PromiseOrValue<BytesLike>, arg4: PromiseOrValue<BytesLike>, overrides?: CallOverrides): Promise<string>;
        beforeAgreementTerminated(arg0: PromiseOrValue<string>, arg1: PromiseOrValue<string>, arg2: PromiseOrValue<BytesLike>, arg3: PromiseOrValue<BytesLike>, arg4: PromiseOrValue<BytesLike>, overrides?: CallOverrides): Promise<string>;
        beforeAgreementUpdated(arg0: PromiseOrValue<string>, arg1: PromiseOrValue<string>, arg2: PromiseOrValue<BytesLike>, arg3: PromiseOrValue<BytesLike>, arg4: PromiseOrValue<BytesLike>, overrides?: CallOverrides): Promise<string>;
        cfaV1(overrides?: CallOverrides): Promise<[string, string] & {
            host: string;
            cfa: string;
        }>;
        "createAndExecuteVestingScheduleFromAmountAndDuration(address,address,uint256,uint32,bytes)"(superToken: PromiseOrValue<string>, receiver: PromiseOrValue<string>, totalAmount: PromiseOrValue<BigNumberish>, totalDuration: PromiseOrValue<BigNumberish>, ctx: PromiseOrValue<BytesLike>, overrides?: CallOverrides): Promise<string>;
        "createAndExecuteVestingScheduleFromAmountAndDuration(address,address,uint256,uint32)"(superToken: PromiseOrValue<string>, receiver: PromiseOrValue<string>, totalAmount: PromiseOrValue<BigNumberish>, totalDuration: PromiseOrValue<BigNumberish>, overrides?: CallOverrides): Promise<void>;
        "createClaimableVestingSchedule(address,address,uint32,uint32,uint32,int96,uint256,uint32,bytes)"(superToken: PromiseOrValue<string>, receiver: PromiseOrValue<string>, startDate: PromiseOrValue<BigNumberish>, claimValidityDate: PromiseOrValue<BigNumberish>, cliffDate: PromiseOrValue<BigNumberish>, flowRate: PromiseOrValue<BigNumberish>, cliffAmount: PromiseOrValue<BigNumberish>, endDate: PromiseOrValue<BigNumberish>, ctx: PromiseOrValue<BytesLike>, overrides?: CallOverrides): Promise<string>;
        "createClaimableVestingSchedule(address,address,uint32,uint32,uint32,int96,uint256,uint32)"(superToken: PromiseOrValue<string>, receiver: PromiseOrValue<string>, startDate: PromiseOrValue<BigNumberish>, claimValidityDate: PromiseOrValue<BigNumberish>, cliffDate: PromiseOrValue<BigNumberish>, flowRate: PromiseOrValue<BigNumberish>, cliffAmount: PromiseOrValue<BigNumberish>, endDate: PromiseOrValue<BigNumberish>, overrides?: CallOverrides): Promise<void>;
        "createClaimableVestingScheduleFromAmountAndDuration(address,address,uint256,uint32,uint32,uint32)"(superToken: PromiseOrValue<string>, receiver: PromiseOrValue<string>, totalAmount: PromiseOrValue<BigNumberish>, totalDuration: PromiseOrValue<BigNumberish>, claimPeriod: PromiseOrValue<BigNumberish>, cliffPeriod: PromiseOrValue<BigNumberish>, overrides?: CallOverrides): Promise<void>;
        "createClaimableVestingScheduleFromAmountAndDuration(address,address,uint256,uint32,uint32,uint32,uint32)"(superToken: PromiseOrValue<string>, receiver: PromiseOrValue<string>, totalAmount: PromiseOrValue<BigNumberish>, totalDuration: PromiseOrValue<BigNumberish>, claimPeriod: PromiseOrValue<BigNumberish>, cliffPeriod: PromiseOrValue<BigNumberish>, startDate: PromiseOrValue<BigNumberish>, overrides?: CallOverrides): Promise<void>;
        "createClaimableVestingScheduleFromAmountAndDuration(address,address,uint256,uint32,uint32)"(superToken: PromiseOrValue<string>, receiver: PromiseOrValue<string>, totalAmount: PromiseOrValue<BigNumberish>, totalDuration: PromiseOrValue<BigNumberish>, claimPeriod: PromiseOrValue<BigNumberish>, overrides?: CallOverrides): Promise<void>;
        "createClaimableVestingScheduleFromAmountAndDuration(address,address,uint256,uint32,uint32,uint32,uint32,bytes)"(superToken: PromiseOrValue<string>, receiver: PromiseOrValue<string>, totalAmount: PromiseOrValue<BigNumberish>, totalDuration: PromiseOrValue<BigNumberish>, claimPeriod: PromiseOrValue<BigNumberish>, cliffPeriod: PromiseOrValue<BigNumberish>, startDate: PromiseOrValue<BigNumberish>, ctx: PromiseOrValue<BytesLike>, overrides?: CallOverrides): Promise<string>;
        "createVestingSchedule(address,address,uint32,uint32,int96,uint256,uint32,bytes)"(superToken: PromiseOrValue<string>, receiver: PromiseOrValue<string>, startDate: PromiseOrValue<BigNumberish>, cliffDate: PromiseOrValue<BigNumberish>, flowRate: PromiseOrValue<BigNumberish>, cliffAmount: PromiseOrValue<BigNumberish>, endDate: PromiseOrValue<BigNumberish>, ctx: PromiseOrValue<BytesLike>, overrides?: CallOverrides): Promise<string>;
        "createVestingSchedule(address,address,uint32,uint32,int96,uint256,uint32)"(superToken: PromiseOrValue<string>, receiver: PromiseOrValue<string>, startDate: PromiseOrValue<BigNumberish>, cliffDate: PromiseOrValue<BigNumberish>, flowRate: PromiseOrValue<BigNumberish>, cliffAmount: PromiseOrValue<BigNumberish>, endDate: PromiseOrValue<BigNumberish>, overrides?: CallOverrides): Promise<void>;
        "createVestingScheduleFromAmountAndDuration(address,address,uint256,uint32)"(superToken: PromiseOrValue<string>, receiver: PromiseOrValue<string>, totalAmount: PromiseOrValue<BigNumberish>, totalDuration: PromiseOrValue<BigNumberish>, overrides?: CallOverrides): Promise<void>;
        "createVestingScheduleFromAmountAndDuration(address,address,uint256,uint32,uint32,uint32,bytes)"(superToken: PromiseOrValue<string>, receiver: PromiseOrValue<string>, totalAmount: PromiseOrValue<BigNumberish>, totalDuration: PromiseOrValue<BigNumberish>, cliffPeriod: PromiseOrValue<BigNumberish>, startDate: PromiseOrValue<BigNumberish>, ctx: PromiseOrValue<BytesLike>, overrides?: CallOverrides): Promise<string>;
        "createVestingScheduleFromAmountAndDuration(address,address,uint256,uint32,uint32,uint32)"(superToken: PromiseOrValue<string>, receiver: PromiseOrValue<string>, totalAmount: PromiseOrValue<BigNumberish>, totalDuration: PromiseOrValue<BigNumberish>, cliffPeriod: PromiseOrValue<BigNumberish>, startDate: PromiseOrValue<BigNumberish>, overrides?: CallOverrides): Promise<void>;
        "createVestingScheduleFromAmountAndDuration(address,address,uint256,uint32,uint32)"(superToken: PromiseOrValue<string>, receiver: PromiseOrValue<string>, totalAmount: PromiseOrValue<BigNumberish>, totalDuration: PromiseOrValue<BigNumberish>, cliffPeriod: PromiseOrValue<BigNumberish>, overrides?: CallOverrides): Promise<void>;
        deleteVestingSchedule(superToken: PromiseOrValue<string>, receiver: PromiseOrValue<string>, ctx: PromiseOrValue<BytesLike>, overrides?: CallOverrides): Promise<string>;
        executeCliffAndFlow(superToken: PromiseOrValue<string>, sender: PromiseOrValue<string>, receiver: PromiseOrValue<string>, overrides?: CallOverrides): Promise<boolean>;
        executeEndVesting(superToken: PromiseOrValue<string>, sender: PromiseOrValue<string>, receiver: PromiseOrValue<string>, overrides?: CallOverrides): Promise<boolean>;
        getCreateVestingScheduleParamsFromAmountAndDuration(superToken: PromiseOrValue<string>, receiver: PromiseOrValue<string>, totalAmount: PromiseOrValue<BigNumberish>, totalDuration: PromiseOrValue<BigNumberish>, cliffPeriod: PromiseOrValue<BigNumberish>, startDate: PromiseOrValue<BigNumberish>, claimPeriod: PromiseOrValue<BigNumberish>, overrides?: CallOverrides): Promise<IVestingSchedulerV2.ScheduleCreationParamsStructOutput>;
        "getMaximumNeededTokenAllowance(address,address,address)"(superToken: PromiseOrValue<string>, sender: PromiseOrValue<string>, receiver: PromiseOrValue<string>, overrides?: CallOverrides): Promise<BigNumber>;
        "getMaximumNeededTokenAllowance((uint32,uint32,int96,uint256,uint96,uint32))"(schedule: IVestingSchedulerV2.VestingScheduleStruct, overrides?: CallOverrides): Promise<BigNumber>;
        getVestingSchedule(superToken: PromiseOrValue<string>, sender: PromiseOrValue<string>, receiver: PromiseOrValue<string>, overrides?: CallOverrides): Promise<IVestingSchedulerV2.VestingScheduleStructOutput>;
        updateVestingSchedule(superToken: PromiseOrValue<string>, receiver: PromiseOrValue<string>, endDate: PromiseOrValue<BigNumberish>, ctx: PromiseOrValue<BytesLike>, overrides?: CallOverrides): Promise<string>;
        vestingSchedules(arg0: PromiseOrValue<BytesLike>, overrides?: CallOverrides): Promise<[
            number,
            number,
            BigNumber,
            BigNumber,
            BigNumber,
            number
        ] & {
            cliffAndFlowDate: number;
            endDate: number;
            flowRate: BigNumber;
            cliffAmount: BigNumber;
            remainderAmount: BigNumber;
            claimValidityDate: number;
        }>;
    };
    filters: {
        "VestingClaimed(address,address,address,address)"(superToken?: PromiseOrValue<string> | null, sender?: PromiseOrValue<string> | null, receiver?: PromiseOrValue<string> | null, claimer?: null): VestingClaimedEventFilter;
        VestingClaimed(superToken?: PromiseOrValue<string> | null, sender?: PromiseOrValue<string> | null, receiver?: PromiseOrValue<string> | null, claimer?: null): VestingClaimedEventFilter;
        "VestingCliffAndFlowExecuted(address,address,address,uint32,int96,uint256,uint256)"(superToken?: PromiseOrValue<string> | null, sender?: PromiseOrValue<string> | null, receiver?: PromiseOrValue<string> | null, cliffAndFlowDate?: null, flowRate?: null, cliffAmount?: null, flowDelayCompensation?: null): VestingCliffAndFlowExecutedEventFilter;
        VestingCliffAndFlowExecuted(superToken?: PromiseOrValue<string> | null, sender?: PromiseOrValue<string> | null, receiver?: PromiseOrValue<string> | null, cliffAndFlowDate?: null, flowRate?: null, cliffAmount?: null, flowDelayCompensation?: null): VestingCliffAndFlowExecutedEventFilter;
        "VestingEndExecuted(address,address,address,uint32,uint256,bool)"(superToken?: PromiseOrValue<string> | null, sender?: PromiseOrValue<string> | null, receiver?: PromiseOrValue<string> | null, endDate?: null, earlyEndCompensation?: null, didCompensationFail?: null): VestingEndExecutedEventFilter;
        VestingEndExecuted(superToken?: PromiseOrValue<string> | null, sender?: PromiseOrValue<string> | null, receiver?: PromiseOrValue<string> | null, endDate?: null, earlyEndCompensation?: null, didCompensationFail?: null): VestingEndExecutedEventFilter;
        "VestingEndFailed(address,address,address,uint32)"(superToken?: PromiseOrValue<string> | null, sender?: PromiseOrValue<string> | null, receiver?: PromiseOrValue<string> | null, endDate?: null): VestingEndFailedEventFilter;
        VestingEndFailed(superToken?: PromiseOrValue<string> | null, sender?: PromiseOrValue<string> | null, receiver?: PromiseOrValue<string> | null, endDate?: null): VestingEndFailedEventFilter;
        "VestingScheduleCreated(address,address,address,uint32,uint32,int96,uint32,uint256,uint32,uint96)"(superToken?: PromiseOrValue<string> | null, sender?: PromiseOrValue<string> | null, receiver?: PromiseOrValue<string> | null, startDate?: null, cliffDate?: null, flowRate?: null, endDate?: null, cliffAmount?: null, claimValidityDate?: null, remainderAmount?: null): VestingScheduleCreatedEventFilter;
        VestingScheduleCreated(superToken?: PromiseOrValue<string> | null, sender?: PromiseOrValue<string> | null, receiver?: PromiseOrValue<string> | null, startDate?: null, cliffDate?: null, flowRate?: null, endDate?: null, cliffAmount?: null, claimValidityDate?: null, remainderAmount?: null): VestingScheduleCreatedEventFilter;
        "VestingScheduleDeleted(address,address,address)"(superToken?: PromiseOrValue<string> | null, sender?: PromiseOrValue<string> | null, receiver?: PromiseOrValue<string> | null): VestingScheduleDeletedEventFilter;
        VestingScheduleDeleted(superToken?: PromiseOrValue<string> | null, sender?: PromiseOrValue<string> | null, receiver?: PromiseOrValue<string> | null): VestingScheduleDeletedEventFilter;
        "VestingScheduleUpdated(address,address,address,uint32,uint32,uint96)"(superToken?: PromiseOrValue<string> | null, sender?: PromiseOrValue<string> | null, receiver?: PromiseOrValue<string> | null, oldEndDate?: null, endDate?: null, remainderAmount?: null): VestingScheduleUpdatedEventFilter;
        VestingScheduleUpdated(superToken?: PromiseOrValue<string> | null, sender?: PromiseOrValue<string> | null, receiver?: PromiseOrValue<string> | null, oldEndDate?: null, endDate?: null, remainderAmount?: null): VestingScheduleUpdatedEventFilter;
    };
    estimateGas: {
        END_DATE_VALID_BEFORE(overrides?: CallOverrides): Promise<BigNumber>;
        MIN_VESTING_DURATION(overrides?: CallOverrides): Promise<BigNumber>;
        START_DATE_VALID_AFTER(overrides?: CallOverrides): Promise<BigNumber>;
        VERSION(overrides?: CallOverrides): Promise<BigNumber>;
        _getVestingScheduleAggregate(superToken: PromiseOrValue<string>, sender: PromiseOrValue<string>, receiver: PromiseOrValue<string>, overrides?: CallOverrides): Promise<BigNumber>;
        afterAgreementCreated(arg0: PromiseOrValue<string>, arg1: PromiseOrValue<string>, arg2: PromiseOrValue<BytesLike>, arg3: PromiseOrValue<BytesLike>, arg4: PromiseOrValue<BytesLike>, arg5: PromiseOrValue<BytesLike>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<BigNumber>;
        afterAgreementTerminated(arg0: PromiseOrValue<string>, arg1: PromiseOrValue<string>, arg2: PromiseOrValue<BytesLike>, arg3: PromiseOrValue<BytesLike>, arg4: PromiseOrValue<BytesLike>, arg5: PromiseOrValue<BytesLike>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<BigNumber>;
        afterAgreementUpdated(arg0: PromiseOrValue<string>, arg1: PromiseOrValue<string>, arg2: PromiseOrValue<BytesLike>, arg3: PromiseOrValue<BytesLike>, arg4: PromiseOrValue<BytesLike>, arg5: PromiseOrValue<BytesLike>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<BigNumber>;
        beforeAgreementCreated(arg0: PromiseOrValue<string>, arg1: PromiseOrValue<string>, arg2: PromiseOrValue<BytesLike>, arg3: PromiseOrValue<BytesLike>, arg4: PromiseOrValue<BytesLike>, overrides?: CallOverrides): Promise<BigNumber>;
        beforeAgreementTerminated(arg0: PromiseOrValue<string>, arg1: PromiseOrValue<string>, arg2: PromiseOrValue<BytesLike>, arg3: PromiseOrValue<BytesLike>, arg4: PromiseOrValue<BytesLike>, overrides?: CallOverrides): Promise<BigNumber>;
        beforeAgreementUpdated(arg0: PromiseOrValue<string>, arg1: PromiseOrValue<string>, arg2: PromiseOrValue<BytesLike>, arg3: PromiseOrValue<BytesLike>, arg4: PromiseOrValue<BytesLike>, overrides?: CallOverrides): Promise<BigNumber>;
        cfaV1(overrides?: CallOverrides): Promise<BigNumber>;
        "createAndExecuteVestingScheduleFromAmountAndDuration(address,address,uint256,uint32,bytes)"(superToken: PromiseOrValue<string>, receiver: PromiseOrValue<string>, totalAmount: PromiseOrValue<BigNumberish>, totalDuration: PromiseOrValue<BigNumberish>, ctx: PromiseOrValue<BytesLike>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<BigNumber>;
        "createAndExecuteVestingScheduleFromAmountAndDuration(address,address,uint256,uint32)"(superToken: PromiseOrValue<string>, receiver: PromiseOrValue<string>, totalAmount: PromiseOrValue<BigNumberish>, totalDuration: PromiseOrValue<BigNumberish>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<BigNumber>;
        "createClaimableVestingSchedule(address,address,uint32,uint32,uint32,int96,uint256,uint32,bytes)"(superToken: PromiseOrValue<string>, receiver: PromiseOrValue<string>, startDate: PromiseOrValue<BigNumberish>, claimValidityDate: PromiseOrValue<BigNumberish>, cliffDate: PromiseOrValue<BigNumberish>, flowRate: PromiseOrValue<BigNumberish>, cliffAmount: PromiseOrValue<BigNumberish>, endDate: PromiseOrValue<BigNumberish>, ctx: PromiseOrValue<BytesLike>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<BigNumber>;
        "createClaimableVestingSchedule(address,address,uint32,uint32,uint32,int96,uint256,uint32)"(superToken: PromiseOrValue<string>, receiver: PromiseOrValue<string>, startDate: PromiseOrValue<BigNumberish>, claimValidityDate: PromiseOrValue<BigNumberish>, cliffDate: PromiseOrValue<BigNumberish>, flowRate: PromiseOrValue<BigNumberish>, cliffAmount: PromiseOrValue<BigNumberish>, endDate: PromiseOrValue<BigNumberish>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<BigNumber>;
        "createClaimableVestingScheduleFromAmountAndDuration(address,address,uint256,uint32,uint32,uint32)"(superToken: PromiseOrValue<string>, receiver: PromiseOrValue<string>, totalAmount: PromiseOrValue<BigNumberish>, totalDuration: PromiseOrValue<BigNumberish>, claimPeriod: PromiseOrValue<BigNumberish>, cliffPeriod: PromiseOrValue<BigNumberish>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<BigNumber>;
        "createClaimableVestingScheduleFromAmountAndDuration(address,address,uint256,uint32,uint32,uint32,uint32)"(superToken: PromiseOrValue<string>, receiver: PromiseOrValue<string>, totalAmount: PromiseOrValue<BigNumberish>, totalDuration: PromiseOrValue<BigNumberish>, claimPeriod: PromiseOrValue<BigNumberish>, cliffPeriod: PromiseOrValue<BigNumberish>, startDate: PromiseOrValue<BigNumberish>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<BigNumber>;
        "createClaimableVestingScheduleFromAmountAndDuration(address,address,uint256,uint32,uint32)"(superToken: PromiseOrValue<string>, receiver: PromiseOrValue<string>, totalAmount: PromiseOrValue<BigNumberish>, totalDuration: PromiseOrValue<BigNumberish>, claimPeriod: PromiseOrValue<BigNumberish>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<BigNumber>;
        "createClaimableVestingScheduleFromAmountAndDuration(address,address,uint256,uint32,uint32,uint32,uint32,bytes)"(superToken: PromiseOrValue<string>, receiver: PromiseOrValue<string>, totalAmount: PromiseOrValue<BigNumberish>, totalDuration: PromiseOrValue<BigNumberish>, claimPeriod: PromiseOrValue<BigNumberish>, cliffPeriod: PromiseOrValue<BigNumberish>, startDate: PromiseOrValue<BigNumberish>, ctx: PromiseOrValue<BytesLike>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<BigNumber>;
        "createVestingSchedule(address,address,uint32,uint32,int96,uint256,uint32,bytes)"(superToken: PromiseOrValue<string>, receiver: PromiseOrValue<string>, startDate: PromiseOrValue<BigNumberish>, cliffDate: PromiseOrValue<BigNumberish>, flowRate: PromiseOrValue<BigNumberish>, cliffAmount: PromiseOrValue<BigNumberish>, endDate: PromiseOrValue<BigNumberish>, ctx: PromiseOrValue<BytesLike>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<BigNumber>;
        "createVestingSchedule(address,address,uint32,uint32,int96,uint256,uint32)"(superToken: PromiseOrValue<string>, receiver: PromiseOrValue<string>, startDate: PromiseOrValue<BigNumberish>, cliffDate: PromiseOrValue<BigNumberish>, flowRate: PromiseOrValue<BigNumberish>, cliffAmount: PromiseOrValue<BigNumberish>, endDate: PromiseOrValue<BigNumberish>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<BigNumber>;
        "createVestingScheduleFromAmountAndDuration(address,address,uint256,uint32)"(superToken: PromiseOrValue<string>, receiver: PromiseOrValue<string>, totalAmount: PromiseOrValue<BigNumberish>, totalDuration: PromiseOrValue<BigNumberish>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<BigNumber>;
        "createVestingScheduleFromAmountAndDuration(address,address,uint256,uint32,uint32,uint32,bytes)"(superToken: PromiseOrValue<string>, receiver: PromiseOrValue<string>, totalAmount: PromiseOrValue<BigNumberish>, totalDuration: PromiseOrValue<BigNumberish>, cliffPeriod: PromiseOrValue<BigNumberish>, startDate: PromiseOrValue<BigNumberish>, ctx: PromiseOrValue<BytesLike>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<BigNumber>;
        "createVestingScheduleFromAmountAndDuration(address,address,uint256,uint32,uint32,uint32)"(superToken: PromiseOrValue<string>, receiver: PromiseOrValue<string>, totalAmount: PromiseOrValue<BigNumberish>, totalDuration: PromiseOrValue<BigNumberish>, cliffPeriod: PromiseOrValue<BigNumberish>, startDate: PromiseOrValue<BigNumberish>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<BigNumber>;
        "createVestingScheduleFromAmountAndDuration(address,address,uint256,uint32,uint32)"(superToken: PromiseOrValue<string>, receiver: PromiseOrValue<string>, totalAmount: PromiseOrValue<BigNumberish>, totalDuration: PromiseOrValue<BigNumberish>, cliffPeriod: PromiseOrValue<BigNumberish>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<BigNumber>;
        deleteVestingSchedule(superToken: PromiseOrValue<string>, receiver: PromiseOrValue<string>, ctx: PromiseOrValue<BytesLike>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<BigNumber>;
        executeCliffAndFlow(superToken: PromiseOrValue<string>, sender: PromiseOrValue<string>, receiver: PromiseOrValue<string>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<BigNumber>;
        executeEndVesting(superToken: PromiseOrValue<string>, sender: PromiseOrValue<string>, receiver: PromiseOrValue<string>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<BigNumber>;
        getCreateVestingScheduleParamsFromAmountAndDuration(superToken: PromiseOrValue<string>, receiver: PromiseOrValue<string>, totalAmount: PromiseOrValue<BigNumberish>, totalDuration: PromiseOrValue<BigNumberish>, cliffPeriod: PromiseOrValue<BigNumberish>, startDate: PromiseOrValue<BigNumberish>, claimPeriod: PromiseOrValue<BigNumberish>, overrides?: CallOverrides): Promise<BigNumber>;
        "getMaximumNeededTokenAllowance(address,address,address)"(superToken: PromiseOrValue<string>, sender: PromiseOrValue<string>, receiver: PromiseOrValue<string>, overrides?: CallOverrides): Promise<BigNumber>;
        "getMaximumNeededTokenAllowance((uint32,uint32,int96,uint256,uint96,uint32))"(schedule: IVestingSchedulerV2.VestingScheduleStruct, overrides?: CallOverrides): Promise<BigNumber>;
        getVestingSchedule(superToken: PromiseOrValue<string>, sender: PromiseOrValue<string>, receiver: PromiseOrValue<string>, overrides?: CallOverrides): Promise<BigNumber>;
        updateVestingSchedule(superToken: PromiseOrValue<string>, receiver: PromiseOrValue<string>, endDate: PromiseOrValue<BigNumberish>, ctx: PromiseOrValue<BytesLike>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<BigNumber>;
        vestingSchedules(arg0: PromiseOrValue<BytesLike>, overrides?: CallOverrides): Promise<BigNumber>;
    };
    populateTransaction: {
        END_DATE_VALID_BEFORE(overrides?: CallOverrides): Promise<PopulatedTransaction>;
        MIN_VESTING_DURATION(overrides?: CallOverrides): Promise<PopulatedTransaction>;
        START_DATE_VALID_AFTER(overrides?: CallOverrides): Promise<PopulatedTransaction>;
        VERSION(overrides?: CallOverrides): Promise<PopulatedTransaction>;
        _getVestingScheduleAggregate(superToken: PromiseOrValue<string>, sender: PromiseOrValue<string>, receiver: PromiseOrValue<string>, overrides?: CallOverrides): Promise<PopulatedTransaction>;
        afterAgreementCreated(arg0: PromiseOrValue<string>, arg1: PromiseOrValue<string>, arg2: PromiseOrValue<BytesLike>, arg3: PromiseOrValue<BytesLike>, arg4: PromiseOrValue<BytesLike>, arg5: PromiseOrValue<BytesLike>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<PopulatedTransaction>;
        afterAgreementTerminated(arg0: PromiseOrValue<string>, arg1: PromiseOrValue<string>, arg2: PromiseOrValue<BytesLike>, arg3: PromiseOrValue<BytesLike>, arg4: PromiseOrValue<BytesLike>, arg5: PromiseOrValue<BytesLike>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<PopulatedTransaction>;
        afterAgreementUpdated(arg0: PromiseOrValue<string>, arg1: PromiseOrValue<string>, arg2: PromiseOrValue<BytesLike>, arg3: PromiseOrValue<BytesLike>, arg4: PromiseOrValue<BytesLike>, arg5: PromiseOrValue<BytesLike>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<PopulatedTransaction>;
        beforeAgreementCreated(arg0: PromiseOrValue<string>, arg1: PromiseOrValue<string>, arg2: PromiseOrValue<BytesLike>, arg3: PromiseOrValue<BytesLike>, arg4: PromiseOrValue<BytesLike>, overrides?: CallOverrides): Promise<PopulatedTransaction>;
        beforeAgreementTerminated(arg0: PromiseOrValue<string>, arg1: PromiseOrValue<string>, arg2: PromiseOrValue<BytesLike>, arg3: PromiseOrValue<BytesLike>, arg4: PromiseOrValue<BytesLike>, overrides?: CallOverrides): Promise<PopulatedTransaction>;
        beforeAgreementUpdated(arg0: PromiseOrValue<string>, arg1: PromiseOrValue<string>, arg2: PromiseOrValue<BytesLike>, arg3: PromiseOrValue<BytesLike>, arg4: PromiseOrValue<BytesLike>, overrides?: CallOverrides): Promise<PopulatedTransaction>;
        cfaV1(overrides?: CallOverrides): Promise<PopulatedTransaction>;
        "createAndExecuteVestingScheduleFromAmountAndDuration(address,address,uint256,uint32,bytes)"(superToken: PromiseOrValue<string>, receiver: PromiseOrValue<string>, totalAmount: PromiseOrValue<BigNumberish>, totalDuration: PromiseOrValue<BigNumberish>, ctx: PromiseOrValue<BytesLike>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<PopulatedTransaction>;
        "createAndExecuteVestingScheduleFromAmountAndDuration(address,address,uint256,uint32)"(superToken: PromiseOrValue<string>, receiver: PromiseOrValue<string>, totalAmount: PromiseOrValue<BigNumberish>, totalDuration: PromiseOrValue<BigNumberish>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<PopulatedTransaction>;
        "createClaimableVestingSchedule(address,address,uint32,uint32,uint32,int96,uint256,uint32,bytes)"(superToken: PromiseOrValue<string>, receiver: PromiseOrValue<string>, startDate: PromiseOrValue<BigNumberish>, claimValidityDate: PromiseOrValue<BigNumberish>, cliffDate: PromiseOrValue<BigNumberish>, flowRate: PromiseOrValue<BigNumberish>, cliffAmount: PromiseOrValue<BigNumberish>, endDate: PromiseOrValue<BigNumberish>, ctx: PromiseOrValue<BytesLike>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<PopulatedTransaction>;
        "createClaimableVestingSchedule(address,address,uint32,uint32,uint32,int96,uint256,uint32)"(superToken: PromiseOrValue<string>, receiver: PromiseOrValue<string>, startDate: PromiseOrValue<BigNumberish>, claimValidityDate: PromiseOrValue<BigNumberish>, cliffDate: PromiseOrValue<BigNumberish>, flowRate: PromiseOrValue<BigNumberish>, cliffAmount: PromiseOrValue<BigNumberish>, endDate: PromiseOrValue<BigNumberish>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<PopulatedTransaction>;
        "createClaimableVestingScheduleFromAmountAndDuration(address,address,uint256,uint32,uint32,uint32)"(superToken: PromiseOrValue<string>, receiver: PromiseOrValue<string>, totalAmount: PromiseOrValue<BigNumberish>, totalDuration: PromiseOrValue<BigNumberish>, claimPeriod: PromiseOrValue<BigNumberish>, cliffPeriod: PromiseOrValue<BigNumberish>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<PopulatedTransaction>;
        "createClaimableVestingScheduleFromAmountAndDuration(address,address,uint256,uint32,uint32,uint32,uint32)"(superToken: PromiseOrValue<string>, receiver: PromiseOrValue<string>, totalAmount: PromiseOrValue<BigNumberish>, totalDuration: PromiseOrValue<BigNumberish>, claimPeriod: PromiseOrValue<BigNumberish>, cliffPeriod: PromiseOrValue<BigNumberish>, startDate: PromiseOrValue<BigNumberish>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<PopulatedTransaction>;
        "createClaimableVestingScheduleFromAmountAndDuration(address,address,uint256,uint32,uint32)"(superToken: PromiseOrValue<string>, receiver: PromiseOrValue<string>, totalAmount: PromiseOrValue<BigNumberish>, totalDuration: PromiseOrValue<BigNumberish>, claimPeriod: PromiseOrValue<BigNumberish>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<PopulatedTransaction>;
        "createClaimableVestingScheduleFromAmountAndDuration(address,address,uint256,uint32,uint32,uint32,uint32,bytes)"(superToken: PromiseOrValue<string>, receiver: PromiseOrValue<string>, totalAmount: PromiseOrValue<BigNumberish>, totalDuration: PromiseOrValue<BigNumberish>, claimPeriod: PromiseOrValue<BigNumberish>, cliffPeriod: PromiseOrValue<BigNumberish>, startDate: PromiseOrValue<BigNumberish>, ctx: PromiseOrValue<BytesLike>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<PopulatedTransaction>;
        "createVestingSchedule(address,address,uint32,uint32,int96,uint256,uint32,bytes)"(superToken: PromiseOrValue<string>, receiver: PromiseOrValue<string>, startDate: PromiseOrValue<BigNumberish>, cliffDate: PromiseOrValue<BigNumberish>, flowRate: PromiseOrValue<BigNumberish>, cliffAmount: PromiseOrValue<BigNumberish>, endDate: PromiseOrValue<BigNumberish>, ctx: PromiseOrValue<BytesLike>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<PopulatedTransaction>;
        "createVestingSchedule(address,address,uint32,uint32,int96,uint256,uint32)"(superToken: PromiseOrValue<string>, receiver: PromiseOrValue<string>, startDate: PromiseOrValue<BigNumberish>, cliffDate: PromiseOrValue<BigNumberish>, flowRate: PromiseOrValue<BigNumberish>, cliffAmount: PromiseOrValue<BigNumberish>, endDate: PromiseOrValue<BigNumberish>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<PopulatedTransaction>;
        "createVestingScheduleFromAmountAndDuration(address,address,uint256,uint32)"(superToken: PromiseOrValue<string>, receiver: PromiseOrValue<string>, totalAmount: PromiseOrValue<BigNumberish>, totalDuration: PromiseOrValue<BigNumberish>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<PopulatedTransaction>;
        "createVestingScheduleFromAmountAndDuration(address,address,uint256,uint32,uint32,uint32,bytes)"(superToken: PromiseOrValue<string>, receiver: PromiseOrValue<string>, totalAmount: PromiseOrValue<BigNumberish>, totalDuration: PromiseOrValue<BigNumberish>, cliffPeriod: PromiseOrValue<BigNumberish>, startDate: PromiseOrValue<BigNumberish>, ctx: PromiseOrValue<BytesLike>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<PopulatedTransaction>;
        "createVestingScheduleFromAmountAndDuration(address,address,uint256,uint32,uint32,uint32)"(superToken: PromiseOrValue<string>, receiver: PromiseOrValue<string>, totalAmount: PromiseOrValue<BigNumberish>, totalDuration: PromiseOrValue<BigNumberish>, cliffPeriod: PromiseOrValue<BigNumberish>, startDate: PromiseOrValue<BigNumberish>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<PopulatedTransaction>;
        "createVestingScheduleFromAmountAndDuration(address,address,uint256,uint32,uint32)"(superToken: PromiseOrValue<string>, receiver: PromiseOrValue<string>, totalAmount: PromiseOrValue<BigNumberish>, totalDuration: PromiseOrValue<BigNumberish>, cliffPeriod: PromiseOrValue<BigNumberish>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<PopulatedTransaction>;
        deleteVestingSchedule(superToken: PromiseOrValue<string>, receiver: PromiseOrValue<string>, ctx: PromiseOrValue<BytesLike>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<PopulatedTransaction>;
        executeCliffAndFlow(superToken: PromiseOrValue<string>, sender: PromiseOrValue<string>, receiver: PromiseOrValue<string>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<PopulatedTransaction>;
        executeEndVesting(superToken: PromiseOrValue<string>, sender: PromiseOrValue<string>, receiver: PromiseOrValue<string>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<PopulatedTransaction>;
        getCreateVestingScheduleParamsFromAmountAndDuration(superToken: PromiseOrValue<string>, receiver: PromiseOrValue<string>, totalAmount: PromiseOrValue<BigNumberish>, totalDuration: PromiseOrValue<BigNumberish>, cliffPeriod: PromiseOrValue<BigNumberish>, startDate: PromiseOrValue<BigNumberish>, claimPeriod: PromiseOrValue<BigNumberish>, overrides?: CallOverrides): Promise<PopulatedTransaction>;
        "getMaximumNeededTokenAllowance(address,address,address)"(superToken: PromiseOrValue<string>, sender: PromiseOrValue<string>, receiver: PromiseOrValue<string>, overrides?: CallOverrides): Promise<PopulatedTransaction>;
        "getMaximumNeededTokenAllowance((uint32,uint32,int96,uint256,uint96,uint32))"(schedule: IVestingSchedulerV2.VestingScheduleStruct, overrides?: CallOverrides): Promise<PopulatedTransaction>;
        getVestingSchedule(superToken: PromiseOrValue<string>, sender: PromiseOrValue<string>, receiver: PromiseOrValue<string>, overrides?: CallOverrides): Promise<PopulatedTransaction>;
        updateVestingSchedule(superToken: PromiseOrValue<string>, receiver: PromiseOrValue<string>, endDate: PromiseOrValue<BigNumberish>, ctx: PromiseOrValue<BytesLike>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<PopulatedTransaction>;
        vestingSchedules(arg0: PromiseOrValue<BytesLike>, overrides?: CallOverrides): Promise<PopulatedTransaction>;
    };
}
