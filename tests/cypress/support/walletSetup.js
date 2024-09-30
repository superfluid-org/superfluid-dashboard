const { Framework } = require('@superfluid-finance/sdk-core');
const { ethers } = require('ethers');
const { getNetwork } = require('@ethersproject/networks');
const minimist = require('minimist');
const { addYears } = require('date-fns');

const autoWrapManagerAddresses = {
  137: '0x2581c27E7f6D6AF452E63fCe884EDE3EDd716b32',
  56: '0x2AcdD61ac1EFFe1535109449c31889bdE8d7f325',
  5: '0x0B82D14E9616ca4d260E77454834AdCf5887595F',
  80001: '0x3eAB3c6207F488E475b7955B631B564F0E6317B9',
  43113: '0x30aE282CF477E2eF28B14d0125aCEAd57Fe1d7a1',
  43114: '0x8082e58681350876aFe8f52d3Bf8672034A03Db0',
  10: '0x1fA76f2Cd0C3fe6c399A80111408d9C42C0CAC23',
  42161: '0xf01825eAFAe5CD1Dab5593EFAF218efC8968D272',
  1: '0x30aE282CF477E2eF28B14d0125aCEAd57Fe1d7a1',
  100: '0x8082e58681350876aFe8f52d3Bf8672034A03Db0',
  11155420: '0xe567b32C10B0dB72d9490eB1B9A409C5ADed192C',
};

const autoWrapStrategyAddresses = {
  137: '0xb4afa36BAd8c76976Dc77a21c9Ad711EF720eE4b',
  56: '0x9e308cb079ae130790F604b1030cDf386670f199',
  5: '0xea49af829d3e28d3ec49e0e0a0ba1e7860a56f60',
  80001: '0x544728AFDBeEafBeC9e1329031788edb53017bC4',
  43113: '0x1D65c6d3AD39d454Ea8F682c49aE7744706eA96d',
  43114: '0x51FBAbD31A615E14b1bC12E9d887f60997264a4E',
  10: '0x0Cf060a501c0040e9CCC708eFE94079F501c6Bb4',
  42161: '0x342076aA957B0ec8bC1d3893af719b288eA31e61',
  1: '0x1D65c6d3AD39d454Ea8F682c49aE7744706eA96d',
  100: '0x51FBAbD31A615E14b1bC12E9d887f60997264a4E',
  11155420: '0xf232f1fd34CE12e24F4391865c2D6E374D2C34d9',
};

const flowSchedulerContractAddresses = {
  5: '0xf428308b426D7cD7Ad8eBE549d750f31C8E060Ca',
  42161: '0x3fA8B653F9abf91428800C0ba0F8D145a71F97A1',
  43114: '0xF7AfF590E9DE493D7ACb421Fca7f1E35C1ad4Ce5',
  56: '0x2f9e2A2A59405682d4F86779275CF5525AD7eC2B',
  1: '0xAA0cD305eD020137E302CeCede7b18c0A05aCCDA',
  10: '0x55c8fc400833eEa791087cF343Ff2409A39DeBcC',
  137: '0x55F7758dd99d5e185f4CC08d4Ad95B71f598264D',
  80001: '0x59A3Ba9d34c387FB70b4f4e4Fbc9eD7519194139',
  100: '0x9cC7fc484fF588926149577e9330fA5b2cA74336',
  11155420: '0x73B1Ce21d03ad389C2A291B1d1dc4DAFE7B5Dc68',
};

const vestingContractAddresses = {
  100: '0x0170FFCC75d178d426EBad5b1a31451d00Ddbd0D',
  5: '0xF9240F930d847F70ad900aBEE8949F25649Bf24a',
  137: '0xcFE6382B33F2AdaFbE46e6A26A88E0182ae32b0c',
  80001: '0x3962EE56c9f7176215D149938BA685F91aBB633B',
  42161: '0x55c8fc400833eEa791087cF343Ff2409A39DeBcC',
  10: '0x65377d4dfE9c01639A41952B5083D58964782892',
  43114: '0x3fA8B653F9abf91428800C0ba0F8D145a71F97A1',
  56: '0x9B91c27f78376383003C6A12Ad12B341d016C5b9',
  1: '0x39D5cBBa9adEBc25085a3918d36D5325546C001B',
  11155420: '0x27444c0235a4D921F3106475faeba0B5e7ABDD7a',
};

const vestingV2ContractAddresses = {
  11155420: '0x3aa62b96f44D0f8892BeBBC819DE8e02E9DE69A8',
};

