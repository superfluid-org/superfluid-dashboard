import type { BaseContract, BigNumber, BigNumberish, BytesLike, CallOverrides, ContractTransaction, Overrides, PopulatedTransaction, Signer, utils } from "ethers";
import type { FunctionFragment, Result, EventFragment } from "@ethersproject/abi";
import type { Listener, Provider } from "@ethersproject/providers";
import type { TypedEventFilter, TypedEvent, TypedListener, OnEvent, PromiseOrValue } from "../common";
export declare namespace IVestingScheduler {
    type ScheduleStruct = {
        effectiveStartDate: PromiseOrValue<BigNumberish>;
        startDateValidFor: PromiseOrValue<BigNumberish>;
        endDate: PromiseOrValue<BigNumberish>;
        endDateValidBefore: PromiseOrValue<BigNumberish>;
        flowRate: PromiseOrValue<BigNumberish>;
        cliffTransferAmount: PromiseOrValue<BigNumberish>;
    };
    type ScheduleStructOutput = [
        number,
        number,
        number,
        number,
        BigNumber,
        BigNumber
    ] & {
        effectiveStartDate: number;
        startDateValidFor: number;
        endDate: number;
        endDateValidBefore: number;
        flowRate: BigNumber;
        cliffTransferAmount: BigNumber;
    };
}
export interface VestingSchedulerInterface extends utils.Interface {
    functions: {
        "afterAgreementCreated(address,address,bytes32,bytes,bytes,bytes)": FunctionFragment;
        "afterAgreementTerminated(address,address,bytes32,bytes,bytes,bytes)": FunctionFragment;
        "afterAgreementUpdated(address,address,bytes32,bytes,bytes,bytes)": FunctionFragment;
        "beforeAgreementCreated(address,address,bytes32,bytes,bytes)": FunctionFragment;
        "beforeAgreementTerminated(address,address,bytes32,bytes,bytes)": FunctionFragment;
        "beforeAgreementUpdated(address,address,bytes32,bytes,bytes)": FunctionFragment;
        "cfaV1()": FunctionFragment;
        "createVestingSchedule(address,address,uint32,uint32,uint32,int96,uint256,uint32,uint32,bytes)": FunctionFragment;
        "deleteVestingSchedule(address,address,bytes)": FunctionFragment;
        "executeCloseVesting(address,address,address)": FunctionFragment;
        "executeVesting(address,address,address)": FunctionFragment;
        "getVestingSchedule(address,address,address)": FunctionFragment;
        "vestingSchedules(bytes32)": FunctionFragment;
    };
    getFunction(nameOrSignatureOrTopic: "afterAgreementCreated" | "afterAgreementTerminated" | "afterAgreementUpdated" | "beforeAgreementCreated" | "beforeAgreementTerminated" | "beforeAgreementUpdated" | "cfaV1" | "createVestingSchedule" | "deleteVestingSchedule" | "executeCloseVesting" | "executeVesting" | "getVestingSchedule" | "vestingSchedules"): FunctionFragment;
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
    encodeFunctionData(functionFragment: "createVestingSchedule", values: [
        PromiseOrValue<string>,
        PromiseOrValue<string>,
        PromiseOrValue<BigNumberish>,
        PromiseOrValue<BigNumberish>,
        PromiseOrValue<BigNumberish>,
        PromiseOrValue<BigNumberish>,
        PromiseOrValue<BigNumberish>,
        PromiseOrValue<BigNumberish>,
        PromiseOrValue<BigNumberish>,
        PromiseOrValue<BytesLike>
    ]): string;
    encodeFunctionData(functionFragment: "deleteVestingSchedule", values: [
        PromiseOrValue<string>,
        PromiseOrValue<string>,
        PromiseOrValue<BytesLike>
    ]): string;
    encodeFunctionData(functionFragment: "executeCloseVesting", values: [
        PromiseOrValue<string>,
        PromiseOrValue<string>,
        PromiseOrValue<string>
    ]): string;
    encodeFunctionData(functionFragment: "executeVesting", values: [
        PromiseOrValue<string>,
        PromiseOrValue<string>,
        PromiseOrValue<string>
    ]): string;
    encodeFunctionData(functionFragment: "getVestingSchedule", values: [
        PromiseOrValue<string>,
        PromiseOrValue<string>,
        PromiseOrValue<string>
    ]): string;
    encodeFunctionData(functionFragment: "vestingSchedules", values: [PromiseOrValue<BytesLike>]): string;
    decodeFunctionResult(functionFragment: "afterAgreementCreated", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "afterAgreementTerminated", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "afterAgreementUpdated", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "beforeAgreementCreated", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "beforeAgreementTerminated", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "beforeAgreementUpdated", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "cfaV1", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "createVestingSchedule", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "deleteVestingSchedule", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "executeCloseVesting", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "executeVesting", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "getVestingSchedule", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "vestingSchedules", data: BytesLike): Result;
    events: {
        "CreateVestingSchedule(address,address,address,uint32,uint32,uint32,int96,uint32,uint32,uint256)": EventFragment;
        "DeleteVestingSchedule(address,address,address)": EventFragment;
        "ExecuteClosingVesting(address,address,address,uint32,uint32,uint256,bool)": EventFragment;
        "ExecuteVesting(address,address,address,uint32,uint32,int96,uint256,uint256)": EventFragment;
    };
    getEvent(nameOrSignatureOrTopic: "CreateVestingSchedule"): EventFragment;
    getEvent(nameOrSignatureOrTopic: "DeleteVestingSchedule"): EventFragment;
    getEvent(nameOrSignatureOrTopic: "ExecuteClosingVesting"): EventFragment;
    getEvent(nameOrSignatureOrTopic: "ExecuteVesting"): EventFragment;
}
export interface CreateVestingScheduleEventObject {
    sender: string;
    receiver: string;
    superToken: string;
    startDate: number;
    startDateValidFor: number;
    cliffDate: number;
    flowRate: BigNumber;
    endDate: number;
    endDateValidBefore: number;
    cliffTransferAmount: BigNumber;
}
export declare type CreateVestingScheduleEvent = TypedEvent<[
    string,
    string,
    string,
    number,
    number,
    number,
    BigNumber,
    number,
    number,
    BigNumber
], CreateVestingScheduleEventObject>;
export declare type CreateVestingScheduleEventFilter = TypedEventFilter<CreateVestingScheduleEvent>;
export interface DeleteVestingScheduleEventObject {
    sender: string;
    receiver: string;
    superToken: string;
}
export declare type DeleteVestingScheduleEvent = TypedEvent<[
    string,
    string,
    string
], DeleteVestingScheduleEventObject>;
export declare type DeleteVestingScheduleEventFilter = TypedEventFilter<DeleteVestingScheduleEvent>;
export interface ExecuteClosingVestingEventObject {
    sender: string;
    receiver: string;
    superToken: string;
    endDate: number;
    endDateValidBefore: number;
    closingTransferAmount: BigNumber;
    didTransferFail: boolean;
}
export declare type ExecuteClosingVestingEvent = TypedEvent<[
    string,
    string,
    string,
    number,
    number,
    BigNumber,
    boolean
], ExecuteClosingVestingEventObject>;
export declare type ExecuteClosingVestingEventFilter = TypedEventFilter<ExecuteClosingVestingEvent>;
export interface ExecuteVestingEventObject {
    sender: string;
    receiver: string;
    superToken: string;
    effectiveStartDate: number;
    startDateValidFor: number;
    flowRate: BigNumber;
    cliffTransferAmount: BigNumber;
    adjustedAmount: BigNumber;
}
export declare type ExecuteVestingEvent = TypedEvent<[
    string,
    string,
    string,
    number,
    number,
    BigNumber,
    BigNumber,
    BigNumber
], ExecuteVestingEventObject>;
export declare type ExecuteVestingEventFilter = TypedEventFilter<ExecuteVestingEvent>;
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
        createVestingSchedule(receiver: PromiseOrValue<string>, superToken: PromiseOrValue<string>, startDate: PromiseOrValue<BigNumberish>, startDateValidFor: PromiseOrValue<BigNumberish>, cliffDate: PromiseOrValue<BigNumberish>, flowRate: PromiseOrValue<BigNumberish>, cliffTransferAmount: PromiseOrValue<BigNumberish>, endDate: PromiseOrValue<BigNumberish>, endDateValidBefore: PromiseOrValue<BigNumberish>, ctx: PromiseOrValue<BytesLike>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<ContractTransaction>;
        deleteVestingSchedule(receiver: PromiseOrValue<string>, superToken: PromiseOrValue<string>, ctx: PromiseOrValue<BytesLike>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<ContractTransaction>;
        executeCloseVesting(sender: PromiseOrValue<string>, receiver: PromiseOrValue<string>, superToken: PromiseOrValue<string>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<ContractTransaction>;
        executeVesting(sender: PromiseOrValue<string>, receiver: PromiseOrValue<string>, superToken: PromiseOrValue<string>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<ContractTransaction>;
        getVestingSchedule(sender: PromiseOrValue<string>, receiver: PromiseOrValue<string>, supertoken: PromiseOrValue<string>, overrides?: CallOverrides): Promise<[IVestingScheduler.ScheduleStructOutput]>;
        vestingSchedules(arg0: PromiseOrValue<BytesLike>, overrides?: CallOverrides): Promise<[
            number,
            number,
            number,
            number,
            BigNumber,
            BigNumber
        ] & {
            effectiveStartDate: number;
            startDateValidFor: number;
            endDate: number;
            endDateValidBefore: number;
            flowRate: BigNumber;
            cliffTransferAmount: BigNumber;
        }>;
    };
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
    createVestingSchedule(receiver: PromiseOrValue<string>, superToken: PromiseOrValue<string>, startDate: PromiseOrValue<BigNumberish>, startDateValidFor: PromiseOrValue<BigNumberish>, cliffDate: PromiseOrValue<BigNumberish>, flowRate: PromiseOrValue<BigNumberish>, cliffTransferAmount: PromiseOrValue<BigNumberish>, endDate: PromiseOrValue<BigNumberish>, endDateValidBefore: PromiseOrValue<BigNumberish>, ctx: PromiseOrValue<BytesLike>, overrides?: Overrides & {
        from?: PromiseOrValue<string>;
    }): Promise<ContractTransaction>;
    deleteVestingSchedule(receiver: PromiseOrValue<string>, superToken: PromiseOrValue<string>, ctx: PromiseOrValue<BytesLike>, overrides?: Overrides & {
        from?: PromiseOrValue<string>;
    }): Promise<ContractTransaction>;
    executeCloseVesting(sender: PromiseOrValue<string>, receiver: PromiseOrValue<string>, superToken: PromiseOrValue<string>, overrides?: Overrides & {
        from?: PromiseOrValue<string>;
    }): Promise<ContractTransaction>;
    executeVesting(sender: PromiseOrValue<string>, receiver: PromiseOrValue<string>, superToken: PromiseOrValue<string>, overrides?: Overrides & {
        from?: PromiseOrValue<string>;
    }): Promise<ContractTransaction>;
    getVestingSchedule(sender: PromiseOrValue<string>, receiver: PromiseOrValue<string>, supertoken: PromiseOrValue<string>, overrides?: CallOverrides): Promise<IVestingScheduler.ScheduleStructOutput>;
    vestingSchedules(arg0: PromiseOrValue<BytesLike>, overrides?: CallOverrides): Promise<[
        number,
        number,
        number,
        number,
        BigNumber,
        BigNumber
    ] & {
        effectiveStartDate: number;
        startDateValidFor: number;
        endDate: number;
        endDateValidBefore: number;
        flowRate: BigNumber;
        cliffTransferAmount: BigNumber;
    }>;
    callStatic: {
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
        createVestingSchedule(receiver: PromiseOrValue<string>, superToken: PromiseOrValue<string>, startDate: PromiseOrValue<BigNumberish>, startDateValidFor: PromiseOrValue<BigNumberish>, cliffDate: PromiseOrValue<BigNumberish>, flowRate: PromiseOrValue<BigNumberish>, cliffTransferAmount: PromiseOrValue<BigNumberish>, endDate: PromiseOrValue<BigNumberish>, endDateValidBefore: PromiseOrValue<BigNumberish>, ctx: PromiseOrValue<BytesLike>, overrides?: CallOverrides): Promise<string>;
        deleteVestingSchedule(receiver: PromiseOrValue<string>, superToken: PromiseOrValue<string>, ctx: PromiseOrValue<BytesLike>, overrides?: CallOverrides): Promise<string>;
        executeCloseVesting(sender: PromiseOrValue<string>, receiver: PromiseOrValue<string>, superToken: PromiseOrValue<string>, overrides?: CallOverrides): Promise<void>;
        executeVesting(sender: PromiseOrValue<string>, receiver: PromiseOrValue<string>, superToken: PromiseOrValue<string>, overrides?: CallOverrides): Promise<void>;
        getVestingSchedule(sender: PromiseOrValue<string>, receiver: PromiseOrValue<string>, supertoken: PromiseOrValue<string>, overrides?: CallOverrides): Promise<IVestingScheduler.ScheduleStructOutput>;
        vestingSchedules(arg0: PromiseOrValue<BytesLike>, overrides?: CallOverrides): Promise<[
            number,
            number,
            number,
            number,
            BigNumber,
            BigNumber
        ] & {
            effectiveStartDate: number;
            startDateValidFor: number;
            endDate: number;
            endDateValidBefore: number;
            flowRate: BigNumber;
            cliffTransferAmount: BigNumber;
        }>;
    };
    filters: {
        "CreateVestingSchedule(address,address,address,uint32,uint32,uint32,int96,uint32,uint32,uint256)"(sender?: PromiseOrValue<string> | null, receiver?: PromiseOrValue<string> | null, superToken?: PromiseOrValue<string> | null, startDate?: null, startDateValidFor?: null, cliffDate?: null, flowRate?: null, endDate?: null, endDateValidBefore?: null, cliffTransferAmount?: null): CreateVestingScheduleEventFilter;
        CreateVestingSchedule(sender?: PromiseOrValue<string> | null, receiver?: PromiseOrValue<string> | null, superToken?: PromiseOrValue<string> | null, startDate?: null, startDateValidFor?: null, cliffDate?: null, flowRate?: null, endDate?: null, endDateValidBefore?: null, cliffTransferAmount?: null): CreateVestingScheduleEventFilter;
        "DeleteVestingSchedule(address,address,address)"(sender?: PromiseOrValue<string> | null, receiver?: PromiseOrValue<string> | null, superToken?: PromiseOrValue<string> | null): DeleteVestingScheduleEventFilter;
        DeleteVestingSchedule(sender?: PromiseOrValue<string> | null, receiver?: PromiseOrValue<string> | null, superToken?: PromiseOrValue<string> | null): DeleteVestingScheduleEventFilter;
        "ExecuteClosingVesting(address,address,address,uint32,uint32,uint256,bool)"(sender?: PromiseOrValue<string> | null, receiver?: PromiseOrValue<string> | null, superToken?: PromiseOrValue<string> | null, endDate?: null, endDateValidBefore?: null, closingTransferAmount?: null, didTransferFail?: null): ExecuteClosingVestingEventFilter;
        ExecuteClosingVesting(sender?: PromiseOrValue<string> | null, receiver?: PromiseOrValue<string> | null, superToken?: PromiseOrValue<string> | null, endDate?: null, endDateValidBefore?: null, closingTransferAmount?: null, didTransferFail?: null): ExecuteClosingVestingEventFilter;
        "ExecuteVesting(address,address,address,uint32,uint32,int96,uint256,uint256)"(sender?: PromiseOrValue<string> | null, receiver?: PromiseOrValue<string> | null, superToken?: PromiseOrValue<string> | null, effectiveStartDate?: null, startDateValidFor?: null, flowRate?: null, cliffTransferAmount?: null, adjustedAmount?: null): ExecuteVestingEventFilter;
        ExecuteVesting(sender?: PromiseOrValue<string> | null, receiver?: PromiseOrValue<string> | null, superToken?: PromiseOrValue<string> | null, effectiveStartDate?: null, startDateValidFor?: null, flowRate?: null, cliffTransferAmount?: null, adjustedAmount?: null): ExecuteVestingEventFilter;
    };
    estimateGas: {
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
        createVestingSchedule(receiver: PromiseOrValue<string>, superToken: PromiseOrValue<string>, startDate: PromiseOrValue<BigNumberish>, startDateValidFor: PromiseOrValue<BigNumberish>, cliffDate: PromiseOrValue<BigNumberish>, flowRate: PromiseOrValue<BigNumberish>, cliffTransferAmount: PromiseOrValue<BigNumberish>, endDate: PromiseOrValue<BigNumberish>, endDateValidBefore: PromiseOrValue<BigNumberish>, ctx: PromiseOrValue<BytesLike>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<BigNumber>;
        deleteVestingSchedule(receiver: PromiseOrValue<string>, superToken: PromiseOrValue<string>, ctx: PromiseOrValue<BytesLike>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<BigNumber>;
        executeCloseVesting(sender: PromiseOrValue<string>, receiver: PromiseOrValue<string>, superToken: PromiseOrValue<string>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<BigNumber>;
        executeVesting(sender: PromiseOrValue<string>, receiver: PromiseOrValue<string>, superToken: PromiseOrValue<string>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<BigNumber>;
        getVestingSchedule(sender: PromiseOrValue<string>, receiver: PromiseOrValue<string>, supertoken: PromiseOrValue<string>, overrides?: CallOverrides): Promise<BigNumber>;
        vestingSchedules(arg0: PromiseOrValue<BytesLike>, overrides?: CallOverrides): Promise<BigNumber>;
    };
    populateTransaction: {
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
        createVestingSchedule(receiver: PromiseOrValue<string>, superToken: PromiseOrValue<string>, startDate: PromiseOrValue<BigNumberish>, startDateValidFor: PromiseOrValue<BigNumberish>, cliffDate: PromiseOrValue<BigNumberish>, flowRate: PromiseOrValue<BigNumberish>, cliffTransferAmount: PromiseOrValue<BigNumberish>, endDate: PromiseOrValue<BigNumberish>, endDateValidBefore: PromiseOrValue<BigNumberish>, ctx: PromiseOrValue<BytesLike>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<PopulatedTransaction>;
        deleteVestingSchedule(receiver: PromiseOrValue<string>, superToken: PromiseOrValue<string>, ctx: PromiseOrValue<BytesLike>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<PopulatedTransaction>;
        executeCloseVesting(sender: PromiseOrValue<string>, receiver: PromiseOrValue<string>, superToken: PromiseOrValue<string>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<PopulatedTransaction>;
        executeVesting(sender: PromiseOrValue<string>, receiver: PromiseOrValue<string>, superToken: PromiseOrValue<string>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<PopulatedTransaction>;
        getVestingSchedule(sender: PromiseOrValue<string>, receiver: PromiseOrValue<string>, supertoken: PromiseOrValue<string>, overrides?: CallOverrides): Promise<PopulatedTransaction>;
        vestingSchedules(arg0: PromiseOrValue<BytesLike>, overrides?: CallOverrides): Promise<PopulatedTransaction>;
    };
}
