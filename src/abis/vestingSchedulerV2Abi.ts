export const vestingSchedulerV2Abi = [
    {
        "inputs": [
            {
                "internalType": "contract ISuperfluid",
                "name": "host",
                "type": "address"
            }
        ],
        "stateMutability": "nonpayable",
        "type": "constructor"
    },
    {
        "inputs": [],
        "name": "AccountInvalid",
        "type": "error"
    },
    {
        "inputs": [],
        "name": "AlreadyExecuted",
        "type": "error"
    },
    {
        "inputs": [],
        "name": "CannotClaimScheduleOnBehalf",
        "type": "error"
    },
    {
        "inputs": [],
        "name": "CliffInvalid",
        "type": "error"
    },
    {
        "inputs": [],
        "name": "FlowRateInvalid",
        "type": "error"
    },
    {
        "inputs": [],
        "name": "HostInvalid",
        "type": "error"
    },
    {
        "inputs": [],
        "name": "ScheduleAlreadyExists",
        "type": "error"
    },
    {
        "inputs": [],
        "name": "ScheduleDoesNotExist",
        "type": "error"
    },
    {
        "inputs": [],
        "name": "ScheduleNotClaimed",
        "type": "error"
    },
    {
        "inputs": [],
        "name": "ScheduleNotFlowing",
        "type": "error"
    },
    {
        "inputs": [],
        "name": "TimeWindowInvalid",
        "type": "error"
    },
    {
        "inputs": [],
        "name": "ZeroAddress",
        "type": "error"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": true,
                "internalType": "contract ISuperToken",
                "name": "superToken",
                "type": "address"
            },
            {
                "indexed": true,
                "internalType": "address",
                "name": "sender",
                "type": "address"
            },
            {
                "indexed": true,
                "internalType": "address",
                "name": "receiver",
                "type": "address"
            },
            {
                "indexed": false,
                "internalType": "address",
                "name": "claimer",
                "type": "address"
            }
        ],
        "name": "VestingClaimed",
        "type": "event"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": true,
                "internalType": "contract ISuperToken",
                "name": "superToken",
                "type": "address"
            },
            {
                "indexed": true,
                "internalType": "address",
                "name": "sender",
                "type": "address"
            },
            {
                "indexed": true,
                "internalType": "address",
                "name": "receiver",
                "type": "address"
            },
            {
                "indexed": false,
                "internalType": "uint32",
                "name": "cliffAndFlowDate",
                "type": "uint32"
            },
            {
                "indexed": false,
                "internalType": "int96",
                "name": "flowRate",
                "type": "int96"
            },
            {
                "indexed": false,
                "internalType": "uint256",
                "name": "cliffAmount",
                "type": "uint256"
            },
            {
                "indexed": false,
                "internalType": "uint256",
                "name": "flowDelayCompensation",
                "type": "uint256"
            }
        ],
        "name": "VestingCliffAndFlowExecuted",
        "type": "event"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": true,
                "internalType": "contract ISuperToken",
                "name": "superToken",
                "type": "address"
            },
            {
                "indexed": true,
                "internalType": "address",
                "name": "sender",
                "type": "address"
            },
            {
                "indexed": true,
                "internalType": "address",
                "name": "receiver",
                "type": "address"
            },
            {
                "indexed": false,
                "internalType": "uint32",
                "name": "endDate",
                "type": "uint32"
            },
            {
                "indexed": false,
                "internalType": "uint256",
                "name": "earlyEndCompensation",
                "type": "uint256"
            },
            {
                "indexed": false,
                "internalType": "bool",
                "name": "didCompensationFail",
                "type": "bool"
            }
        ],
        "name": "VestingEndExecuted",
        "type": "event"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": true,
                "internalType": "contract ISuperToken",
                "name": "superToken",
                "type": "address"
            },
            {
                "indexed": true,
                "internalType": "address",
                "name": "sender",
                "type": "address"
            },
            {
                "indexed": true,
                "internalType": "address",
                "name": "receiver",
                "type": "address"
            },
            {
                "indexed": false,
                "internalType": "uint32",
                "name": "endDate",
                "type": "uint32"
            }
        ],
        "name": "VestingEndFailed",
        "type": "event"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": true,
                "internalType": "contract ISuperToken",
                "name": "superToken",
                "type": "address"
            },
            {
                "indexed": true,
                "internalType": "address",
                "name": "sender",
                "type": "address"
            },
            {
                "indexed": true,
                "internalType": "address",
                "name": "receiver",
                "type": "address"
            },
            {
                "indexed": false,
                "internalType": "uint32",
                "name": "startDate",
                "type": "uint32"
            },
            {
                "indexed": false,
                "internalType": "uint32",
                "name": "cliffDate",
                "type": "uint32"
            },
            {
                "indexed": false,
                "internalType": "int96",
                "name": "flowRate",
                "type": "int96"
            },
            {
                "indexed": false,
                "internalType": "uint32",
                "name": "endDate",
                "type": "uint32"
            },
            {
                "indexed": false,
                "internalType": "uint256",
                "name": "cliffAmount",
                "type": "uint256"
            },
            {
                "indexed": false,
                "internalType": "uint32",
                "name": "claimValidityDate",
                "type": "uint32"
            },
            {
                "indexed": false,
                "internalType": "uint96",
                "name": "remainderAmount",
                "type": "uint96"
            }
        ],
        "name": "VestingScheduleCreated",
        "type": "event"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": true,
                "internalType": "contract ISuperToken",
                "name": "superToken",
                "type": "address"
            },
            {
                "indexed": true,
                "internalType": "address",
                "name": "sender",
                "type": "address"
            },
            {
                "indexed": true,
                "internalType": "address",
                "name": "receiver",
                "type": "address"
            }
        ],
        "name": "VestingScheduleDeleted",
        "type": "event"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": true,
                "internalType": "contract ISuperToken",
                "name": "superToken",
                "type": "address"
            },
            {
                "indexed": true,
                "internalType": "address",
                "name": "sender",
                "type": "address"
            },
            {
                "indexed": true,
                "internalType": "address",
                "name": "receiver",
                "type": "address"
            },
            {
                "indexed": false,
                "internalType": "uint32",
                "name": "oldEndDate",
                "type": "uint32"
            },
            {
                "indexed": false,
                "internalType": "uint32",
                "name": "endDate",
                "type": "uint32"
            },
            {
                "indexed": false,
                "internalType": "uint96",
                "name": "remainderAmount",
                "type": "uint96"
            }
        ],
        "name": "VestingScheduleUpdated",
        "type": "event"
    },
    {
        "inputs": [],
        "name": "END_DATE_VALID_BEFORE",
        "outputs": [
            {
                "internalType": "uint32",
                "name": "",
                "type": "uint32"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "MIN_VESTING_DURATION",
        "outputs": [
            {
                "internalType": "uint32",
                "name": "",
                "type": "uint32"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "START_DATE_VALID_AFTER",
        "outputs": [
            {
                "internalType": "uint32",
                "name": "",
                "type": "uint32"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "contract ISuperToken",
                "name": "",
                "type": "address"
            },
            {
                "internalType": "address",
                "name": "",
                "type": "address"
            },
            {
                "internalType": "bytes32",
                "name": "",
                "type": "bytes32"
            },
            {
                "internalType": "bytes",
                "name": "",
                "type": "bytes"
            },
            {
                "internalType": "bytes",
                "name": "",
                "type": "bytes"
            },
            {
                "internalType": "bytes",
                "name": "",
                "type": "bytes"
            }
        ],
        "name": "afterAgreementCreated",
        "outputs": [
            {
                "internalType": "bytes",
                "name": "",
                "type": "bytes"
            }
        ],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "contract ISuperToken",
                "name": "",
                "type": "address"
            },
            {
                "internalType": "address",
                "name": "",
                "type": "address"
            },
            {
                "internalType": "bytes32",
                "name": "",
                "type": "bytes32"
            },
            {
                "internalType": "bytes",
                "name": "",
                "type": "bytes"
            },
            {
                "internalType": "bytes",
                "name": "",
                "type": "bytes"
            },
            {
                "internalType": "bytes",
                "name": "",
                "type": "bytes"
            }
        ],
        "name": "afterAgreementTerminated",
        "outputs": [
            {
                "internalType": "bytes",
                "name": "",
                "type": "bytes"
            }
        ],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "contract ISuperToken",
                "name": "",
                "type": "address"
            },
            {
                "internalType": "address",
                "name": "",
                "type": "address"
            },
            {
                "internalType": "bytes32",
                "name": "",
                "type": "bytes32"
            },
            {
                "internalType": "bytes",
                "name": "",
                "type": "bytes"
            },
            {
                "internalType": "bytes",
                "name": "",
                "type": "bytes"
            },
            {
                "internalType": "bytes",
                "name": "",
                "type": "bytes"
            }
        ],
        "name": "afterAgreementUpdated",
        "outputs": [
            {
                "internalType": "bytes",
                "name": "",
                "type": "bytes"
            }
        ],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "contract ISuperToken",
                "name": "",
                "type": "address"
            },
            {
                "internalType": "address",
                "name": "",
                "type": "address"
            },
            {
                "internalType": "bytes32",
                "name": "",
                "type": "bytes32"
            },
            {
                "internalType": "bytes",
                "name": "",
                "type": "bytes"
            },
            {
                "internalType": "bytes",
                "name": "",
                "type": "bytes"
            }
        ],
        "name": "beforeAgreementCreated",
        "outputs": [
            {
                "internalType": "bytes",
                "name": "",
                "type": "bytes"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "contract ISuperToken",
                "name": "",
                "type": "address"
            },
            {
                "internalType": "address",
                "name": "",
                "type": "address"
            },
            {
                "internalType": "bytes32",
                "name": "",
                "type": "bytes32"
            },
            {
                "internalType": "bytes",
                "name": "",
                "type": "bytes"
            },
            {
                "internalType": "bytes",
                "name": "",
                "type": "bytes"
            }
        ],
        "name": "beforeAgreementTerminated",
        "outputs": [
            {
                "internalType": "bytes",
                "name": "",
                "type": "bytes"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "contract ISuperToken",
                "name": "",
                "type": "address"
            },
            {
                "internalType": "address",
                "name": "",
                "type": "address"
            },
            {
                "internalType": "bytes32",
                "name": "",
                "type": "bytes32"
            },
            {
                "internalType": "bytes",
                "name": "",
                "type": "bytes"
            },
            {
                "internalType": "bytes",
                "name": "",
                "type": "bytes"
            }
        ],
        "name": "beforeAgreementUpdated",
        "outputs": [
            {
                "internalType": "bytes",
                "name": "",
                "type": "bytes"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "cfaV1",
        "outputs": [
            {
                "internalType": "contract ISuperfluid",
                "name": "host",
                "type": "address"
            },
            {
                "internalType": "contract IConstantFlowAgreementV1",
                "name": "cfa",
                "type": "address"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "contract ISuperToken",
                "name": "superToken",
                "type": "address"
            },
            {
                "internalType": "address",
                "name": "receiver",
                "type": "address"
            },
            {
                "internalType": "uint256",
                "name": "totalAmount",
                "type": "uint256"
            },
            {
                "internalType": "uint32",
                "name": "totalDuration",
                "type": "uint32"
            },
            {
                "internalType": "bytes",
                "name": "ctx",
                "type": "bytes"
            }
        ],
        "name": "createAndExecuteVestingScheduleFromAmountAndDuration",
        "outputs": [
            {
                "internalType": "bytes",
                "name": "newCtx",
                "type": "bytes"
            }
        ],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "contract ISuperToken",
                "name": "superToken",
                "type": "address"
            },
            {
                "internalType": "address",
                "name": "receiver",
                "type": "address"
            },
            {
                "internalType": "uint256",
                "name": "totalAmount",
                "type": "uint256"
            },
            {
                "internalType": "uint32",
                "name": "totalDuration",
                "type": "uint32"
            }
        ],
        "name": "createAndExecuteVestingScheduleFromAmountAndDuration",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "contract ISuperToken",
                "name": "superToken",
                "type": "address"
            },
            {
                "internalType": "address",
                "name": "receiver",
                "type": "address"
            },
            {
                "internalType": "uint32",
                "name": "startDate",
                "type": "uint32"
            },
            {
                "internalType": "uint32",
                "name": "cliffDate",
                "type": "uint32"
            },
            {
                "internalType": "int96",
                "name": "flowRate",
                "type": "int96"
            },
            {
                "internalType": "uint256",
                "name": "cliffAmount",
                "type": "uint256"
            },
            {
                "internalType": "uint32",
                "name": "endDate",
                "type": "uint32"
            },
            {
                "internalType": "uint32",
                "name": "claimValidityDate",
                "type": "uint32"
            }
        ],
        "name": "createVestingSchedule",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "contract ISuperToken",
                "name": "superToken",
                "type": "address"
            },
            {
                "internalType": "address",
                "name": "receiver",
                "type": "address"
            },
            {
                "internalType": "uint32",
                "name": "startDate",
                "type": "uint32"
            },
            {
                "internalType": "uint32",
                "name": "cliffDate",
                "type": "uint32"
            },
            {
                "internalType": "int96",
                "name": "flowRate",
                "type": "int96"
            },
            {
                "internalType": "uint256",
                "name": "cliffAmount",
                "type": "uint256"
            },
            {
                "internalType": "uint32",
                "name": "endDate",
                "type": "uint32"
            },
            {
                "internalType": "bytes",
                "name": "ctx",
                "type": "bytes"
            }
        ],
        "name": "createVestingSchedule",
        "outputs": [
            {
                "internalType": "bytes",
                "name": "newCtx",
                "type": "bytes"
            }
        ],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "contract ISuperToken",
                "name": "superToken",
                "type": "address"
            },
            {
                "internalType": "address",
                "name": "receiver",
                "type": "address"
            },
            {
                "internalType": "uint32",
                "name": "startDate",
                "type": "uint32"
            },
            {
                "internalType": "uint32",
                "name": "cliffDate",
                "type": "uint32"
            },
            {
                "internalType": "int96",
                "name": "flowRate",
                "type": "int96"
            },
            {
                "internalType": "uint256",
                "name": "cliffAmount",
                "type": "uint256"
            },
            {
                "internalType": "uint32",
                "name": "endDate",
                "type": "uint32"
            },
            {
                "internalType": "uint32",
                "name": "claimValidityDate",
                "type": "uint32"
            },
            {
                "internalType": "bytes",
                "name": "ctx",
                "type": "bytes"
            }
        ],
        "name": "createVestingSchedule",
        "outputs": [
            {
                "internalType": "bytes",
                "name": "newCtx",
                "type": "bytes"
            }
        ],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "contract ISuperToken",
                "name": "superToken",
                "type": "address"
            },
            {
                "internalType": "address",
                "name": "receiver",
                "type": "address"
            },
            {
                "internalType": "uint256",
                "name": "totalAmount",
                "type": "uint256"
            },
            {
                "internalType": "uint32",
                "name": "totalDuration",
                "type": "uint32"
            },
            {
                "internalType": "uint32",
                "name": "startDate",
                "type": "uint32"
            },
            {
                "internalType": "uint32",
                "name": "cliffPeriod",
                "type": "uint32"
            },
            {
                "internalType": "uint32",
                "name": "claimPeriod",
                "type": "uint32"
            },
            {
                "internalType": "bytes",
                "name": "ctx",
                "type": "bytes"
            }
        ],
        "name": "createVestingScheduleFromAmountAndDuration",
        "outputs": [
            {
                "internalType": "bytes",
                "name": "newCtx",
                "type": "bytes"
            }
        ],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "contract ISuperToken",
                "name": "superToken",
                "type": "address"
            },
            {
                "internalType": "address",
                "name": "receiver",
                "type": "address"
            },
            {
                "internalType": "uint256",
                "name": "totalAmount",
                "type": "uint256"
            },
            {
                "internalType": "uint32",
                "name": "totalDuration",
                "type": "uint32"
            },
            {
                "internalType": "uint32",
                "name": "startDate",
                "type": "uint32"
            },
            {
                "internalType": "uint32",
                "name": "cliffPeriod",
                "type": "uint32"
            },
            {
                "internalType": "uint32",
                "name": "claimPeriod",
                "type": "uint32"
            }
        ],
        "name": "createVestingScheduleFromAmountAndDuration",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "contract ISuperToken",
                "name": "superToken",
                "type": "address"
            },
            {
                "internalType": "address",
                "name": "receiver",
                "type": "address"
            },
            {
                "internalType": "bytes",
                "name": "ctx",
                "type": "bytes"
            }
        ],
        "name": "deleteVestingSchedule",
        "outputs": [
            {
                "internalType": "bytes",
                "name": "newCtx",
                "type": "bytes"
            }
        ],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "contract ISuperToken",
                "name": "superToken",
                "type": "address"
            },
            {
                "internalType": "address",
                "name": "sender",
                "type": "address"
            },
            {
                "internalType": "address",
                "name": "receiver",
                "type": "address"
            }
        ],
        "name": "executeCliffAndFlow",
        "outputs": [
            {
                "internalType": "bool",
                "name": "success",
                "type": "bool"
            }
        ],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "contract ISuperToken",
                "name": "superToken",
                "type": "address"
            },
            {
                "internalType": "address",
                "name": "sender",
                "type": "address"
            },
            {
                "internalType": "address",
                "name": "receiver",
                "type": "address"
            }
        ],
        "name": "executeEndVesting",
        "outputs": [
            {
                "internalType": "bool",
                "name": "success",
                "type": "bool"
            }
        ],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "components": [
                    {
                        "internalType": "uint32",
                        "name": "cliffAndFlowDate",
                        "type": "uint32"
                    },
                    {
                        "internalType": "uint32",
                        "name": "endDate",
                        "type": "uint32"
                    },
                    {
                        "internalType": "int96",
                        "name": "flowRate",
                        "type": "int96"
                    },
                    {
                        "internalType": "uint256",
                        "name": "cliffAmount",
                        "type": "uint256"
                    },
                    {
                        "internalType": "uint96",
                        "name": "remainderAmount",
                        "type": "uint96"
                    },
                    {
                        "internalType": "uint32",
                        "name": "claimValidityDate",
                        "type": "uint32"
                    }
                ],
                "internalType": "struct IVestingSchedulerV2.VestingSchedule",
                "name": "schedule",
                "type": "tuple"
            }
        ],
        "name": "getMaximumNeededTokenAllowance",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "stateMutability": "pure",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "superToken",
                "type": "address"
            },
            {
                "internalType": "address",
                "name": "sender",
                "type": "address"
            },
            {
                "internalType": "address",
                "name": "receiver",
                "type": "address"
            }
        ],
        "name": "getVestingSchedule",
        "outputs": [
            {
                "components": [
                    {
                        "internalType": "uint32",
                        "name": "cliffAndFlowDate",
                        "type": "uint32"
                    },
                    {
                        "internalType": "uint32",
                        "name": "endDate",
                        "type": "uint32"
                    },
                    {
                        "internalType": "int96",
                        "name": "flowRate",
                        "type": "int96"
                    },
                    {
                        "internalType": "uint256",
                        "name": "cliffAmount",
                        "type": "uint256"
                    },
                    {
                        "internalType": "uint96",
                        "name": "remainderAmount",
                        "type": "uint96"
                    },
                    {
                        "internalType": "uint32",
                        "name": "claimValidityDate",
                        "type": "uint32"
                    }
                ],
                "internalType": "struct IVestingSchedulerV2.VestingSchedule",
                "name": "",
                "type": "tuple"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "contract ISuperToken",
                "name": "superToken",
                "type": "address"
            },
            {
                "internalType": "address",
                "name": "sender",
                "type": "address"
            },
            {
                "internalType": "address",
                "name": "receiver",
                "type": "address"
            },
            {
                "internalType": "uint256",
                "name": "totalAmount",
                "type": "uint256"
            },
            {
                "internalType": "uint32",
                "name": "totalDuration",
                "type": "uint32"
            },
            {
                "internalType": "uint32",
                "name": "startDate",
                "type": "uint32"
            },
            {
                "internalType": "uint32",
                "name": "cliffPeriod",
                "type": "uint32"
            },
            {
                "internalType": "uint32",
                "name": "claimPeriod",
                "type": "uint32"
            }
        ],
        "name": "mapCreateVestingScheduleParams",
        "outputs": [
            {
                "components": [
                    {
                        "internalType": "contract ISuperToken",
                        "name": "superToken",
                        "type": "address"
                    },
                    {
                        "internalType": "address",
                        "name": "sender",
                        "type": "address"
                    },
                    {
                        "internalType": "address",
                        "name": "receiver",
                        "type": "address"
                    },
                    {
                        "internalType": "uint32",
                        "name": "startDate",
                        "type": "uint32"
                    },
                    {
                        "internalType": "uint32",
                        "name": "claimValidityDate",
                        "type": "uint32"
                    },
                    {
                        "internalType": "uint32",
                        "name": "cliffDate",
                        "type": "uint32"
                    },
                    {
                        "internalType": "int96",
                        "name": "flowRate",
                        "type": "int96"
                    },
                    {
                        "internalType": "uint256",
                        "name": "cliffAmount",
                        "type": "uint256"
                    },
                    {
                        "internalType": "uint32",
                        "name": "endDate",
                        "type": "uint32"
                    },
                    {
                        "internalType": "uint96",
                        "name": "remainderAmount",
                        "type": "uint96"
                    }
                ],
                "internalType": "struct IVestingSchedulerV2.ScheduleCreationParams",
                "name": "params",
                "type": "tuple"
            }
        ],
        "stateMutability": "pure",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "contract ISuperToken",
                "name": "superToken",
                "type": "address"
            },
            {
                "internalType": "address",
                "name": "receiver",
                "type": "address"
            },
            {
                "internalType": "uint32",
                "name": "endDate",
                "type": "uint32"
            },
            {
                "internalType": "bytes",
                "name": "ctx",
                "type": "bytes"
            }
        ],
        "name": "updateVestingSchedule",
        "outputs": [
            {
                "internalType": "bytes",
                "name": "newCtx",
                "type": "bytes"
            }
        ],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "bytes32",
                "name": "",
                "type": "bytes32"
            }
        ],
        "name": "vestingSchedules",
        "outputs": [
            {
                "internalType": "uint32",
                "name": "cliffAndFlowDate",
                "type": "uint32"
            },
            {
                "internalType": "uint32",
                "name": "endDate",
                "type": "uint32"
            },
            {
                "internalType": "int96",
                "name": "flowRate",
                "type": "int96"
            },
            {
                "internalType": "uint256",
                "name": "cliffAmount",
                "type": "uint256"
            },
            {
                "internalType": "uint96",
                "name": "remainderAmount",
                "type": "uint96"
            },
            {
                "internalType": "uint32",
                "name": "claimValidityDate",
                "type": "uint32"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    }
] as const;