const vestingSchedulerAbi = [
  {
    inputs: [
      { internalType: 'contract ISuperfluid', name: 'host', type: 'address' },
      { internalType: 'string', name: 'registrationKey', type: 'string' },
    ],
    stateMutability: 'nonpayable',
    type: 'constructor',
  },
  { inputs: [], name: 'AccountInvalid', type: 'error' },
  { inputs: [], name: 'CliffInvalid', type: 'error' },
  { inputs: [], name: 'FlowRateInvalid', type: 'error' },
  { inputs: [], name: 'HostInvalid', type: 'error' },
  { inputs: [], name: 'ScheduleAlreadyExists', type: 'error' },
  { inputs: [], name: 'ScheduleDoesNotExist', type: 'error' },
  { inputs: [], name: 'ScheduleNotFlowing', type: 'error' },
  { inputs: [], name: 'TimeWindowInvalid', type: 'error' },
  { inputs: [], name: 'ZeroAddress', type: 'error' },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'contract ISuperToken',
        name: 'superToken',
        type: 'address',
      },
      {
        indexed: true,
        internalType: 'address',
        name: 'sender',
        type: 'address',
      },
      {
        indexed: true,
        internalType: 'address',
        name: 'receiver',
        type: 'address',
      },
      {
        indexed: false,
        internalType: 'uint32',
        name: 'cliffAndFlowDate',
        type: 'uint32',
      },
      {
        indexed: false,
        internalType: 'int96',
        name: 'flowRate',
        type: 'int96',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'cliffAmount',
        type: 'uint256',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'flowDelayCompensation',
        type: 'uint256',
      },
    ],
    name: 'VestingCliffAndFlowExecuted',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'contract ISuperToken',
        name: 'superToken',
        type: 'address',
      },
      {
        indexed: true,
        internalType: 'address',
        name: 'sender',
        type: 'address',
      },
      {
        indexed: true,
        internalType: 'address',
        name: 'receiver',
        type: 'address',
      },
      {
        indexed: false,
        internalType: 'uint32',
        name: 'endDate',
        type: 'uint32',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'earlyEndCompensation',
        type: 'uint256',
      },
      {
        indexed: false,
        internalType: 'bool',
        name: 'didCompensationFail',
        type: 'bool',
      },
    ],
    name: 'VestingEndExecuted',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'contract ISuperToken',
        name: 'superToken',
        type: 'address',
      },
      {
        indexed: true,
        internalType: 'address',
        name: 'sender',
        type: 'address',
      },
      {
        indexed: true,
        internalType: 'address',
        name: 'receiver',
        type: 'address',
      },
      {
        indexed: false,
        internalType: 'uint32',
        name: 'endDate',
        type: 'uint32',
      },
    ],
    name: 'VestingEndFailed',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'contract ISuperToken',
        name: 'superToken',
        type: 'address',
      },
      {
        indexed: true,
        internalType: 'address',
        name: 'sender',
        type: 'address',
      },
      {
        indexed: true,
        internalType: 'address',
        name: 'receiver',
        type: 'address',
      },
      {
        indexed: false,
        internalType: 'uint32',
        name: 'startDate',
        type: 'uint32',
      },
      {
        indexed: false,
        internalType: 'uint32',
        name: 'cliffDate',
        type: 'uint32',
      },
      {
        indexed: false,
        internalType: 'int96',
        name: 'flowRate',
        type: 'int96',
      },
      {
        indexed: false,
        internalType: 'uint32',
        name: 'endDate',
        type: 'uint32',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'cliffAmount',
        type: 'uint256',
      },
    ],
    name: 'VestingScheduleCreated',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'contract ISuperToken',
        name: 'superToken',
        type: 'address',
      },
      {
        indexed: true,
        internalType: 'address',
        name: 'sender',
        type: 'address',
      },
      {
        indexed: true,
        internalType: 'address',
        name: 'receiver',
        type: 'address',
      },
    ],
    name: 'VestingScheduleDeleted',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'contract ISuperToken',
        name: 'superToken',
        type: 'address',
      },
      {
        indexed: true,
        internalType: 'address',
        name: 'sender',
        type: 'address',
      },
      {
        indexed: true,
        internalType: 'address',
        name: 'receiver',
        type: 'address',
      },
      {
        indexed: false,
        internalType: 'uint32',
        name: 'oldEndDate',
        type: 'uint32',
      },
      {
        indexed: false,
        internalType: 'uint32',
        name: 'endDate',
        type: 'uint32',
      },
    ],
    name: 'VestingScheduleUpdated',
    type: 'event',
  },
  {
    inputs: [],
    name: 'END_DATE_VALID_BEFORE',
    outputs: [{ internalType: 'uint32', name: '', type: 'uint32' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'MIN_VESTING_DURATION',
    outputs: [{ internalType: 'uint32', name: '', type: 'uint32' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'START_DATE_VALID_AFTER',
    outputs: [{ internalType: 'uint32', name: '', type: 'uint32' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'contract ISuperToken', name: '', type: 'address' },
      { internalType: 'address', name: '', type: 'address' },
      { internalType: 'bytes32', name: '', type: 'bytes32' },
      { internalType: 'bytes', name: '', type: 'bytes' },
      { internalType: 'bytes', name: '', type: 'bytes' },
      { internalType: 'bytes', name: '', type: 'bytes' },
    ],
    name: 'afterAgreementCreated',
    outputs: [{ internalType: 'bytes', name: '', type: 'bytes' }],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'contract ISuperToken', name: '', type: 'address' },
      { internalType: 'address', name: '', type: 'address' },
      { internalType: 'bytes32', name: '', type: 'bytes32' },
      { internalType: 'bytes', name: '', type: 'bytes' },
      { internalType: 'bytes', name: '', type: 'bytes' },
      { internalType: 'bytes', name: '', type: 'bytes' },
    ],
    name: 'afterAgreementTerminated',
    outputs: [{ internalType: 'bytes', name: '', type: 'bytes' }],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'contract ISuperToken', name: '', type: 'address' },
      { internalType: 'address', name: '', type: 'address' },
      { internalType: 'bytes32', name: '', type: 'bytes32' },
      { internalType: 'bytes', name: '', type: 'bytes' },
      { internalType: 'bytes', name: '', type: 'bytes' },
      { internalType: 'bytes', name: '', type: 'bytes' },
    ],
    name: 'afterAgreementUpdated',
    outputs: [{ internalType: 'bytes', name: '', type: 'bytes' }],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'contract ISuperToken', name: '', type: 'address' },
      { internalType: 'address', name: '', type: 'address' },
      { internalType: 'bytes32', name: '', type: 'bytes32' },
      { internalType: 'bytes', name: '', type: 'bytes' },
      { internalType: 'bytes', name: '', type: 'bytes' },
    ],
    name: 'beforeAgreementCreated',
    outputs: [{ internalType: 'bytes', name: '', type: 'bytes' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'contract ISuperToken', name: '', type: 'address' },
      { internalType: 'address', name: '', type: 'address' },
      { internalType: 'bytes32', name: '', type: 'bytes32' },
      { internalType: 'bytes', name: '', type: 'bytes' },
      { internalType: 'bytes', name: '', type: 'bytes' },
    ],
    name: 'beforeAgreementTerminated',
    outputs: [{ internalType: 'bytes', name: '', type: 'bytes' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'contract ISuperToken', name: '', type: 'address' },
      { internalType: 'address', name: '', type: 'address' },
      { internalType: 'bytes32', name: '', type: 'bytes32' },
      { internalType: 'bytes', name: '', type: 'bytes' },
      { internalType: 'bytes', name: '', type: 'bytes' },
    ],
    name: 'beforeAgreementUpdated',
    outputs: [{ internalType: 'bytes', name: '', type: 'bytes' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'cfaV1',
    outputs: [
      { internalType: 'contract ISuperfluid', name: 'host', type: 'address' },
      {
        internalType: 'contract IConstantFlowAgreementV1',
        name: 'cfa',
        type: 'address',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'contract ISuperToken',
        name: 'superToken',
        type: 'address',
      },
      { internalType: 'address', name: 'receiver', type: 'address' },
      { internalType: 'uint32', name: 'startDate', type: 'uint32' },
      { internalType: 'uint32', name: 'cliffDate', type: 'uint32' },
      { internalType: 'int96', name: 'flowRate', type: 'int96' },
      { internalType: 'uint256', name: 'cliffAmount', type: 'uint256' },
      { internalType: 'uint32', name: 'endDate', type: 'uint32' },
      { internalType: 'bytes', name: 'ctx', type: 'bytes' },
    ],
    name: 'createVestingSchedule',
    outputs: [{ internalType: 'bytes', name: 'newCtx', type: 'bytes' }],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'contract ISuperToken',
        name: 'superToken',
        type: 'address',
      },
      { internalType: 'address', name: 'receiver', type: 'address' },
      { internalType: 'bytes', name: 'ctx', type: 'bytes' },
    ],
    name: 'deleteVestingSchedule',
    outputs: [{ internalType: 'bytes', name: 'newCtx', type: 'bytes' }],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'contract ISuperToken',
        name: 'superToken',
        type: 'address',
      },
      { internalType: 'address', name: 'sender', type: 'address' },
      { internalType: 'address', name: 'receiver', type: 'address' },
    ],
    name: 'executeCliffAndFlow',
    outputs: [{ internalType: 'bool', name: 'success', type: 'bool' }],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'contract ISuperToken',
        name: 'superToken',
        type: 'address',
      },
      { internalType: 'address', name: 'sender', type: 'address' },
      { internalType: 'address', name: 'receiver', type: 'address' },
    ],
    name: 'executeEndVesting',
    outputs: [{ internalType: 'bool', name: 'success', type: 'bool' }],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'address', name: 'supertoken', type: 'address' },
      { internalType: 'address', name: 'sender', type: 'address' },
      { internalType: 'address', name: 'receiver', type: 'address' },
    ],
    name: 'getVestingSchedule',
    outputs: [
      {
        components: [
          { internalType: 'uint32', name: 'cliffAndFlowDate', type: 'uint32' },
          { internalType: 'uint32', name: 'endDate', type: 'uint32' },
          { internalType: 'int96', name: 'flowRate', type: 'int96' },
          { internalType: 'uint256', name: 'cliffAmount', type: 'uint256' },
        ],
        internalType: 'struct IVestingScheduler.VestingSchedule',
        name: '',
        type: 'tuple',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'contract ISuperToken',
        name: 'superToken',
        type: 'address',
      },
      { internalType: 'address', name: 'receiver', type: 'address' },
      { internalType: 'uint32', name: 'endDate', type: 'uint32' },
      { internalType: 'bytes', name: 'ctx', type: 'bytes' },
    ],
    name: 'updateVestingSchedule',
    outputs: [{ internalType: 'bytes', name: 'newCtx', type: 'bytes' }],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'bytes32', name: '', type: 'bytes32' }],
    name: 'vestingSchedules',
    outputs: [
      { internalType: 'uint32', name: 'cliffAndFlowDate', type: 'uint32' },
      { internalType: 'uint32', name: 'endDate', type: 'uint32' },
      { internalType: 'int96', name: 'flowRate', type: 'int96' },
      { internalType: 'uint256', name: 'cliffAmount', type: 'uint256' },
    ],
    stateMutability: 'view',
    type: 'function',
  },
];

