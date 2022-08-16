import type { BaseContract, BigNumber, BigNumberish, BytesLike, CallOverrides, ContractTransaction, Overrides, PopulatedTransaction, Signer, utils } from "ethers";
import type { FunctionFragment, Result, EventFragment } from "@ethersproject/abi";
import type { Listener, Provider } from "@ethersproject/providers";
import type { TypedEventFilter, TypedEvent, TypedListener, OnEvent, PromiseOrValue } from "../common";
export interface StreamSchedulerInterface extends utils.Interface {
    functions: {
        "cfaV1()": FunctionFragment;
        "createStreamOrder(address,address,uint32,uint32,int96,uint32,bytes)": FunctionFragment;
        "executeCreateStream(address,address,address,bytes)": FunctionFragment;
        "executeDeleteStream(address,address,address,bytes)": FunctionFragment;
        "streamOrders(bytes32)": FunctionFragment;
    };
    getFunction(nameOrSignatureOrTopic: "cfaV1" | "createStreamOrder" | "executeCreateStream" | "executeDeleteStream" | "streamOrders"): FunctionFragment;
    encodeFunctionData(functionFragment: "cfaV1", values?: undefined): string;
    encodeFunctionData(functionFragment: "createStreamOrder", values: [
        PromiseOrValue<string>,
        PromiseOrValue<string>,
        PromiseOrValue<BigNumberish>,
        PromiseOrValue<BigNumberish>,
        PromiseOrValue<BigNumberish>,
        PromiseOrValue<BigNumberish>,
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
    encodeFunctionData(functionFragment: "streamOrders", values: [PromiseOrValue<BytesLike>]): string;
    decodeFunctionResult(functionFragment: "cfaV1", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "createStreamOrder", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "executeCreateStream", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "executeDeleteStream", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "streamOrders", data: BytesLike): Result;
    events: {
        "CreateStreamOrder(address,address,address,uint32,uint32,int96,uint32,bytes)": EventFragment;
        "ExecuteCreateStream(address,address,address,uint32,uint32,int96,bytes)": EventFragment;
        "ExecuteDeleteStream(address,address,address,uint32,bytes)": EventFragment;
    };
    getEvent(nameOrSignatureOrTopic: "CreateStreamOrder"): EventFragment;
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
        cfaV1(overrides?: CallOverrides): Promise<[string, string] & {
            host: string;
            cfa: string;
        }>;
        createStreamOrder(receiver: PromiseOrValue<string>, superToken: PromiseOrValue<string>, startDate: PromiseOrValue<BigNumberish>, startDuration: PromiseOrValue<BigNumberish>, flowRate: PromiseOrValue<BigNumberish>, endDate: PromiseOrValue<BigNumberish>, userData: PromiseOrValue<BytesLike>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<ContractTransaction>;
        executeCreateStream(sender: PromiseOrValue<string>, receiver: PromiseOrValue<string>, superToken: PromiseOrValue<string>, userData: PromiseOrValue<BytesLike>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<ContractTransaction>;
        executeDeleteStream(sender: PromiseOrValue<string>, receiver: PromiseOrValue<string>, superToken: PromiseOrValue<string>, userData: PromiseOrValue<BytesLike>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<ContractTransaction>;
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
    cfaV1(overrides?: CallOverrides): Promise<[string, string] & {
        host: string;
        cfa: string;
    }>;
    createStreamOrder(receiver: PromiseOrValue<string>, superToken: PromiseOrValue<string>, startDate: PromiseOrValue<BigNumberish>, startDuration: PromiseOrValue<BigNumberish>, flowRate: PromiseOrValue<BigNumberish>, endDate: PromiseOrValue<BigNumberish>, userData: PromiseOrValue<BytesLike>, overrides?: Overrides & {
        from?: PromiseOrValue<string>;
    }): Promise<ContractTransaction>;
    executeCreateStream(sender: PromiseOrValue<string>, receiver: PromiseOrValue<string>, superToken: PromiseOrValue<string>, userData: PromiseOrValue<BytesLike>, overrides?: Overrides & {
        from?: PromiseOrValue<string>;
    }): Promise<ContractTransaction>;
    executeDeleteStream(sender: PromiseOrValue<string>, receiver: PromiseOrValue<string>, superToken: PromiseOrValue<string>, userData: PromiseOrValue<BytesLike>, overrides?: Overrides & {
        from?: PromiseOrValue<string>;
    }): Promise<ContractTransaction>;
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
        cfaV1(overrides?: CallOverrides): Promise<[string, string] & {
            host: string;
            cfa: string;
        }>;
        createStreamOrder(receiver: PromiseOrValue<string>, superToken: PromiseOrValue<string>, startDate: PromiseOrValue<BigNumberish>, startDuration: PromiseOrValue<BigNumberish>, flowRate: PromiseOrValue<BigNumberish>, endDate: PromiseOrValue<BigNumberish>, userData: PromiseOrValue<BytesLike>, overrides?: CallOverrides): Promise<void>;
        executeCreateStream(sender: PromiseOrValue<string>, receiver: PromiseOrValue<string>, superToken: PromiseOrValue<string>, userData: PromiseOrValue<BytesLike>, overrides?: CallOverrides): Promise<void>;
        executeDeleteStream(sender: PromiseOrValue<string>, receiver: PromiseOrValue<string>, superToken: PromiseOrValue<string>, userData: PromiseOrValue<BytesLike>, overrides?: CallOverrides): Promise<void>;
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
        "ExecuteCreateStream(address,address,address,uint32,uint32,int96,bytes)"(sender?: PromiseOrValue<string> | null, receiver?: PromiseOrValue<string> | null, superToken?: null, startDate?: null, startDuration?: null, flowRate?: null, userData?: null): ExecuteCreateStreamEventFilter;
        ExecuteCreateStream(sender?: PromiseOrValue<string> | null, receiver?: PromiseOrValue<string> | null, superToken?: null, startDate?: null, startDuration?: null, flowRate?: null, userData?: null): ExecuteCreateStreamEventFilter;
        "ExecuteDeleteStream(address,address,address,uint32,bytes)"(sender?: PromiseOrValue<string> | null, receiver?: PromiseOrValue<string> | null, superToken?: null, endDate?: null, userData?: null): ExecuteDeleteStreamEventFilter;
        ExecuteDeleteStream(sender?: PromiseOrValue<string> | null, receiver?: PromiseOrValue<string> | null, superToken?: null, endDate?: null, userData?: null): ExecuteDeleteStreamEventFilter;
    };
    estimateGas: {
        cfaV1(overrides?: CallOverrides): Promise<BigNumber>;
        createStreamOrder(receiver: PromiseOrValue<string>, superToken: PromiseOrValue<string>, startDate: PromiseOrValue<BigNumberish>, startDuration: PromiseOrValue<BigNumberish>, flowRate: PromiseOrValue<BigNumberish>, endDate: PromiseOrValue<BigNumberish>, userData: PromiseOrValue<BytesLike>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<BigNumber>;
        executeCreateStream(sender: PromiseOrValue<string>, receiver: PromiseOrValue<string>, superToken: PromiseOrValue<string>, userData: PromiseOrValue<BytesLike>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<BigNumber>;
        executeDeleteStream(sender: PromiseOrValue<string>, receiver: PromiseOrValue<string>, superToken: PromiseOrValue<string>, userData: PromiseOrValue<BytesLike>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<BigNumber>;
        streamOrders(arg0: PromiseOrValue<BytesLike>, overrides?: CallOverrides): Promise<BigNumber>;
    };
    populateTransaction: {
        cfaV1(overrides?: CallOverrides): Promise<PopulatedTransaction>;
        createStreamOrder(receiver: PromiseOrValue<string>, superToken: PromiseOrValue<string>, startDate: PromiseOrValue<BigNumberish>, startDuration: PromiseOrValue<BigNumberish>, flowRate: PromiseOrValue<BigNumberish>, endDate: PromiseOrValue<BigNumberish>, userData: PromiseOrValue<BytesLike>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<PopulatedTransaction>;
        executeCreateStream(sender: PromiseOrValue<string>, receiver: PromiseOrValue<string>, superToken: PromiseOrValue<string>, userData: PromiseOrValue<BytesLike>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<PopulatedTransaction>;
        executeDeleteStream(sender: PromiseOrValue<string>, receiver: PromiseOrValue<string>, superToken: PromiseOrValue<string>, userData: PromiseOrValue<BytesLike>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<PopulatedTransaction>;
        streamOrders(arg0: PromiseOrValue<BytesLike>, overrides?: CallOverrides): Promise<PopulatedTransaction>;
    };
}
