import { Signer } from "ethers";
import type { Provider } from "@ethersproject/providers";
import type { AutoWrapManager, AutoWrapManagerInterface } from "../../mainnet/AutoWrapManager";
export declare class AutoWrapManager__factory {
    static readonly abi: readonly [{
        readonly inputs: readonly [{
            readonly internalType: "address";
            readonly name: "_cfa";
            readonly type: "address";
        }, {
            readonly internalType: "uint64";
            readonly name: "_minLower";
            readonly type: "uint64";
        }, {
            readonly internalType: "uint64";
            readonly name: "_minUpper";
            readonly type: "uint64";
        }];
        readonly stateMutability: "nonpayable";
        readonly type: "constructor";
    }, {
        readonly inputs: readonly [{
            readonly internalType: "uint64";
            readonly name: "limitGiven";
            readonly type: "uint64";
        }, {
            readonly internalType: "uint64";
            readonly name: "minLimit";
            readonly type: "uint64";
        }];
        readonly name: "InsufficientLimits";
        readonly type: "error";
    }, {
        readonly inputs: readonly [{
            readonly internalType: "uint64";
            readonly name: "expirationTimeGiven";
            readonly type: "uint64";
        }, {
            readonly internalType: "uint256";
            readonly name: "timeNow";
            readonly type: "uint256";
        }];
        readonly name: "InvalidExpirationTime";
        readonly type: "error";
    }, {
        readonly inputs: readonly [{
            readonly internalType: "address";
            readonly name: "strategy";
            readonly type: "address";
        }];
        readonly name: "InvalidStrategy";
        readonly type: "error";
    }, {
        readonly inputs: readonly [{
            readonly internalType: "address";
            readonly name: "caller";
            readonly type: "address";
        }, {
            readonly internalType: "address";
            readonly name: "expectedCaller";
            readonly type: "address";
        }];
        readonly name: "UnauthorizedCaller";
        readonly type: "error";
    }, {
        readonly inputs: readonly [{
            readonly internalType: "address";
            readonly name: "superToken";
            readonly type: "address";
        }];
        readonly name: "UnsupportedSuperToken";
        readonly type: "error";
    }, {
        readonly inputs: readonly [{
            readonly internalType: "bytes32";
            readonly name: "index";
            readonly type: "bytes32";
        }];
        readonly name: "WrapNotRequired";
        readonly type: "error";
    }, {
        readonly inputs: readonly [{
            readonly internalType: "uint64";
            readonly name: "lowerLimit";
            readonly type: "uint64";
        }, {
            readonly internalType: "uint64";
            readonly name: "upperLimit";
            readonly type: "uint64";
        }];
        readonly name: "WrongLimits";
        readonly type: "error";
    }, {
        readonly inputs: readonly [];
        readonly name: "ZeroAddress";
        readonly type: "error";
    }, {
        readonly anonymous: false;
        readonly inputs: readonly [{
            readonly indexed: true;
            readonly internalType: "address";
            readonly name: "strategy";
            readonly type: "address";
        }];
        readonly name: "AddedApprovedStrategy";
        readonly type: "event";
    }, {
        readonly anonymous: false;
        readonly inputs: readonly [{
            readonly indexed: false;
            readonly internalType: "uint64";
            readonly name: "lowerLimit";
            readonly type: "uint64";
        }, {
            readonly indexed: false;
            readonly internalType: "uint64";
            readonly name: "upperLimit";
            readonly type: "uint64";
        }];
        readonly name: "LimitsChanged";
        readonly type: "event";
    }, {
        readonly anonymous: false;
        readonly inputs: readonly [{
            readonly indexed: true;
            readonly internalType: "address";
            readonly name: "previousOwner";
            readonly type: "address";
        }, {
            readonly indexed: true;
            readonly internalType: "address";
            readonly name: "newOwner";
            readonly type: "address";
        }];
        readonly name: "OwnershipTransferred";
        readonly type: "event";
    }, {
        readonly anonymous: false;
        readonly inputs: readonly [{
            readonly indexed: true;
            readonly internalType: "address";
            readonly name: "strategy";
            readonly type: "address";
        }];
        readonly name: "RemovedApprovedStrategy";
        readonly type: "event";
    }, {
        readonly anonymous: false;
        readonly inputs: readonly [{
            readonly indexed: true;
            readonly internalType: "bytes32";
            readonly name: "id";
            readonly type: "bytes32";
        }, {
            readonly indexed: false;
            readonly internalType: "uint256";
            readonly name: "wrapAmount";
            readonly type: "uint256";
        }];
        readonly name: "WrapExecuted";
        readonly type: "event";
    }, {
        readonly anonymous: false;
        readonly inputs: readonly [{
            readonly indexed: true;
            readonly internalType: "bytes32";
            readonly name: "id";
            readonly type: "bytes32";
        }, {
            readonly indexed: true;
            readonly internalType: "address";
            readonly name: "user";
            readonly type: "address";
        }, {
            readonly indexed: true;
            readonly internalType: "address";
            readonly name: "superToken";
            readonly type: "address";
        }, {
            readonly indexed: false;
            readonly internalType: "address";
            readonly name: "strategy";
            readonly type: "address";
        }, {
            readonly indexed: false;
            readonly internalType: "address";
            readonly name: "liquidityToken";
            readonly type: "address";
        }, {
            readonly indexed: false;
            readonly internalType: "uint256";
            readonly name: "expiry";
            readonly type: "uint256";
        }, {
            readonly indexed: false;
            readonly internalType: "uint256";
            readonly name: "lowerLimit";
            readonly type: "uint256";
        }, {
            readonly indexed: false;
            readonly internalType: "uint256";
            readonly name: "upperLimit";
            readonly type: "uint256";
        }];
        readonly name: "WrapScheduleCreated";
        readonly type: "event";
    }, {
        readonly anonymous: false;
        readonly inputs: readonly [{
            readonly indexed: true;
            readonly internalType: "bytes32";
            readonly name: "id";
            readonly type: "bytes32";
        }, {
            readonly indexed: true;
            readonly internalType: "address";
            readonly name: "user";
            readonly type: "address";
        }, {
            readonly indexed: true;
            readonly internalType: "address";
            readonly name: "superToken";
            readonly type: "address";
        }, {
            readonly indexed: false;
            readonly internalType: "address";
            readonly name: "strategy";
            readonly type: "address";
        }, {
            readonly indexed: false;
            readonly internalType: "address";
            readonly name: "liquidityToken";
            readonly type: "address";
        }];
        readonly name: "WrapScheduleDeleted";
        readonly type: "event";
    }, {
        readonly inputs: readonly [{
            readonly internalType: "address";
            readonly name: "strategy";
            readonly type: "address";
        }];
        readonly name: "addApprovedStrategy";
        readonly outputs: readonly [];
        readonly stateMutability: "nonpayable";
        readonly type: "function";
    }, {
        readonly inputs: readonly [{
            readonly internalType: "address";
            readonly name: "";
            readonly type: "address";
        }];
        readonly name: "approvedStrategies";
        readonly outputs: readonly [{
            readonly internalType: "bool";
            readonly name: "";
            readonly type: "bool";
        }];
        readonly stateMutability: "view";
        readonly type: "function";
    }, {
        readonly inputs: readonly [];
        readonly name: "cfaV1";
        readonly outputs: readonly [{
            readonly internalType: "contract IConstantFlowAgreementV1";
            readonly name: "";
            readonly type: "address";
        }];
        readonly stateMutability: "view";
        readonly type: "function";
    }, {
        readonly inputs: readonly [{
            readonly internalType: "address";
            readonly name: "user";
            readonly type: "address";
        }, {
            readonly internalType: "address";
            readonly name: "superToken";
            readonly type: "address";
        }, {
            readonly internalType: "address";
            readonly name: "liquidityToken";
            readonly type: "address";
        }];
        readonly name: "checkWrap";
        readonly outputs: readonly [{
            readonly internalType: "uint256";
            readonly name: "";
            readonly type: "uint256";
        }];
        readonly stateMutability: "view";
        readonly type: "function";
    }, {
        readonly inputs: readonly [{
            readonly internalType: "bytes32";
            readonly name: "index";
            readonly type: "bytes32";
        }];
        readonly name: "checkWrapByIndex";
        readonly outputs: readonly [{
            readonly internalType: "uint256";
            readonly name: "amount";
            readonly type: "uint256";
        }];
        readonly stateMutability: "view";
        readonly type: "function";
    }, {
        readonly inputs: readonly [{
            readonly internalType: "address";
            readonly name: "superToken";
            readonly type: "address";
        }, {
            readonly internalType: "address";
            readonly name: "strategy";
            readonly type: "address";
        }, {
            readonly internalType: "address";
            readonly name: "liquidityToken";
            readonly type: "address";
        }, {
            readonly internalType: "uint64";
            readonly name: "expiry";
            readonly type: "uint64";
        }, {
            readonly internalType: "uint64";
            readonly name: "lowerLimit";
            readonly type: "uint64";
        }, {
            readonly internalType: "uint64";
            readonly name: "upperLimit";
            readonly type: "uint64";
        }];
        readonly name: "createWrapSchedule";
        readonly outputs: readonly [];
        readonly stateMutability: "nonpayable";
        readonly type: "function";
    }, {
        readonly inputs: readonly [{
            readonly internalType: "address";
            readonly name: "user";
            readonly type: "address";
        }, {
            readonly internalType: "address";
            readonly name: "superToken";
            readonly type: "address";
        }, {
            readonly internalType: "address";
            readonly name: "liquidityToken";
            readonly type: "address";
        }];
        readonly name: "deleteWrapSchedule";
        readonly outputs: readonly [];
        readonly stateMutability: "nonpayable";
        readonly type: "function";
    }, {
        readonly inputs: readonly [{
            readonly internalType: "bytes32";
            readonly name: "index";
            readonly type: "bytes32";
        }];
        readonly name: "deleteWrapScheduleByIndex";
        readonly outputs: readonly [];
        readonly stateMutability: "nonpayable";
        readonly type: "function";
    }, {
        readonly inputs: readonly [{
            readonly internalType: "address";
            readonly name: "user";
            readonly type: "address";
        }, {
            readonly internalType: "address";
            readonly name: "superToken";
            readonly type: "address";
        }, {
            readonly internalType: "address";
            readonly name: "liquidityToken";
            readonly type: "address";
        }];
        readonly name: "executeWrap";
        readonly outputs: readonly [];
        readonly stateMutability: "nonpayable";
        readonly type: "function";
    }, {
        readonly inputs: readonly [{
            readonly internalType: "bytes32";
            readonly name: "index";
            readonly type: "bytes32";
        }];
        readonly name: "executeWrapByIndex";
        readonly outputs: readonly [];
        readonly stateMutability: "nonpayable";
        readonly type: "function";
    }, {
        readonly inputs: readonly [{
            readonly internalType: "address";
            readonly name: "user";
            readonly type: "address";
        }, {
            readonly internalType: "address";
            readonly name: "superToken";
            readonly type: "address";
        }, {
            readonly internalType: "address";
            readonly name: "liquidityToken";
            readonly type: "address";
        }];
        readonly name: "getWrapSchedule";
        readonly outputs: readonly [{
            readonly components: readonly [{
                readonly internalType: "address";
                readonly name: "user";
                readonly type: "address";
            }, {
                readonly internalType: "contract ISuperToken";
                readonly name: "superToken";
                readonly type: "address";
            }, {
                readonly internalType: "contract IStrategy";
                readonly name: "strategy";
                readonly type: "address";
            }, {
                readonly internalType: "address";
                readonly name: "liquidityToken";
                readonly type: "address";
            }, {
                readonly internalType: "uint64";
                readonly name: "expiry";
                readonly type: "uint64";
            }, {
                readonly internalType: "uint64";
                readonly name: "lowerLimit";
                readonly type: "uint64";
            }, {
                readonly internalType: "uint64";
                readonly name: "upperLimit";
                readonly type: "uint64";
            }];
            readonly internalType: "struct IManager.WrapSchedule";
            readonly name: "";
            readonly type: "tuple";
        }];
        readonly stateMutability: "view";
        readonly type: "function";
    }, {
        readonly inputs: readonly [{
            readonly internalType: "bytes32";
            readonly name: "index";
            readonly type: "bytes32";
        }];
        readonly name: "getWrapScheduleByIndex";
        readonly outputs: readonly [{
            readonly components: readonly [{
                readonly internalType: "address";
                readonly name: "user";
                readonly type: "address";
            }, {
                readonly internalType: "contract ISuperToken";
                readonly name: "superToken";
                readonly type: "address";
            }, {
                readonly internalType: "contract IStrategy";
                readonly name: "strategy";
                readonly type: "address";
            }, {
                readonly internalType: "address";
                readonly name: "liquidityToken";
                readonly type: "address";
            }, {
                readonly internalType: "uint64";
                readonly name: "expiry";
                readonly type: "uint64";
            }, {
                readonly internalType: "uint64";
                readonly name: "lowerLimit";
                readonly type: "uint64";
            }, {
                readonly internalType: "uint64";
                readonly name: "upperLimit";
                readonly type: "uint64";
            }];
            readonly internalType: "struct IManager.WrapSchedule";
            readonly name: "";
            readonly type: "tuple";
        }];
        readonly stateMutability: "view";
        readonly type: "function";
    }, {
        readonly inputs: readonly [{
            readonly internalType: "address";
            readonly name: "user";
            readonly type: "address";
        }, {
            readonly internalType: "address";
            readonly name: "superToken";
            readonly type: "address";
        }, {
            readonly internalType: "address";
            readonly name: "liquidityToken";
            readonly type: "address";
        }];
        readonly name: "getWrapScheduleIndex";
        readonly outputs: readonly [{
            readonly internalType: "bytes32";
            readonly name: "";
            readonly type: "bytes32";
        }];
        readonly stateMutability: "pure";
        readonly type: "function";
    }, {
        readonly inputs: readonly [];
        readonly name: "minLower";
        readonly outputs: readonly [{
            readonly internalType: "uint64";
            readonly name: "";
            readonly type: "uint64";
        }];
        readonly stateMutability: "view";
        readonly type: "function";
    }, {
        readonly inputs: readonly [];
        readonly name: "minUpper";
        readonly outputs: readonly [{
            readonly internalType: "uint64";
            readonly name: "";
            readonly type: "uint64";
        }];
        readonly stateMutability: "view";
        readonly type: "function";
    }, {
        readonly inputs: readonly [];
        readonly name: "owner";
        readonly outputs: readonly [{
            readonly internalType: "address";
            readonly name: "";
            readonly type: "address";
        }];
        readonly stateMutability: "view";
        readonly type: "function";
    }, {
        readonly inputs: readonly [{
            readonly internalType: "address";
            readonly name: "strategy";
            readonly type: "address";
        }];
        readonly name: "removeApprovedStrategy";
        readonly outputs: readonly [];
        readonly stateMutability: "nonpayable";
        readonly type: "function";
    }, {
        readonly inputs: readonly [];
        readonly name: "renounceOwnership";
        readonly outputs: readonly [];
        readonly stateMutability: "nonpayable";
        readonly type: "function";
    }, {
        readonly inputs: readonly [{
            readonly internalType: "uint64";
            readonly name: "lowerLimit";
            readonly type: "uint64";
        }, {
            readonly internalType: "uint64";
            readonly name: "upperLimit";
            readonly type: "uint64";
        }];
        readonly name: "setLimits";
        readonly outputs: readonly [];
        readonly stateMutability: "nonpayable";
        readonly type: "function";
    }, {
        readonly inputs: readonly [{
            readonly internalType: "address";
            readonly name: "newOwner";
            readonly type: "address";
        }];
        readonly name: "transferOwnership";
        readonly outputs: readonly [];
        readonly stateMutability: "nonpayable";
        readonly type: "function";
    }];
    static createInterface(): AutoWrapManagerInterface;
    static connect(address: string, signerOrProvider: Signer | Provider): AutoWrapManager;
}