const autoWrapManagerAbi = [
  {
    stateMutability: 'nonpayable',
    type: 'constructor',
    inputs: [
      { name: '_cfa', internalType: 'address', type: 'address' },
      { name: '_minLower', internalType: 'uint64', type: 'uint64' },
      { name: '_minUpper', internalType: 'uint64', type: 'uint64' },
    ],
  },
  {
    type: 'error',
    inputs: [
      { name: 'limitGiven', internalType: 'uint64', type: 'uint64' },
      { name: 'minLimit', internalType: 'uint64', type: 'uint64' },
    ],
    name: 'InsufficientLimits',
  },
  {
    type: 'error',
    inputs: [
      { name: 'expirationTimeGiven', internalType: 'uint64', type: 'uint64' },
      { name: 'timeNow', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'InvalidExpirationTime',
  },
  {
    type: 'error',
    inputs: [{ name: 'strategy', internalType: 'address', type: 'address' }],
    name: 'InvalidStrategy',
  },
  {
    type: 'error',
    inputs: [
      { name: 'caller', internalType: 'address', type: 'address' },
      { name: 'expectedCaller', internalType: 'address', type: 'address' },
    ],
    name: 'UnauthorizedCaller',
  },
  {
    type: 'error',
    inputs: [{ name: 'superToken', internalType: 'address', type: 'address' }],
    name: 'UnsupportedSuperToken',
  },
  {
    type: 'error',
    inputs: [{ name: 'index', internalType: 'bytes32', type: 'bytes32' }],
    name: 'WrapNotRequired',
  },
  {
    type: 'error',
    inputs: [
      { name: 'lowerLimit', internalType: 'uint64', type: 'uint64' },
      { name: 'upperLimit', internalType: 'uint64', type: 'uint64' },
    ],
    name: 'WrongLimits',
  },
  { type: 'error', inputs: [], name: 'ZeroAddress' },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'strategy',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
    ],
    name: 'AddedApprovedStrategy',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'lowerLimit',
        internalType: 'uint64',
        type: 'uint64',
        indexed: false,
      },
      {
        name: 'upperLimit',
        internalType: 'uint64',
        type: 'uint64',
        indexed: false,
      },
    ],
    name: 'LimitsChanged',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'previousOwner',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'newOwner',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
    ],
    name: 'OwnershipTransferred',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'strategy',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
    ],
    name: 'RemovedApprovedStrategy',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      { name: 'id', internalType: 'bytes32', type: 'bytes32', indexed: true },
      {
        name: 'wrapAmount',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
    ],
    name: 'WrapExecuted',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      { name: 'id', internalType: 'bytes32', type: 'bytes32', indexed: true },
      { name: 'user', internalType: 'address', type: 'address', indexed: true },
      {
        name: 'superToken',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'strategy',
        internalType: 'address',
        type: 'address',
        indexed: false,
      },
      {
        name: 'liquidityToken',
        internalType: 'address',
        type: 'address',
        indexed: false,
      },
      {
        name: 'expiry',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
      {
        name: 'lowerLimit',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
      {
        name: 'upperLimit',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
    ],
    name: 'WrapScheduleCreated',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      { name: 'id', internalType: 'bytes32', type: 'bytes32', indexed: true },
      { name: 'user', internalType: 'address', type: 'address', indexed: true },
      {
        name: 'superToken',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'strategy',
        internalType: 'address',
        type: 'address',
        indexed: false,
      },
      {
        name: 'liquidityToken',
        internalType: 'address',
        type: 'address',
        indexed: false,
      },
    ],
    name: 'WrapScheduleDeleted',
  },
  {
    stateMutability: 'nonpayable',
    type: 'function',
    inputs: [{ name: 'strategy', internalType: 'address', type: 'address' }],
    name: 'addApprovedStrategy',
    outputs: [],
  },
  {
    stateMutability: 'view',
    type: 'function',
    inputs: [{ name: '', internalType: 'address', type: 'address' }],
    name: 'approvedStrategies',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
  },
  {
    stateMutability: 'view',
    type: 'function',
    inputs: [],
    name: 'cfaV1',
    outputs: [
      {
        name: '',
        internalType: 'contract IConstantFlowAgreementV1',
        type: 'address',
      },
    ],
  },
  {
    stateMutability: 'view',
    type: 'function',
    inputs: [
      { name: 'user', internalType: 'address', type: 'address' },
      { name: 'superToken', internalType: 'address', type: 'address' },
      { name: 'liquidityToken', internalType: 'address', type: 'address' },
    ],
    name: 'checkWrap',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
  },
  {
    stateMutability: 'view',
    type: 'function',
    inputs: [{ name: 'index', internalType: 'bytes32', type: 'bytes32' }],
    name: 'checkWrapByIndex',
    outputs: [{ name: 'amount', internalType: 'uint256', type: 'uint256' }],
  },
  {
    stateMutability: 'nonpayable',
    type: 'function',
    inputs: [
      { name: 'superToken', internalType: 'address', type: 'address' },
      { name: 'strategy', internalType: 'address', type: 'address' },
      { name: 'liquidityToken', internalType: 'address', type: 'address' },
      { name: 'expiry', internalType: 'uint64', type: 'uint64' },
      { name: 'lowerLimit', internalType: 'uint64', type: 'uint64' },
      { name: 'upperLimit', internalType: 'uint64', type: 'uint64' },
    ],
    name: 'createWrapSchedule',
    outputs: [],
  },
  {
    stateMutability: 'nonpayable',
    type: 'function',
    inputs: [
      { name: 'user', internalType: 'address', type: 'address' },
      { name: 'superToken', internalType: 'address', type: 'address' },
      { name: 'liquidityToken', internalType: 'address', type: 'address' },
    ],
    name: 'deleteWrapSchedule',
    outputs: [],
  },
  {
    stateMutability: 'nonpayable',
    type: 'function',
    inputs: [{ name: 'index', internalType: 'bytes32', type: 'bytes32' }],
    name: 'deleteWrapScheduleByIndex',
    outputs: [],
  },
  {
    stateMutability: 'nonpayable',
    type: 'function',
    inputs: [
      { name: 'user', internalType: 'address', type: 'address' },
      { name: 'superToken', internalType: 'address', type: 'address' },
      { name: 'liquidityToken', internalType: 'address', type: 'address' },
    ],
    name: 'executeWrap',
    outputs: [],
  },
  {
    stateMutability: 'nonpayable',
    type: 'function',
    inputs: [{ name: 'index', internalType: 'bytes32', type: 'bytes32' }],
    name: 'executeWrapByIndex',
    outputs: [],
  },
  {
    stateMutability: 'view',
    type: 'function',
    inputs: [
      { name: 'user', internalType: 'address', type: 'address' },
      { name: 'superToken', internalType: 'address', type: 'address' },
      { name: 'liquidityToken', internalType: 'address', type: 'address' },
    ],
    name: 'getWrapSchedule',
    outputs: [
      {
        name: '',
        internalType: 'struct IManager.WrapSchedule',
        type: 'tuple',
        components: [
          { name: 'user', internalType: 'address', type: 'address' },
          {
            name: 'superToken',
            internalType: 'contract ISuperToken',
            type: 'address',
          },
          {
            name: 'strategy',
            internalType: 'contract IStrategy',
            type: 'address',
          },
          { name: 'liquidityToken', internalType: 'address', type: 'address' },
          { name: 'expiry', internalType: 'uint64', type: 'uint64' },
          { name: 'lowerLimit', internalType: 'uint64', type: 'uint64' },
          { name: 'upperLimit', internalType: 'uint64', type: 'uint64' },
        ],
      },
    ],
  },
  {
    stateMutability: 'view',
    type: 'function',
    inputs: [{ name: 'index', internalType: 'bytes32', type: 'bytes32' }],
    name: 'getWrapScheduleByIndex',
    outputs: [
      {
        name: '',
        internalType: 'struct IManager.WrapSchedule',
        type: 'tuple',
        components: [
          { name: 'user', internalType: 'address', type: 'address' },
          {
            name: 'superToken',
            internalType: 'contract ISuperToken',
            type: 'address',
          },
          {
            name: 'strategy',
            internalType: 'contract IStrategy',
            type: 'address',
          },
          { name: 'liquidityToken', internalType: 'address', type: 'address' },
          { name: 'expiry', internalType: 'uint64', type: 'uint64' },
          { name: 'lowerLimit', internalType: 'uint64', type: 'uint64' },
          { name: 'upperLimit', internalType: 'uint64', type: 'uint64' },
        ],
      },
    ],
  },
  {
    stateMutability: 'pure',
    type: 'function',
    inputs: [
      { name: 'user', internalType: 'address', type: 'address' },
      { name: 'superToken', internalType: 'address', type: 'address' },
      { name: 'liquidityToken', internalType: 'address', type: 'address' },
    ],
    name: 'getWrapScheduleIndex',
    outputs: [{ name: '', internalType: 'bytes32', type: 'bytes32' }],
  },
  {
    stateMutability: 'view',
    type: 'function',
    inputs: [],
    name: 'minLower',
    outputs: [{ name: '', internalType: 'uint64', type: 'uint64' }],
  },
  {
    stateMutability: 'view',
    type: 'function',
    inputs: [],
    name: 'minUpper',
    outputs: [{ name: '', internalType: 'uint64', type: 'uint64' }],
  },
  {
    stateMutability: 'view',
    type: 'function',
    inputs: [],
    name: 'owner',
    outputs: [{ name: '', internalType: 'address', type: 'address' }],
  },
  {
    stateMutability: 'nonpayable',
    type: 'function',
    inputs: [{ name: 'strategy', internalType: 'address', type: 'address' }],
    name: 'removeApprovedStrategy',
    outputs: [],
  },
  {
    stateMutability: 'nonpayable',
    type: 'function',
    inputs: [],
    name: 'renounceOwnership',
    outputs: [],
  },
  {
    stateMutability: 'nonpayable',
    type: 'function',
    inputs: [
      { name: 'lowerLimit', internalType: 'uint64', type: 'uint64' },
      { name: 'upperLimit', internalType: 'uint64', type: 'uint64' },
    ],
    name: 'setLimits',
    outputs: [],
  },
  {
    stateMutability: 'nonpayable',
    type: 'function',
    inputs: [{ name: 'newOwner', internalType: 'address', type: 'address' }],
    name: 'transferOwnership',
    outputs: [],
  },
];

