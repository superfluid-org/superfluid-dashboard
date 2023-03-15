import type { BaseContract, BigNumber, BigNumberish, BytesLike, CallOverrides, ContractTransaction, Overrides, PopulatedTransaction, Signer, utils } from "ethers";
import type { FunctionFragment, Result, EventFragment } from "@ethersproject/abi";
import type { Listener, Provider } from "@ethersproject/providers";
import type { TypedEventFilter, TypedEvent, TypedListener, OnEvent, PromiseOrValue } from "../common";
export declare namespace IManager {
    type WrapScheduleStruct = {
        user: PromiseOrValue<string>;
        superToken: PromiseOrValue<string>;
        strategy: PromiseOrValue<string>;
        liquidityToken: PromiseOrValue<string>;
        expiry: PromiseOrValue<BigNumberish>;
        lowerLimit: PromiseOrValue<BigNumberish>;
        upperLimit: PromiseOrValue<BigNumberish>;
    };
    type WrapScheduleStructOutput = [
        string,
        string,
        string,
        string,
        BigNumber,
        BigNumber,
        BigNumber
    ] & {
        user: string;
        superToken: string;
        strategy: string;
        liquidityToken: string;
        expiry: BigNumber;
        lowerLimit: BigNumber;
        upperLimit: BigNumber;
    };
}
export interface AutoWrapManagerInterface extends utils.Interface {
    functions: {
        "addApprovedStrategy(address)": FunctionFragment;
        "approvedStrategies(address)": FunctionFragment;
        "cfaV1()": FunctionFragment;
        "checkWrap(address,address,address)": FunctionFragment;
        "checkWrapByIndex(bytes32)": FunctionFragment;
        "createWrapSchedule(address,address,address,uint64,uint64,uint64)": FunctionFragment;
        "deleteWrapSchedule(address,address,address)": FunctionFragment;
        "deleteWrapScheduleByIndex(bytes32)": FunctionFragment;
        "executeWrap(address,address,address)": FunctionFragment;
        "executeWrapByIndex(bytes32)": FunctionFragment;
        "getWrapSchedule(address,address,address)": FunctionFragment;
        "getWrapScheduleByIndex(bytes32)": FunctionFragment;
        "getWrapScheduleIndex(address,address,address)": FunctionFragment;
        "minLower()": FunctionFragment;
        "minUpper()": FunctionFragment;
        "owner()": FunctionFragment;
        "removeApprovedStrategy(address)": FunctionFragment;
        "renounceOwnership()": FunctionFragment;
        "setLimits(uint64,uint64)": FunctionFragment;
        "transferOwnership(address)": FunctionFragment;
    };
    getFunction(nameOrSignatureOrTopic: "addApprovedStrategy" | "approvedStrategies" | "cfaV1" | "checkWrap" | "checkWrapByIndex" | "createWrapSchedule" | "deleteWrapSchedule" | "deleteWrapScheduleByIndex" | "executeWrap" | "executeWrapByIndex" | "getWrapSchedule" | "getWrapScheduleByIndex" | "getWrapScheduleIndex" | "minLower" | "minUpper" | "owner" | "removeApprovedStrategy" | "renounceOwnership" | "setLimits" | "transferOwnership"): FunctionFragment;
    encodeFunctionData(functionFragment: "addApprovedStrategy", values: [PromiseOrValue<string>]): string;
    encodeFunctionData(functionFragment: "approvedStrategies", values: [PromiseOrValue<string>]): string;
    encodeFunctionData(functionFragment: "cfaV1", values?: undefined): string;
    encodeFunctionData(functionFragment: "checkWrap", values: [
        PromiseOrValue<string>,
        PromiseOrValue<string>,
        PromiseOrValue<string>
    ]): string;
    encodeFunctionData(functionFragment: "checkWrapByIndex", values: [PromiseOrValue<BytesLike>]): string;
    encodeFunctionData(functionFragment: "createWrapSchedule", values: [
        PromiseOrValue<string>,
        PromiseOrValue<string>,
        PromiseOrValue<string>,
        PromiseOrValue<BigNumberish>,
        PromiseOrValue<BigNumberish>,
        PromiseOrValue<BigNumberish>
    ]): string;
    encodeFunctionData(functionFragment: "deleteWrapSchedule", values: [
        PromiseOrValue<string>,
        PromiseOrValue<string>,
        PromiseOrValue<string>
    ]): string;
    encodeFunctionData(functionFragment: "deleteWrapScheduleByIndex", values: [PromiseOrValue<BytesLike>]): string;
    encodeFunctionData(functionFragment: "executeWrap", values: [
        PromiseOrValue<string>,
        PromiseOrValue<string>,
        PromiseOrValue<string>
    ]): string;
    encodeFunctionData(functionFragment: "executeWrapByIndex", values: [PromiseOrValue<BytesLike>]): string;
    encodeFunctionData(functionFragment: "getWrapSchedule", values: [
        PromiseOrValue<string>,
        PromiseOrValue<string>,
        PromiseOrValue<string>
    ]): string;
    encodeFunctionData(functionFragment: "getWrapScheduleByIndex", values: [PromiseOrValue<BytesLike>]): string;
    encodeFunctionData(functionFragment: "getWrapScheduleIndex", values: [
        PromiseOrValue<string>,
        PromiseOrValue<string>,
        PromiseOrValue<string>
    ]): string;
    encodeFunctionData(functionFragment: "minLower", values?: undefined): string;
    encodeFunctionData(functionFragment: "minUpper", values?: undefined): string;
    encodeFunctionData(functionFragment: "owner", values?: undefined): string;
    encodeFunctionData(functionFragment: "removeApprovedStrategy", values: [PromiseOrValue<string>]): string;
    encodeFunctionData(functionFragment: "renounceOwnership", values?: undefined): string;
    encodeFunctionData(functionFragment: "setLimits", values: [PromiseOrValue<BigNumberish>, PromiseOrValue<BigNumberish>]): string;
    encodeFunctionData(functionFragment: "transferOwnership", values: [PromiseOrValue<string>]): string;
    decodeFunctionResult(functionFragment: "addApprovedStrategy", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "approvedStrategies", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "cfaV1", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "checkWrap", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "checkWrapByIndex", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "createWrapSchedule", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "deleteWrapSchedule", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "deleteWrapScheduleByIndex", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "executeWrap", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "executeWrapByIndex", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "getWrapSchedule", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "getWrapScheduleByIndex", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "getWrapScheduleIndex", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "minLower", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "minUpper", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "owner", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "removeApprovedStrategy", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "renounceOwnership", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "setLimits", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "transferOwnership", data: BytesLike): Result;
    events: {
        "AddedApprovedStrategy(address)": EventFragment;
        "LimitsChanged(uint64,uint64)": EventFragment;
        "OwnershipTransferred(address,address)": EventFragment;
        "RemovedApprovedStrategy(address)": EventFragment;
        "WrapExecuted(bytes32,uint256)": EventFragment;
        "WrapScheduleCreated(bytes32,address,address,address,address,uint256,uint256,uint256)": EventFragment;
        "WrapScheduleDeleted(bytes32,address,address,address,address)": EventFragment;
    };
    getEvent(nameOrSignatureOrTopic: "AddedApprovedStrategy"): EventFragment;
    getEvent(nameOrSignatureOrTopic: "LimitsChanged"): EventFragment;
    getEvent(nameOrSignatureOrTopic: "OwnershipTransferred"): EventFragment;
    getEvent(nameOrSignatureOrTopic: "RemovedApprovedStrategy"): EventFragment;
    getEvent(nameOrSignatureOrTopic: "WrapExecuted"): EventFragment;
    getEvent(nameOrSignatureOrTopic: "WrapScheduleCreated"): EventFragment;
    getEvent(nameOrSignatureOrTopic: "WrapScheduleDeleted"): EventFragment;
}
export interface AddedApprovedStrategyEventObject {
    strategy: string;
}
export type AddedApprovedStrategyEvent = TypedEvent<[
    string
], AddedApprovedStrategyEventObject>;
export type AddedApprovedStrategyEventFilter = TypedEventFilter<AddedApprovedStrategyEvent>;
export interface LimitsChangedEventObject {
    lowerLimit: BigNumber;
    upperLimit: BigNumber;
}
export type LimitsChangedEvent = TypedEvent<[
    BigNumber,
    BigNumber
], LimitsChangedEventObject>;
export type LimitsChangedEventFilter = TypedEventFilter<LimitsChangedEvent>;
export interface OwnershipTransferredEventObject {
    previousOwner: string;
    newOwner: string;
}
export type OwnershipTransferredEvent = TypedEvent<[
    string,
    string
], OwnershipTransferredEventObject>;
export type OwnershipTransferredEventFilter = TypedEventFilter<OwnershipTransferredEvent>;
export interface RemovedApprovedStrategyEventObject {
    strategy: string;
}
export type RemovedApprovedStrategyEvent = TypedEvent<[
    string
], RemovedApprovedStrategyEventObject>;
export type RemovedApprovedStrategyEventFilter = TypedEventFilter<RemovedApprovedStrategyEvent>;
export interface WrapExecutedEventObject {
    id: string;
    wrapAmount: BigNumber;
}
export type WrapExecutedEvent = TypedEvent<[
    string,
    BigNumber
], WrapExecutedEventObject>;
export type WrapExecutedEventFilter = TypedEventFilter<WrapExecutedEvent>;
export interface WrapScheduleCreatedEventObject {
    id: string;
    user: string;
    superToken: string;
    strategy: string;
    liquidityToken: string;
    expiry: BigNumber;
    lowerLimit: BigNumber;
    upperLimit: BigNumber;
}
export type WrapScheduleCreatedEvent = TypedEvent<[
    string,
    string,
    string,
    string,
    string,
    BigNumber,
    BigNumber,
    BigNumber
], WrapScheduleCreatedEventObject>;
export type WrapScheduleCreatedEventFilter = TypedEventFilter<WrapScheduleCreatedEvent>;
export interface WrapScheduleDeletedEventObject {
    id: string;
    user: string;
    superToken: string;
    strategy: string;
    liquidityToken: string;
}
export type WrapScheduleDeletedEvent = TypedEvent<[
    string,
    string,
    string,
    string,
    string
], WrapScheduleDeletedEventObject>;
export type WrapScheduleDeletedEventFilter = TypedEventFilter<WrapScheduleDeletedEvent>;
export interface AutoWrapManager extends BaseContract {
    connect(signerOrProvider: Signer | Provider | string): this;
    attach(addressOrName: string): this;
    deployed(): Promise<this>;
    interface: AutoWrapManagerInterface;
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
        addApprovedStrategy(strategy: PromiseOrValue<string>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<ContractTransaction>;
        approvedStrategies(arg0: PromiseOrValue<string>, overrides?: CallOverrides): Promise<[boolean]>;
        cfaV1(overrides?: CallOverrides): Promise<[string]>;
        checkWrap(user: PromiseOrValue<string>, superToken: PromiseOrValue<string>, liquidityToken: PromiseOrValue<string>, overrides?: CallOverrides): Promise<[BigNumber]>;
        checkWrapByIndex(index: PromiseOrValue<BytesLike>, overrides?: CallOverrides): Promise<[BigNumber] & {
            amount: BigNumber;
        }>;
        createWrapSchedule(superToken: PromiseOrValue<string>, strategy: PromiseOrValue<string>, liquidityToken: PromiseOrValue<string>, expiry: PromiseOrValue<BigNumberish>, lowerLimit: PromiseOrValue<BigNumberish>, upperLimit: PromiseOrValue<BigNumberish>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<ContractTransaction>;
        deleteWrapSchedule(user: PromiseOrValue<string>, superToken: PromiseOrValue<string>, liquidityToken: PromiseOrValue<string>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<ContractTransaction>;
        deleteWrapScheduleByIndex(index: PromiseOrValue<BytesLike>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<ContractTransaction>;
        executeWrap(user: PromiseOrValue<string>, superToken: PromiseOrValue<string>, liquidityToken: PromiseOrValue<string>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<ContractTransaction>;
        executeWrapByIndex(index: PromiseOrValue<BytesLike>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<ContractTransaction>;
        getWrapSchedule(user: PromiseOrValue<string>, superToken: PromiseOrValue<string>, liquidityToken: PromiseOrValue<string>, overrides?: CallOverrides): Promise<[IManager.WrapScheduleStructOutput]>;
        getWrapScheduleByIndex(index: PromiseOrValue<BytesLike>, overrides?: CallOverrides): Promise<[IManager.WrapScheduleStructOutput]>;
        getWrapScheduleIndex(user: PromiseOrValue<string>, superToken: PromiseOrValue<string>, liquidityToken: PromiseOrValue<string>, overrides?: CallOverrides): Promise<[string]>;
        minLower(overrides?: CallOverrides): Promise<[BigNumber]>;
        minUpper(overrides?: CallOverrides): Promise<[BigNumber]>;
        owner(overrides?: CallOverrides): Promise<[string]>;
        removeApprovedStrategy(strategy: PromiseOrValue<string>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<ContractTransaction>;
        renounceOwnership(overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<ContractTransaction>;
        setLimits(lowerLimit: PromiseOrValue<BigNumberish>, upperLimit: PromiseOrValue<BigNumberish>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<ContractTransaction>;
        transferOwnership(newOwner: PromiseOrValue<string>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<ContractTransaction>;
    };
    addApprovedStrategy(strategy: PromiseOrValue<string>, overrides?: Overrides & {
        from?: PromiseOrValue<string>;
    }): Promise<ContractTransaction>;
    approvedStrategies(arg0: PromiseOrValue<string>, overrides?: CallOverrides): Promise<boolean>;
    cfaV1(overrides?: CallOverrides): Promise<string>;
    checkWrap(user: PromiseOrValue<string>, superToken: PromiseOrValue<string>, liquidityToken: PromiseOrValue<string>, overrides?: CallOverrides): Promise<BigNumber>;
    checkWrapByIndex(index: PromiseOrValue<BytesLike>, overrides?: CallOverrides): Promise<BigNumber>;
    createWrapSchedule(superToken: PromiseOrValue<string>, strategy: PromiseOrValue<string>, liquidityToken: PromiseOrValue<string>, expiry: PromiseOrValue<BigNumberish>, lowerLimit: PromiseOrValue<BigNumberish>, upperLimit: PromiseOrValue<BigNumberish>, overrides?: Overrides & {
        from?: PromiseOrValue<string>;
    }): Promise<ContractTransaction>;
    deleteWrapSchedule(user: PromiseOrValue<string>, superToken: PromiseOrValue<string>, liquidityToken: PromiseOrValue<string>, overrides?: Overrides & {
        from?: PromiseOrValue<string>;
    }): Promise<ContractTransaction>;
    deleteWrapScheduleByIndex(index: PromiseOrValue<BytesLike>, overrides?: Overrides & {
        from?: PromiseOrValue<string>;
    }): Promise<ContractTransaction>;
    executeWrap(user: PromiseOrValue<string>, superToken: PromiseOrValue<string>, liquidityToken: PromiseOrValue<string>, overrides?: Overrides & {
        from?: PromiseOrValue<string>;
    }): Promise<ContractTransaction>;
    executeWrapByIndex(index: PromiseOrValue<BytesLike>, overrides?: Overrides & {
        from?: PromiseOrValue<string>;
    }): Promise<ContractTransaction>;
    getWrapSchedule(user: PromiseOrValue<string>, superToken: PromiseOrValue<string>, liquidityToken: PromiseOrValue<string>, overrides?: CallOverrides): Promise<IManager.WrapScheduleStructOutput>;
    getWrapScheduleByIndex(index: PromiseOrValue<BytesLike>, overrides?: CallOverrides): Promise<IManager.WrapScheduleStructOutput>;
    getWrapScheduleIndex(user: PromiseOrValue<string>, superToken: PromiseOrValue<string>, liquidityToken: PromiseOrValue<string>, overrides?: CallOverrides): Promise<string>;
    minLower(overrides?: CallOverrides): Promise<BigNumber>;
    minUpper(overrides?: CallOverrides): Promise<BigNumber>;
    owner(overrides?: CallOverrides): Promise<string>;
    removeApprovedStrategy(strategy: PromiseOrValue<string>, overrides?: Overrides & {
        from?: PromiseOrValue<string>;
    }): Promise<ContractTransaction>;
    renounceOwnership(overrides?: Overrides & {
        from?: PromiseOrValue<string>;
    }): Promise<ContractTransaction>;
    setLimits(lowerLimit: PromiseOrValue<BigNumberish>, upperLimit: PromiseOrValue<BigNumberish>, overrides?: Overrides & {
        from?: PromiseOrValue<string>;
    }): Promise<ContractTransaction>;
    transferOwnership(newOwner: PromiseOrValue<string>, overrides?: Overrides & {
        from?: PromiseOrValue<string>;
    }): Promise<ContractTransaction>;
    callStatic: {
        addApprovedStrategy(strategy: PromiseOrValue<string>, overrides?: CallOverrides): Promise<void>;
        approvedStrategies(arg0: PromiseOrValue<string>, overrides?: CallOverrides): Promise<boolean>;
        cfaV1(overrides?: CallOverrides): Promise<string>;
        checkWrap(user: PromiseOrValue<string>, superToken: PromiseOrValue<string>, liquidityToken: PromiseOrValue<string>, overrides?: CallOverrides): Promise<BigNumber>;
        checkWrapByIndex(index: PromiseOrValue<BytesLike>, overrides?: CallOverrides): Promise<BigNumber>;
        createWrapSchedule(superToken: PromiseOrValue<string>, strategy: PromiseOrValue<string>, liquidityToken: PromiseOrValue<string>, expiry: PromiseOrValue<BigNumberish>, lowerLimit: PromiseOrValue<BigNumberish>, upperLimit: PromiseOrValue<BigNumberish>, overrides?: CallOverrides): Promise<void>;
        deleteWrapSchedule(user: PromiseOrValue<string>, superToken: PromiseOrValue<string>, liquidityToken: PromiseOrValue<string>, overrides?: CallOverrides): Promise<void>;
        deleteWrapScheduleByIndex(index: PromiseOrValue<BytesLike>, overrides?: CallOverrides): Promise<void>;
        executeWrap(user: PromiseOrValue<string>, superToken: PromiseOrValue<string>, liquidityToken: PromiseOrValue<string>, overrides?: CallOverrides): Promise<void>;
        executeWrapByIndex(index: PromiseOrValue<BytesLike>, overrides?: CallOverrides): Promise<void>;
        getWrapSchedule(user: PromiseOrValue<string>, superToken: PromiseOrValue<string>, liquidityToken: PromiseOrValue<string>, overrides?: CallOverrides): Promise<IManager.WrapScheduleStructOutput>;
        getWrapScheduleByIndex(index: PromiseOrValue<BytesLike>, overrides?: CallOverrides): Promise<IManager.WrapScheduleStructOutput>;
        getWrapScheduleIndex(user: PromiseOrValue<string>, superToken: PromiseOrValue<string>, liquidityToken: PromiseOrValue<string>, overrides?: CallOverrides): Promise<string>;
        minLower(overrides?: CallOverrides): Promise<BigNumber>;
        minUpper(overrides?: CallOverrides): Promise<BigNumber>;
        owner(overrides?: CallOverrides): Promise<string>;
        removeApprovedStrategy(strategy: PromiseOrValue<string>, overrides?: CallOverrides): Promise<void>;
        renounceOwnership(overrides?: CallOverrides): Promise<void>;
        setLimits(lowerLimit: PromiseOrValue<BigNumberish>, upperLimit: PromiseOrValue<BigNumberish>, overrides?: CallOverrides): Promise<void>;
        transferOwnership(newOwner: PromiseOrValue<string>, overrides?: CallOverrides): Promise<void>;
    };
    filters: {
        "AddedApprovedStrategy(address)"(strategy?: PromiseOrValue<string> | null): AddedApprovedStrategyEventFilter;
        AddedApprovedStrategy(strategy?: PromiseOrValue<string> | null): AddedApprovedStrategyEventFilter;
        "LimitsChanged(uint64,uint64)"(lowerLimit?: null, upperLimit?: null): LimitsChangedEventFilter;
        LimitsChanged(lowerLimit?: null, upperLimit?: null): LimitsChangedEventFilter;
        "OwnershipTransferred(address,address)"(previousOwner?: PromiseOrValue<string> | null, newOwner?: PromiseOrValue<string> | null): OwnershipTransferredEventFilter;
        OwnershipTransferred(previousOwner?: PromiseOrValue<string> | null, newOwner?: PromiseOrValue<string> | null): OwnershipTransferredEventFilter;
        "RemovedApprovedStrategy(address)"(strategy?: PromiseOrValue<string> | null): RemovedApprovedStrategyEventFilter;
        RemovedApprovedStrategy(strategy?: PromiseOrValue<string> | null): RemovedApprovedStrategyEventFilter;
        "WrapExecuted(bytes32,uint256)"(id?: PromiseOrValue<BytesLike> | null, wrapAmount?: null): WrapExecutedEventFilter;
        WrapExecuted(id?: PromiseOrValue<BytesLike> | null, wrapAmount?: null): WrapExecutedEventFilter;
        "WrapScheduleCreated(bytes32,address,address,address,address,uint256,uint256,uint256)"(id?: PromiseOrValue<BytesLike> | null, user?: PromiseOrValue<string> | null, superToken?: PromiseOrValue<string> | null, strategy?: null, liquidityToken?: null, expiry?: null, lowerLimit?: null, upperLimit?: null): WrapScheduleCreatedEventFilter;
        WrapScheduleCreated(id?: PromiseOrValue<BytesLike> | null, user?: PromiseOrValue<string> | null, superToken?: PromiseOrValue<string> | null, strategy?: null, liquidityToken?: null, expiry?: null, lowerLimit?: null, upperLimit?: null): WrapScheduleCreatedEventFilter;
        "WrapScheduleDeleted(bytes32,address,address,address,address)"(id?: PromiseOrValue<BytesLike> | null, user?: PromiseOrValue<string> | null, superToken?: PromiseOrValue<string> | null, strategy?: null, liquidityToken?: null): WrapScheduleDeletedEventFilter;
        WrapScheduleDeleted(id?: PromiseOrValue<BytesLike> | null, user?: PromiseOrValue<string> | null, superToken?: PromiseOrValue<string> | null, strategy?: null, liquidityToken?: null): WrapScheduleDeletedEventFilter;
    };
    estimateGas: {
        addApprovedStrategy(strategy: PromiseOrValue<string>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<BigNumber>;
        approvedStrategies(arg0: PromiseOrValue<string>, overrides?: CallOverrides): Promise<BigNumber>;
        cfaV1(overrides?: CallOverrides): Promise<BigNumber>;
        checkWrap(user: PromiseOrValue<string>, superToken: PromiseOrValue<string>, liquidityToken: PromiseOrValue<string>, overrides?: CallOverrides): Promise<BigNumber>;
        checkWrapByIndex(index: PromiseOrValue<BytesLike>, overrides?: CallOverrides): Promise<BigNumber>;
        createWrapSchedule(superToken: PromiseOrValue<string>, strategy: PromiseOrValue<string>, liquidityToken: PromiseOrValue<string>, expiry: PromiseOrValue<BigNumberish>, lowerLimit: PromiseOrValue<BigNumberish>, upperLimit: PromiseOrValue<BigNumberish>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<BigNumber>;
        deleteWrapSchedule(user: PromiseOrValue<string>, superToken: PromiseOrValue<string>, liquidityToken: PromiseOrValue<string>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<BigNumber>;
        deleteWrapScheduleByIndex(index: PromiseOrValue<BytesLike>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<BigNumber>;
        executeWrap(user: PromiseOrValue<string>, superToken: PromiseOrValue<string>, liquidityToken: PromiseOrValue<string>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<BigNumber>;
        executeWrapByIndex(index: PromiseOrValue<BytesLike>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<BigNumber>;
        getWrapSchedule(user: PromiseOrValue<string>, superToken: PromiseOrValue<string>, liquidityToken: PromiseOrValue<string>, overrides?: CallOverrides): Promise<BigNumber>;
        getWrapScheduleByIndex(index: PromiseOrValue<BytesLike>, overrides?: CallOverrides): Promise<BigNumber>;
        getWrapScheduleIndex(user: PromiseOrValue<string>, superToken: PromiseOrValue<string>, liquidityToken: PromiseOrValue<string>, overrides?: CallOverrides): Promise<BigNumber>;
        minLower(overrides?: CallOverrides): Promise<BigNumber>;
        minUpper(overrides?: CallOverrides): Promise<BigNumber>;
        owner(overrides?: CallOverrides): Promise<BigNumber>;
        removeApprovedStrategy(strategy: PromiseOrValue<string>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<BigNumber>;
        renounceOwnership(overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<BigNumber>;
        setLimits(lowerLimit: PromiseOrValue<BigNumberish>, upperLimit: PromiseOrValue<BigNumberish>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<BigNumber>;
        transferOwnership(newOwner: PromiseOrValue<string>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<BigNumber>;
    };
    populateTransaction: {
        addApprovedStrategy(strategy: PromiseOrValue<string>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<PopulatedTransaction>;
        approvedStrategies(arg0: PromiseOrValue<string>, overrides?: CallOverrides): Promise<PopulatedTransaction>;
        cfaV1(overrides?: CallOverrides): Promise<PopulatedTransaction>;
        checkWrap(user: PromiseOrValue<string>, superToken: PromiseOrValue<string>, liquidityToken: PromiseOrValue<string>, overrides?: CallOverrides): Promise<PopulatedTransaction>;
        checkWrapByIndex(index: PromiseOrValue<BytesLike>, overrides?: CallOverrides): Promise<PopulatedTransaction>;
        createWrapSchedule(superToken: PromiseOrValue<string>, strategy: PromiseOrValue<string>, liquidityToken: PromiseOrValue<string>, expiry: PromiseOrValue<BigNumberish>, lowerLimit: PromiseOrValue<BigNumberish>, upperLimit: PromiseOrValue<BigNumberish>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<PopulatedTransaction>;
        deleteWrapSchedule(user: PromiseOrValue<string>, superToken: PromiseOrValue<string>, liquidityToken: PromiseOrValue<string>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<PopulatedTransaction>;
        deleteWrapScheduleByIndex(index: PromiseOrValue<BytesLike>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<PopulatedTransaction>;
        executeWrap(user: PromiseOrValue<string>, superToken: PromiseOrValue<string>, liquidityToken: PromiseOrValue<string>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<PopulatedTransaction>;
        executeWrapByIndex(index: PromiseOrValue<BytesLike>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<PopulatedTransaction>;
        getWrapSchedule(user: PromiseOrValue<string>, superToken: PromiseOrValue<string>, liquidityToken: PromiseOrValue<string>, overrides?: CallOverrides): Promise<PopulatedTransaction>;
        getWrapScheduleByIndex(index: PromiseOrValue<BytesLike>, overrides?: CallOverrides): Promise<PopulatedTransaction>;
        getWrapScheduleIndex(user: PromiseOrValue<string>, superToken: PromiseOrValue<string>, liquidityToken: PromiseOrValue<string>, overrides?: CallOverrides): Promise<PopulatedTransaction>;
        minLower(overrides?: CallOverrides): Promise<PopulatedTransaction>;
        minUpper(overrides?: CallOverrides): Promise<PopulatedTransaction>;
        owner(overrides?: CallOverrides): Promise<PopulatedTransaction>;
        removeApprovedStrategy(strategy: PromiseOrValue<string>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<PopulatedTransaction>;
        renounceOwnership(overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<PopulatedTransaction>;
        setLimits(lowerLimit: PromiseOrValue<BigNumberish>, upperLimit: PromiseOrValue<BigNumberish>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<PopulatedTransaction>;
        transferOwnership(newOwner: PromiseOrValue<string>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<PopulatedTransaction>;
    };
}
