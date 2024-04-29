import type { BaseContract, BigNumber, BigNumberish, BytesLike, CallOverrides, ContractTransaction, Overrides, PopulatedTransaction, Signer, utils } from "ethers";
import type { FunctionFragment, Result, EventFragment } from "@ethersproject/abi";
import type { Listener, Provider } from "@ethersproject/providers";
import type { TypedEventFilter, TypedEvent, TypedListener, OnEvent, PromiseOrValue } from "../common";
export declare namespace IFlowScheduler {
    type FlowScheduleStruct = {
        startDate: PromiseOrValue<BigNumberish>;
        startMaxDelay: PromiseOrValue<BigNumberish>;
        endDate: PromiseOrValue<BigNumberish>;
        flowRate: PromiseOrValue<BigNumberish>;
        startAmount: PromiseOrValue<BigNumberish>;
        userData: PromiseOrValue<BytesLike>;
    };
    type FlowScheduleStructOutput = [
        number,
        number,
        number,
        BigNumber,
        BigNumber,
        string
    ] & {
        startDate: number;
        startMaxDelay: number;
        endDate: number;
        flowRate: BigNumber;
        startAmount: BigNumber;
        userData: string;
    };
}
export interface FlowSchedulerInterface extends utils.Interface {
    functions: {
        "afterAgreementCreated(address,address,bytes32,bytes,bytes,bytes)": FunctionFragment;
        "afterAgreementTerminated(address,address,bytes32,bytes,bytes,bytes)": FunctionFragment;
        "afterAgreementUpdated(address,address,bytes32,bytes,bytes,bytes)": FunctionFragment;
        "beforeAgreementCreated(address,address,bytes32,bytes,bytes)": FunctionFragment;
        "beforeAgreementTerminated(address,address,bytes32,bytes,bytes)": FunctionFragment;
        "beforeAgreementUpdated(address,address,bytes32,bytes,bytes)": FunctionFragment;
        "cfaV1()": FunctionFragment;
        "createFlowSchedule(address,address,uint32,uint32,int96,uint256,uint32,bytes,bytes)": FunctionFragment;
        "deleteFlowSchedule(address,address,bytes)": FunctionFragment;
        "executeCreateFlow(address,address,address,bytes)": FunctionFragment;
        "executeDeleteFlow(address,address,address,bytes)": FunctionFragment;
        "flowSchedules(bytes32)": FunctionFragment;
        "getFlowSchedule(address,address,address)": FunctionFragment;
    };
    getFunction(nameOrSignatureOrTopic: "afterAgreementCreated" | "afterAgreementTerminated" | "afterAgreementUpdated" | "beforeAgreementCreated" | "beforeAgreementTerminated" | "beforeAgreementUpdated" | "cfaV1" | "createFlowSchedule" | "deleteFlowSchedule" | "executeCreateFlow" | "executeDeleteFlow" | "flowSchedules" | "getFlowSchedule"): FunctionFragment;
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
    encodeFunctionData(functionFragment: "createFlowSchedule", values: [
        PromiseOrValue<string>,
        PromiseOrValue<string>,
        PromiseOrValue<BigNumberish>,
        PromiseOrValue<BigNumberish>,
        PromiseOrValue<BigNumberish>,
        PromiseOrValue<BigNumberish>,
        PromiseOrValue<BigNumberish>,
        PromiseOrValue<BytesLike>,
        PromiseOrValue<BytesLike>
    ]): string;
    encodeFunctionData(functionFragment: "deleteFlowSchedule", values: [
        PromiseOrValue<string>,
        PromiseOrValue<string>,
        PromiseOrValue<BytesLike>
    ]): string;
    encodeFunctionData(functionFragment: "executeCreateFlow", values: [
        PromiseOrValue<string>,
        PromiseOrValue<string>,
        PromiseOrValue<string>,
        PromiseOrValue<BytesLike>
    ]): string;
    encodeFunctionData(functionFragment: "executeDeleteFlow", values: [
        PromiseOrValue<string>,
        PromiseOrValue<string>,
        PromiseOrValue<string>,
        PromiseOrValue<BytesLike>
    ]): string;
    encodeFunctionData(functionFragment: "flowSchedules", values: [PromiseOrValue<BytesLike>]): string;
    encodeFunctionData(functionFragment: "getFlowSchedule", values: [
        PromiseOrValue<string>,
        PromiseOrValue<string>,
        PromiseOrValue<string>
    ]): string;
    decodeFunctionResult(functionFragment: "afterAgreementCreated", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "afterAgreementTerminated", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "afterAgreementUpdated", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "beforeAgreementCreated", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "beforeAgreementTerminated", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "beforeAgreementUpdated", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "cfaV1", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "createFlowSchedule", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "deleteFlowSchedule", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "executeCreateFlow", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "executeDeleteFlow", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "flowSchedules", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "getFlowSchedule", data: BytesLike): Result;
    events: {
        "CreateFlowExecuted(address,address,address,uint32,uint32,int96,uint256,bytes)": EventFragment;
        "DeleteFlowExecuted(address,address,address,uint32,bytes)": EventFragment;
        "FlowScheduleCreated(address,address,address,uint32,uint32,int96,uint32,uint256,bytes)": EventFragment;
        "FlowScheduleDeleted(address,address,address)": EventFragment;
    };
    getEvent(nameOrSignatureOrTopic: "CreateFlowExecuted"): EventFragment;
    getEvent(nameOrSignatureOrTopic: "DeleteFlowExecuted"): EventFragment;
    getEvent(nameOrSignatureOrTopic: "FlowScheduleCreated"): EventFragment;
    getEvent(nameOrSignatureOrTopic: "FlowScheduleDeleted"): EventFragment;
}
export interface CreateFlowExecutedEventObject {
    superToken: string;
    sender: string;
    receiver: string;
    startDate: number;
    startMaxDelay: number;
    flowRate: BigNumber;
    startAmount: BigNumber;
    userData: string;
}
export type CreateFlowExecutedEvent = TypedEvent<[
    string,
    string,
    string,
    number,
    number,
    BigNumber,
    BigNumber,
    string
], CreateFlowExecutedEventObject>;
export type CreateFlowExecutedEventFilter = TypedEventFilter<CreateFlowExecutedEvent>;
export interface DeleteFlowExecutedEventObject {
    superToken: string;
    sender: string;
    receiver: string;
    endDate: number;
    userData: string;
}
export type DeleteFlowExecutedEvent = TypedEvent<[
    string,
    string,
    string,
    number,
    string
], DeleteFlowExecutedEventObject>;
export type DeleteFlowExecutedEventFilter = TypedEventFilter<DeleteFlowExecutedEvent>;
export interface FlowScheduleCreatedEventObject {
    superToken: string;
    sender: string;
    receiver: string;
    startDate: number;
    startMaxDelay: number;
    flowRate: BigNumber;
    endDate: number;
    startAmount: BigNumber;
    userData: string;
}
export type FlowScheduleCreatedEvent = TypedEvent<[
    string,
    string,
    string,
    number,
    number,
    BigNumber,
    number,
    BigNumber,
    string
], FlowScheduleCreatedEventObject>;
export type FlowScheduleCreatedEventFilter = TypedEventFilter<FlowScheduleCreatedEvent>;
export interface FlowScheduleDeletedEventObject {
    superToken: string;
    sender: string;
    receiver: string;
}
export type FlowScheduleDeletedEvent = TypedEvent<[
    string,
    string,
    string
], FlowScheduleDeletedEventObject>;
export type FlowScheduleDeletedEventFilter = TypedEventFilter<FlowScheduleDeletedEvent>;
export interface FlowScheduler extends BaseContract {
    connect(signerOrProvider: Signer | Provider | string): this;
    attach(addressOrName: string): this;
    deployed(): Promise<this>;
    interface: FlowSchedulerInterface;
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
        createFlowSchedule(superToken: PromiseOrValue<string>, receiver: PromiseOrValue<string>, startDate: PromiseOrValue<BigNumberish>, startMaxDelay: PromiseOrValue<BigNumberish>, flowRate: PromiseOrValue<BigNumberish>, startAmount: PromiseOrValue<BigNumberish>, endDate: PromiseOrValue<BigNumberish>, userData: PromiseOrValue<BytesLike>, ctx: PromiseOrValue<BytesLike>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<ContractTransaction>;
        deleteFlowSchedule(superToken: PromiseOrValue<string>, receiver: PromiseOrValue<string>, ctx: PromiseOrValue<BytesLike>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<ContractTransaction>;
        executeCreateFlow(superToken: PromiseOrValue<string>, sender: PromiseOrValue<string>, receiver: PromiseOrValue<string>, userData: PromiseOrValue<BytesLike>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<ContractTransaction>;
        executeDeleteFlow(superToken: PromiseOrValue<string>, sender: PromiseOrValue<string>, receiver: PromiseOrValue<string>, userData: PromiseOrValue<BytesLike>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<ContractTransaction>;
        flowSchedules(arg0: PromiseOrValue<BytesLike>, overrides?: CallOverrides): Promise<[
            number,
            number,
            number,
            BigNumber,
            BigNumber,
            string
        ] & {
            startDate: number;
            startMaxDelay: number;
            endDate: number;
            flowRate: BigNumber;
            startAmount: BigNumber;
            userData: string;
        }>;
        getFlowSchedule(superToken: PromiseOrValue<string>, sender: PromiseOrValue<string>, receiver: PromiseOrValue<string>, overrides?: CallOverrides): Promise<[IFlowScheduler.FlowScheduleStructOutput]>;
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
    createFlowSchedule(superToken: PromiseOrValue<string>, receiver: PromiseOrValue<string>, startDate: PromiseOrValue<BigNumberish>, startMaxDelay: PromiseOrValue<BigNumberish>, flowRate: PromiseOrValue<BigNumberish>, startAmount: PromiseOrValue<BigNumberish>, endDate: PromiseOrValue<BigNumberish>, userData: PromiseOrValue<BytesLike>, ctx: PromiseOrValue<BytesLike>, overrides?: Overrides & {
        from?: PromiseOrValue<string>;
    }): Promise<ContractTransaction>;
    deleteFlowSchedule(superToken: PromiseOrValue<string>, receiver: PromiseOrValue<string>, ctx: PromiseOrValue<BytesLike>, overrides?: Overrides & {
        from?: PromiseOrValue<string>;
    }): Promise<ContractTransaction>;
    executeCreateFlow(superToken: PromiseOrValue<string>, sender: PromiseOrValue<string>, receiver: PromiseOrValue<string>, userData: PromiseOrValue<BytesLike>, overrides?: Overrides & {
        from?: PromiseOrValue<string>;
    }): Promise<ContractTransaction>;
    executeDeleteFlow(superToken: PromiseOrValue<string>, sender: PromiseOrValue<string>, receiver: PromiseOrValue<string>, userData: PromiseOrValue<BytesLike>, overrides?: Overrides & {
        from?: PromiseOrValue<string>;
    }): Promise<ContractTransaction>;
    flowSchedules(arg0: PromiseOrValue<BytesLike>, overrides?: CallOverrides): Promise<[
        number,
        number,
        number,
        BigNumber,
        BigNumber,
        string
    ] & {
        startDate: number;
        startMaxDelay: number;
        endDate: number;
        flowRate: BigNumber;
        startAmount: BigNumber;
        userData: string;
    }>;
    getFlowSchedule(superToken: PromiseOrValue<string>, sender: PromiseOrValue<string>, receiver: PromiseOrValue<string>, overrides?: CallOverrides): Promise<IFlowScheduler.FlowScheduleStructOutput>;
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
        createFlowSchedule(superToken: PromiseOrValue<string>, receiver: PromiseOrValue<string>, startDate: PromiseOrValue<BigNumberish>, startMaxDelay: PromiseOrValue<BigNumberish>, flowRate: PromiseOrValue<BigNumberish>, startAmount: PromiseOrValue<BigNumberish>, endDate: PromiseOrValue<BigNumberish>, userData: PromiseOrValue<BytesLike>, ctx: PromiseOrValue<BytesLike>, overrides?: CallOverrides): Promise<string>;
        deleteFlowSchedule(superToken: PromiseOrValue<string>, receiver: PromiseOrValue<string>, ctx: PromiseOrValue<BytesLike>, overrides?: CallOverrides): Promise<string>;
        executeCreateFlow(superToken: PromiseOrValue<string>, sender: PromiseOrValue<string>, receiver: PromiseOrValue<string>, userData: PromiseOrValue<BytesLike>, overrides?: CallOverrides): Promise<boolean>;
        executeDeleteFlow(superToken: PromiseOrValue<string>, sender: PromiseOrValue<string>, receiver: PromiseOrValue<string>, userData: PromiseOrValue<BytesLike>, overrides?: CallOverrides): Promise<boolean>;
        flowSchedules(arg0: PromiseOrValue<BytesLike>, overrides?: CallOverrides): Promise<[
            number,
            number,
            number,
            BigNumber,
            BigNumber,
            string
        ] & {
            startDate: number;
            startMaxDelay: number;
            endDate: number;
            flowRate: BigNumber;
            startAmount: BigNumber;
            userData: string;
        }>;
        getFlowSchedule(superToken: PromiseOrValue<string>, sender: PromiseOrValue<string>, receiver: PromiseOrValue<string>, overrides?: CallOverrides): Promise<IFlowScheduler.FlowScheduleStructOutput>;
    };
    filters: {
        "CreateFlowExecuted(address,address,address,uint32,uint32,int96,uint256,bytes)"(superToken?: PromiseOrValue<string> | null, sender?: PromiseOrValue<string> | null, receiver?: PromiseOrValue<string> | null, startDate?: null, startMaxDelay?: null, flowRate?: null, startAmount?: null, userData?: null): CreateFlowExecutedEventFilter;
        CreateFlowExecuted(superToken?: PromiseOrValue<string> | null, sender?: PromiseOrValue<string> | null, receiver?: PromiseOrValue<string> | null, startDate?: null, startMaxDelay?: null, flowRate?: null, startAmount?: null, userData?: null): CreateFlowExecutedEventFilter;
        "DeleteFlowExecuted(address,address,address,uint32,bytes)"(superToken?: PromiseOrValue<string> | null, sender?: PromiseOrValue<string> | null, receiver?: PromiseOrValue<string> | null, endDate?: null, userData?: null): DeleteFlowExecutedEventFilter;
        DeleteFlowExecuted(superToken?: PromiseOrValue<string> | null, sender?: PromiseOrValue<string> | null, receiver?: PromiseOrValue<string> | null, endDate?: null, userData?: null): DeleteFlowExecutedEventFilter;
        "FlowScheduleCreated(address,address,address,uint32,uint32,int96,uint32,uint256,bytes)"(superToken?: PromiseOrValue<string> | null, sender?: PromiseOrValue<string> | null, receiver?: PromiseOrValue<string> | null, startDate?: null, startMaxDelay?: null, flowRate?: null, endDate?: null, startAmount?: null, userData?: null): FlowScheduleCreatedEventFilter;
        FlowScheduleCreated(superToken?: PromiseOrValue<string> | null, sender?: PromiseOrValue<string> | null, receiver?: PromiseOrValue<string> | null, startDate?: null, startMaxDelay?: null, flowRate?: null, endDate?: null, startAmount?: null, userData?: null): FlowScheduleCreatedEventFilter;
        "FlowScheduleDeleted(address,address,address)"(superToken?: PromiseOrValue<string> | null, sender?: PromiseOrValue<string> | null, receiver?: PromiseOrValue<string> | null): FlowScheduleDeletedEventFilter;
        FlowScheduleDeleted(superToken?: PromiseOrValue<string> | null, sender?: PromiseOrValue<string> | null, receiver?: PromiseOrValue<string> | null): FlowScheduleDeletedEventFilter;
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
        createFlowSchedule(superToken: PromiseOrValue<string>, receiver: PromiseOrValue<string>, startDate: PromiseOrValue<BigNumberish>, startMaxDelay: PromiseOrValue<BigNumberish>, flowRate: PromiseOrValue<BigNumberish>, startAmount: PromiseOrValue<BigNumberish>, endDate: PromiseOrValue<BigNumberish>, userData: PromiseOrValue<BytesLike>, ctx: PromiseOrValue<BytesLike>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<BigNumber>;
        deleteFlowSchedule(superToken: PromiseOrValue<string>, receiver: PromiseOrValue<string>, ctx: PromiseOrValue<BytesLike>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<BigNumber>;
        executeCreateFlow(superToken: PromiseOrValue<string>, sender: PromiseOrValue<string>, receiver: PromiseOrValue<string>, userData: PromiseOrValue<BytesLike>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<BigNumber>;
        executeDeleteFlow(superToken: PromiseOrValue<string>, sender: PromiseOrValue<string>, receiver: PromiseOrValue<string>, userData: PromiseOrValue<BytesLike>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<BigNumber>;
        flowSchedules(arg0: PromiseOrValue<BytesLike>, overrides?: CallOverrides): Promise<BigNumber>;
        getFlowSchedule(superToken: PromiseOrValue<string>, sender: PromiseOrValue<string>, receiver: PromiseOrValue<string>, overrides?: CallOverrides): Promise<BigNumber>;
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
        createFlowSchedule(superToken: PromiseOrValue<string>, receiver: PromiseOrValue<string>, startDate: PromiseOrValue<BigNumberish>, startMaxDelay: PromiseOrValue<BigNumberish>, flowRate: PromiseOrValue<BigNumberish>, startAmount: PromiseOrValue<BigNumberish>, endDate: PromiseOrValue<BigNumberish>, userData: PromiseOrValue<BytesLike>, ctx: PromiseOrValue<BytesLike>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<PopulatedTransaction>;
        deleteFlowSchedule(superToken: PromiseOrValue<string>, receiver: PromiseOrValue<string>, ctx: PromiseOrValue<BytesLike>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<PopulatedTransaction>;
        executeCreateFlow(superToken: PromiseOrValue<string>, sender: PromiseOrValue<string>, receiver: PromiseOrValue<string>, userData: PromiseOrValue<BytesLike>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<PopulatedTransaction>;
        executeDeleteFlow(superToken: PromiseOrValue<string>, sender: PromiseOrValue<string>, receiver: PromiseOrValue<string>, userData: PromiseOrValue<BytesLike>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<PopulatedTransaction>;
        flowSchedules(arg0: PromiseOrValue<BytesLike>, overrides?: CallOverrides): Promise<PopulatedTransaction>;
        getFlowSchedule(superToken: PromiseOrValue<string>, sender: PromiseOrValue<string>, receiver: PromiseOrValue<string>, overrides?: CallOverrides): Promise<PopulatedTransaction>;
    };
}
