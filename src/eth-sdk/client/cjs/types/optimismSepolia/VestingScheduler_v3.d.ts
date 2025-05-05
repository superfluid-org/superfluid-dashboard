import type { BaseContract, BigNumber, BigNumberish, BytesLike, CallOverrides, ContractTransaction, Overrides, PopulatedTransaction, Signer, utils } from "ethers";
import type { FunctionFragment, Result, EventFragment } from "@ethersproject/abi";
import type { Listener, Provider } from "@ethersproject/providers";
import type { TypedEventFilter, TypedEvent, TypedListener, OnEvent, PromiseOrValue } from "../common";
export declare namespace IVestingSchedulerV3 {
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
        sender: PromiseOrValue<string>;
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
        sender: string;
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
export interface VestingScheduler_v3Interface extends utils.Interface {
    functions: {
        "END_DATE_VALID_BEFORE()": FunctionFragment;
        "HOST()": FunctionFragment;
        "MIN_VESTING_DURATION()": FunctionFragment;
        "START_DATE_VALID_AFTER()": FunctionFragment;
        "accountings(bytes32)": FunctionFragment;
        "createAndExecuteVestingScheduleFromAmountAndDuration(address,address,uint256,uint32)": FunctionFragment;
        "createVestingSchedule(address,address,uint32,uint32,int96,uint256,uint32,uint32)": FunctionFragment;
        "createVestingSchedule(address,address,uint32,uint32,int96,uint256,uint32)": FunctionFragment;
        "createVestingScheduleFromAmountAndDuration(address,address,uint256,uint32,uint32,uint32,uint32)": FunctionFragment;
        "createVestingScheduleFromAmountAndDuration(address,address,uint256,uint32,uint32,uint32,uint32,uint256)": FunctionFragment;
        "deleteVestingSchedule(address,address)": FunctionFragment;
        "endVestingScheduleNow(address,address)": FunctionFragment;
        "executeCliffAndFlow(address,address,address)": FunctionFragment;
        "executeEndVesting(address,address,address)": FunctionFragment;
        "getMaximumNeededTokenAllowance(address,address,address)": FunctionFragment;
        "getMaximumNeededTokenAllowance((uint32,uint32,int96,uint256,uint96,uint32))": FunctionFragment;
        "getTotalVestedAmount(address,address,address)": FunctionFragment;
        "getVestingSchedule(address,address,address)": FunctionFragment;
        "isTrustedForwarder(address)": FunctionFragment;
        "mapCreateVestingScheduleParams(address,address,address,uint256,uint32,uint32,uint32,uint32,uint256)": FunctionFragment;
        "mapCreateVestingScheduleParams(address,address,address,uint256,uint32,uint32,uint32,uint32)": FunctionFragment;
        "updateVestingSchedule(address,address,uint32)": FunctionFragment;
        "updateVestingScheduleFlowRateFromAmount(address,address,uint256)": FunctionFragment;
        "updateVestingScheduleFlowRateFromAmountAndEndDate(address,address,uint256,uint32)": FunctionFragment;
        "updateVestingScheduleFlowRateFromEndDate(address,address,uint32)": FunctionFragment;
        "versionRecipient()": FunctionFragment;
        "vestingSchedules(bytes32)": FunctionFragment;
    };
    getFunction(nameOrSignatureOrTopic: "END_DATE_VALID_BEFORE" | "HOST" | "MIN_VESTING_DURATION" | "START_DATE_VALID_AFTER" | "accountings" | "createAndExecuteVestingScheduleFromAmountAndDuration" | "createVestingSchedule(address,address,uint32,uint32,int96,uint256,uint32,uint32)" | "createVestingSchedule(address,address,uint32,uint32,int96,uint256,uint32)" | "createVestingScheduleFromAmountAndDuration(address,address,uint256,uint32,uint32,uint32,uint32)" | "createVestingScheduleFromAmountAndDuration(address,address,uint256,uint32,uint32,uint32,uint32,uint256)" | "deleteVestingSchedule" | "endVestingScheduleNow" | "executeCliffAndFlow" | "executeEndVesting" | "getMaximumNeededTokenAllowance(address,address,address)" | "getMaximumNeededTokenAllowance((uint32,uint32,int96,uint256,uint96,uint32))" | "getTotalVestedAmount" | "getVestingSchedule" | "isTrustedForwarder" | "mapCreateVestingScheduleParams(address,address,address,uint256,uint32,uint32,uint32,uint32,uint256)" | "mapCreateVestingScheduleParams(address,address,address,uint256,uint32,uint32,uint32,uint32)" | "updateVestingSchedule" | "updateVestingScheduleFlowRateFromAmount" | "updateVestingScheduleFlowRateFromAmountAndEndDate" | "updateVestingScheduleFlowRateFromEndDate" | "versionRecipient" | "vestingSchedules"): FunctionFragment;
    encodeFunctionData(functionFragment: "END_DATE_VALID_BEFORE", values?: undefined): string;
    encodeFunctionData(functionFragment: "HOST", values?: undefined): string;
    encodeFunctionData(functionFragment: "MIN_VESTING_DURATION", values?: undefined): string;
    encodeFunctionData(functionFragment: "START_DATE_VALID_AFTER", values?: undefined): string;
    encodeFunctionData(functionFragment: "accountings", values: [PromiseOrValue<BytesLike>]): string;
    encodeFunctionData(functionFragment: "createAndExecuteVestingScheduleFromAmountAndDuration", values: [
        PromiseOrValue<string>,
        PromiseOrValue<string>,
        PromiseOrValue<BigNumberish>,
        PromiseOrValue<BigNumberish>
    ]): string;
    encodeFunctionData(functionFragment: "createVestingSchedule(address,address,uint32,uint32,int96,uint256,uint32,uint32)", values: [
        PromiseOrValue<string>,
        PromiseOrValue<string>,
        PromiseOrValue<BigNumberish>,
        PromiseOrValue<BigNumberish>,
        PromiseOrValue<BigNumberish>,
        PromiseOrValue<BigNumberish>,
        PromiseOrValue<BigNumberish>,
        PromiseOrValue<BigNumberish>
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
    encodeFunctionData(functionFragment: "createVestingScheduleFromAmountAndDuration(address,address,uint256,uint32,uint32,uint32,uint32)", values: [
        PromiseOrValue<string>,
        PromiseOrValue<string>,
        PromiseOrValue<BigNumberish>,
        PromiseOrValue<BigNumberish>,
        PromiseOrValue<BigNumberish>,
        PromiseOrValue<BigNumberish>,
        PromiseOrValue<BigNumberish>
    ]): string;
    encodeFunctionData(functionFragment: "createVestingScheduleFromAmountAndDuration(address,address,uint256,uint32,uint32,uint32,uint32,uint256)", values: [
        PromiseOrValue<string>,
        PromiseOrValue<string>,
        PromiseOrValue<BigNumberish>,
        PromiseOrValue<BigNumberish>,
        PromiseOrValue<BigNumberish>,
        PromiseOrValue<BigNumberish>,
        PromiseOrValue<BigNumberish>,
        PromiseOrValue<BigNumberish>
    ]): string;
    encodeFunctionData(functionFragment: "deleteVestingSchedule", values: [PromiseOrValue<string>, PromiseOrValue<string>]): string;
    encodeFunctionData(functionFragment: "endVestingScheduleNow", values: [PromiseOrValue<string>, PromiseOrValue<string>]): string;
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
    encodeFunctionData(functionFragment: "getMaximumNeededTokenAllowance(address,address,address)", values: [
        PromiseOrValue<string>,
        PromiseOrValue<string>,
        PromiseOrValue<string>
    ]): string;
    encodeFunctionData(functionFragment: "getMaximumNeededTokenAllowance((uint32,uint32,int96,uint256,uint96,uint32))", values: [IVestingSchedulerV3.VestingScheduleStruct]): string;
    encodeFunctionData(functionFragment: "getTotalVestedAmount", values: [
        PromiseOrValue<string>,
        PromiseOrValue<string>,
        PromiseOrValue<string>
    ]): string;
    encodeFunctionData(functionFragment: "getVestingSchedule", values: [
        PromiseOrValue<string>,
        PromiseOrValue<string>,
        PromiseOrValue<string>
    ]): string;
    encodeFunctionData(functionFragment: "isTrustedForwarder", values: [PromiseOrValue<string>]): string;
    encodeFunctionData(functionFragment: "mapCreateVestingScheduleParams(address,address,address,uint256,uint32,uint32,uint32,uint32,uint256)", values: [
        PromiseOrValue<string>,
        PromiseOrValue<string>,
        PromiseOrValue<string>,
        PromiseOrValue<BigNumberish>,
        PromiseOrValue<BigNumberish>,
        PromiseOrValue<BigNumberish>,
        PromiseOrValue<BigNumberish>,
        PromiseOrValue<BigNumberish>,
        PromiseOrValue<BigNumberish>
    ]): string;
    encodeFunctionData(functionFragment: "mapCreateVestingScheduleParams(address,address,address,uint256,uint32,uint32,uint32,uint32)", values: [
        PromiseOrValue<string>,
        PromiseOrValue<string>,
        PromiseOrValue<string>,
        PromiseOrValue<BigNumberish>,
        PromiseOrValue<BigNumberish>,
        PromiseOrValue<BigNumberish>,
        PromiseOrValue<BigNumberish>,
        PromiseOrValue<BigNumberish>
    ]): string;
    encodeFunctionData(functionFragment: "updateVestingSchedule", values: [
        PromiseOrValue<string>,
        PromiseOrValue<string>,
        PromiseOrValue<BigNumberish>
    ]): string;
    encodeFunctionData(functionFragment: "updateVestingScheduleFlowRateFromAmount", values: [
        PromiseOrValue<string>,
        PromiseOrValue<string>,
        PromiseOrValue<BigNumberish>
    ]): string;
    encodeFunctionData(functionFragment: "updateVestingScheduleFlowRateFromAmountAndEndDate", values: [
        PromiseOrValue<string>,
        PromiseOrValue<string>,
        PromiseOrValue<BigNumberish>,
        PromiseOrValue<BigNumberish>
    ]): string;
    encodeFunctionData(functionFragment: "updateVestingScheduleFlowRateFromEndDate", values: [
        PromiseOrValue<string>,
        PromiseOrValue<string>,
        PromiseOrValue<BigNumberish>
    ]): string;
    encodeFunctionData(functionFragment: "versionRecipient", values?: undefined): string;
    encodeFunctionData(functionFragment: "vestingSchedules", values: [PromiseOrValue<BytesLike>]): string;
    decodeFunctionResult(functionFragment: "END_DATE_VALID_BEFORE", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "HOST", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "MIN_VESTING_DURATION", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "START_DATE_VALID_AFTER", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "accountings", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "createAndExecuteVestingScheduleFromAmountAndDuration", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "createVestingSchedule(address,address,uint32,uint32,int96,uint256,uint32,uint32)", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "createVestingSchedule(address,address,uint32,uint32,int96,uint256,uint32)", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "createVestingScheduleFromAmountAndDuration(address,address,uint256,uint32,uint32,uint32,uint32)", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "createVestingScheduleFromAmountAndDuration(address,address,uint256,uint32,uint32,uint32,uint32,uint256)", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "deleteVestingSchedule", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "endVestingScheduleNow", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "executeCliffAndFlow", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "executeEndVesting", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "getMaximumNeededTokenAllowance(address,address,address)", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "getMaximumNeededTokenAllowance((uint32,uint32,int96,uint256,uint96,uint32))", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "getTotalVestedAmount", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "getVestingSchedule", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "isTrustedForwarder", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "mapCreateVestingScheduleParams(address,address,address,uint256,uint32,uint32,uint32,uint32,uint256)", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "mapCreateVestingScheduleParams(address,address,address,uint256,uint32,uint32,uint32,uint32)", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "updateVestingSchedule", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "updateVestingScheduleFlowRateFromAmount", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "updateVestingScheduleFlowRateFromAmountAndEndDate", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "updateVestingScheduleFlowRateFromEndDate", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "versionRecipient", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "vestingSchedules", data: BytesLike): Result;
    events: {
        "VestingClaimed(address,address,address,address)": EventFragment;
        "VestingCliffAndFlowExecuted(address,address,address,uint32,int96,uint256,uint256)": EventFragment;
        "VestingEndExecuted(address,address,address,uint32,uint256,bool)": EventFragment;
        "VestingEndFailed(address,address,address,uint32)": EventFragment;
        "VestingScheduleCreated(address,address,address,uint32,uint32,int96,uint32,uint256,uint32,uint96)": EventFragment;
        "VestingScheduleDeleted(address,address,address)": EventFragment;
        "VestingScheduleUpdated(address,address,address,uint32,uint96,int96,uint256,uint256)": EventFragment;
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
    endDate: number;
    remainderAmount: BigNumber;
    flowRate: BigNumber;
    totalAmount: BigNumber;
    settledAmount: BigNumber;
}
export type VestingScheduleUpdatedEvent = TypedEvent<[
    string,
    string,
    string,
    number,
    BigNumber,
    BigNumber,
    BigNumber,
    BigNumber
], VestingScheduleUpdatedEventObject>;
export type VestingScheduleUpdatedEventFilter = TypedEventFilter<VestingScheduleUpdatedEvent>;
export interface VestingScheduler_v3 extends BaseContract {
    connect(signerOrProvider: Signer | Provider | string): this;
    attach(addressOrName: string): this;
    deployed(): Promise<this>;
    interface: VestingScheduler_v3Interface;
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
        HOST(overrides?: CallOverrides): Promise<[string]>;
        MIN_VESTING_DURATION(overrides?: CallOverrides): Promise<[number]>;
        START_DATE_VALID_AFTER(overrides?: CallOverrides): Promise<[number]>;
        accountings(vestingId: PromiseOrValue<BytesLike>, overrides?: CallOverrides): Promise<[
            BigNumber,
            BigNumber
        ] & {
            settledAmount: BigNumber;
            settledDate: BigNumber;
        }>;
        createAndExecuteVestingScheduleFromAmountAndDuration(superToken: PromiseOrValue<string>, receiver: PromiseOrValue<string>, totalAmount: PromiseOrValue<BigNumberish>, totalDuration: PromiseOrValue<BigNumberish>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<ContractTransaction>;
        "createVestingSchedule(address,address,uint32,uint32,int96,uint256,uint32,uint32)"(superToken: PromiseOrValue<string>, receiver: PromiseOrValue<string>, startDate: PromiseOrValue<BigNumberish>, cliffDate: PromiseOrValue<BigNumberish>, flowRate: PromiseOrValue<BigNumberish>, cliffAmount: PromiseOrValue<BigNumberish>, endDate: PromiseOrValue<BigNumberish>, claimValidityDate: PromiseOrValue<BigNumberish>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<ContractTransaction>;
        "createVestingSchedule(address,address,uint32,uint32,int96,uint256,uint32)"(superToken: PromiseOrValue<string>, receiver: PromiseOrValue<string>, startDate: PromiseOrValue<BigNumberish>, cliffDate: PromiseOrValue<BigNumberish>, flowRate: PromiseOrValue<BigNumberish>, cliffAmount: PromiseOrValue<BigNumberish>, endDate: PromiseOrValue<BigNumberish>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<ContractTransaction>;
        "createVestingScheduleFromAmountAndDuration(address,address,uint256,uint32,uint32,uint32,uint32)"(superToken: PromiseOrValue<string>, receiver: PromiseOrValue<string>, totalAmount: PromiseOrValue<BigNumberish>, totalDuration: PromiseOrValue<BigNumberish>, startDate: PromiseOrValue<BigNumberish>, cliffPeriod: PromiseOrValue<BigNumberish>, claimPeriod: PromiseOrValue<BigNumberish>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<ContractTransaction>;
        "createVestingScheduleFromAmountAndDuration(address,address,uint256,uint32,uint32,uint32,uint32,uint256)"(superToken: PromiseOrValue<string>, receiver: PromiseOrValue<string>, totalAmount: PromiseOrValue<BigNumberish>, totalDuration: PromiseOrValue<BigNumberish>, startDate: PromiseOrValue<BigNumberish>, cliffPeriod: PromiseOrValue<BigNumberish>, claimPeriod: PromiseOrValue<BigNumberish>, cliffAmount: PromiseOrValue<BigNumberish>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<ContractTransaction>;
        deleteVestingSchedule(superToken: PromiseOrValue<string>, receiver: PromiseOrValue<string>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<ContractTransaction>;
        endVestingScheduleNow(superToken: PromiseOrValue<string>, receiver: PromiseOrValue<string>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<ContractTransaction>;
        executeCliffAndFlow(superToken: PromiseOrValue<string>, sender: PromiseOrValue<string>, receiver: PromiseOrValue<string>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<ContractTransaction>;
        executeEndVesting(superToken: PromiseOrValue<string>, sender: PromiseOrValue<string>, receiver: PromiseOrValue<string>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<ContractTransaction>;
        "getMaximumNeededTokenAllowance(address,address,address)"(superToken: PromiseOrValue<string>, sender: PromiseOrValue<string>, receiver: PromiseOrValue<string>, overrides?: CallOverrides): Promise<[BigNumber] & {
            maxNeededAllowance: BigNumber;
        }>;
        "getMaximumNeededTokenAllowance((uint32,uint32,int96,uint256,uint96,uint32))"(schedule: IVestingSchedulerV3.VestingScheduleStruct, overrides?: CallOverrides): Promise<[BigNumber] & {
            maxNeededAllowance: BigNumber;
        }>;
        getTotalVestedAmount(superToken: PromiseOrValue<string>, sender: PromiseOrValue<string>, receiver: PromiseOrValue<string>, overrides?: CallOverrides): Promise<[BigNumber] & {
            totalVestedAmount: BigNumber;
        }>;
        getVestingSchedule(superToken: PromiseOrValue<string>, sender: PromiseOrValue<string>, receiver: PromiseOrValue<string>, overrides?: CallOverrides): Promise<[
            IVestingSchedulerV3.VestingScheduleStructOutput
        ] & {
            schedule: IVestingSchedulerV3.VestingScheduleStructOutput;
        }>;
        isTrustedForwarder(forwarder: PromiseOrValue<string>, overrides?: CallOverrides): Promise<[boolean] & {
            isForwarderTrusted: boolean;
        }>;
        "mapCreateVestingScheduleParams(address,address,address,uint256,uint32,uint32,uint32,uint32,uint256)"(superToken: PromiseOrValue<string>, sender: PromiseOrValue<string>, receiver: PromiseOrValue<string>, totalAmount: PromiseOrValue<BigNumberish>, totalDuration: PromiseOrValue<BigNumberish>, startDate: PromiseOrValue<BigNumberish>, cliffPeriod: PromiseOrValue<BigNumberish>, claimPeriod: PromiseOrValue<BigNumberish>, cliffAmount: PromiseOrValue<BigNumberish>, overrides?: CallOverrides): Promise<[
            IVestingSchedulerV3.ScheduleCreationParamsStructOutput
        ] & {
            params: IVestingSchedulerV3.ScheduleCreationParamsStructOutput;
        }>;
        "mapCreateVestingScheduleParams(address,address,address,uint256,uint32,uint32,uint32,uint32)"(superToken: PromiseOrValue<string>, sender: PromiseOrValue<string>, receiver: PromiseOrValue<string>, totalAmount: PromiseOrValue<BigNumberish>, totalDuration: PromiseOrValue<BigNumberish>, startDate: PromiseOrValue<BigNumberish>, cliffPeriod: PromiseOrValue<BigNumberish>, claimPeriod: PromiseOrValue<BigNumberish>, overrides?: CallOverrides): Promise<[
            IVestingSchedulerV3.ScheduleCreationParamsStructOutput
        ] & {
            params: IVestingSchedulerV3.ScheduleCreationParamsStructOutput;
        }>;
        updateVestingSchedule(superToken: PromiseOrValue<string>, receiver: PromiseOrValue<string>, newEndDate: PromiseOrValue<BigNumberish>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<ContractTransaction>;
        updateVestingScheduleFlowRateFromAmount(superToken: PromiseOrValue<string>, receiver: PromiseOrValue<string>, newTotalAmount: PromiseOrValue<BigNumberish>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<ContractTransaction>;
        updateVestingScheduleFlowRateFromAmountAndEndDate(superToken: PromiseOrValue<string>, receiver: PromiseOrValue<string>, newTotalAmount: PromiseOrValue<BigNumberish>, newEndDate: PromiseOrValue<BigNumberish>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<ContractTransaction>;
        updateVestingScheduleFlowRateFromEndDate(superToken: PromiseOrValue<string>, receiver: PromiseOrValue<string>, newEndDate: PromiseOrValue<BigNumberish>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<ContractTransaction>;
        versionRecipient(overrides?: CallOverrides): Promise<[string] & {
            version: string;
        }>;
        vestingSchedules(vestingId: PromiseOrValue<BytesLike>, overrides?: CallOverrides): Promise<[
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
    HOST(overrides?: CallOverrides): Promise<string>;
    MIN_VESTING_DURATION(overrides?: CallOverrides): Promise<number>;
    START_DATE_VALID_AFTER(overrides?: CallOverrides): Promise<number>;
    accountings(vestingId: PromiseOrValue<BytesLike>, overrides?: CallOverrides): Promise<[
        BigNumber,
        BigNumber
    ] & {
        settledAmount: BigNumber;
        settledDate: BigNumber;
    }>;
    createAndExecuteVestingScheduleFromAmountAndDuration(superToken: PromiseOrValue<string>, receiver: PromiseOrValue<string>, totalAmount: PromiseOrValue<BigNumberish>, totalDuration: PromiseOrValue<BigNumberish>, overrides?: Overrides & {
        from?: PromiseOrValue<string>;
    }): Promise<ContractTransaction>;
    "createVestingSchedule(address,address,uint32,uint32,int96,uint256,uint32,uint32)"(superToken: PromiseOrValue<string>, receiver: PromiseOrValue<string>, startDate: PromiseOrValue<BigNumberish>, cliffDate: PromiseOrValue<BigNumberish>, flowRate: PromiseOrValue<BigNumberish>, cliffAmount: PromiseOrValue<BigNumberish>, endDate: PromiseOrValue<BigNumberish>, claimValidityDate: PromiseOrValue<BigNumberish>, overrides?: Overrides & {
        from?: PromiseOrValue<string>;
    }): Promise<ContractTransaction>;
    "createVestingSchedule(address,address,uint32,uint32,int96,uint256,uint32)"(superToken: PromiseOrValue<string>, receiver: PromiseOrValue<string>, startDate: PromiseOrValue<BigNumberish>, cliffDate: PromiseOrValue<BigNumberish>, flowRate: PromiseOrValue<BigNumberish>, cliffAmount: PromiseOrValue<BigNumberish>, endDate: PromiseOrValue<BigNumberish>, overrides?: Overrides & {
        from?: PromiseOrValue<string>;
    }): Promise<ContractTransaction>;
    "createVestingScheduleFromAmountAndDuration(address,address,uint256,uint32,uint32,uint32,uint32)"(superToken: PromiseOrValue<string>, receiver: PromiseOrValue<string>, totalAmount: PromiseOrValue<BigNumberish>, totalDuration: PromiseOrValue<BigNumberish>, startDate: PromiseOrValue<BigNumberish>, cliffPeriod: PromiseOrValue<BigNumberish>, claimPeriod: PromiseOrValue<BigNumberish>, overrides?: Overrides & {
        from?: PromiseOrValue<string>;
    }): Promise<ContractTransaction>;
    "createVestingScheduleFromAmountAndDuration(address,address,uint256,uint32,uint32,uint32,uint32,uint256)"(superToken: PromiseOrValue<string>, receiver: PromiseOrValue<string>, totalAmount: PromiseOrValue<BigNumberish>, totalDuration: PromiseOrValue<BigNumberish>, startDate: PromiseOrValue<BigNumberish>, cliffPeriod: PromiseOrValue<BigNumberish>, claimPeriod: PromiseOrValue<BigNumberish>, cliffAmount: PromiseOrValue<BigNumberish>, overrides?: Overrides & {
        from?: PromiseOrValue<string>;
    }): Promise<ContractTransaction>;
    deleteVestingSchedule(superToken: PromiseOrValue<string>, receiver: PromiseOrValue<string>, overrides?: Overrides & {
        from?: PromiseOrValue<string>;
    }): Promise<ContractTransaction>;
    endVestingScheduleNow(superToken: PromiseOrValue<string>, receiver: PromiseOrValue<string>, overrides?: Overrides & {
        from?: PromiseOrValue<string>;
    }): Promise<ContractTransaction>;
    executeCliffAndFlow(superToken: PromiseOrValue<string>, sender: PromiseOrValue<string>, receiver: PromiseOrValue<string>, overrides?: Overrides & {
        from?: PromiseOrValue<string>;
    }): Promise<ContractTransaction>;
    executeEndVesting(superToken: PromiseOrValue<string>, sender: PromiseOrValue<string>, receiver: PromiseOrValue<string>, overrides?: Overrides & {
        from?: PromiseOrValue<string>;
    }): Promise<ContractTransaction>;
    "getMaximumNeededTokenAllowance(address,address,address)"(superToken: PromiseOrValue<string>, sender: PromiseOrValue<string>, receiver: PromiseOrValue<string>, overrides?: CallOverrides): Promise<BigNumber>;
    "getMaximumNeededTokenAllowance((uint32,uint32,int96,uint256,uint96,uint32))"(schedule: IVestingSchedulerV3.VestingScheduleStruct, overrides?: CallOverrides): Promise<BigNumber>;
    getTotalVestedAmount(superToken: PromiseOrValue<string>, sender: PromiseOrValue<string>, receiver: PromiseOrValue<string>, overrides?: CallOverrides): Promise<BigNumber>;
    getVestingSchedule(superToken: PromiseOrValue<string>, sender: PromiseOrValue<string>, receiver: PromiseOrValue<string>, overrides?: CallOverrides): Promise<IVestingSchedulerV3.VestingScheduleStructOutput>;
    isTrustedForwarder(forwarder: PromiseOrValue<string>, overrides?: CallOverrides): Promise<boolean>;
    "mapCreateVestingScheduleParams(address,address,address,uint256,uint32,uint32,uint32,uint32,uint256)"(superToken: PromiseOrValue<string>, sender: PromiseOrValue<string>, receiver: PromiseOrValue<string>, totalAmount: PromiseOrValue<BigNumberish>, totalDuration: PromiseOrValue<BigNumberish>, startDate: PromiseOrValue<BigNumberish>, cliffPeriod: PromiseOrValue<BigNumberish>, claimPeriod: PromiseOrValue<BigNumberish>, cliffAmount: PromiseOrValue<BigNumberish>, overrides?: CallOverrides): Promise<IVestingSchedulerV3.ScheduleCreationParamsStructOutput>;
    "mapCreateVestingScheduleParams(address,address,address,uint256,uint32,uint32,uint32,uint32)"(superToken: PromiseOrValue<string>, sender: PromiseOrValue<string>, receiver: PromiseOrValue<string>, totalAmount: PromiseOrValue<BigNumberish>, totalDuration: PromiseOrValue<BigNumberish>, startDate: PromiseOrValue<BigNumberish>, cliffPeriod: PromiseOrValue<BigNumberish>, claimPeriod: PromiseOrValue<BigNumberish>, overrides?: CallOverrides): Promise<IVestingSchedulerV3.ScheduleCreationParamsStructOutput>;
    updateVestingSchedule(superToken: PromiseOrValue<string>, receiver: PromiseOrValue<string>, newEndDate: PromiseOrValue<BigNumberish>, overrides?: Overrides & {
        from?: PromiseOrValue<string>;
    }): Promise<ContractTransaction>;
    updateVestingScheduleFlowRateFromAmount(superToken: PromiseOrValue<string>, receiver: PromiseOrValue<string>, newTotalAmount: PromiseOrValue<BigNumberish>, overrides?: Overrides & {
        from?: PromiseOrValue<string>;
    }): Promise<ContractTransaction>;
    updateVestingScheduleFlowRateFromAmountAndEndDate(superToken: PromiseOrValue<string>, receiver: PromiseOrValue<string>, newTotalAmount: PromiseOrValue<BigNumberish>, newEndDate: PromiseOrValue<BigNumberish>, overrides?: Overrides & {
        from?: PromiseOrValue<string>;
    }): Promise<ContractTransaction>;
    updateVestingScheduleFlowRateFromEndDate(superToken: PromiseOrValue<string>, receiver: PromiseOrValue<string>, newEndDate: PromiseOrValue<BigNumberish>, overrides?: Overrides & {
        from?: PromiseOrValue<string>;
    }): Promise<ContractTransaction>;
    versionRecipient(overrides?: CallOverrides): Promise<string>;
    vestingSchedules(vestingId: PromiseOrValue<BytesLike>, overrides?: CallOverrides): Promise<[
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
        HOST(overrides?: CallOverrides): Promise<string>;
        MIN_VESTING_DURATION(overrides?: CallOverrides): Promise<number>;
        START_DATE_VALID_AFTER(overrides?: CallOverrides): Promise<number>;
        accountings(vestingId: PromiseOrValue<BytesLike>, overrides?: CallOverrides): Promise<[
            BigNumber,
            BigNumber
        ] & {
            settledAmount: BigNumber;
            settledDate: BigNumber;
        }>;
        createAndExecuteVestingScheduleFromAmountAndDuration(superToken: PromiseOrValue<string>, receiver: PromiseOrValue<string>, totalAmount: PromiseOrValue<BigNumberish>, totalDuration: PromiseOrValue<BigNumberish>, overrides?: CallOverrides): Promise<void>;
        "createVestingSchedule(address,address,uint32,uint32,int96,uint256,uint32,uint32)"(superToken: PromiseOrValue<string>, receiver: PromiseOrValue<string>, startDate: PromiseOrValue<BigNumberish>, cliffDate: PromiseOrValue<BigNumberish>, flowRate: PromiseOrValue<BigNumberish>, cliffAmount: PromiseOrValue<BigNumberish>, endDate: PromiseOrValue<BigNumberish>, claimValidityDate: PromiseOrValue<BigNumberish>, overrides?: CallOverrides): Promise<void>;
        "createVestingSchedule(address,address,uint32,uint32,int96,uint256,uint32)"(superToken: PromiseOrValue<string>, receiver: PromiseOrValue<string>, startDate: PromiseOrValue<BigNumberish>, cliffDate: PromiseOrValue<BigNumberish>, flowRate: PromiseOrValue<BigNumberish>, cliffAmount: PromiseOrValue<BigNumberish>, endDate: PromiseOrValue<BigNumberish>, overrides?: CallOverrides): Promise<void>;
        "createVestingScheduleFromAmountAndDuration(address,address,uint256,uint32,uint32,uint32,uint32)"(superToken: PromiseOrValue<string>, receiver: PromiseOrValue<string>, totalAmount: PromiseOrValue<BigNumberish>, totalDuration: PromiseOrValue<BigNumberish>, startDate: PromiseOrValue<BigNumberish>, cliffPeriod: PromiseOrValue<BigNumberish>, claimPeriod: PromiseOrValue<BigNumberish>, overrides?: CallOverrides): Promise<void>;
        "createVestingScheduleFromAmountAndDuration(address,address,uint256,uint32,uint32,uint32,uint32,uint256)"(superToken: PromiseOrValue<string>, receiver: PromiseOrValue<string>, totalAmount: PromiseOrValue<BigNumberish>, totalDuration: PromiseOrValue<BigNumberish>, startDate: PromiseOrValue<BigNumberish>, cliffPeriod: PromiseOrValue<BigNumberish>, claimPeriod: PromiseOrValue<BigNumberish>, cliffAmount: PromiseOrValue<BigNumberish>, overrides?: CallOverrides): Promise<void>;
        deleteVestingSchedule(superToken: PromiseOrValue<string>, receiver: PromiseOrValue<string>, overrides?: CallOverrides): Promise<void>;
        endVestingScheduleNow(superToken: PromiseOrValue<string>, receiver: PromiseOrValue<string>, overrides?: CallOverrides): Promise<void>;
        executeCliffAndFlow(superToken: PromiseOrValue<string>, sender: PromiseOrValue<string>, receiver: PromiseOrValue<string>, overrides?: CallOverrides): Promise<boolean>;
        executeEndVesting(superToken: PromiseOrValue<string>, sender: PromiseOrValue<string>, receiver: PromiseOrValue<string>, overrides?: CallOverrides): Promise<boolean>;
        "getMaximumNeededTokenAllowance(address,address,address)"(superToken: PromiseOrValue<string>, sender: PromiseOrValue<string>, receiver: PromiseOrValue<string>, overrides?: CallOverrides): Promise<BigNumber>;
        "getMaximumNeededTokenAllowance((uint32,uint32,int96,uint256,uint96,uint32))"(schedule: IVestingSchedulerV3.VestingScheduleStruct, overrides?: CallOverrides): Promise<BigNumber>;
        getTotalVestedAmount(superToken: PromiseOrValue<string>, sender: PromiseOrValue<string>, receiver: PromiseOrValue<string>, overrides?: CallOverrides): Promise<BigNumber>;
        getVestingSchedule(superToken: PromiseOrValue<string>, sender: PromiseOrValue<string>, receiver: PromiseOrValue<string>, overrides?: CallOverrides): Promise<IVestingSchedulerV3.VestingScheduleStructOutput>;
        isTrustedForwarder(forwarder: PromiseOrValue<string>, overrides?: CallOverrides): Promise<boolean>;
        "mapCreateVestingScheduleParams(address,address,address,uint256,uint32,uint32,uint32,uint32,uint256)"(superToken: PromiseOrValue<string>, sender: PromiseOrValue<string>, receiver: PromiseOrValue<string>, totalAmount: PromiseOrValue<BigNumberish>, totalDuration: PromiseOrValue<BigNumberish>, startDate: PromiseOrValue<BigNumberish>, cliffPeriod: PromiseOrValue<BigNumberish>, claimPeriod: PromiseOrValue<BigNumberish>, cliffAmount: PromiseOrValue<BigNumberish>, overrides?: CallOverrides): Promise<IVestingSchedulerV3.ScheduleCreationParamsStructOutput>;
        "mapCreateVestingScheduleParams(address,address,address,uint256,uint32,uint32,uint32,uint32)"(superToken: PromiseOrValue<string>, sender: PromiseOrValue<string>, receiver: PromiseOrValue<string>, totalAmount: PromiseOrValue<BigNumberish>, totalDuration: PromiseOrValue<BigNumberish>, startDate: PromiseOrValue<BigNumberish>, cliffPeriod: PromiseOrValue<BigNumberish>, claimPeriod: PromiseOrValue<BigNumberish>, overrides?: CallOverrides): Promise<IVestingSchedulerV3.ScheduleCreationParamsStructOutput>;
        updateVestingSchedule(superToken: PromiseOrValue<string>, receiver: PromiseOrValue<string>, newEndDate: PromiseOrValue<BigNumberish>, overrides?: CallOverrides): Promise<void>;
        updateVestingScheduleFlowRateFromAmount(superToken: PromiseOrValue<string>, receiver: PromiseOrValue<string>, newTotalAmount: PromiseOrValue<BigNumberish>, overrides?: CallOverrides): Promise<void>;
        updateVestingScheduleFlowRateFromAmountAndEndDate(superToken: PromiseOrValue<string>, receiver: PromiseOrValue<string>, newTotalAmount: PromiseOrValue<BigNumberish>, newEndDate: PromiseOrValue<BigNumberish>, overrides?: CallOverrides): Promise<void>;
        updateVestingScheduleFlowRateFromEndDate(superToken: PromiseOrValue<string>, receiver: PromiseOrValue<string>, newEndDate: PromiseOrValue<BigNumberish>, overrides?: CallOverrides): Promise<void>;
        versionRecipient(overrides?: CallOverrides): Promise<string>;
        vestingSchedules(vestingId: PromiseOrValue<BytesLike>, overrides?: CallOverrides): Promise<[
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
        "VestingScheduleUpdated(address,address,address,uint32,uint96,int96,uint256,uint256)"(superToken?: PromiseOrValue<string> | null, sender?: PromiseOrValue<string> | null, receiver?: PromiseOrValue<string> | null, endDate?: null, remainderAmount?: null, flowRate?: null, totalAmount?: null, settledAmount?: null): VestingScheduleUpdatedEventFilter;
        VestingScheduleUpdated(superToken?: PromiseOrValue<string> | null, sender?: PromiseOrValue<string> | null, receiver?: PromiseOrValue<string> | null, endDate?: null, remainderAmount?: null, flowRate?: null, totalAmount?: null, settledAmount?: null): VestingScheduleUpdatedEventFilter;
    };
    estimateGas: {
        END_DATE_VALID_BEFORE(overrides?: CallOverrides): Promise<BigNumber>;
        HOST(overrides?: CallOverrides): Promise<BigNumber>;
        MIN_VESTING_DURATION(overrides?: CallOverrides): Promise<BigNumber>;
        START_DATE_VALID_AFTER(overrides?: CallOverrides): Promise<BigNumber>;
        accountings(vestingId: PromiseOrValue<BytesLike>, overrides?: CallOverrides): Promise<BigNumber>;
        createAndExecuteVestingScheduleFromAmountAndDuration(superToken: PromiseOrValue<string>, receiver: PromiseOrValue<string>, totalAmount: PromiseOrValue<BigNumberish>, totalDuration: PromiseOrValue<BigNumberish>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<BigNumber>;
        "createVestingSchedule(address,address,uint32,uint32,int96,uint256,uint32,uint32)"(superToken: PromiseOrValue<string>, receiver: PromiseOrValue<string>, startDate: PromiseOrValue<BigNumberish>, cliffDate: PromiseOrValue<BigNumberish>, flowRate: PromiseOrValue<BigNumberish>, cliffAmount: PromiseOrValue<BigNumberish>, endDate: PromiseOrValue<BigNumberish>, claimValidityDate: PromiseOrValue<BigNumberish>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<BigNumber>;
        "createVestingSchedule(address,address,uint32,uint32,int96,uint256,uint32)"(superToken: PromiseOrValue<string>, receiver: PromiseOrValue<string>, startDate: PromiseOrValue<BigNumberish>, cliffDate: PromiseOrValue<BigNumberish>, flowRate: PromiseOrValue<BigNumberish>, cliffAmount: PromiseOrValue<BigNumberish>, endDate: PromiseOrValue<BigNumberish>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<BigNumber>;
        "createVestingScheduleFromAmountAndDuration(address,address,uint256,uint32,uint32,uint32,uint32)"(superToken: PromiseOrValue<string>, receiver: PromiseOrValue<string>, totalAmount: PromiseOrValue<BigNumberish>, totalDuration: PromiseOrValue<BigNumberish>, startDate: PromiseOrValue<BigNumberish>, cliffPeriod: PromiseOrValue<BigNumberish>, claimPeriod: PromiseOrValue<BigNumberish>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<BigNumber>;
        "createVestingScheduleFromAmountAndDuration(address,address,uint256,uint32,uint32,uint32,uint32,uint256)"(superToken: PromiseOrValue<string>, receiver: PromiseOrValue<string>, totalAmount: PromiseOrValue<BigNumberish>, totalDuration: PromiseOrValue<BigNumberish>, startDate: PromiseOrValue<BigNumberish>, cliffPeriod: PromiseOrValue<BigNumberish>, claimPeriod: PromiseOrValue<BigNumberish>, cliffAmount: PromiseOrValue<BigNumberish>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<BigNumber>;
        deleteVestingSchedule(superToken: PromiseOrValue<string>, receiver: PromiseOrValue<string>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<BigNumber>;
        endVestingScheduleNow(superToken: PromiseOrValue<string>, receiver: PromiseOrValue<string>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<BigNumber>;
        executeCliffAndFlow(superToken: PromiseOrValue<string>, sender: PromiseOrValue<string>, receiver: PromiseOrValue<string>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<BigNumber>;
        executeEndVesting(superToken: PromiseOrValue<string>, sender: PromiseOrValue<string>, receiver: PromiseOrValue<string>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<BigNumber>;
        "getMaximumNeededTokenAllowance(address,address,address)"(superToken: PromiseOrValue<string>, sender: PromiseOrValue<string>, receiver: PromiseOrValue<string>, overrides?: CallOverrides): Promise<BigNumber>;
        "getMaximumNeededTokenAllowance((uint32,uint32,int96,uint256,uint96,uint32))"(schedule: IVestingSchedulerV3.VestingScheduleStruct, overrides?: CallOverrides): Promise<BigNumber>;
        getTotalVestedAmount(superToken: PromiseOrValue<string>, sender: PromiseOrValue<string>, receiver: PromiseOrValue<string>, overrides?: CallOverrides): Promise<BigNumber>;
        getVestingSchedule(superToken: PromiseOrValue<string>, sender: PromiseOrValue<string>, receiver: PromiseOrValue<string>, overrides?: CallOverrides): Promise<BigNumber>;
        isTrustedForwarder(forwarder: PromiseOrValue<string>, overrides?: CallOverrides): Promise<BigNumber>;
        "mapCreateVestingScheduleParams(address,address,address,uint256,uint32,uint32,uint32,uint32,uint256)"(superToken: PromiseOrValue<string>, sender: PromiseOrValue<string>, receiver: PromiseOrValue<string>, totalAmount: PromiseOrValue<BigNumberish>, totalDuration: PromiseOrValue<BigNumberish>, startDate: PromiseOrValue<BigNumberish>, cliffPeriod: PromiseOrValue<BigNumberish>, claimPeriod: PromiseOrValue<BigNumberish>, cliffAmount: PromiseOrValue<BigNumberish>, overrides?: CallOverrides): Promise<BigNumber>;
        "mapCreateVestingScheduleParams(address,address,address,uint256,uint32,uint32,uint32,uint32)"(superToken: PromiseOrValue<string>, sender: PromiseOrValue<string>, receiver: PromiseOrValue<string>, totalAmount: PromiseOrValue<BigNumberish>, totalDuration: PromiseOrValue<BigNumberish>, startDate: PromiseOrValue<BigNumberish>, cliffPeriod: PromiseOrValue<BigNumberish>, claimPeriod: PromiseOrValue<BigNumberish>, overrides?: CallOverrides): Promise<BigNumber>;
        updateVestingSchedule(superToken: PromiseOrValue<string>, receiver: PromiseOrValue<string>, newEndDate: PromiseOrValue<BigNumberish>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<BigNumber>;
        updateVestingScheduleFlowRateFromAmount(superToken: PromiseOrValue<string>, receiver: PromiseOrValue<string>, newTotalAmount: PromiseOrValue<BigNumberish>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<BigNumber>;
        updateVestingScheduleFlowRateFromAmountAndEndDate(superToken: PromiseOrValue<string>, receiver: PromiseOrValue<string>, newTotalAmount: PromiseOrValue<BigNumberish>, newEndDate: PromiseOrValue<BigNumberish>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<BigNumber>;
        updateVestingScheduleFlowRateFromEndDate(superToken: PromiseOrValue<string>, receiver: PromiseOrValue<string>, newEndDate: PromiseOrValue<BigNumberish>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<BigNumber>;
        versionRecipient(overrides?: CallOverrides): Promise<BigNumber>;
        vestingSchedules(vestingId: PromiseOrValue<BytesLike>, overrides?: CallOverrides): Promise<BigNumber>;
    };
    populateTransaction: {
        END_DATE_VALID_BEFORE(overrides?: CallOverrides): Promise<PopulatedTransaction>;
        HOST(overrides?: CallOverrides): Promise<PopulatedTransaction>;
        MIN_VESTING_DURATION(overrides?: CallOverrides): Promise<PopulatedTransaction>;
        START_DATE_VALID_AFTER(overrides?: CallOverrides): Promise<PopulatedTransaction>;
        accountings(vestingId: PromiseOrValue<BytesLike>, overrides?: CallOverrides): Promise<PopulatedTransaction>;
        createAndExecuteVestingScheduleFromAmountAndDuration(superToken: PromiseOrValue<string>, receiver: PromiseOrValue<string>, totalAmount: PromiseOrValue<BigNumberish>, totalDuration: PromiseOrValue<BigNumberish>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<PopulatedTransaction>;
        "createVestingSchedule(address,address,uint32,uint32,int96,uint256,uint32,uint32)"(superToken: PromiseOrValue<string>, receiver: PromiseOrValue<string>, startDate: PromiseOrValue<BigNumberish>, cliffDate: PromiseOrValue<BigNumberish>, flowRate: PromiseOrValue<BigNumberish>, cliffAmount: PromiseOrValue<BigNumberish>, endDate: PromiseOrValue<BigNumberish>, claimValidityDate: PromiseOrValue<BigNumberish>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<PopulatedTransaction>;
        "createVestingSchedule(address,address,uint32,uint32,int96,uint256,uint32)"(superToken: PromiseOrValue<string>, receiver: PromiseOrValue<string>, startDate: PromiseOrValue<BigNumberish>, cliffDate: PromiseOrValue<BigNumberish>, flowRate: PromiseOrValue<BigNumberish>, cliffAmount: PromiseOrValue<BigNumberish>, endDate: PromiseOrValue<BigNumberish>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<PopulatedTransaction>;
        "createVestingScheduleFromAmountAndDuration(address,address,uint256,uint32,uint32,uint32,uint32)"(superToken: PromiseOrValue<string>, receiver: PromiseOrValue<string>, totalAmount: PromiseOrValue<BigNumberish>, totalDuration: PromiseOrValue<BigNumberish>, startDate: PromiseOrValue<BigNumberish>, cliffPeriod: PromiseOrValue<BigNumberish>, claimPeriod: PromiseOrValue<BigNumberish>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<PopulatedTransaction>;
        "createVestingScheduleFromAmountAndDuration(address,address,uint256,uint32,uint32,uint32,uint32,uint256)"(superToken: PromiseOrValue<string>, receiver: PromiseOrValue<string>, totalAmount: PromiseOrValue<BigNumberish>, totalDuration: PromiseOrValue<BigNumberish>, startDate: PromiseOrValue<BigNumberish>, cliffPeriod: PromiseOrValue<BigNumberish>, claimPeriod: PromiseOrValue<BigNumberish>, cliffAmount: PromiseOrValue<BigNumberish>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<PopulatedTransaction>;
        deleteVestingSchedule(superToken: PromiseOrValue<string>, receiver: PromiseOrValue<string>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<PopulatedTransaction>;
        endVestingScheduleNow(superToken: PromiseOrValue<string>, receiver: PromiseOrValue<string>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<PopulatedTransaction>;
        executeCliffAndFlow(superToken: PromiseOrValue<string>, sender: PromiseOrValue<string>, receiver: PromiseOrValue<string>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<PopulatedTransaction>;
        executeEndVesting(superToken: PromiseOrValue<string>, sender: PromiseOrValue<string>, receiver: PromiseOrValue<string>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<PopulatedTransaction>;
        "getMaximumNeededTokenAllowance(address,address,address)"(superToken: PromiseOrValue<string>, sender: PromiseOrValue<string>, receiver: PromiseOrValue<string>, overrides?: CallOverrides): Promise<PopulatedTransaction>;
        "getMaximumNeededTokenAllowance((uint32,uint32,int96,uint256,uint96,uint32))"(schedule: IVestingSchedulerV3.VestingScheduleStruct, overrides?: CallOverrides): Promise<PopulatedTransaction>;
        getTotalVestedAmount(superToken: PromiseOrValue<string>, sender: PromiseOrValue<string>, receiver: PromiseOrValue<string>, overrides?: CallOverrides): Promise<PopulatedTransaction>;
        getVestingSchedule(superToken: PromiseOrValue<string>, sender: PromiseOrValue<string>, receiver: PromiseOrValue<string>, overrides?: CallOverrides): Promise<PopulatedTransaction>;
        isTrustedForwarder(forwarder: PromiseOrValue<string>, overrides?: CallOverrides): Promise<PopulatedTransaction>;
        "mapCreateVestingScheduleParams(address,address,address,uint256,uint32,uint32,uint32,uint32,uint256)"(superToken: PromiseOrValue<string>, sender: PromiseOrValue<string>, receiver: PromiseOrValue<string>, totalAmount: PromiseOrValue<BigNumberish>, totalDuration: PromiseOrValue<BigNumberish>, startDate: PromiseOrValue<BigNumberish>, cliffPeriod: PromiseOrValue<BigNumberish>, claimPeriod: PromiseOrValue<BigNumberish>, cliffAmount: PromiseOrValue<BigNumberish>, overrides?: CallOverrides): Promise<PopulatedTransaction>;
        "mapCreateVestingScheduleParams(address,address,address,uint256,uint32,uint32,uint32,uint32)"(superToken: PromiseOrValue<string>, sender: PromiseOrValue<string>, receiver: PromiseOrValue<string>, totalAmount: PromiseOrValue<BigNumberish>, totalDuration: PromiseOrValue<BigNumberish>, startDate: PromiseOrValue<BigNumberish>, cliffPeriod: PromiseOrValue<BigNumberish>, claimPeriod: PromiseOrValue<BigNumberish>, overrides?: CallOverrides): Promise<PopulatedTransaction>;
        updateVestingSchedule(superToken: PromiseOrValue<string>, receiver: PromiseOrValue<string>, newEndDate: PromiseOrValue<BigNumberish>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<PopulatedTransaction>;
        updateVestingScheduleFlowRateFromAmount(superToken: PromiseOrValue<string>, receiver: PromiseOrValue<string>, newTotalAmount: PromiseOrValue<BigNumberish>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<PopulatedTransaction>;
        updateVestingScheduleFlowRateFromAmountAndEndDate(superToken: PromiseOrValue<string>, receiver: PromiseOrValue<string>, newTotalAmount: PromiseOrValue<BigNumberish>, newEndDate: PromiseOrValue<BigNumberish>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<PopulatedTransaction>;
        updateVestingScheduleFlowRateFromEndDate(superToken: PromiseOrValue<string>, receiver: PromiseOrValue<string>, newEndDate: PromiseOrValue<BigNumberish>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<PopulatedTransaction>;
        versionRecipient(overrides?: CallOverrides): Promise<PopulatedTransaction>;
        vestingSchedules(vestingId: PromiseOrValue<BytesLike>, overrides?: CallOverrides): Promise<PopulatedTransaction>;
    };
}