const args = minimist(process.argv.slice(2), {
  string: ['tokenOne', 'tokenTwo', 'tokenThree'],
  alias: {
    t1: 'tokenOne',
    t2: 'tokenTwo',
    t3: 'tokenThree',
    pk: 'privateKey',
  },
});

const networkGasTokenSymbols = {
  1: 'ETHx',
  5: 'ETHx',
  10: 'ETHx',
  56: 'BNBx',
  100: 'xDAIx',
  137: 'POLx',
  420: 'ETHx',
  1442: 'ETHx',
  42161: 'ETHx',
  43113: 'AVAXx',
  43114: 'AVAXx',
  80001: 'POLx',
  84531: 'ETHx',
  421613: 'ETHx',
  11155111: 'ETHx',
  11155420: 'ETHx',
  534351: 'ETHx',
  8453: 'ETHx',
};

const receiverAddress = args.receiver
  ? args.receiver
  : '0xF9Ce34dFCD3cc92804772F3022AF27bCd5E43Ff2';
const provider = args.rpc
  ? new ethers.providers.JsonRpcProvider(args.rpc)
  : new ethers.providers.InfuraProvider(getNetwork(args.chainId));
const wallet = new ethers.Wallet(args.privateKey, provider);
const nativeTokenSymbol = networkGasTokenSymbols[args.chainId];

