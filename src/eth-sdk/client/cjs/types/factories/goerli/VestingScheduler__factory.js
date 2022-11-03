"use strict";
/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */
Object.defineProperty(exports, "__esModule", { value: true });
exports.VestingScheduler__factory = void 0;
const ethers_1 = require("ethers");
const _abi = [
    {
        inputs: [
            {
                internalType: "contract ISuperfluid",
                name: "host",
                type: "address",
            },
            {
                internalType: "string",
                name: "registrationKey",
                type: "string",
            },
        ],
        stateMutability: "nonpayable",
        type: "constructor",
    },
    {
        inputs: [],
        name: "AccountInvalid",
        type: "error",
    },
    {
        inputs: [],
        name: "FlowRateInvalid",
        type: "error",
    },
    {
        inputs: [],
        name: "HostInvalid",
        type: "error",
    },
    {
        inputs: [],
        name: "ScheduleDontExist",
        type: "error",
    },
    {
        inputs: [],
        name: "ScheduleExist",
        type: "error",
    },
    {
        inputs: [],
        name: "TimeWindowInvalid",
        type: "error",
    },
    {
        inputs: [],
        name: "ZeroAddress",
        type: "error",
    },
    {
        anonymous: false,
        inputs: [
            {
                indexed: true,
                internalType: "address",
                name: "sender",
                type: "address",
            },
            {
                indexed: true,
                internalType: "address",
                name: "receiver",
                type: "address",
            },
            {
                indexed: true,
                internalType: "contract ISuperToken",
                name: "superToken",
                type: "address",
            },
            {
                indexed: false,
                internalType: "uint32",
                name: "startDate",
                type: "uint32",
            },
            {
                indexed: false,
                internalType: "uint32",
                name: "cliffDate",
                type: "uint32",
            },
            {
                indexed: false,
                internalType: "int96",
                name: "flowRate",
                type: "int96",
            },
            {
                indexed: false,
                internalType: "uint32",
                name: "endDate",
                type: "uint32",
            },
            {
                indexed: false,
                internalType: "uint256",
                name: "cliffTransferAmount",
                type: "uint256",
            },
        ],
        name: "CreateVestingSchedule",
        type: "event",
    },
    {
        anonymous: false,
        inputs: [
            {
                indexed: true,
                internalType: "address",
                name: "sender",
                type: "address",
            },
            {
                indexed: true,
                internalType: "address",
                name: "receiver",
                type: "address",
            },
            {
                indexed: true,
                internalType: "contract ISuperToken",
                name: "superToken",
                type: "address",
            },
        ],
        name: "DeleteVestingSchedule",
        type: "event",
    },
    {
        anonymous: false,
        inputs: [
            {
                indexed: true,
                internalType: "address",
                name: "sender",
                type: "address",
            },
            {
                indexed: true,
                internalType: "address",
                name: "receiver",
                type: "address",
            },
            {
                indexed: true,
                internalType: "contract ISuperToken",
                name: "superToken",
                type: "address",
            },
            {
                indexed: false,
                internalType: "uint32",
                name: "endDate",
                type: "uint32",
            },
            {
                indexed: false,
                internalType: "uint256",
                name: "closingTransferAmount",
                type: "uint256",
            },
            {
                indexed: false,
                internalType: "bool",
                name: "didTransferFail",
                type: "bool",
            },
        ],
        name: "ExecuteClosingVesting",
        type: "event",
    },
    {
        anonymous: false,
        inputs: [
            {
                indexed: true,
                internalType: "address",
                name: "sender",
                type: "address",
            },
            {
                indexed: true,
                internalType: "address",
                name: "receiver",
                type: "address",
            },
            {
                indexed: true,
                internalType: "contract ISuperToken",
                name: "superToken",
                type: "address",
            },
            {
                indexed: false,
                internalType: "uint32",
                name: "effectiveStartDate",
                type: "uint32",
            },
            {
                indexed: false,
                internalType: "int96",
                name: "flowRate",
                type: "int96",
            },
            {
                indexed: false,
                internalType: "uint256",
                name: "cliffTransferAmount",
                type: "uint256",
            },
            {
                indexed: false,
                internalType: "uint256",
                name: "adjustedAmount",
                type: "uint256",
            },
        ],
        name: "ExecuteVesting",
        type: "event",
    },
    {
        inputs: [
            {
                internalType: "contract ISuperToken",
                name: "",
                type: "address",
            },
            {
                internalType: "address",
                name: "",
                type: "address",
            },
            {
                internalType: "bytes32",
                name: "",
                type: "bytes32",
            },
            {
                internalType: "bytes",
                name: "",
                type: "bytes",
            },
            {
                internalType: "bytes",
                name: "",
                type: "bytes",
            },
            {
                internalType: "bytes",
                name: "",
                type: "bytes",
            },
        ],
        name: "afterAgreementCreated",
        outputs: [
            {
                internalType: "bytes",
                name: "",
                type: "bytes",
            },
        ],
        stateMutability: "nonpayable",
        type: "function",
    },
    {
        inputs: [
            {
                internalType: "contract ISuperToken",
                name: "",
                type: "address",
            },
            {
                internalType: "address",
                name: "",
                type: "address",
            },
            {
                internalType: "bytes32",
                name: "",
                type: "bytes32",
            },
            {
                internalType: "bytes",
                name: "",
                type: "bytes",
            },
            {
                internalType: "bytes",
                name: "",
                type: "bytes",
            },
            {
                internalType: "bytes",
                name: "",
                type: "bytes",
            },
        ],
        name: "afterAgreementTerminated",
        outputs: [
            {
                internalType: "bytes",
                name: "",
                type: "bytes",
            },
        ],
        stateMutability: "nonpayable",
        type: "function",
    },
    {
        inputs: [
            {
                internalType: "contract ISuperToken",
                name: "",
                type: "address",
            },
            {
                internalType: "address",
                name: "",
                type: "address",
            },
            {
                internalType: "bytes32",
                name: "",
                type: "bytes32",
            },
            {
                internalType: "bytes",
                name: "",
                type: "bytes",
            },
            {
                internalType: "bytes",
                name: "",
                type: "bytes",
            },
            {
                internalType: "bytes",
                name: "",
                type: "bytes",
            },
        ],
        name: "afterAgreementUpdated",
        outputs: [
            {
                internalType: "bytes",
                name: "",
                type: "bytes",
            },
        ],
        stateMutability: "nonpayable",
        type: "function",
    },
    {
        inputs: [
            {
                internalType: "contract ISuperToken",
                name: "",
                type: "address",
            },
            {
                internalType: "address",
                name: "",
                type: "address",
            },
            {
                internalType: "bytes32",
                name: "",
                type: "bytes32",
            },
            {
                internalType: "bytes",
                name: "",
                type: "bytes",
            },
            {
                internalType: "bytes",
                name: "",
                type: "bytes",
            },
        ],
        name: "beforeAgreementCreated",
        outputs: [
            {
                internalType: "bytes",
                name: "",
                type: "bytes",
            },
        ],
        stateMutability: "view",
        type: "function",
    },
    {
        inputs: [
            {
                internalType: "contract ISuperToken",
                name: "",
                type: "address",
            },
            {
                internalType: "address",
                name: "",
                type: "address",
            },
            {
                internalType: "bytes32",
                name: "",
                type: "bytes32",
            },
            {
                internalType: "bytes",
                name: "",
                type: "bytes",
            },
            {
                internalType: "bytes",
                name: "",
                type: "bytes",
            },
        ],
        name: "beforeAgreementTerminated",
        outputs: [
            {
                internalType: "bytes",
                name: "",
                type: "bytes",
            },
        ],
        stateMutability: "view",
        type: "function",
    },
    {
        inputs: [
            {
                internalType: "contract ISuperToken",
                name: "",
                type: "address",
            },
            {
                internalType: "address",
                name: "",
                type: "address",
            },
            {
                internalType: "bytes32",
                name: "",
                type: "bytes32",
            },
            {
                internalType: "bytes",
                name: "",
                type: "bytes",
            },
            {
                internalType: "bytes",
                name: "",
                type: "bytes",
            },
        ],
        name: "beforeAgreementUpdated",
        outputs: [
            {
                internalType: "bytes",
                name: "",
                type: "bytes",
            },
        ],
        stateMutability: "view",
        type: "function",
    },
    {
        inputs: [],
        name: "cfaV1",
        outputs: [
            {
                internalType: "contract ISuperfluid",
                name: "host",
                type: "address",
            },
            {
                internalType: "contract IConstantFlowAgreementV1",
                name: "cfa",
                type: "address",
            },
        ],
        stateMutability: "view",
        type: "function",
    },
    {
        inputs: [
            {
                internalType: "address",
                name: "receiver",
                type: "address",
            },
            {
                internalType: "contract ISuperToken",
                name: "superToken",
                type: "address",
            },
            {
                internalType: "uint32",
                name: "startDate",
                type: "uint32",
            },
            {
                internalType: "uint32",
                name: "cliffDate",
                type: "uint32",
            },
            {
                internalType: "int96",
                name: "flowRate",
                type: "int96",
            },
            {
                internalType: "uint256",
                name: "cliffTransferAmount",
                type: "uint256",
            },
            {
                internalType: "uint32",
                name: "endDate",
                type: "uint32",
            },
            {
                internalType: "bytes",
                name: "ctx",
                type: "bytes",
            },
        ],
        name: "createVestingSchedule",
        outputs: [
            {
                internalType: "bytes",
                name: "newCtx",
                type: "bytes",
            },
        ],
        stateMutability: "nonpayable",
        type: "function",
    },
    {
        inputs: [
            {
                internalType: "address",
                name: "receiver",
                type: "address",
            },
            {
                internalType: "contract ISuperToken",
                name: "superToken",
                type: "address",
            },
            {
                internalType: "bytes",
                name: "ctx",
                type: "bytes",
            },
        ],
        name: "deleteVestingSchedule",
        outputs: [
            {
                internalType: "bytes",
                name: "newCtx",
                type: "bytes",
            },
        ],
        stateMutability: "nonpayable",
        type: "function",
    },
    {
        inputs: [
            {
                internalType: "address",
                name: "sender",
                type: "address",
            },
            {
                internalType: "address",
                name: "receiver",
                type: "address",
            },
            {
                internalType: "contract ISuperToken",
                name: "superToken",
                type: "address",
            },
        ],
        name: "executeCloseVesting",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function",
    },
    {
        inputs: [
            {
                internalType: "address",
                name: "sender",
                type: "address",
            },
            {
                internalType: "address",
                name: "receiver",
                type: "address",
            },
            {
                internalType: "contract ISuperToken",
                name: "superToken",
                type: "address",
            },
        ],
        name: "executeVesting",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function",
    },
    {
        inputs: [
            {
                internalType: "address",
                name: "sender",
                type: "address",
            },
            {
                internalType: "address",
                name: "receiver",
                type: "address",
            },
            {
                internalType: "address",
                name: "supertoken",
                type: "address",
            },
        ],
        name: "getVestingSchedule",
        outputs: [
            {
                components: [
                    {
                        internalType: "uint32",
                        name: "effectiveStartDate",
                        type: "uint32",
                    },
                    {
                        internalType: "uint32",
                        name: "endDate",
                        type: "uint32",
                    },
                    {
                        internalType: "int96",
                        name: "flowRate",
                        type: "int96",
                    },
                    {
                        internalType: "uint256",
                        name: "cliffTransferAmount",
                        type: "uint256",
                    },
                ],
                internalType: "struct IVestingScheduler.Schedule",
                name: "",
                type: "tuple",
            },
        ],
        stateMutability: "view",
        type: "function",
    },
    {
        inputs: [
            {
                internalType: "bytes32",
                name: "",
                type: "bytes32",
            },
        ],
        name: "vestingSchedules",
        outputs: [
            {
                internalType: "uint32",
                name: "effectiveStartDate",
                type: "uint32",
            },
            {
                internalType: "uint32",
                name: "endDate",
                type: "uint32",
            },
            {
                internalType: "int96",
                name: "flowRate",
                type: "int96",
            },
            {
                internalType: "uint256",
                name: "cliffTransferAmount",
                type: "uint256",
            },
        ],
        stateMutability: "view",
        type: "function",
    },
];
class VestingScheduler__factory {
    static createInterface() {
        return new ethers_1.utils.Interface(_abi);
    }
    static connect(address, signerOrProvider) {
        return new ethers_1.Contract(address, _abi, signerOrProvider);
    }
}
exports.VestingScheduler__factory = VestingScheduler__factory;
VestingScheduler__factory.abi = _abi;
