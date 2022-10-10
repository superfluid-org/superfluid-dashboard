import type { BaseContract, BigNumber, BigNumberish, BytesLike, CallOverrides, ContractTransaction, Overrides, PopulatedTransaction, Signer, utils } from "ethers";
import type { FunctionFragment, Result, EventFragment } from "@ethersproject/abi";
import type { Listener, Provider } from "@ethersproject/providers";
import type { TypedEventFilter, TypedEvent, TypedListener, OnEvent, PromiseOrValue } from "../common";
export declare namespace IStreamScheduler {
    type OrderStruct = {
        startDate: PromiseOrValue<BigNumberish>;
        startDuration: PromiseOrValue<BigNumberish>;
        endDate: PromiseOrValue<BigNumberish>;
        flowRate: PromiseOrValue<BigNumberish>;
        userData: PromiseOrValue<BytesLike>;
    };
    type OrderStructOutput = [
        number,
        number,
        number,
        BigNumber,
        string
    ] & {
        startDate: number;
        startDuration: number;
        endDate: number;
        flowRate: BigNumber;
        userData: string;
    };
}
export interface StreamSchedulerInterface extends utils.Interface {
    functions: {
        "afterAgreementCreated(address,address,bytes32,bytes,bytes,bytes)": FunctionFragment;
        "afterAgreementTerminated(address,address,bytes32,bytes,bytes,bytes)": FunctionFragment;
        "afterAgreementUpdated(address,address,bytes32,bytes,bytes,bytes)": FunctionFragment;
        "beforeAgreementCreated(address,address,bytes32,bytes,bytes)": FunctionFragment;
        "beforeAgreementTerminated(address,address,bytes32,bytes,bytes)": FunctionFragment;
        "beforeAgreementUpdated(address,address,bytes32,bytes,bytes)": FunctionFragment;
        "cfaV1()": FunctionFragment;
        "createStreamOrder(address,address,uint32,uint32,int96,uint32,bytes,bytes)": FunctionFragment;
        "deleteStreamOrder(address,address,bytes)": FunctionFragment;
        "executeCreateStream(address,address,address,bytes)": FunctionFragment;
        "executeDeleteStream(address,address,address,bytes)": FunctionFragment;
        "getStreamOrders(address,address,address)": FunctionFragment;
        "streamOrders(bytes32)": FunctionFragment;
    };
    getFunction(nameOrSignatureOrTopic: "afterAgreementCreated" | "afterAgreementTerminated" | "afterAgreementUpdated" | "beforeAgreementCreated" | "beforeAgreementTerminated" | "beforeAgreementUpdated" | "cfaV1" | "createStreamOrder" | "deleteStreamOrder" | "executeCreateStream" | "executeDeleteStream" | "getStreamOrders" | "streamOrders"): FunctionFragment;
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
    encodeFunctionData(functionFragment: "createStreamOrder", values: [
        PromiseOrValue<string>,
        PromiseOrValue<string>,
        PromiseOrValue<BigNumberish>,
        PromiseOrValue<BigNumberish>,
        PromiseOrValue<BigNumberish>,
        PromiseOrValue<BigNumberish>,
        PromiseOrValue<BytesLike>,
        PromiseOrValue<BytesLike>
    ]): string;
    encodeFunctionData(functionFragment: "deleteStreamOrder", values: [
        PromiseOrValue<string>,
        PromiseOrValue<string>,
        PromiseOrValue<BytesLike>
    ]): string;
    encodeFunctionData(functionFragment: "executeCreateStream", values: [
        PromiseOrValue<string>,
        PromiseOrValue<string>,
        PromiseOrValue<string>,
        PromiseOrValue<BytesLike>
    ]): string;
    encodeFunctionData(functionFragment: "executeDeleteStream", values: [
        PromiseOrValue<string>,
        PromiseOrValue<string>,
        PromiseOrValue<string>,
        PromiseOrValue<BytesLike>
    ]): string;
    encodeFunctionData(functionFragment: "getStreamOrders", values: [
        PromiseOrValue<string>,
        PromiseOrValue<string>,
        PromiseOrValue<string>
    ]): string;
    encodeFunctionData(functionFragment: "streamOrders", values: [PromiseOrValue<BytesLike>]): string;
    decodeFunctionResult(functionFragment: "afterAgreementCreated", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "afterAgreementTerminated", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "afterAgreementUpdated", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "beforeAgreementCreated", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "beforeAgreementTerminated", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "beforeAgreementUpdated", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "cfaV1", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "createStreamOrder", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "deleteStreamOrder", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "executeCreateStream", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "executeDeleteStream", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "getStreamOrders", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "streamOrders", data: BytesLike): Result;
    events: {
        "CreateStreamOrder(address,address,address,uint32,uint32,int96,uint32,bytes)": EventFragment;
        "DeleteStreamOrder(address,address,address)": EventFragment;
        "ExecuteCreateStream(address,address,address,uint32,uint32,int96,bytes)": EventFragment;
        "ExecuteDeleteStream(address,address,address,uint32,bytes)": EventFragment;
    };
    getEvent(nameOrSignatureOrTopic: "CreateStreamOrder"): EventFragment;
    getEvent(nameOrSignatureOrTopic: "DeleteStreamOrder"): EventFragment;
    getEvent(nameOrSignatureOrTopic: "ExecuteCreateStream"): EventFragment;
    getEvent(nameOrSignatureOrTopic: "ExecuteDeleteStream"): EventFragment;
}
export interface CreateStreamOrderEventObject {
    sender: string;
    receiver: string;
    superToken: string;
    startDate: number;
    startDuration: number;
    flowRate: BigNumber;
    endDate: number;
    userData: string;
}
export declare type CreateStreamOrderEvent = TypedEvent<[
    string,
    string,
    string,
    number,
    number,
    BigNumber,
    number,
    string
], CreateStreamOrderEventObject>;
export declare type CreateStreamOrderEventFilter = TypedEventFilter<CreateStreamOrderEvent>;
export interface DeleteStreamOrderEventObject {
    sender: string;
    receiver: string;
    superToken: string;
}
export declare type DeleteStreamOrderEvent = TypedEvent<[
    string,
    string,
    string
], DeleteStreamOrderEventObject>;
export declare type DeleteStreamOrderEventFilter = TypedEventFilter<DeleteStreamOrderEvent>;
export interface ExecuteCreateStreamEventObject {
    sender: string;
    receiver: string;
    superToken: string;
    startDate: number;
    startDuration: number;
    flowRate: BigNumber;
    userData: string;
}
export declare type ExecuteCreateStreamEvent = TypedEvent<[
    string,
    string,
    string,
    number,
    number,
    BigNumber,
    string
], ExecuteCreateStreamEventObject>;
export declare type ExecuteCreateStreamEventFilter = TypedEventFilter<ExecuteCreateStreamEvent>;
export interface ExecuteDeleteStreamEventObject {
    sender: string;
    receiver: string;
    superToken: string;
    endDate: number;
    userData: string;
}
export declare type ExecuteDeleteStreamEvent = TypedEvent<[
    string,
    string,
    string,
    number,
    string
], ExecuteDeleteStreamEventObject>;
export declare type ExecuteDeleteStreamEventFilter = TypedEventFilter<ExecuteDeleteStreamEvent>;
export interface StreamScheduler extends BaseContract {
    connect(signerOrProvider: Signer | Provider | string): this;
    attach(addressOrName: string): this;
    deployed(): Promise<this>;
    interface: StreamSchedulerInterface;
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
        createStreamOrder(receiver: PromiseOrValue<string>, superToken: PromiseOrValue<string>, startDate: PromiseOrValue<BigNumberish>, startDuration: PromiseOrValue<BigNumberish>, flowRate: PromiseOrValue<BigNumberish>, endDate: PromiseOrValue<BigNumberish>, userData: PromiseOrValue<BytesLike>, ctx: PromiseOrValue<BytesLike>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<ContractTransaction>;
        deleteStreamOrder(receiver: PromiseOrValue<string>, superToken: PromiseOrValue<string>, ctx: PromiseOrValue<BytesLike>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<ContractTransaction>;
        executeCreateStream(sender: PromiseOrValue<string>, receiver: PromiseOrValue<string>, superToken: PromiseOrValue<string>, userData: PromiseOrValue<BytesLike>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<ContractTransaction>;
        executeDeleteStream(sender: PromiseOrValue<string>, receiver: PromiseOrValue<string>, superToken: PromiseOrValue<string>, userData: PromiseOrValue<BytesLike>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<ContractTransaction>;
        getStreamOrders(sender: PromiseOrValue<string>, receiver: PromiseOrValue<string>, supertoken: PromiseOrValue<string>, overrides?: CallOverrides): Promise<[IStreamScheduler.OrderStructOutput]>;
        streamOrders(arg0: PromiseOrValue<BytesLike>, overrides?: CallOverrides): Promise<[
            number,
            number,
            number,
            BigNumber,
            string
        ] & {
            startDate: number;
            startDuration: number;
            endDate: number;
            flowRate: BigNumber;
            userData: string;
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
    createStreamOrder(receiver: PromiseOrValue<string>, superToken: PromiseOrValue<string>, startDate: PromiseOrValue<BigNumberish>, startDuration: PromiseOrValue<BigNumberish>, flowRate: PromiseOrValue<BigNumberish>, endDate: PromiseOrValue<BigNumberish>, userData: PromiseOrValue<BytesLike>, ctx: PromiseOrValue<BytesLike>, overrides?: Overrides & {
        from?: PromiseOrValue<string>;
    }): Promise<ContractTransaction>;
    deleteStreamOrder(receiver: PromiseOrValue<string>, superToken: PromiseOrValue<string>, ctx: PromiseOrValue<BytesLike>, overrides?: Overrides & {
        from?: PromiseOrValue<string>;
    }): Promise<ContractTransaction>;
    executeCreateStream(sender: PromiseOrValue<string>, receiver: PromiseOrValue<string>, superToken: PromiseOrValue<string>, userData: PromiseOrValue<BytesLike>, overrides?: Overrides & {
        from?: PromiseOrValue<string>;
    }): Promise<ContractTransaction>;
    executeDeleteStream(sender: PromiseOrValue<string>, receiver: PromiseOrValue<string>, superToken: PromiseOrValue<string>, userData: PromiseOrValue<BytesLike>, overrides?: Overrides & {
        from?: PromiseOrValue<string>;
    }): Promise<ContractTransaction>;
    getStreamOrders(sender: PromiseOrValue<string>, receiver: PromiseOrValue<string>, supertoken: PromiseOrValue<string>, overrides?: CallOverrides): Promise<IStreamScheduler.OrderStructOutput>;
    streamOrders(arg0: PromiseOrValue<BytesLike>, overrides?: CallOverrides): Promise<[
        number,
        number,
        number,
        BigNumber,
        string
    ] & {
        startDate: number;
        startDuration: number;
        endDate: number;
        flowRate: BigNumber;
        userData: string;
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
        createStreamOrder(receiver: PromiseOrValue<string>, superToken: PromiseOrValue<string>, startDate: PromiseOrValue<BigNumberish>, startDuration: PromiseOrValue<BigNumberish>, flowRate: PromiseOrValue<BigNumberish>, endDate: PromiseOrValue<BigNumberish>, userData: PromiseOrValue<BytesLike>, ctx: PromiseOrValue<BytesLike>, overrides?: CallOverrides): Promise<string>;
        deleteStreamOrder(receiver: PromiseOrValue<string>, superToken: PromiseOrValue<string>, ctx: PromiseOrValue<BytesLike>, overrides?: CallOverrides): Promise<string>;
        executeCreateStream(sender: PromiseOrValue<string>, receiver: PromiseOrValue<string>, superToken: PromiseOrValue<string>, userData: PromiseOrValue<BytesLike>, overrides?: CallOverrides): Promise<void>;
        executeDeleteStream(sender: PromiseOrValue<string>, receiver: PromiseOrValue<string>, superToken: PromiseOrValue<string>, userData: PromiseOrValue<BytesLike>, overrides?: CallOverrides): Promise<void>;
        getStreamOrders(sender: PromiseOrValue<string>, receiver: PromiseOrValue<string>, supertoken: PromiseOrValue<string>, overrides?: CallOverrides): Promise<IStreamScheduler.OrderStructOutput>;
        streamOrders(arg0: PromiseOrValue<BytesLike>, overrides?: CallOverrides): Promise<[
            number,
            number,
            number,
            BigNumber,
            string
        ] & {
            startDate: number;
            startDuration: number;
            endDate: number;
            flowRate: BigNumber;
            userData: string;
        }>;
    };
    filters: {
        "CreateStreamOrder(address,address,address,uint32,uint32,int96,uint32,bytes)"(sender?: PromiseOrValue<string> | null, receiver?: PromiseOrValue<string> | null, superToken?: PromiseOrValue<string> | null, startDate?: null, startDuration?: null, flowRate?: null, endDate?: null, userData?: null): CreateStreamOrderEventFilter;
        CreateStreamOrder(sender?: PromiseOrValue<string> | null, receiver?: PromiseOrValue<string> | null, superToken?: PromiseOrValue<string> | null, startDate?: null, startDuration?: null, flowRate?: null, endDate?: null, userData?: null): CreateStreamOrderEventFilter;
        "DeleteStreamOrder(address,address,address)"(sender?: PromiseOrValue<string> | null, receiver?: PromiseOrValue<string> | null, superToken?: PromiseOrValue<string> | null): DeleteStreamOrderEventFilter;
        DeleteStreamOrder(sender?: PromiseOrValue<string> | null, receiver?: PromiseOrValue<string> | null, superToken?: PromiseOrValue<string> | null): DeleteStreamOrderEventFilter;
        "ExecuteCreateStream(address,address,address,uint32,uint32,int96,bytes)"(sender?: PromiseOrValue<string> | null, receiver?: PromiseOrValue<string> | null, superToken?: null, startDate?: null, startDuration?: null, flowRate?: null, userData?: null): ExecuteCreateStreamEventFilter;
        ExecuteCreateStream(sender?: PromiseOrValue<string> | null, receiver?: PromiseOrValue<string> | null, superToken?: null, startDate?: null, startDuration?: null, flowRate?: null, userData?: null): ExecuteCreateStreamEventFilter;
        "ExecuteDeleteStream(address,address,address,uint32,bytes)"(sender?: PromiseOrValue<string> | null, receiver?: PromiseOrValue<string> | null, superToken?: null, endDate?: null, userData?: null): ExecuteDeleteStreamEventFilter;
        ExecuteDeleteStream(sender?: PromiseOrValue<string> | null, receiver?: PromiseOrValue<string> | null, superToken?: null, endDate?: null, userData?: null): ExecuteDeleteStreamEventFilter;
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
        createStreamOrder(receiver: PromiseOrValue<string>, superToken: PromiseOrValue<string>, startDate: PromiseOrValue<BigNumberish>, startDuration: PromiseOrValue<BigNumberish>, flowRate: PromiseOrValue<BigNumberish>, endDate: PromiseOrValue<BigNumberish>, userData: PromiseOrValue<BytesLike>, ctx: PromiseOrValue<BytesLike>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<BigNumber>;
        deleteStreamOrder(receiver: PromiseOrValue<string>, superToken: PromiseOrValue<string>, ctx: PromiseOrValue<BytesLike>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<BigNumber>;
        executeCreateStream(sender: PromiseOrValue<string>, receiver: PromiseOrValue<string>, superToken: PromiseOrValue<string>, userData: PromiseOrValue<BytesLike>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<BigNumber>;
        executeDeleteStream(sender: PromiseOrValue<string>, receiver: PromiseOrValue<string>, superToken: PromiseOrValue<string>, userData: PromiseOrValue<BytesLike>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<BigNumber>;
        getStreamOrders(sender: PromiseOrValue<string>, receiver: PromiseOrValue<string>, supertoken: PromiseOrValue<string>, overrides?: CallOverrides): Promise<BigNumber>;
        streamOrders(arg0: PromiseOrValue<BytesLike>, overrides?: CallOverrides): Promise<BigNumber>;
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
        createStreamOrder(receiver: PromiseOrValue<string>, superToken: PromiseOrValue<string>, startDate: PromiseOrValue<BigNumberish>, startDuration: PromiseOrValue<BigNumberish>, flowRate: PromiseOrValue<BigNumberish>, endDate: PromiseOrValue<BigNumberish>, userData: PromiseOrValue<BytesLike>, ctx: PromiseOrValue<BytesLike>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<PopulatedTransaction>;
        deleteStreamOrder(receiver: PromiseOrValue<string>, superToken: PromiseOrValue<string>, ctx: PromiseOrValue<BytesLike>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<PopulatedTransaction>;
        executeCreateStream(sender: PromiseOrValue<string>, receiver: PromiseOrValue<string>, superToken: PromiseOrValue<string>, userData: PromiseOrValue<BytesLike>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<PopulatedTransaction>;
        executeDeleteStream(sender: PromiseOrValue<string>, receiver: PromiseOrValue<string>, superToken: PromiseOrValue<string>, userData: PromiseOrValue<BytesLike>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<PopulatedTransaction>;
        getStreamOrders(sender: PromiseOrValue<string>, receiver: PromiseOrValue<string>, supertoken: PromiseOrValue<string>, overrides?: CallOverrides): Promise<PopulatedTransaction>;
        streamOrders(arg0: PromiseOrValue<BytesLike>, overrides?: CallOverrides): Promise<PopulatedTransaction>;
    };
}