let vestingContract;
let autoWrapManagerContract;
if (
  autoWrapManagerAddresses[args.chainId] &&
  vestingContractAddresses[args.chainId]
) {
  vestingContract = new ethers.Contract(
    vestingContractAddresses[args.chainId],
    vestingSchedulerAbi,
    provider
  );
  autoWrapManagerContract = new ethers.Contract(
    autoWrapManagerAddresses[args.chainId],
    autoWrapManagerAbi,
    provider
  );
}

function checkArgs() {
  if (!args.tokenOne || !args.tokenTwo || !args.privateKey || !args.chainId) {
    throw new Error(
      'You forgot an argument to the script , it requires:\n' +
        '--t1 or --tokenOne : Resolver name or address of the token\n' +
        '--t2 or --tokenTwo : Resolver name or address of the token\n' +
        '--pk or --privateKey : The private key of the wallet you want to set up\n' +
        '--chainId : The chainId of the network you want to set the wallet on to\n' +
        'Optional:\n' +
        '--t3 or --tokenThree : Resolver name or address of the token , needed if platform services are deployed on the network\n' +
        '--receiver : change the wallet who receives flows from the wallet\n' +
        '--rpc : in case the network is not supported by the free ethers InfuraProviders you can provide your own RPC\n' +
        '--amount : override the default 0.01 token upgrade amount'
    );
  }
  if (!networkGasTokenSymbols[args.chainId]) {
    throw new Error(
      `${args.chainId} does not seem to be supported by the script, please update the networkGasTokenSymbols JSON in the script `
    );
  }
}

