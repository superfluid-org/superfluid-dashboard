import { Signer } from "ethers";
import type { Provider } from "@ethersproject/providers";
import type { VestingScheduler_v3, VestingScheduler_v3Interface } from "../../optimismSepolia/VestingScheduler_v3";
export declare class VestingScheduler_v3__factory {
    static readonly abi: readonly [{
        readonly inputs: readonly [{
            readonly internalType: "contract ISuperfluid";
            readonly name: "host";
            readonly type: "address";
        }];
        readonly stateMutability: "nonpayable";
        readonly type: "constructor";
    }, {
        readonly inputs: readonly [];
        readonly name: "AccountInvalid";
        readonly type: "error";
    }, {
        readonly inputs: readonly [];
        readonly name: "AlreadyExecuted";
        readonly type: "error";
    }, {
        readonly inputs: readonly [];
        readonly name: "CFA_INVALID_FLOW_RATE";
        readonly type: "error";
    }, {
        readonly inputs: readonly [];
        readonly name: "CannotClaimScheduleOnBehalf";
        readonly type: "error";
    }, {
        readonly inputs: readonly [];
        readonly name: "CliffInvalid";
        readonly type: "error";
    }, {
        readonly inputs: readonly [];
        readonly name: "FlowRateInvalid";
        readonly type: "error";
    }, {
        readonly inputs: readonly [];
        readonly name: "InvalidNewTotalAmount";
        readonly type: "error";
    }, {
        readonly inputs: readonly [];
        readonly name: "ScheduleAlreadyExists";
        readonly type: "error";
    }, {
        readonly inputs: readonly [];
        readonly name: "ScheduleDoesNotExist";
        readonly type: "error";
    }, {
        readonly inputs: readonly [];
        readonly name: "ScheduleNotClaimed";
        readonly type: "error";
    }, {
        readonly inputs: readonly [];
        readonly name: "ScheduleNotFlowing";
        readonly type: "error";
    }, {
        readonly inputs: readonly [];
        readonly name: "TimeWindowInvalid";
        readonly type: "error";
    }, {
        readonly inputs: readonly [];
        readonly name: "ZeroAddress";
        readonly type: "error";
    }, {
        readonly anonymous: false;
        readonly inputs: readonly [{
            readonly indexed: true;
            readonly internalType: "contract ISuperToken";
            readonly name: "superToken";
            readonly type: "address";
        }, {
            readonly indexed: true;
            readonly internalType: "address";
            readonly name: "sender";
            readonly type: "address";
        }, {
            readonly indexed: true;
            readonly internalType: "address";
            readonly name: "receiver";
            readonly type: "address";
        }, {
            readonly indexed: false;
            readonly internalType: "address";
            readonly name: "claimer";
            readonly type: "address";
        }];
        readonly name: "VestingClaimed";
        readonly type: "event";
    }, {
        readonly anonymous: false;
        readonly inputs: readonly [{
            readonly indexed: true;
            readonly internalType: "contract ISuperToken";
            readonly name: "superToken";
            readonly type: "address";
        }, {
            readonly indexed: true;
            readonly internalType: "address";
            readonly name: "sender";
            readonly type: "address";
        }, {
            readonly indexed: true;
            readonly internalType: "address";
            readonly name: "receiver";
            readonly type: "address";
        }, {
            readonly indexed: false;
            readonly internalType: "uint32";
            readonly name: "cliffAndFlowDate";
            readonly type: "uint32";
        }, {
            readonly indexed: false;
            readonly internalType: "int96";
            readonly name: "flowRate";
            readonly type: "int96";
        }, {
            readonly indexed: false;
            readonly internalType: "uint256";
            readonly name: "cliffAmount";
            readonly type: "uint256";
        }, {
            readonly indexed: false;
            readonly internalType: "uint256";
            readonly name: "flowDelayCompensation";
            readonly type: "uint256";
        }];
        readonly name: "VestingCliffAndFlowExecuted";
        readonly type: "event";
    }, {
        readonly anonymous: false;
        readonly inputs: readonly [{
            readonly indexed: true;
            readonly internalType: "contract ISuperToken";
            readonly name: "superToken";
            readonly type: "address";
        }, {
            readonly indexed: true;
            readonly internalType: "address";
            readonly name: "sender";
            readonly type: "address";
        }, {
            readonly indexed: true;
            readonly internalType: "address";
            readonly name: "receiver";
            readonly type: "address";
        }, {
            readonly indexed: false;
            readonly internalType: "uint32";
            readonly name: "endDate";
            readonly type: "uint32";
        }, {
            readonly indexed: false;
            readonly internalType: "uint256";
            readonly name: "earlyEndCompensation";
            readonly type: "uint256";
        }, {
            readonly indexed: false;
            readonly internalType: "bool";
            readonly name: "didCompensationFail";
            readonly type: "bool";
        }];
        readonly name: "VestingEndExecuted";
        readonly type: "event";
    }, {
        readonly anonymous: false;
        readonly inputs: readonly [{
            readonly indexed: true;
            readonly internalType: "contract ISuperToken";
            readonly name: "superToken";
            readonly type: "address";
        }, {
            readonly indexed: true;
            readonly internalType: "address";
            readonly name: "sender";
            readonly type: "address";
        }, {
            readonly indexed: true;
            readonly internalType: "address";
            readonly name: "receiver";
            readonly type: "address";
        }, {
            readonly indexed: false;
            readonly internalType: "uint32";
            readonly name: "endDate";
            readonly type: "uint32";
        }];
        readonly name: "VestingEndFailed";
        readonly type: "event";
    }, {
        readonly anonymous: false;
        readonly inputs: readonly [{
            readonly indexed: true;
            readonly internalType: "contract ISuperToken";
            readonly name: "superToken";
            readonly type: "address";
        }, {
            readonly indexed: true;
            readonly internalType: "address";
            readonly name: "sender";
            readonly type: "address";
        }, {
            readonly indexed: true;
            readonly internalType: "address";
            readonly name: "receiver";
            readonly type: "address";
        }, {
            readonly indexed: false;
            readonly internalType: "uint32";
            readonly name: "startDate";
            readonly type: "uint32";
        }, {
            readonly indexed: false;
            readonly internalType: "uint32";
            readonly name: "cliffDate";
            readonly type: "uint32";
        }, {
            readonly indexed: false;
            readonly internalType: "int96";
            readonly name: "flowRate";
            readonly type: "int96";
        }, {
            readonly indexed: false;
            readonly internalType: "uint32";
            readonly name: "endDate";
            readonly type: "uint32";
        }, {
            readonly indexed: false;
            readonly internalType: "uint256";
            readonly name: "cliffAmount";
            readonly type: "uint256";
        }, {
            readonly indexed: false;
            readonly internalType: "uint32";
            readonly name: "claimValidityDate";
            readonly type: "uint32";
        }, {
            readonly indexed: false;
            readonly internalType: "uint96";
            readonly name: "remainderAmount";
            readonly type: "uint96";
        }];
        readonly name: "VestingScheduleCreated";
        readonly type: "event";
    }, {
        readonly anonymous: false;
        readonly inputs: readonly [{
            readonly indexed: true;
            readonly internalType: "contract ISuperToken";
            readonly name: "superToken";
            readonly type: "address";
        }, {
            readonly indexed: true;
            readonly internalType: "address";
            readonly name: "sender";
            readonly type: "address";
        }, {
            readonly indexed: true;
            readonly internalType: "address";
            readonly name: "receiver";
            readonly type: "address";
        }];
        readonly name: "VestingScheduleDeleted";
        readonly type: "event";
    }, {
        readonly anonymous: false;
        readonly inputs: readonly [{
            readonly indexed: true;
            readonly internalType: "contract ISuperToken";
            readonly name: "superToken";
            readonly type: "address";
        }, {
            readonly indexed: true;
            readonly internalType: "address";
            readonly name: "sender";
            readonly type: "address";
        }, {
            readonly indexed: true;
            readonly internalType: "address";
            readonly name: "receiver";
            readonly type: "address";
        }, {
            readonly indexed: false;
            readonly internalType: "uint32";
            readonly name: "endDate";
            readonly type: "uint32";
        }, {
            readonly indexed: false;
            readonly internalType: "uint96";
            readonly name: "remainderAmount";
            readonly type: "uint96";
        }, {
            readonly indexed: false;
            readonly internalType: "int96";
            readonly name: "flowRate";
            readonly type: "int96";
        }, {
            readonly indexed: false;
            readonly internalType: "uint256";
            readonly name: "totalAmount";
            readonly type: "uint256";
        }, {
            readonly indexed: false;
            readonly internalType: "uint256";
            readonly name: "settledAmount";
            readonly type: "uint256";
        }];
        readonly name: "VestingScheduleUpdated";
        readonly type: "event";
    }, {
        readonly inputs: readonly [];
        readonly name: "END_DATE_VALID_BEFORE";
        readonly outputs: readonly [{
            readonly internalType: "uint32";
            readonly name: "";
            readonly type: "uint32";
        }];
        readonly stateMutability: "view";
        readonly type: "function";
    }, {
        readonly inputs: readonly [];
        readonly name: "HOST";
        readonly outputs: readonly [{
            readonly internalType: "contract ISuperfluid";
            readonly name: "";
            readonly type: "address";
        }];
        readonly stateMutability: "view";
        readonly type: "function";
    }, {
        readonly inputs: readonly [];
        readonly name: "MIN_VESTING_DURATION";
        readonly outputs: readonly [{
            readonly internalType: "uint32";
            readonly name: "";
            readonly type: "uint32";
        }];
        readonly stateMutability: "view";
        readonly type: "function";
    }, {
        readonly inputs: readonly [];
        readonly name: "START_DATE_VALID_AFTER";
        readonly outputs: readonly [{
            readonly internalType: "uint32";
            readonly name: "";
            readonly type: "uint32";
        }];
        readonly stateMutability: "view";
        readonly type: "function";
    }, {
        readonly inputs: readonly [{
            readonly internalType: "bytes32";
            readonly name: "vestingId";
            readonly type: "bytes32";
        }];
        readonly name: "accountings";
        readonly outputs: readonly [{
            readonly internalType: "uint256";
            readonly name: "settledAmount";
            readonly type: "uint256";
        }, {
            readonly internalType: "uint256";
            readonly name: "settledDate";
            readonly type: "uint256";
        }];
        readonly stateMutability: "view";
        readonly type: "function";
    }, {
        readonly inputs: readonly [{
            readonly internalType: "contract ISuperToken";
            readonly name: "superToken";
            readonly type: "address";
        }, {
            readonly internalType: "address";
            readonly name: "receiver";
            readonly type: "address";
        }, {
            readonly internalType: "uint256";
            readonly name: "totalAmount";
            readonly type: "uint256";
        }, {
            readonly internalType: "uint32";
            readonly name: "totalDuration";
            readonly type: "uint32";
        }];
        readonly name: "createAndExecuteVestingScheduleFromAmountAndDuration";
        readonly outputs: readonly [];
        readonly stateMutability: "nonpayable";
        readonly type: "function";
    }, {
        readonly inputs: readonly [{
            readonly internalType: "contract ISuperToken";
            readonly name: "superToken";
            readonly type: "address";
        }, {
            readonly internalType: "address";
            readonly name: "receiver";
            readonly type: "address";
        }, {
            readonly internalType: "uint32";
            readonly name: "startDate";
            readonly type: "uint32";
        }, {
            readonly internalType: "uint32";
            readonly name: "cliffDate";
            readonly type: "uint32";
        }, {
            readonly internalType: "int96";
            readonly name: "flowRate";
            readonly type: "int96";
        }, {
            readonly internalType: "uint256";
            readonly name: "cliffAmount";
            readonly type: "uint256";
        }, {
            readonly internalType: "uint32";
            readonly name: "endDate";
            readonly type: "uint32";
        }, {
            readonly internalType: "uint32";
            readonly name: "claimValidityDate";
            readonly type: "uint32";
        }];
        readonly name: "createVestingSchedule";
        readonly outputs: readonly [];
        readonly stateMutability: "nonpayable";
        readonly type: "function";
    }, {
        readonly inputs: readonly [{
            readonly internalType: "contract ISuperToken";
            readonly name: "superToken";
            readonly type: "address";
        }, {
            readonly internalType: "address";
            readonly name: "receiver";
            readonly type: "address";
        }, {
            readonly internalType: "uint32";
            readonly name: "startDate";
            readonly type: "uint32";
        }, {
            readonly internalType: "uint32";
            readonly name: "cliffDate";
            readonly type: "uint32";
        }, {
            readonly internalType: "int96";
            readonly name: "flowRate";
            readonly type: "int96";
        }, {
            readonly internalType: "uint256";
            readonly name: "cliffAmount";
            readonly type: "uint256";
        }, {
            readonly internalType: "uint32";
            readonly name: "endDate";
            readonly type: "uint32";
        }];
        readonly name: "createVestingSchedule";
        readonly outputs: readonly [];
        readonly stateMutability: "nonpayable";
        readonly type: "function";
    }, {
        readonly inputs: readonly [{
            readonly internalType: "contract ISuperToken";
            readonly name: "superToken";
            readonly type: "address";
        }, {
            readonly internalType: "address";
            readonly name: "receiver";
            readonly type: "address";
        }, {
            readonly internalType: "uint256";
            readonly name: "totalAmount";
            readonly type: "uint256";
        }, {
            readonly internalType: "uint32";
            readonly name: "totalDuration";
            readonly type: "uint32";
        }, {
            readonly internalType: "uint32";
            readonly name: "startDate";
            readonly type: "uint32";
        }, {
            readonly internalType: "uint32";
            readonly name: "cliffPeriod";
            readonly type: "uint32";
        }, {
            readonly internalType: "uint32";
            readonly name: "claimPeriod";
            readonly type: "uint32";
        }];
        readonly name: "createVestingScheduleFromAmountAndDuration";
        readonly outputs: readonly [];
        readonly stateMutability: "nonpayable";
        readonly type: "function";
    }, {
        readonly inputs: readonly [{
            readonly internalType: "contract ISuperToken";
            readonly name: "superToken";
            readonly type: "address";
        }, {
            readonly internalType: "address";
            readonly name: "receiver";
            readonly type: "address";
        }, {
            readonly internalType: "uint256";
            readonly name: "totalAmount";
            readonly type: "uint256";
        }, {
            readonly internalType: "uint32";
            readonly name: "totalDuration";
            readonly type: "uint32";
        }, {
            readonly internalType: "uint32";
            readonly name: "startDate";
            readonly type: "uint32";
        }, {
            readonly internalType: "uint32";
            readonly name: "cliffPeriod";
            readonly type: "uint32";
        }, {
            readonly internalType: "uint32";
            readonly name: "claimPeriod";
            readonly type: "uint32";
        }, {
            readonly internalType: "uint256";
            readonly name: "cliffAmount";
            readonly type: "uint256";
        }];
        readonly name: "createVestingScheduleFromAmountAndDuration";
        readonly outputs: readonly [];
        readonly stateMutability: "nonpayable";
        readonly type: "function";
    }, {
        readonly inputs: readonly [{
            readonly internalType: "contract ISuperToken";
            readonly name: "superToken";
            readonly type: "address";
        }, {
            readonly internalType: "address";
            readonly name: "receiver";
            readonly type: "address";
        }];
        readonly name: "deleteVestingSchedule";
        readonly outputs: readonly [];
        readonly stateMutability: "nonpayable";
        readonly type: "function";
    }, {
        readonly inputs: readonly [{
            readonly internalType: "contract ISuperToken";
            readonly name: "superToken";
            readonly type: "address";
        }, {
            readonly internalType: "address";
            readonly name: "receiver";
            readonly type: "address";
        }];
        readonly name: "endVestingScheduleNow";
        readonly outputs: readonly [];
        readonly stateMutability: "nonpayable";
        readonly type: "function";
    }, {
        readonly inputs: readonly [{
            readonly internalType: "contract ISuperToken";
            readonly name: "superToken";
            readonly type: "address";
        }, {
            readonly internalType: "address";
            readonly name: "sender";
            readonly type: "address";
        }, {
            readonly internalType: "address";
            readonly name: "receiver";
            readonly type: "address";
        }];
        readonly name: "executeCliffAndFlow";
        readonly outputs: readonly [{
            readonly internalType: "bool";
            readonly name: "success";
            readonly type: "bool";
        }];
        readonly stateMutability: "nonpayable";
        readonly type: "function";
    }, {
        readonly inputs: readonly [{
            readonly internalType: "contract ISuperToken";
            readonly name: "superToken";
            readonly type: "address";
        }, {
            readonly internalType: "address";
            readonly name: "sender";
            readonly type: "address";
        }, {
            readonly internalType: "address";
            readonly name: "receiver";
            readonly type: "address";
        }];
        readonly name: "executeEndVesting";
        readonly outputs: readonly [{
            readonly internalType: "bool";
            readonly name: "success";
            readonly type: "bool";
        }];
        readonly stateMutability: "nonpayable";
        readonly type: "function";
    }, {
        readonly inputs: readonly [{
            readonly internalType: "contract ISuperToken";
            readonly name: "superToken";
            readonly type: "address";
        }, {
            readonly internalType: "address";
            readonly name: "sender";
            readonly type: "address";
        }, {
            readonly internalType: "address";
            readonly name: "receiver";
            readonly type: "address";
        }];
        readonly name: "getMaximumNeededTokenAllowance";
        readonly outputs: readonly [{
            readonly internalType: "uint256";
            readonly name: "maxNeededAllowance";
            readonly type: "uint256";
        }];
        readonly stateMutability: "view";
        readonly type: "function";
    }, {
        readonly inputs: readonly [{
            readonly components: readonly [{
                readonly internalType: "uint32";
                readonly name: "cliffAndFlowDate";
                readonly type: "uint32";
            }, {
                readonly internalType: "uint32";
                readonly name: "endDate";
                readonly type: "uint32";
            }, {
                readonly internalType: "int96";
                readonly name: "flowRate";
                readonly type: "int96";
            }, {
                readonly internalType: "uint256";
                readonly name: "cliffAmount";
                readonly type: "uint256";
            }, {
                readonly internalType: "uint96";
                readonly name: "remainderAmount";
                readonly type: "uint96";
            }, {
                readonly internalType: "uint32";
                readonly name: "claimValidityDate";
                readonly type: "uint32";
            }];
            readonly internalType: "struct IVestingSchedulerV3.VestingSchedule";
            readonly name: "schedule";
            readonly type: "tuple";
        }];
        readonly name: "getMaximumNeededTokenAllowance";
        readonly outputs: readonly [{
            readonly internalType: "uint256";
            readonly name: "maxNeededAllowance";
            readonly type: "uint256";
        }];
        readonly stateMutability: "pure";
        readonly type: "function";
    }, {
        readonly inputs: readonly [{
            readonly internalType: "contract ISuperToken";
            readonly name: "superToken";
            readonly type: "address";
        }, {
            readonly internalType: "address";
            readonly name: "sender";
            readonly type: "address";
        }, {
            readonly internalType: "address";
            readonly name: "receiver";
            readonly type: "address";
        }];
        readonly name: "getTotalVestedAmount";
        readonly outputs: readonly [{
            readonly internalType: "uint256";
            readonly name: "totalVestedAmount";
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
            readonly name: "sender";
            readonly type: "address";
        }, {
            readonly internalType: "address";
            readonly name: "receiver";
            readonly type: "address";
        }];
        readonly name: "getVestingSchedule";
        readonly outputs: readonly [{
            readonly components: readonly [{
                readonly internalType: "uint32";
                readonly name: "cliffAndFlowDate";
                readonly type: "uint32";
            }, {
                readonly internalType: "uint32";
                readonly name: "endDate";
                readonly type: "uint32";
            }, {
                readonly internalType: "int96";
                readonly name: "flowRate";
                readonly type: "int96";
            }, {
                readonly internalType: "uint256";
                readonly name: "cliffAmount";
                readonly type: "uint256";
            }, {
                readonly internalType: "uint96";
                readonly name: "remainderAmount";
                readonly type: "uint96";
            }, {
                readonly internalType: "uint32";
                readonly name: "claimValidityDate";
                readonly type: "uint32";
            }];
            readonly internalType: "struct IVestingSchedulerV3.VestingSchedule";
            readonly name: "schedule";
            readonly type: "tuple";
        }];
        readonly stateMutability: "view";
        readonly type: "function";
    }, {
        readonly inputs: readonly [{
            readonly internalType: "address";
            readonly name: "forwarder";
            readonly type: "address";
        }];
        readonly name: "isTrustedForwarder";
        readonly outputs: readonly [{
            readonly internalType: "bool";
            readonly name: "isForwarderTrusted";
            readonly type: "bool";
        }];
        readonly stateMutability: "view";
        readonly type: "function";
    }, {
        readonly inputs: readonly [{
            readonly internalType: "contract ISuperToken";
            readonly name: "superToken";
            readonly type: "address";
        }, {
            readonly internalType: "address";
            readonly name: "sender";
            readonly type: "address";
        }, {
            readonly internalType: "address";
            readonly name: "receiver";
            readonly type: "address";
        }, {
            readonly internalType: "uint256";
            readonly name: "totalAmount";
            readonly type: "uint256";
        }, {
            readonly internalType: "uint32";
            readonly name: "totalDuration";
            readonly type: "uint32";
        }, {
            readonly internalType: "uint32";
            readonly name: "startDate";
            readonly type: "uint32";
        }, {
            readonly internalType: "uint32";
            readonly name: "cliffPeriod";
            readonly type: "uint32";
        }, {
            readonly internalType: "uint32";
            readonly name: "claimPeriod";
            readonly type: "uint32";
        }, {
            readonly internalType: "uint256";
            readonly name: "cliffAmount";
            readonly type: "uint256";
        }];
        readonly name: "mapCreateVestingScheduleParams";
        readonly outputs: readonly [{
            readonly components: readonly [{
                readonly internalType: "contract ISuperToken";
                readonly name: "superToken";
                readonly type: "address";
            }, {
                readonly internalType: "address";
                readonly name: "sender";
                readonly type: "address";
            }, {
                readonly internalType: "address";
                readonly name: "receiver";
                readonly type: "address";
            }, {
                readonly internalType: "uint32";
                readonly name: "startDate";
                readonly type: "uint32";
            }, {
                readonly internalType: "uint32";
                readonly name: "claimValidityDate";
                readonly type: "uint32";
            }, {
                readonly internalType: "uint32";
                readonly name: "cliffDate";
                readonly type: "uint32";
            }, {
                readonly internalType: "int96";
                readonly name: "flowRate";
                readonly type: "int96";
            }, {
                readonly internalType: "uint256";
                readonly name: "cliffAmount";
                readonly type: "uint256";
            }, {
                readonly internalType: "uint32";
                readonly name: "endDate";
                readonly type: "uint32";
            }, {
                readonly internalType: "uint96";
                readonly name: "remainderAmount";
                readonly type: "uint96";
            }];
            readonly internalType: "struct IVestingSchedulerV3.ScheduleCreationParams";
            readonly name: "params";
            readonly type: "tuple";
        }];
        readonly stateMutability: "pure";
        readonly type: "function";
    }, {
        readonly inputs: readonly [{
            readonly internalType: "contract ISuperToken";
            readonly name: "superToken";
            readonly type: "address";
        }, {
            readonly internalType: "address";
            readonly name: "sender";
            readonly type: "address";
        }, {
            readonly internalType: "address";
            readonly name: "receiver";
            readonly type: "address";
        }, {
            readonly internalType: "uint256";
            readonly name: "totalAmount";
            readonly type: "uint256";
        }, {
            readonly internalType: "uint32";
            readonly name: "totalDuration";
            readonly type: "uint32";
        }, {
            readonly internalType: "uint32";
            readonly name: "startDate";
            readonly type: "uint32";
        }, {
            readonly internalType: "uint32";
            readonly name: "cliffPeriod";
            readonly type: "uint32";
        }, {
            readonly internalType: "uint32";
            readonly name: "claimPeriod";
            readonly type: "uint32";
        }];
        readonly name: "mapCreateVestingScheduleParams";
        readonly outputs: readonly [{
            readonly components: readonly [{
                readonly internalType: "contract ISuperToken";
                readonly name: "superToken";
                readonly type: "address";
            }, {
                readonly internalType: "address";
                readonly name: "sender";
                readonly type: "address";
            }, {
                readonly internalType: "address";
                readonly name: "receiver";
                readonly type: "address";
            }, {
                readonly internalType: "uint32";
                readonly name: "startDate";
                readonly type: "uint32";
            }, {
                readonly internalType: "uint32";
                readonly name: "claimValidityDate";
                readonly type: "uint32";
            }, {
                readonly internalType: "uint32";
                readonly name: "cliffDate";
                readonly type: "uint32";
            }, {
                readonly internalType: "int96";
                readonly name: "flowRate";
                readonly type: "int96";
            }, {
                readonly internalType: "uint256";
                readonly name: "cliffAmount";
                readonly type: "uint256";
            }, {
                readonly internalType: "uint32";
                readonly name: "endDate";
                readonly type: "uint32";
            }, {
                readonly internalType: "uint96";
                readonly name: "remainderAmount";
                readonly type: "uint96";
            }];
            readonly internalType: "struct IVestingSchedulerV3.ScheduleCreationParams";
            readonly name: "params";
            readonly type: "tuple";
        }];
        readonly stateMutability: "pure";
        readonly type: "function";
    }, {
        readonly inputs: readonly [{
            readonly internalType: "contract ISuperToken";
            readonly name: "superToken";
            readonly type: "address";
        }, {
            readonly internalType: "address";
            readonly name: "receiver";
            readonly type: "address";
        }, {
            readonly internalType: "uint32";
            readonly name: "newEndDate";
            readonly type: "uint32";
        }];
        readonly name: "updateVestingSchedule";
        readonly outputs: readonly [];
        readonly stateMutability: "nonpayable";
        readonly type: "function";
    }, {
        readonly inputs: readonly [{
            readonly internalType: "contract ISuperToken";
            readonly name: "superToken";
            readonly type: "address";
        }, {
            readonly internalType: "address";
            readonly name: "receiver";
            readonly type: "address";
        }, {
            readonly internalType: "uint256";
            readonly name: "newTotalAmount";
            readonly type: "uint256";
        }];
        readonly name: "updateVestingScheduleFlowRateFromAmount";
        readonly outputs: readonly [];
        readonly stateMutability: "nonpayable";
        readonly type: "function";
    }, {
        readonly inputs: readonly [{
            readonly internalType: "contract ISuperToken";
            readonly name: "superToken";
            readonly type: "address";
        }, {
            readonly internalType: "address";
            readonly name: "receiver";
            readonly type: "address";
        }, {
            readonly internalType: "uint256";
            readonly name: "newTotalAmount";
            readonly type: "uint256";
        }, {
            readonly internalType: "uint32";
            readonly name: "newEndDate";
            readonly type: "uint32";
        }];
        readonly name: "updateVestingScheduleFlowRateFromAmountAndEndDate";
        readonly outputs: readonly [];
        readonly stateMutability: "nonpayable";
        readonly type: "function";
    }, {
        readonly inputs: readonly [{
            readonly internalType: "contract ISuperToken";
            readonly name: "superToken";
            readonly type: "address";
        }, {
            readonly internalType: "address";
            readonly name: "receiver";
            readonly type: "address";
        }, {
            readonly internalType: "uint32";
            readonly name: "newEndDate";
            readonly type: "uint32";
        }];
        readonly name: "updateVestingScheduleFlowRateFromEndDate";
        readonly outputs: readonly [];
        readonly stateMutability: "nonpayable";
        readonly type: "function";
    }, {
        readonly inputs: readonly [];
        readonly name: "versionRecipient";
        readonly outputs: readonly [{
            readonly internalType: "string";
            readonly name: "version";
            readonly type: "string";
        }];
        readonly stateMutability: "pure";
        readonly type: "function";
    }, {
        readonly inputs: readonly [{
            readonly internalType: "bytes32";
            readonly name: "vestingId";
            readonly type: "bytes32";
        }];
        readonly name: "vestingSchedules";
        readonly outputs: readonly [{
            readonly internalType: "uint32";
            readonly name: "cliffAndFlowDate";
            readonly type: "uint32";
        }, {
            readonly internalType: "uint32";
            readonly name: "endDate";
            readonly type: "uint32";
        }, {
            readonly internalType: "int96";
            readonly name: "flowRate";
            readonly type: "int96";
        }, {
            readonly internalType: "uint256";
            readonly name: "cliffAmount";
            readonly type: "uint256";
        }, {
            readonly internalType: "uint96";
            readonly name: "remainderAmount";
            readonly type: "uint96";
        }, {
            readonly internalType: "uint32";
            readonly name: "claimValidityDate";
            readonly type: "uint32";
        }];
        readonly stateMutability: "view";
        readonly type: "function";
    }];
    static createInterface(): VestingScheduler_v3Interface;
    static connect(address: string, signerOrProvider: Signer | Provider): VestingScheduler_v3;
}
