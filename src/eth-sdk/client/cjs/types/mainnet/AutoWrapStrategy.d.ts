import type { BaseContract, BigNumber, BigNumberish, BytesLike, CallOverrides, ContractTransaction, Overrides, PopulatedTransaction, Signer, utils } from "ethers";
import type { FunctionFragment, Result, EventFragment } from "@ethersproject/abi";
import type { Listener, Provider } from "@ethersproject/providers";
import type { TypedEventFilter, TypedEvent, TypedListener, OnEvent, PromiseOrValue } from "../common";
export interface AutoWrapStrategyInterface extends utils.Interface {
    functions: {
        "changeManager(address)": FunctionFragment;
        "emergencyWithdraw(address)": FunctionFragment;
        "isSupportedSuperToken(address)": FunctionFragment;
        "manager()": FunctionFragment;
        "owner()": FunctionFragment;
        "renounceOwnership()": FunctionFragment;
        "transferOwnership(address)": FunctionFragment;
        "wrap(address,address,uint256)": FunctionFragment;
    };
    getFunction(nameOrSignatureOrTopic: "changeManager" | "emergencyWithdraw" | "isSupportedSuperToken" | "manager" | "owner" | "renounceOwnership" | "transferOwnership" | "wrap"): FunctionFragment;
    encodeFunctionData(functionFragment: "changeManager", values: [PromiseOrValue<string>]): string;
    encodeFunctionData(functionFragment: "emergencyWithdraw", values: [PromiseOrValue<string>]): string;
    encodeFunctionData(functionFragment: "isSupportedSuperToken", values: [PromiseOrValue<string>]): string;
    encodeFunctionData(functionFragment: "manager", values?: undefined): string;
    encodeFunctionData(functionFragment: "owner", values?: undefined): string;
    encodeFunctionData(functionFragment: "renounceOwnership", values?: undefined): string;
    encodeFunctionData(functionFragment: "transferOwnership", values: [PromiseOrValue<string>]): string;
    encodeFunctionData(functionFragment: "wrap", values: [
        PromiseOrValue<string>,
        PromiseOrValue<string>,
        PromiseOrValue<BigNumberish>
    ]): string;
    decodeFunctionResult(functionFragment: "changeManager", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "emergencyWithdraw", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "isSupportedSuperToken", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "manager", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "owner", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "renounceOwnership", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "transferOwnership", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "wrap", data: BytesLike): Result;
    events: {
        "EmergencyWithdrawInitiated(address,address,uint256)": EventFragment;
        "ManagerChanged(address,address)": EventFragment;
        "OwnershipTransferred(address,address)": EventFragment;
        "Wrapped(address,address,uint256)": EventFragment;
    };
    getEvent(nameOrSignatureOrTopic: "EmergencyWithdrawInitiated"): EventFragment;
    getEvent(nameOrSignatureOrTopic: "ManagerChanged"): EventFragment;
    getEvent(nameOrSignatureOrTopic: "OwnershipTransferred"): EventFragment;
    getEvent(nameOrSignatureOrTopic: "Wrapped"): EventFragment;
}
export interface EmergencyWithdrawInitiatedEventObject {
    receiver: string;
    token: string;
    amount: BigNumber;
}
export type EmergencyWithdrawInitiatedEvent = TypedEvent<[
    string,
    string,
    BigNumber
], EmergencyWithdrawInitiatedEventObject>;
export type EmergencyWithdrawInitiatedEventFilter = TypedEventFilter<EmergencyWithdrawInitiatedEvent>;
export interface ManagerChangedEventObject {
    oldManager: string;
    manager: string;
}
export type ManagerChangedEvent = TypedEvent<[
    string,
    string
], ManagerChangedEventObject>;
export type ManagerChangedEventFilter = TypedEventFilter<ManagerChangedEvent>;
export interface OwnershipTransferredEventObject {
    previousOwner: string;
    newOwner: string;
}
export type OwnershipTransferredEvent = TypedEvent<[
    string,
    string
], OwnershipTransferredEventObject>;
export type OwnershipTransferredEventFilter = TypedEventFilter<OwnershipTransferredEvent>;
export interface WrappedEventObject {
    user: string;
    superToken: string;
    superTokenAmount: BigNumber;
}
export type WrappedEvent = TypedEvent<[
    string,
    string,
    BigNumber
], WrappedEventObject>;
export type WrappedEventFilter = TypedEventFilter<WrappedEvent>;
export interface AutoWrapStrategy extends BaseContract {
    connect(signerOrProvider: Signer | Provider | string): this;
    attach(addressOrName: string): this;
    deployed(): Promise<this>;
    interface: AutoWrapStrategyInterface;
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
        changeManager(newManager: PromiseOrValue<string>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<ContractTransaction>;
        emergencyWithdraw(token: PromiseOrValue<string>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<ContractTransaction>;
        isSupportedSuperToken(superToken: PromiseOrValue<string>, overrides?: CallOverrides): Promise<[boolean]>;
        manager(overrides?: CallOverrides): Promise<[string]>;
        owner(overrides?: CallOverrides): Promise<[string]>;
        renounceOwnership(overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<ContractTransaction>;
        transferOwnership(newOwner: PromiseOrValue<string>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<ContractTransaction>;
        wrap(user: PromiseOrValue<string>, superToken: PromiseOrValue<string>, superTokenAmount: PromiseOrValue<BigNumberish>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<ContractTransaction>;
    };
    changeManager(newManager: PromiseOrValue<string>, overrides?: Overrides & {
        from?: PromiseOrValue<string>;
    }): Promise<ContractTransaction>;
    emergencyWithdraw(token: PromiseOrValue<string>, overrides?: Overrides & {
        from?: PromiseOrValue<string>;
    }): Promise<ContractTransaction>;
    isSupportedSuperToken(superToken: PromiseOrValue<string>, overrides?: CallOverrides): Promise<boolean>;
    manager(overrides?: CallOverrides): Promise<string>;
    owner(overrides?: CallOverrides): Promise<string>;
    renounceOwnership(overrides?: Overrides & {
        from?: PromiseOrValue<string>;
    }): Promise<ContractTransaction>;
    transferOwnership(newOwner: PromiseOrValue<string>, overrides?: Overrides & {
        from?: PromiseOrValue<string>;
    }): Promise<ContractTransaction>;
    wrap(user: PromiseOrValue<string>, superToken: PromiseOrValue<string>, superTokenAmount: PromiseOrValue<BigNumberish>, overrides?: Overrides & {
        from?: PromiseOrValue<string>;
    }): Promise<ContractTransaction>;
    callStatic: {
        changeManager(newManager: PromiseOrValue<string>, overrides?: CallOverrides): Promise<void>;
        emergencyWithdraw(token: PromiseOrValue<string>, overrides?: CallOverrides): Promise<void>;
        isSupportedSuperToken(superToken: PromiseOrValue<string>, overrides?: CallOverrides): Promise<boolean>;
        manager(overrides?: CallOverrides): Promise<string>;
        owner(overrides?: CallOverrides): Promise<string>;
        renounceOwnership(overrides?: CallOverrides): Promise<void>;
        transferOwnership(newOwner: PromiseOrValue<string>, overrides?: CallOverrides): Promise<void>;
        wrap(user: PromiseOrValue<string>, superToken: PromiseOrValue<string>, superTokenAmount: PromiseOrValue<BigNumberish>, overrides?: CallOverrides): Promise<void>;
    };
    filters: {
        "EmergencyWithdrawInitiated(address,address,uint256)"(receiver?: PromiseOrValue<string> | null, token?: PromiseOrValue<string> | null, amount?: null): EmergencyWithdrawInitiatedEventFilter;
        EmergencyWithdrawInitiated(receiver?: PromiseOrValue<string> | null, token?: PromiseOrValue<string> | null, amount?: null): EmergencyWithdrawInitiatedEventFilter;
        "ManagerChanged(address,address)"(oldManager?: PromiseOrValue<string> | null, manager?: PromiseOrValue<string> | null): ManagerChangedEventFilter;
        ManagerChanged(oldManager?: PromiseOrValue<string> | null, manager?: PromiseOrValue<string> | null): ManagerChangedEventFilter;
        "OwnershipTransferred(address,address)"(previousOwner?: PromiseOrValue<string> | null, newOwner?: PromiseOrValue<string> | null): OwnershipTransferredEventFilter;
        OwnershipTransferred(previousOwner?: PromiseOrValue<string> | null, newOwner?: PromiseOrValue<string> | null): OwnershipTransferredEventFilter;
        "Wrapped(address,address,uint256)"(user?: PromiseOrValue<string> | null, superToken?: PromiseOrValue<string> | null, superTokenAmount?: null): WrappedEventFilter;
        Wrapped(user?: PromiseOrValue<string> | null, superToken?: PromiseOrValue<string> | null, superTokenAmount?: null): WrappedEventFilter;
    };
    estimateGas: {
        changeManager(newManager: PromiseOrValue<string>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<BigNumber>;
        emergencyWithdraw(token: PromiseOrValue<string>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<BigNumber>;
        isSupportedSuperToken(superToken: PromiseOrValue<string>, overrides?: CallOverrides): Promise<BigNumber>;
        manager(overrides?: CallOverrides): Promise<BigNumber>;
        owner(overrides?: CallOverrides): Promise<BigNumber>;
        renounceOwnership(overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<BigNumber>;
        transferOwnership(newOwner: PromiseOrValue<string>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<BigNumber>;
        wrap(user: PromiseOrValue<string>, superToken: PromiseOrValue<string>, superTokenAmount: PromiseOrValue<BigNumberish>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<BigNumber>;
    };
    populateTransaction: {
        changeManager(newManager: PromiseOrValue<string>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<PopulatedTransaction>;
        emergencyWithdraw(token: PromiseOrValue<string>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<PopulatedTransaction>;
        isSupportedSuperToken(superToken: PromiseOrValue<string>, overrides?: CallOverrides): Promise<PopulatedTransaction>;
        manager(overrides?: CallOverrides): Promise<PopulatedTransaction>;
        owner(overrides?: CallOverrides): Promise<PopulatedTransaction>;
        renounceOwnership(overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<PopulatedTransaction>;
        transferOwnership(newOwner: PromiseOrValue<string>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<PopulatedTransaction>;
        wrap(user: PromiseOrValue<string>, superToken: PromiseOrValue<string>, superTokenAmount: PromiseOrValue<BigNumberish>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<PopulatedTransaction>;
    };
}