async function checkAndGiveAllowanceIfNecessary(
  token,
  contract,
  signer,
  tokenName,
  contractName
) {
  const tokenAllowance = await token.allowance({
    owner: wallet.address,
    spender: contract,
    providerOrSigner: signer,
  });

  if (tokenAllowance === '0') {
    console.log(
      `There is not enough ${tokenName} allowance for the ${contractName}`
    );
    const approvalTx = await token
      .approve({
        receiver: contract,
        amount: ethers.utils.parseEther('100'),
        overrides: { gasPrice: await provider.getGasPrice() },
      })
      .exec(signer);
    await approvalTx.wait();
    console.log(
      `${tokenName} allowance for the ${contractName} was given sucesfully`
    );
  } else {
    console.log(
      `${tokenName} allowance for ${contractName} was already set up`
    );
  }
}

async function checkAndGivePermissionsIfNecessary(
  token,
  contract,
  signer,
  tokenName,
  contractName
) {
  const flowOperatorData = await token.getFlowOperatorData({
    sender: wallet.address,
    flowOperator: contract,
    providerOrSigner: signer,
  });

  if (flowOperatorData.permissions === '0') {
    console.log(`${tokenName} ACL permissions are not set for ${contractName}`);
    const aclTransaction = await token
      .updateFlowOperatorPermissions({
        flowOperator: contract,
        //Create, Update , Delete
        permissions: '5',
        flowRateAllowance: ethers.utils.parseEther('1'),
        overrides: { gasPrice: await provider.getGasPrice() },
      })
      .exec(signer);
    await aclTransaction.wait();
    console.log(
      `${tokenName} ACL permissions for ${contractName} were given sucesfully`
    );
  } else {
    console.log(
      `${tokenName} ACL permissions for ${contractName} are already set up`
    );
  }
}

async function checkAndCreateVestingScheduleIfNecessary(
  token,
  signer,
  tokenName
) {
  const currentDate = new Date();
  const startDate = (addYears(currentDate, 5).getTime() / 1000).toFixed();
  const endDate = (addYears(currentDate, 10).getTime() / 1000).toFixed();
  const vestingSchedule = await vestingContract.getVestingSchedule(
    token.address,
    wallet.address,
    receiverAddress
  );

  if (vestingSchedule.endDate === 0) {
    console.log(`${tokenName} vesting schedule is missing, creating a new one`);
    const createScheduleTx =
      await vestingContract.populateTransaction.createVestingSchedule(
        token.address,
        receiverAddress,
        startDate,
        '0',
        ethers.utils.parseEther('0.0000003858').toString(),
        '0',
        endDate,
        '0x'
      );
    if (args.chainId === '137') {
      createScheduleTx.gasPrice = await provider.getGasPrice();
    }
    await signer.sendTransaction(createScheduleTx);
    console.log(`${tokenName} vesting schedule was created succesfully`);
  } else {
    console.log(`${tokenName} vesting schedule is already created`);
  }
}

async function checkAndCreateAutoWrapScheduleIfNecessary(
  token,
  autoWrapStrategyAddress,
  signer,
  tokenName
) {
  const expiry = 3000000000;
  const upperLimit = 1209600;
  const lowerLimit = 604800;
  await autoWrapManagerContract
    .getWrapSchedule(
      wallet.address,
      token.address,
      token.underlyingToken.address
    )
    .then(async (schedule) => {
      if (schedule.user === '0x0000000000000000000000000000000000000000') {
        console.log(
          `${tokenName} auto-wrap schedule is not set up, creating a new one`
        );
        const autoWrapTx =
          await autoWrapManagerContract.populateTransaction.createWrapSchedule(
            token.address,
            autoWrapStrategyAddress,
            token.underlyingToken.address,
            expiry,
            lowerLimit,
            upperLimit
          );
        if (args.chainId === 137) {
          autoWrapTx.gasPrice = await provider.getGasPrice();
        }

        await signer.sendTransaction(autoWrapTx);
        console.log(`${tokenName} auto-wrap schedule was created succesfully`);
      } else {
        console.log(`${tokenName} auto-wrap schedule is already set up`);
      }
    });
}

async function main() {
  checkArgs();
  const nativeUnderlyingBalance = await wallet.getBalance();
  console.log(`Trying to set up ${wallet.address} on chain: ${args.chainId}`);

  const sf = await Framework.create({
    chainId: args.chainId,
    provider: provider,
  });
  const signer = sf.createSigner({
    privateKey: args.privateKey,
    provider,
  });
  const units = ethers.utils.parseUnits('0.01').toString();
  const upgradeTargetAmount = args.amount
    ? ethers.utils.parseEther(args.amount)
    : ethers.utils.parseEther('0.01');
  const nativeToken = await sf.loadNativeAssetSuperToken(nativeTokenSymbol);
  const tokenOne = await sf.loadSuperToken(args.tokenOne);
  let tokenOneIndex = await tokenOne.getIndex({
    publisher: wallet.address,
    indexId: '0',
    providerOrSigner: signer,
  });
  const tokenOneStream = await tokenOne.getFlow({
    sender: wallet.address,
    receiver: receiverAddress,
    providerOrSigner: signer,
  });

  const tokenTwo = await sf.loadSuperToken(args.tokenTwo);
  let tokenTwoIndex = await tokenTwo.getIndex({
    publisher: wallet.address,
    indexId: '0',
    providerOrSigner: signer,
  });

  let tokenThree =
    autoWrapManagerAddresses[args.chainId] &&
    vestingContractAddresses[args.chainId]
      ? await sf.loadSuperToken(args.tokenThree)
      : undefined;

  try {
    const nativeBalance = (
      await nativeToken.realtimeBalanceOf({
        providerOrSigner: provider,
        account: wallet.address,
      })
    ).availableBalance;

    const tokenOneBalance = (
      await tokenOne.realtimeBalanceOf({
        providerOrSigner: provider,
        account: wallet.address,
      })
    ).availableBalance;

    const tokenOneUnderylingBalance = await tokenOne.underlyingToken.balanceOf({
      providerOrSigner: provider,
      account: wallet.address,
    });

    const tokenTwoBalance = (
      await tokenOne.realtimeBalanceOf({
        providerOrSigner: provider,
        account: wallet.address,
      })
    ).availableBalance;

    const tokenTwoUnderylingBalance = await tokenTwo.underlyingToken.balanceOf({
      providerOrSigner: provider,
      account: wallet.address,
    });

    const underlyingBalances = {
      tokenOneUnderylingBalance,
      tokenTwoUnderylingBalance,
      nativeUnderlyingBalance: nativeUnderlyingBalance.toString(),
    };

    const balanceValues = Object.values(underlyingBalances);
    if (balanceValues.some((x) => x / 1e18 < 0.02)) {
      //TODO go over all balances , check the wrapped ones also , and downgrade if neccessary to save some tokens
      // when running the script on used wallets , not needed atm
      new Error(
        'Amigo, you need to add some balances to the wallet, this is not enough'
      );
    }

    if (nativeBalance / 1e18 < 0.01) {
      console.log(
        `${nativeTokenSymbol} balance not sufficient for rejected tx tests:`
      );
      const upgradeAmount = upgradeTargetAmount - nativeBalance;
      console.log(
        `Upgrading ${ethers.utils.parseUnits(
          upgradeAmount.toString()
        )} ${nativeTokenSymbol} to get 0.01 ${nativeTokenSymbol}`
      );
      const upgradeTx = await nativeToken
        .upgrade({ amount: upgradeAmount.toString() })
        .exec(signer);
      await upgradeTx.wait();
    } else {
      console.log(
        `${nativeTokenSymbol} balance already sufficient, not upgrading`
      );
    }

    if (tokenOneBalance / 1e18 < 0.01) {
      console.log(
        `${args.tokenOne} balance not sufficient for rejected tx tests:`
      );
      //Upgrades 1.5 tokens , will stream 0.01 per month afterwards
      const upgradeAmount =
        parseFloat(upgradeTargetAmount) * 150 - tokenOneBalance;
      const approvalTxn = await tokenOne.underlyingToken
        .approve({
          amount: upgradeAmount.toString(),
          receiver: tokenOne.address,
        })
        .exec(signer);
      console.log(
        `Approving the use of ${ethers.utils.parseUnits(
          upgradeAmount.toString()
        )} ${args.tokenOne}`
      );
      await approvalTxn.wait();
      const upgradeTx = await tokenOne
        .upgrade({ amount: upgradeAmount.toString() })
        .exec(signer);
      console.log(
        `Upgrading ${ethers.utils.parseUnits(upgradeAmount.toString())} ${
          args.tokenOne
        } , to get ${ethers.utils.parseUnits(upgradeAmount.toString())} ${
          args.tokenOne
        }`
      );
      await upgradeTx.wait();
    } else {
      console.log(`${args.tokenOne} balance already sufficient, not upgrading`);
    }

    if (tokenTwoBalance / 1e18 < 0.01) {
      console.log(
        `${args.tokenTwo} balance not sufficient for rejected tx tests:`
      );
      const upgradeAmount = ethers.utils.parseEther('0.1') - tokenTwoBalance;
      const approvalTxn = await tokenTwo.underlyingToken
        .approve({
          amount: upgradeAmount.toString(),
          receiver: tokenTwo.address,
        })
        .exec(signer);
      console.log(
        `Approving the use of ${ethers.utils.parseUnits(
          upgradeAmount.toString()
        )} ${args.tokenTwo}`
      );
      await approvalTxn.wait();
      const upgradeTx = await tokenTwo
        .upgrade({ amount: upgradeAmount.toString().toString() })
        .exec(signer);
      console.log(
        `Upgrading ${ethers.utils.parseUnits(upgradeAmount.toString())} ${
          args.tokenTwo
        } , to get 0.1 ${args.tokenTwo}`
      );
      await upgradeTx.wait();
      const overApprovalTxn = await tokenTwo.underlyingToken
        .approve({
          amount: upgradeAmount.toString(),
          receiver: tokenTwo.address,
        })
        .exec(signer);
      await overApprovalTxn.wait();
    } else {
      console.log(`${args.tokenTwo} balance already sufficient, not upgrading`);
    }

    if (tokenOneStream.flowRate === '0') {
      console.log(
        `Creating a flow of 0.01 ${args.tokenOne} per month to ${receiverAddress}`
      );
      const createStreamTx = await tokenOne
        .createFlow({
          sender: wallet.address,
          receiver: receiverAddress,
          flowRate: '3858024691', //0.01 per month
        })
        .exec(signer);
      await createStreamTx.wait();
    } else if (tokenOneStream.flowRate !== '3858024691') {
      console.log(
        `There seems to be a different flow rate than 0.01 , lets fix it`
      );
      const updateStreamTx = await tokenOne
        .updateFlow({
          sender: wallet.address,
          receiver: receiverAddress,
          flowRate: '3858024691', //0.01 per month
        })
        .exec(signer);
      console.log(
        `Updating the flowrate to 0.01 ${args.tokenOne} per month to ${receiverAddress}`
      );
      await updateStreamTx.wait();
    } else {
      console.log(
        `Already streaming 0.01 ${args.tokenOne} per month to ${receiverAddress}`
      );
    }

    if (!tokenOneIndex.exist) {
      const createIndexTx = await tokenOne
        .createIndex({ indexId: '0' })
        .exec(signer);
      console.log(`Creating ${args.tokenOne} index`);
      await createIndexTx.wait();
    } else {
      console.log(`${args.tokenOne} index already created`);
    }
    if (
      parseFloat(tokenOneIndex.totalUnitsPending) +
        parseFloat(tokenOneIndex.totalUnitsApproved) ===
      0
    ) {
      const updateUnitsTx = await tokenOne
        .updateSubscriptionUnits({
          indexId: '0',
          subscriber: wallet.address,
          units,
        })
        .exec(signer);
      console.log(`Updating ${args.tokenTwo} index units to ${units}`);
      await updateUnitsTx.wait();
      tokenOneIndex = await tokenOne.getIndex({
        publisher: wallet.address,
        indexId: '0',
        providerOrSigner: signer,
      });
    }

    if (tokenOneIndex.totalUnitsPending === '0') {
      console.log(`${args.tokenOne} index needs to be revoked!`);
      const revokeTx = await tokenOne
        .revokeSubscription({
          indexId: '0',
          publisher: wallet.address,
        })
        .exec(signer);
      console.log(`Revoking ${args.tokenOne} index`);
      await revokeTx.wait();
    } else {
      console.log(`${args.tokenOne} index approval status is correct`);
    }

    if (!tokenTwoIndex.exist) {
      const createIndexTx = await tokenTwo
        .createIndex({ indexId: '0' })
        .exec(signer);
      console.log(`Creating ${args.tokenTwo} index`);
      await createIndexTx.wait();
      const updateUnitsTx = await tokenTwo
        .updateSubscriptionUnits({
          indexId: '0',
          subscriber: wallet.address,
          units,
        })
        .exec(signer);
      console.log(`Updating ${args.tokenTwo} index units`);
      await updateUnitsTx.wait();
      tokenTwoIndex = await tokenTwo.getIndex({
        publisher: wallet.address,
        indexId: '0',
        providerOrSigner: signer,
      });
    } else {
      console.log(`${args.tokenTwo} index already created`);
    }

    if (tokenTwoIndex.totalUnitsPending !== '0') {
      console.log(`Approving ${args.tokenTwo} index`);
      await tokenTwo
        .approveSubscription({
          indexId: '0',
          publisher: wallet.address,
        })
        .exec(signer);
    } else {
      console.log(`${args.tokenTwo} index already approved`);
    }
    if (
      vestingContractAddresses[args.chainId] &&
      autoWrapStrategyAddresses[args.chainId]
    ) {
      await checkAndGiveAllowanceIfNecessary(
        tokenTwo,
        vestingContract.address,
        signer,
        args.tokenTwo,
        'vesting contract'
      );

      await checkAndGiveAllowanceIfNecessary(
        tokenThree,
        vestingContract.address,
        signer,
        args.tokenThree,
        'vesting contract'
      );

      await checkAndGivePermissionsIfNecessary(
        tokenTwo,
        vestingContract.address,
        signer,
        args.tokenTwo,
        'vesting contract'
      );

      await checkAndGivePermissionsIfNecessary(
        tokenThree,
        vestingContract.address,
        signer,
        args.tokenThree,
        'vesting contract'
      );

      await checkAndGiveAllowanceIfNecessary(
        tokenTwo.underlyingToken,
        autoWrapStrategyAddresses[args.chainId],
        signer,
        args.tokenTwo,
        'auto-wrap strategy contract'
      );

      await checkAndGivePermissionsIfNecessary(
        tokenTwo,
        autoWrapStrategyAddresses[args.chainId],
        signer,
        args.tokenTwo,
        'auto-wrap strategy contract'
      );
      await checkAndGivePermissionsIfNecessary(
        tokenThree,
        autoWrapStrategyAddresses[args.chainId],
        signer,
        args.tokenThree,
        'auto-wrap strategy contract'
      );
      await checkAndCreateVestingScheduleIfNecessary(
        tokenOne,
        signer,
        args.tokenOne
      );
      await checkAndCreateVestingScheduleIfNecessary(
        tokenTwo,
        signer,
        args.tokenTwo
      );
      await checkAndCreateVestingScheduleIfNecessary(
        tokenThree,
        signer,
        args.tokenThree
      );
      await checkAndCreateAutoWrapScheduleIfNecessary(
        tokenTwo,
        autoWrapStrategyAddresses[args.chainId],
        signer,
        args.tokenTwo
      );
      await checkAndCreateAutoWrapScheduleIfNecessary(
        tokenThree,
        autoWrapStrategyAddresses[args.chainId],
        signer,
        args.tokenThree
      );
    }
    console.log(
      `${wallet.address} was successfully set up for being used with rejected tx test cases on chain: ${args.chainId}`
    );
  } catch (e) {
    console.log(e);
  }
}

main();
