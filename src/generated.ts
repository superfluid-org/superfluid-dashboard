import {
  createUseReadContract,
  createUseWriteContract,
  createUseSimulateContract,
  createUseWatchContractEvent,
} from 'wagmi/codegen'

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// AutoWrapManager
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x30aE282CF477E2eF28B14d0125aCEAd57Fe1d7a1)
 * - [__View Contract on Op Mainnet Optimism Explorer__](https://optimistic.etherscan.io/address/0x1fA76f2Cd0C3fe6c399A80111408d9C42C0CAC23)
 * - [__View Contract on Bnb Smart Chain Bsc Scan__](https://bscscan.com/address/0x2AcdD61ac1EFFe1535109449c31889bdE8d7f325)
 * - [__View Contract on Gnosis Gnosisscan__](https://gnosisscan.io/address/0x8082e58681350876aFe8f52d3Bf8672034A03Db0)
 * - [__View Contract on Polygon Polygon Scan__](https://polygonscan.com/address/0x2581c27E7f6D6AF452E63fCe884EDE3EDd716b32)
 * - [__View Contract on Base Basescan__](https://basescan.org/address/0x5D0acD0864Ad07ba4E1E0474AE69Da87482e14A9)
 * - [__View Contract on Arbitrum One Arbiscan__](https://arbiscan.io/address/0xf01825eAFAe5CD1Dab5593EFAF218efC8968D272)
 * - [__View Contract on Avalanche Fuji Snow Trace__](https://testnet.snowtrace.io/address/0x30aE282CF477E2eF28B14d0125aCEAd57Fe1d7a1)
 * - [__View Contract on Avalanche Snow Trace__](https://snowtrace.io/address/0x8082e58681350876aFe8f52d3Bf8672034A03Db0)
 * - [__View Contract on Op Sepolia Blockscout__](https://optimism-sepolia.blockscout.com/address/0xe567b32C10B0dB72d9490eB1B9A409C5ADed192C)
 */
export const autoWrapManagerAbi = [
  {
    type: 'constructor',
    inputs: [
      { name: '_cfa', internalType: 'address', type: 'address' },
      { name: '_minLower', internalType: 'uint64', type: 'uint64' },
      { name: '_minUpper', internalType: 'uint64', type: 'uint64' },
    ],
    stateMutability: 'nonpayable',
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
    type: 'function',
    inputs: [{ name: 'strategy', internalType: 'address', type: 'address' }],
    name: 'addApprovedStrategy',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: '', internalType: 'address', type: 'address' }],
    name: 'approvedStrategies',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
    stateMutability: 'view',
  },
  {
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
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'user', internalType: 'address', type: 'address' },
      { name: 'superToken', internalType: 'address', type: 'address' },
      { name: 'liquidityToken', internalType: 'address', type: 'address' },
    ],
    name: 'checkWrap',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'index', internalType: 'bytes32', type: 'bytes32' }],
    name: 'checkWrapByIndex',
    outputs: [{ name: 'amount', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
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
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'user', internalType: 'address', type: 'address' },
      { name: 'superToken', internalType: 'address', type: 'address' },
      { name: 'liquidityToken', internalType: 'address', type: 'address' },
    ],
    name: 'deleteWrapSchedule',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: 'index', internalType: 'bytes32', type: 'bytes32' }],
    name: 'deleteWrapScheduleByIndex',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'user', internalType: 'address', type: 'address' },
      { name: 'superToken', internalType: 'address', type: 'address' },
      { name: 'liquidityToken', internalType: 'address', type: 'address' },
    ],
    name: 'executeWrap',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: 'index', internalType: 'bytes32', type: 'bytes32' }],
    name: 'executeWrapByIndex',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
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
    stateMutability: 'view',
  },
  {
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
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'user', internalType: 'address', type: 'address' },
      { name: 'superToken', internalType: 'address', type: 'address' },
      { name: 'liquidityToken', internalType: 'address', type: 'address' },
    ],
    name: 'getWrapScheduleIndex',
    outputs: [{ name: '', internalType: 'bytes32', type: 'bytes32' }],
    stateMutability: 'pure',
  },
  {
    type: 'function',
    inputs: [],
    name: 'minLower',
    outputs: [{ name: '', internalType: 'uint64', type: 'uint64' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'minUpper',
    outputs: [{ name: '', internalType: 'uint64', type: 'uint64' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'owner',
    outputs: [{ name: '', internalType: 'address', type: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'strategy', internalType: 'address', type: 'address' }],
    name: 'removeApprovedStrategy',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'renounceOwnership',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'lowerLimit', internalType: 'uint64', type: 'uint64' },
      { name: 'upperLimit', internalType: 'uint64', type: 'uint64' },
    ],
    name: 'setLimits',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: 'newOwner', internalType: 'address', type: 'address' }],
    name: 'transferOwnership',
    outputs: [],
    stateMutability: 'nonpayable',
  },
] as const

/**
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x30aE282CF477E2eF28B14d0125aCEAd57Fe1d7a1)
 * - [__View Contract on Op Mainnet Optimism Explorer__](https://optimistic.etherscan.io/address/0x1fA76f2Cd0C3fe6c399A80111408d9C42C0CAC23)
 * - [__View Contract on Bnb Smart Chain Bsc Scan__](https://bscscan.com/address/0x2AcdD61ac1EFFe1535109449c31889bdE8d7f325)
 * - [__View Contract on Gnosis Gnosisscan__](https://gnosisscan.io/address/0x8082e58681350876aFe8f52d3Bf8672034A03Db0)
 * - [__View Contract on Polygon Polygon Scan__](https://polygonscan.com/address/0x2581c27E7f6D6AF452E63fCe884EDE3EDd716b32)
 * - [__View Contract on Base Basescan__](https://basescan.org/address/0x5D0acD0864Ad07ba4E1E0474AE69Da87482e14A9)
 * - [__View Contract on Arbitrum One Arbiscan__](https://arbiscan.io/address/0xf01825eAFAe5CD1Dab5593EFAF218efC8968D272)
 * - [__View Contract on Avalanche Fuji Snow Trace__](https://testnet.snowtrace.io/address/0x30aE282CF477E2eF28B14d0125aCEAd57Fe1d7a1)
 * - [__View Contract on Avalanche Snow Trace__](https://snowtrace.io/address/0x8082e58681350876aFe8f52d3Bf8672034A03Db0)
 * - [__View Contract on Op Sepolia Blockscout__](https://optimism-sepolia.blockscout.com/address/0xe567b32C10B0dB72d9490eB1B9A409C5ADed192C)
 */
export const autoWrapManagerAddress = {
  1: '0x30aE282CF477E2eF28B14d0125aCEAd57Fe1d7a1',
  10: '0x1fA76f2Cd0C3fe6c399A80111408d9C42C0CAC23',
  56: '0x2AcdD61ac1EFFe1535109449c31889bdE8d7f325',
  100: '0x8082e58681350876aFe8f52d3Bf8672034A03Db0',
  137: '0x2581c27E7f6D6AF452E63fCe884EDE3EDd716b32',
  8453: '0x5D0acD0864Ad07ba4E1E0474AE69Da87482e14A9',
  42161: '0xf01825eAFAe5CD1Dab5593EFAF218efC8968D272',
  43113: '0x30aE282CF477E2eF28B14d0125aCEAd57Fe1d7a1',
  43114: '0x8082e58681350876aFe8f52d3Bf8672034A03Db0',
  11155420: '0xe567b32C10B0dB72d9490eB1B9A409C5ADed192C',
} as const

/**
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x30aE282CF477E2eF28B14d0125aCEAd57Fe1d7a1)
 * - [__View Contract on Op Mainnet Optimism Explorer__](https://optimistic.etherscan.io/address/0x1fA76f2Cd0C3fe6c399A80111408d9C42C0CAC23)
 * - [__View Contract on Bnb Smart Chain Bsc Scan__](https://bscscan.com/address/0x2AcdD61ac1EFFe1535109449c31889bdE8d7f325)
 * - [__View Contract on Gnosis Gnosisscan__](https://gnosisscan.io/address/0x8082e58681350876aFe8f52d3Bf8672034A03Db0)
 * - [__View Contract on Polygon Polygon Scan__](https://polygonscan.com/address/0x2581c27E7f6D6AF452E63fCe884EDE3EDd716b32)
 * - [__View Contract on Base Basescan__](https://basescan.org/address/0x5D0acD0864Ad07ba4E1E0474AE69Da87482e14A9)
 * - [__View Contract on Arbitrum One Arbiscan__](https://arbiscan.io/address/0xf01825eAFAe5CD1Dab5593EFAF218efC8968D272)
 * - [__View Contract on Avalanche Fuji Snow Trace__](https://testnet.snowtrace.io/address/0x30aE282CF477E2eF28B14d0125aCEAd57Fe1d7a1)
 * - [__View Contract on Avalanche Snow Trace__](https://snowtrace.io/address/0x8082e58681350876aFe8f52d3Bf8672034A03Db0)
 * - [__View Contract on Op Sepolia Blockscout__](https://optimism-sepolia.blockscout.com/address/0xe567b32C10B0dB72d9490eB1B9A409C5ADed192C)
 */
export const autoWrapManagerConfig = {
  address: autoWrapManagerAddress,
  abi: autoWrapManagerAbi,
} as const

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// ConstantFlowAgreementV1
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x2844c1BBdA121E9E43105630b9C8310e5c72744b)
 * - [__View Contract on Op Mainnet Optimism Explorer__](https://optimistic.etherscan.io/address/0x204C6f131bb7F258b2Ea1593f5309911d8E458eD)
 * - [__View Contract on Bnb Smart Chain Bsc Scan__](https://bscscan.com/address/0x49c38108870e74Cb9420C0991a85D3edd6363F75)
 * - [__View Contract on Gnosis Gnosisscan__](https://gnosisscan.io/address/0xEbdA4ceF883A7B12c4E669Ebc58927FBa8447C7D)
 * - [__View Contract on Polygon Polygon Scan__](https://polygonscan.com/address/0x6EeE6060f715257b970700bc2656De21dEdF074C)
 * - [__View Contract on Base Basescan__](https://basescan.org/address/0x19ba78B9cDB05A877718841c574325fdB53601bb)
 * - [__View Contract on Arbitrum One Arbiscan__](https://arbiscan.io/address/0x731FdBB12944973B500518aea61942381d7e240D)
 * - [__View Contract on Celo Celo Explorer__](https://celoscan.io/address/0x9d369e78e1a682cE0F8d9aD849BeA4FE1c3bD3Ad)
 * - [__View Contract on Avalanche Fuji Snow Trace__](https://testnet.snowtrace.io/address/0x16843ac25Ccc58Aa7960ba05f61cBB17b36b130A)
 * - [__View Contract on Avalanche Snow Trace__](https://snowtrace.io/address/0x6946c5B38Ffea373b0a2340b4AEf0De8F6782e58)
 * - [__View Contract on Base Sepolia Basescan__](https://sepolia.basescan.org/address/0x6836F23d6171D74Ef62FcF776655aBcD2bcd62Ef)
 * - [__View Contract on Scroll Sepolia Scrollscan__](https://sepolia.scrollscan.com/address/0xbc46B4Aa41c055578306820013d4B65fff42711E)
 * - [__View Contract on Scroll Scrollscan__](https://scrollscan.com/address/0xB3bcD6da1eeB6c97258B3806A853A6dcD3B6C00c)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x6836F23d6171D74Ef62FcF776655aBcD2bcd62Ef)
 * - [__View Contract on Op Sepolia Blockscout__](https://optimism-sepolia.blockscout.com/address/0x8a3170AdbC67233196371226141736E4151e7C26)
 * - [__View Contract on Degen Degen Chain Explorer__](https://explorer.degen.tips/address/0x82cc052d1b17aC554a22A88D5876B56c6b51e95c)
 */
export const constantFlowAgreementV1Abi = [
  {
    type: 'constructor',
    inputs: [
      { name: 'host', internalType: 'contract ISuperfluid', type: 'address' },
    ],
    stateMutability: 'nonpayable',
  },
  { type: 'error', inputs: [], name: 'AGREEMENT_BASE_ONLY_HOST' },
  {
    type: 'error',
    inputs: [{ name: '_code', internalType: 'uint256', type: 'uint256' }],
    name: 'APP_RULE',
  },
  { type: 'error', inputs: [], name: 'CFA_ACL_FLOW_RATE_ALLOWANCE_EXCEEDED' },
  { type: 'error', inputs: [], name: 'CFA_ACL_NO_NEGATIVE_ALLOWANCE' },
  { type: 'error', inputs: [], name: 'CFA_ACL_NO_SENDER_CREATE' },
  { type: 'error', inputs: [], name: 'CFA_ACL_NO_SENDER_FLOW_OPERATOR' },
  { type: 'error', inputs: [], name: 'CFA_ACL_NO_SENDER_UPDATE' },
  { type: 'error', inputs: [], name: 'CFA_ACL_OPERATOR_NO_CREATE_PERMISSIONS' },
  { type: 'error', inputs: [], name: 'CFA_ACL_OPERATOR_NO_DELETE_PERMISSIONS' },
  { type: 'error', inputs: [], name: 'CFA_ACL_OPERATOR_NO_UPDATE_PERMISSIONS' },
  { type: 'error', inputs: [], name: 'CFA_ACL_UNCLEAN_PERMISSIONS' },
  { type: 'error', inputs: [], name: 'CFA_DEPOSIT_TOO_BIG' },
  { type: 'error', inputs: [], name: 'CFA_FLOW_ALREADY_EXISTS' },
  { type: 'error', inputs: [], name: 'CFA_FLOW_DOES_NOT_EXIST' },
  { type: 'error', inputs: [], name: 'CFA_FLOW_RATE_TOO_BIG' },
  { type: 'error', inputs: [], name: 'CFA_HOOK_OUT_OF_GAS' },
  { type: 'error', inputs: [], name: 'CFA_INSUFFICIENT_BALANCE' },
  { type: 'error', inputs: [], name: 'CFA_INVALID_FLOW_RATE' },
  { type: 'error', inputs: [], name: 'CFA_NON_CRITICAL_SENDER' },
  { type: 'error', inputs: [], name: 'CFA_NO_SELF_FLOW' },
  { type: 'error', inputs: [], name: 'CFA_ZERO_ADDRESS_RECEIVER' },
  { type: 'error', inputs: [], name: 'CFA_ZERO_ADDRESS_SENDER' },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'uuid',
        internalType: 'bytes32',
        type: 'bytes32',
        indexed: false,
      },
      {
        name: 'codeAddress',
        internalType: 'address',
        type: 'address',
        indexed: false,
      },
    ],
    name: 'CodeUpdated',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'token',
        internalType: 'contract ISuperfluidToken',
        type: 'address',
        indexed: true,
      },
      {
        name: 'sender',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'flowOperator',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'permissions',
        internalType: 'uint8',
        type: 'uint8',
        indexed: false,
      },
      {
        name: 'flowRateAllowance',
        internalType: 'int96',
        type: 'int96',
        indexed: false,
      },
    ],
    name: 'FlowOperatorUpdated',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'token',
        internalType: 'contract ISuperfluidToken',
        type: 'address',
        indexed: true,
      },
      {
        name: 'sender',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'receiver',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'flowRate',
        internalType: 'int96',
        type: 'int96',
        indexed: false,
      },
      {
        name: 'totalSenderFlowRate',
        internalType: 'int256',
        type: 'int256',
        indexed: false,
      },
      {
        name: 'totalReceiverFlowRate',
        internalType: 'int256',
        type: 'int256',
        indexed: false,
      },
      {
        name: 'userData',
        internalType: 'bytes',
        type: 'bytes',
        indexed: false,
      },
    ],
    name: 'FlowUpdated',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'flowOperator',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'deposit',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
    ],
    name: 'FlowUpdatedExtension',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      { name: 'version', internalType: 'uint8', type: 'uint8', indexed: false },
    ],
    name: 'Initialized',
  },
  {
    type: 'function',
    inputs: [],
    name: 'CFA_HOOK_GAS_LIMIT',
    outputs: [{ name: '', internalType: 'uint64', type: 'uint64' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'DEFAULT_MINIMUM_DEPOSIT',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'MAXIMUM_DEPOSIT',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'MAXIMUM_FLOW_RATE',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'agreementType',
    outputs: [{ name: '', internalType: 'bytes32', type: 'bytes32' }],
    stateMutability: 'pure',
  },
  {
    type: 'function',
    inputs: [],
    name: 'castrate',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'getCodeAddress',
    outputs: [
      { name: 'codeAddress', internalType: 'address', type: 'address' },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'proxiableUUID',
    outputs: [{ name: '', internalType: 'bytes32', type: 'bytes32' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'newAddress', internalType: 'address', type: 'address' }],
    name: 'updateCode',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      {
        name: 'token',
        internalType: 'contract ISuperfluidToken',
        type: 'address',
      },
      { name: 'account', internalType: 'address', type: 'address' },
      { name: 'time', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'realtimeBalanceOf',
    outputs: [
      { name: 'dynamicBalance', internalType: 'int256', type: 'int256' },
      { name: 'deposit', internalType: 'uint256', type: 'uint256' },
      { name: 'owedDeposit', internalType: 'uint256', type: 'uint256' },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      {
        name: 'token',
        internalType: 'contract ISuperfluidToken',
        type: 'address',
      },
      { name: 'deposit', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'getMaximumFlowRateFromDeposit',
    outputs: [{ name: 'flowRate', internalType: 'int96', type: 'int96' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      {
        name: 'token',
        internalType: 'contract ISuperfluidToken',
        type: 'address',
      },
      { name: 'flowRate', internalType: 'int96', type: 'int96' },
    ],
    name: 'getDepositRequiredForFlowRate',
    outputs: [{ name: 'deposit', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      {
        name: 'token',
        internalType: 'contract ISuperfluidToken',
        type: 'address',
      },
      { name: 'account', internalType: 'address', type: 'address' },
    ],
    name: 'isPatricianPeriodNow',
    outputs: [
      {
        name: 'isCurrentlyPatricianPeriod',
        internalType: 'bool',
        type: 'bool',
      },
      { name: 'timestamp', internalType: 'uint256', type: 'uint256' },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      {
        name: 'token',
        internalType: 'contract ISuperfluidToken',
        type: 'address',
      },
      { name: 'account', internalType: 'address', type: 'address' },
      { name: 'timestamp', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'isPatricianPeriod',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      {
        name: 'token',
        internalType: 'contract ISuperfluidToken',
        type: 'address',
      },
      { name: 'receiver', internalType: 'address', type: 'address' },
      { name: 'flowRate', internalType: 'int96', type: 'int96' },
      { name: 'ctx', internalType: 'bytes', type: 'bytes' },
    ],
    name: 'createFlow',
    outputs: [{ name: 'newCtx', internalType: 'bytes', type: 'bytes' }],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      {
        name: 'token',
        internalType: 'contract ISuperfluidToken',
        type: 'address',
      },
      { name: 'receiver', internalType: 'address', type: 'address' },
      { name: 'flowRate', internalType: 'int96', type: 'int96' },
      { name: 'ctx', internalType: 'bytes', type: 'bytes' },
    ],
    name: 'updateFlow',
    outputs: [{ name: 'newCtx', internalType: 'bytes', type: 'bytes' }],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      {
        name: 'token',
        internalType: 'contract ISuperfluidToken',
        type: 'address',
      },
      { name: 'sender', internalType: 'address', type: 'address' },
      { name: 'receiver', internalType: 'address', type: 'address' },
      { name: 'ctx', internalType: 'bytes', type: 'bytes' },
    ],
    name: 'deleteFlow',
    outputs: [{ name: 'newCtx', internalType: 'bytes', type: 'bytes' }],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      {
        name: 'token',
        internalType: 'contract ISuperfluidToken',
        type: 'address',
      },
      { name: 'sender', internalType: 'address', type: 'address' },
      { name: 'receiver', internalType: 'address', type: 'address' },
    ],
    name: 'getFlow',
    outputs: [
      { name: 'timestamp', internalType: 'uint256', type: 'uint256' },
      { name: 'flowRate', internalType: 'int96', type: 'int96' },
      { name: 'deposit', internalType: 'uint256', type: 'uint256' },
      { name: 'owedDeposit', internalType: 'uint256', type: 'uint256' },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      {
        name: 'token',
        internalType: 'contract ISuperfluidToken',
        type: 'address',
      },
      { name: 'flowId', internalType: 'bytes32', type: 'bytes32' },
    ],
    name: 'getFlowByID',
    outputs: [
      { name: 'timestamp', internalType: 'uint256', type: 'uint256' },
      { name: 'flowRate', internalType: 'int96', type: 'int96' },
      { name: 'deposit', internalType: 'uint256', type: 'uint256' },
      { name: 'owedDeposit', internalType: 'uint256', type: 'uint256' },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      {
        name: 'token',
        internalType: 'contract ISuperfluidToken',
        type: 'address',
      },
      { name: 'account', internalType: 'address', type: 'address' },
    ],
    name: 'getAccountFlowInfo',
    outputs: [
      { name: 'timestamp', internalType: 'uint256', type: 'uint256' },
      { name: 'flowRate', internalType: 'int96', type: 'int96' },
      { name: 'deposit', internalType: 'uint256', type: 'uint256' },
      { name: 'owedDeposit', internalType: 'uint256', type: 'uint256' },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      {
        name: 'token',
        internalType: 'contract ISuperfluidToken',
        type: 'address',
      },
      { name: 'account', internalType: 'address', type: 'address' },
    ],
    name: 'getNetFlow',
    outputs: [{ name: 'flowRate', internalType: 'int96', type: 'int96' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      {
        name: 'token',
        internalType: 'contract ISuperfluidToken',
        type: 'address',
      },
      { name: 'sender', internalType: 'address', type: 'address' },
      { name: 'receiver', internalType: 'address', type: 'address' },
      { name: 'flowRate', internalType: 'int96', type: 'int96' },
      { name: 'ctx', internalType: 'bytes', type: 'bytes' },
    ],
    name: 'createFlowByOperator',
    outputs: [{ name: 'newCtx', internalType: 'bytes', type: 'bytes' }],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      {
        name: 'token',
        internalType: 'contract ISuperfluidToken',
        type: 'address',
      },
      { name: 'sender', internalType: 'address', type: 'address' },
      { name: 'receiver', internalType: 'address', type: 'address' },
      { name: 'flowRate', internalType: 'int96', type: 'int96' },
      { name: 'ctx', internalType: 'bytes', type: 'bytes' },
    ],
    name: 'updateFlowByOperator',
    outputs: [{ name: 'newCtx', internalType: 'bytes', type: 'bytes' }],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      {
        name: 'token',
        internalType: 'contract ISuperfluidToken',
        type: 'address',
      },
      { name: 'sender', internalType: 'address', type: 'address' },
      { name: 'receiver', internalType: 'address', type: 'address' },
      { name: 'ctx', internalType: 'bytes', type: 'bytes' },
    ],
    name: 'deleteFlowByOperator',
    outputs: [{ name: 'newCtx', internalType: 'bytes', type: 'bytes' }],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      {
        name: 'token',
        internalType: 'contract ISuperfluidToken',
        type: 'address',
      },
      { name: 'flowOperator', internalType: 'address', type: 'address' },
      { name: 'addedFlowRateAllowance', internalType: 'int96', type: 'int96' },
      { name: 'ctx', internalType: 'bytes', type: 'bytes' },
    ],
    name: 'increaseFlowRateAllowance',
    outputs: [{ name: 'newCtx', internalType: 'bytes', type: 'bytes' }],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      {
        name: 'token',
        internalType: 'contract ISuperfluidToken',
        type: 'address',
      },
      { name: 'flowOperator', internalType: 'address', type: 'address' },
      {
        name: 'subtractedFlowRateAllowance',
        internalType: 'int96',
        type: 'int96',
      },
      { name: 'ctx', internalType: 'bytes', type: 'bytes' },
    ],
    name: 'decreaseFlowRateAllowance',
    outputs: [{ name: 'newCtx', internalType: 'bytes', type: 'bytes' }],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      {
        name: 'token',
        internalType: 'contract ISuperfluidToken',
        type: 'address',
      },
      { name: 'flowOperator', internalType: 'address', type: 'address' },
      { name: 'permissions', internalType: 'uint8', type: 'uint8' },
      { name: 'flowRateAllowance', internalType: 'int96', type: 'int96' },
      { name: 'ctx', internalType: 'bytes', type: 'bytes' },
    ],
    name: 'updateFlowOperatorPermissions',
    outputs: [{ name: 'newCtx', internalType: 'bytes', type: 'bytes' }],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      {
        name: 'token',
        internalType: 'contract ISuperfluidToken',
        type: 'address',
      },
      { name: 'flowOperator', internalType: 'address', type: 'address' },
      { name: 'permissionsToAdd', internalType: 'uint8', type: 'uint8' },
      { name: 'addedFlowRateAllowance', internalType: 'int96', type: 'int96' },
      { name: 'ctx', internalType: 'bytes', type: 'bytes' },
    ],
    name: 'increaseFlowRateAllowanceWithPermissions',
    outputs: [{ name: 'newCtx', internalType: 'bytes', type: 'bytes' }],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      {
        name: 'token',
        internalType: 'contract ISuperfluidToken',
        type: 'address',
      },
      { name: 'flowOperator', internalType: 'address', type: 'address' },
      { name: 'permissionsToRemove', internalType: 'uint8', type: 'uint8' },
      {
        name: 'subtractedFlowRateAllowance',
        internalType: 'int96',
        type: 'int96',
      },
      { name: 'ctx', internalType: 'bytes', type: 'bytes' },
    ],
    name: 'decreaseFlowRateAllowanceWithPermissions',
    outputs: [{ name: 'newCtx', internalType: 'bytes', type: 'bytes' }],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'existingPermissions', internalType: 'uint8', type: 'uint8' },
      { name: 'permissionDelta', internalType: 'uint8', type: 'uint8' },
    ],
    name: 'addPermissions',
    outputs: [{ name: '', internalType: 'uint8', type: 'uint8' }],
    stateMutability: 'pure',
  },
  {
    type: 'function',
    inputs: [
      { name: 'existingPermissions', internalType: 'uint8', type: 'uint8' },
      { name: 'permissionDelta', internalType: 'uint8', type: 'uint8' },
    ],
    name: 'removePermissions',
    outputs: [{ name: '', internalType: 'uint8', type: 'uint8' }],
    stateMutability: 'pure',
  },
  {
    type: 'function',
    inputs: [
      {
        name: 'token',
        internalType: 'contract ISuperfluidToken',
        type: 'address',
      },
      { name: 'flowOperator', internalType: 'address', type: 'address' },
      { name: 'ctx', internalType: 'bytes', type: 'bytes' },
    ],
    name: 'authorizeFlowOperatorWithFullControl',
    outputs: [{ name: 'newCtx', internalType: 'bytes', type: 'bytes' }],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      {
        name: 'token',
        internalType: 'contract ISuperfluidToken',
        type: 'address',
      },
      { name: 'flowOperator', internalType: 'address', type: 'address' },
      { name: 'ctx', internalType: 'bytes', type: 'bytes' },
    ],
    name: 'revokeFlowOperatorWithFullControl',
    outputs: [{ name: 'newCtx', internalType: 'bytes', type: 'bytes' }],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      {
        name: 'token',
        internalType: 'contract ISuperfluidToken',
        type: 'address',
      },
      { name: 'sender', internalType: 'address', type: 'address' },
      { name: 'flowOperator', internalType: 'address', type: 'address' },
    ],
    name: 'getFlowOperatorData',
    outputs: [
      { name: 'flowOperatorId', internalType: 'bytes32', type: 'bytes32' },
      { name: 'permissions', internalType: 'uint8', type: 'uint8' },
      { name: 'flowRateAllowance', internalType: 'int96', type: 'int96' },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      {
        name: 'token',
        internalType: 'contract ISuperfluidToken',
        type: 'address',
      },
      { name: 'flowOperatorId', internalType: 'bytes32', type: 'bytes32' },
    ],
    name: 'getFlowOperatorDataByID',
    outputs: [
      { name: 'permissions', internalType: 'uint8', type: 'uint8' },
      { name: 'flowRateAllowance', internalType: 'int96', type: 'int96' },
    ],
    stateMutability: 'view',
  },
] as const

/**
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x2844c1BBdA121E9E43105630b9C8310e5c72744b)
 * - [__View Contract on Op Mainnet Optimism Explorer__](https://optimistic.etherscan.io/address/0x204C6f131bb7F258b2Ea1593f5309911d8E458eD)
 * - [__View Contract on Bnb Smart Chain Bsc Scan__](https://bscscan.com/address/0x49c38108870e74Cb9420C0991a85D3edd6363F75)
 * - [__View Contract on Gnosis Gnosisscan__](https://gnosisscan.io/address/0xEbdA4ceF883A7B12c4E669Ebc58927FBa8447C7D)
 * - [__View Contract on Polygon Polygon Scan__](https://polygonscan.com/address/0x6EeE6060f715257b970700bc2656De21dEdF074C)
 * - [__View Contract on Base Basescan__](https://basescan.org/address/0x19ba78B9cDB05A877718841c574325fdB53601bb)
 * - [__View Contract on Arbitrum One Arbiscan__](https://arbiscan.io/address/0x731FdBB12944973B500518aea61942381d7e240D)
 * - [__View Contract on Celo Celo Explorer__](https://celoscan.io/address/0x9d369e78e1a682cE0F8d9aD849BeA4FE1c3bD3Ad)
 * - [__View Contract on Avalanche Fuji Snow Trace__](https://testnet.snowtrace.io/address/0x16843ac25Ccc58Aa7960ba05f61cBB17b36b130A)
 * - [__View Contract on Avalanche Snow Trace__](https://snowtrace.io/address/0x6946c5B38Ffea373b0a2340b4AEf0De8F6782e58)
 * - [__View Contract on Base Sepolia Basescan__](https://sepolia.basescan.org/address/0x6836F23d6171D74Ef62FcF776655aBcD2bcd62Ef)
 * - [__View Contract on Scroll Sepolia Scrollscan__](https://sepolia.scrollscan.com/address/0xbc46B4Aa41c055578306820013d4B65fff42711E)
 * - [__View Contract on Scroll Scrollscan__](https://scrollscan.com/address/0xB3bcD6da1eeB6c97258B3806A853A6dcD3B6C00c)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x6836F23d6171D74Ef62FcF776655aBcD2bcd62Ef)
 * - [__View Contract on Op Sepolia Blockscout__](https://optimism-sepolia.blockscout.com/address/0x8a3170AdbC67233196371226141736E4151e7C26)
 * - [__View Contract on Degen Degen Chain Explorer__](https://explorer.degen.tips/address/0x82cc052d1b17aC554a22A88D5876B56c6b51e95c)
 */
export const constantFlowAgreementV1Address = {
  1: '0x2844c1BBdA121E9E43105630b9C8310e5c72744b',
  10: '0x204C6f131bb7F258b2Ea1593f5309911d8E458eD',
  56: '0x49c38108870e74Cb9420C0991a85D3edd6363F75',
  100: '0xEbdA4ceF883A7B12c4E669Ebc58927FBa8447C7D',
  137: '0x6EeE6060f715257b970700bc2656De21dEdF074C',
  8453: '0x19ba78B9cDB05A877718841c574325fdB53601bb',
  42161: '0x731FdBB12944973B500518aea61942381d7e240D',
  42220: '0x9d369e78e1a682cE0F8d9aD849BeA4FE1c3bD3Ad',
  43113: '0x16843ac25Ccc58Aa7960ba05f61cBB17b36b130A',
  43114: '0x6946c5B38Ffea373b0a2340b4AEf0De8F6782e58',
  84532: '0x6836F23d6171D74Ef62FcF776655aBcD2bcd62Ef',
  534351: '0xbc46B4Aa41c055578306820013d4B65fff42711E',
  534352: '0xB3bcD6da1eeB6c97258B3806A853A6dcD3B6C00c',
  11155111: '0x6836F23d6171D74Ef62FcF776655aBcD2bcd62Ef',
  11155420: '0x8a3170AdbC67233196371226141736E4151e7C26',
  666666666: '0x82cc052d1b17aC554a22A88D5876B56c6b51e95c',
} as const

/**
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x2844c1BBdA121E9E43105630b9C8310e5c72744b)
 * - [__View Contract on Op Mainnet Optimism Explorer__](https://optimistic.etherscan.io/address/0x204C6f131bb7F258b2Ea1593f5309911d8E458eD)
 * - [__View Contract on Bnb Smart Chain Bsc Scan__](https://bscscan.com/address/0x49c38108870e74Cb9420C0991a85D3edd6363F75)
 * - [__View Contract on Gnosis Gnosisscan__](https://gnosisscan.io/address/0xEbdA4ceF883A7B12c4E669Ebc58927FBa8447C7D)
 * - [__View Contract on Polygon Polygon Scan__](https://polygonscan.com/address/0x6EeE6060f715257b970700bc2656De21dEdF074C)
 * - [__View Contract on Base Basescan__](https://basescan.org/address/0x19ba78B9cDB05A877718841c574325fdB53601bb)
 * - [__View Contract on Arbitrum One Arbiscan__](https://arbiscan.io/address/0x731FdBB12944973B500518aea61942381d7e240D)
 * - [__View Contract on Celo Celo Explorer__](https://celoscan.io/address/0x9d369e78e1a682cE0F8d9aD849BeA4FE1c3bD3Ad)
 * - [__View Contract on Avalanche Fuji Snow Trace__](https://testnet.snowtrace.io/address/0x16843ac25Ccc58Aa7960ba05f61cBB17b36b130A)
 * - [__View Contract on Avalanche Snow Trace__](https://snowtrace.io/address/0x6946c5B38Ffea373b0a2340b4AEf0De8F6782e58)
 * - [__View Contract on Base Sepolia Basescan__](https://sepolia.basescan.org/address/0x6836F23d6171D74Ef62FcF776655aBcD2bcd62Ef)
 * - [__View Contract on Scroll Sepolia Scrollscan__](https://sepolia.scrollscan.com/address/0xbc46B4Aa41c055578306820013d4B65fff42711E)
 * - [__View Contract on Scroll Scrollscan__](https://scrollscan.com/address/0xB3bcD6da1eeB6c97258B3806A853A6dcD3B6C00c)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x6836F23d6171D74Ef62FcF776655aBcD2bcd62Ef)
 * - [__View Contract on Op Sepolia Blockscout__](https://optimism-sepolia.blockscout.com/address/0x8a3170AdbC67233196371226141736E4151e7C26)
 * - [__View Contract on Degen Degen Chain Explorer__](https://explorer.degen.tips/address/0x82cc052d1b17aC554a22A88D5876B56c6b51e95c)
 */
export const constantFlowAgreementV1Config = {
  address: constantFlowAgreementV1Address,
  abi: constantFlowAgreementV1Abi,
} as const

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// ERC20
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const erc20Abi = [
  {
    type: 'event',
    inputs: [
      { name: 'owner', type: 'address', indexed: true },
      { name: 'spender', type: 'address', indexed: true },
      { name: 'value', type: 'uint256', indexed: false },
    ],
    name: 'Approval',
  },
  {
    type: 'event',
    inputs: [
      { name: 'from', type: 'address', indexed: true },
      { name: 'to', type: 'address', indexed: true },
      { name: 'value', type: 'uint256', indexed: false },
    ],
    name: 'Transfer',
  },
  {
    type: 'function',
    inputs: [
      { name: 'owner', type: 'address' },
      { name: 'spender', type: 'address' },
    ],
    name: 'allowance',
    outputs: [{ type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'spender', type: 'address' },
      { name: 'amount', type: 'uint256' },
    ],
    name: 'approve',
    outputs: [{ type: 'bool' }],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: 'account', type: 'address' }],
    name: 'balanceOf',
    outputs: [{ type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'decimals',
    outputs: [{ type: 'uint8' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'name',
    outputs: [{ type: 'string' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'symbol',
    outputs: [{ type: 'string' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'totalSupply',
    outputs: [{ type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'recipient', type: 'address' },
      { name: 'amount', type: 'uint256' },
    ],
    name: 'transfer',
    outputs: [{ type: 'bool' }],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'sender', type: 'address' },
      { name: 'recipient', type: 'address' },
      { name: 'amount', type: 'uint256' },
    ],
    name: 'transferFrom',
    outputs: [{ type: 'bool' }],
    stateMutability: 'nonpayable',
  },
] as const

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// GeneralDistributionAgreementV1
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0xAAdBB3Eee3Bd080f5353d86DdF1916aCA3fAC842)
 * - [__View Contract on Op Mainnet Optimism Explorer__](https://optimistic.etherscan.io/address/0x68Ae17fa7a31b86F306c383277552fd4813b0d35)
 * - [__View Contract on Bnb Smart Chain Bsc Scan__](https://bscscan.com/address/0x3bbFA4C406719424C7f66CD97A8Fe27Af383d3e2)
 * - [__View Contract on Gnosis Gnosisscan__](https://gnosisscan.io/address/0xd7992D358A20478c82dDEd98B3D8A9da46e99b82)
 * - [__View Contract on Polygon Polygon Scan__](https://polygonscan.com/address/0x961dd5A052741B49B6CBf6759591f9D8576fCFb0)
 * - [__View Contract on Base Basescan__](https://basescan.org/address/0xfE6c87BE05feDB2059d2EC41bA0A09826C9FD7aa)
 * - [__View Contract on Arbitrum One Arbiscan__](https://arbiscan.io/address/0x1e299701792a2aF01408B122419d65Fd2dF0Ba02)
 * - [__View Contract on Celo Celo Explorer__](https://celoscan.io/address/0x308b7405272d11494716e30C6E972DbF6fb89555)
 * - [__View Contract on Avalanche Fuji Snow Trace__](https://testnet.snowtrace.io/address/0x51f571D934C59185f13d17301a36c07A2268B814)
 * - [__View Contract on Avalanche Snow Trace__](https://snowtrace.io/address/0xA7b197cD5b0cEF6d62c4A0a851E3581f5E62e4D2)
 * - [__View Contract on Base Sepolia Basescan__](https://sepolia.basescan.org/address/0x53F4f44C813Dc380182d0b2b67fe5832A12B97f8)
 * - [__View Contract on Scroll Sepolia Scrollscan__](https://sepolia.scrollscan.com/address/0x93fA9B627eE016990Fe5e654F923aaE8a480a75b)
 * - [__View Contract on Scroll Scrollscan__](https://scrollscan.com/address/0x97a9f293d7eD13f3fbD499cE684Ed4F103295a28)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x9823364056BcA85Dc3c4a3b96801314D082C8Eb9)
 * - [__View Contract on Op Sepolia Blockscout__](https://optimism-sepolia.blockscout.com/address/0xd453d38A001B47271488886532f1CCeAbf0c7eF3)
 * - [__View Contract on Degen Degen Chain Explorer__](https://explorer.degen.tips/address/0x210a01ad187003603B2287F78579ec103Eb70D9B)
 */
export const generalDistributionAgreementV1Abi = [
  {
    type: 'constructor',
    inputs: [
      { name: 'host', internalType: 'contract ISuperfluid', type: 'address' },
      {
        name: 'superfluidPoolBeacon_',
        internalType: 'contract SuperfluidUpgradeableBeacon',
        type: 'address',
      },
    ],
    stateMutability: 'nonpayable',
  },
  { type: 'error', inputs: [], name: 'AGREEMENT_BASE_ONLY_HOST' },
  { type: 'error', inputs: [], name: 'GDA_ADMIN_CANNOT_BE_POOL' },
  { type: 'error', inputs: [], name: 'GDA_DISTRIBUTE_FOR_OTHERS_NOT_ALLOWED' },
  {
    type: 'error',
    inputs: [],
    name: 'GDA_DISTRIBUTE_FROM_ANY_ADDRESS_NOT_ALLOWED',
  },
  { type: 'error', inputs: [], name: 'GDA_FLOW_DOES_NOT_EXIST' },
  { type: 'error', inputs: [], name: 'GDA_INSUFFICIENT_BALANCE' },
  { type: 'error', inputs: [], name: 'GDA_NON_CRITICAL_SENDER' },
  { type: 'error', inputs: [], name: 'GDA_NOT_POOL_ADMIN' },
  { type: 'error', inputs: [], name: 'GDA_NO_NEGATIVE_FLOW_RATE' },
  { type: 'error', inputs: [], name: 'GDA_NO_ZERO_ADDRESS_ADMIN' },
  { type: 'error', inputs: [], name: 'GDA_ONLY_SUPER_TOKEN_POOL' },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'token',
        internalType: 'contract ISuperfluidToken',
        type: 'address',
        indexed: true,
      },
      {
        name: 'pool',
        internalType: 'contract ISuperfluidPool',
        type: 'address',
        indexed: true,
      },
      { name: 'from', internalType: 'address', type: 'address', indexed: true },
      {
        name: 'bufferDelta',
        internalType: 'int256',
        type: 'int256',
        indexed: false,
      },
      {
        name: 'newBufferAmount',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
      {
        name: 'totalBufferAmount',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
    ],
    name: 'BufferAdjusted',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'uuid',
        internalType: 'bytes32',
        type: 'bytes32',
        indexed: false,
      },
      {
        name: 'codeAddress',
        internalType: 'address',
        type: 'address',
        indexed: false,
      },
    ],
    name: 'CodeUpdated',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'token',
        internalType: 'contract ISuperfluidToken',
        type: 'address',
        indexed: true,
      },
      {
        name: 'pool',
        internalType: 'contract ISuperfluidPool',
        type: 'address',
        indexed: true,
      },
      {
        name: 'distributor',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'operator',
        internalType: 'address',
        type: 'address',
        indexed: false,
      },
      {
        name: 'oldFlowRate',
        internalType: 'int96',
        type: 'int96',
        indexed: false,
      },
      {
        name: 'newDistributorToPoolFlowRate',
        internalType: 'int96',
        type: 'int96',
        indexed: false,
      },
      {
        name: 'newTotalDistributionFlowRate',
        internalType: 'int96',
        type: 'int96',
        indexed: false,
      },
      {
        name: 'adjustmentFlowRecipient',
        internalType: 'address',
        type: 'address',
        indexed: false,
      },
      {
        name: 'adjustmentFlowRate',
        internalType: 'int96',
        type: 'int96',
        indexed: false,
      },
      {
        name: 'userData',
        internalType: 'bytes',
        type: 'bytes',
        indexed: false,
      },
    ],
    name: 'FlowDistributionUpdated',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      { name: 'version', internalType: 'uint8', type: 'uint8', indexed: false },
    ],
    name: 'Initialized',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'token',
        internalType: 'contract ISuperfluidToken',
        type: 'address',
        indexed: true,
      },
      {
        name: 'pool',
        internalType: 'contract ISuperfluidPool',
        type: 'address',
        indexed: true,
      },
      {
        name: 'distributor',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'operator',
        internalType: 'address',
        type: 'address',
        indexed: false,
      },
      {
        name: 'requestedAmount',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
      {
        name: 'actualAmount',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
      {
        name: 'userData',
        internalType: 'bytes',
        type: 'bytes',
        indexed: false,
      },
    ],
    name: 'InstantDistributionUpdated',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'token',
        internalType: 'contract ISuperfluidToken',
        type: 'address',
        indexed: true,
      },
      {
        name: 'pool',
        internalType: 'contract ISuperfluidPool',
        type: 'address',
        indexed: true,
      },
      {
        name: 'account',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      { name: 'connected', internalType: 'bool', type: 'bool', indexed: false },
      {
        name: 'userData',
        internalType: 'bytes',
        type: 'bytes',
        indexed: false,
      },
    ],
    name: 'PoolConnectionUpdated',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'token',
        internalType: 'contract ISuperfluidToken',
        type: 'address',
        indexed: true,
      },
      {
        name: 'admin',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'pool',
        internalType: 'contract ISuperfluidPool',
        type: 'address',
        indexed: false,
      },
    ],
    name: 'PoolCreated',
  },
  {
    type: 'function',
    inputs: [],
    name: 'SLOTS_BITMAP_LIBRARY_ADDRESS',
    outputs: [{ name: '', internalType: 'address', type: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'SUPERFLUID_POOL_DEPLOYER_ADDRESS',
    outputs: [{ name: '', internalType: 'address', type: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'agreementType',
    outputs: [{ name: '', internalType: 'bytes32', type: 'bytes32' }],
    stateMutability: 'pure',
  },
  {
    type: 'function',
    inputs: [],
    name: 'castrate',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'getCodeAddress',
    outputs: [
      { name: 'codeAddress', internalType: 'address', type: 'address' },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'proxiableUUID',
    outputs: [{ name: '', internalType: 'bytes32', type: 'bytes32' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'superfluidPoolBeacon',
    outputs: [
      {
        name: '',
        internalType: 'contract SuperfluidUpgradeableBeacon',
        type: 'address',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'newAddress', internalType: 'address', type: 'address' }],
    name: 'updateCode',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      {
        name: 'token',
        internalType: 'contract ISuperfluidToken',
        type: 'address',
      },
      { name: 'account', internalType: 'address', type: 'address' },
      { name: 'time', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'realtimeBalanceOf',
    outputs: [
      { name: 'rtb', internalType: 'int256', type: 'int256' },
      { name: 'buf', internalType: 'uint256', type: 'uint256' },
      { name: 'owedBuffer', internalType: 'uint256', type: 'uint256' },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      {
        name: 'token',
        internalType: 'contract ISuperfluidToken',
        type: 'address',
      },
      { name: 'account', internalType: 'address', type: 'address' },
    ],
    name: 'realtimeBalanceOfNow',
    outputs: [
      { name: 'availableBalance', internalType: 'int256', type: 'int256' },
      { name: 'buffer', internalType: 'uint256', type: 'uint256' },
      { name: 'owedBuffer', internalType: 'uint256', type: 'uint256' },
      { name: 'timestamp', internalType: 'uint256', type: 'uint256' },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      {
        name: 'token',
        internalType: 'contract ISuperfluidToken',
        type: 'address',
      },
      { name: 'account', internalType: 'address', type: 'address' },
    ],
    name: 'getNetFlow',
    outputs: [{ name: 'netFlowRate', internalType: 'int96', type: 'int96' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      {
        name: 'token',
        internalType: 'contract ISuperfluidToken',
        type: 'address',
      },
      { name: 'from', internalType: 'address', type: 'address' },
      { name: 'to', internalType: 'contract ISuperfluidPool', type: 'address' },
    ],
    name: 'getFlowRate',
    outputs: [{ name: '', internalType: 'int96', type: 'int96' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      {
        name: 'token',
        internalType: 'contract ISuperfluidToken',
        type: 'address',
      },
      { name: 'from', internalType: 'address', type: 'address' },
      { name: 'to', internalType: 'contract ISuperfluidPool', type: 'address' },
    ],
    name: 'getFlow',
    outputs: [
      { name: 'lastUpdated', internalType: 'uint256', type: 'uint256' },
      { name: 'flowRate', internalType: 'int96', type: 'int96' },
      { name: 'deposit', internalType: 'uint256', type: 'uint256' },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      {
        name: 'token',
        internalType: 'contract ISuperfluidToken',
        type: 'address',
      },
      { name: 'account', internalType: 'address', type: 'address' },
    ],
    name: 'getAccountFlowInfo',
    outputs: [
      { name: 'timestamp', internalType: 'uint256', type: 'uint256' },
      { name: 'flowRate', internalType: 'int96', type: 'int96' },
      { name: 'deposit', internalType: 'uint256', type: 'uint256' },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      {
        name: 'token',
        internalType: 'contract ISuperfluidToken',
        type: 'address',
      },
      { name: 'from', internalType: 'address', type: 'address' },
      { name: 'to', internalType: 'contract ISuperfluidPool', type: 'address' },
      { name: 'requestedFlowRate', internalType: 'int96', type: 'int96' },
    ],
    name: 'estimateFlowDistributionActualFlowRate',
    outputs: [
      { name: 'actualFlowRate', internalType: 'int96', type: 'int96' },
      {
        name: 'totalDistributionFlowRate',
        internalType: 'int96',
        type: 'int96',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      {
        name: 'token',
        internalType: 'contract ISuperfluidToken',
        type: 'address',
      },
      { name: 'from', internalType: 'address', type: 'address' },
      { name: 'to', internalType: 'contract ISuperfluidPool', type: 'address' },
      { name: 'requestedAmount', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'estimateDistributionActualAmount',
    outputs: [
      { name: 'actualAmount', internalType: 'uint256', type: 'uint256' },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      {
        name: 'token',
        internalType: 'contract ISuperfluidToken',
        type: 'address',
      },
      { name: 'admin', internalType: 'address', type: 'address' },
      {
        name: 'config',
        internalType: 'struct PoolConfig',
        type: 'tuple',
        components: [
          {
            name: 'transferabilityForUnitsOwner',
            internalType: 'bool',
            type: 'bool',
          },
          {
            name: 'distributionFromAnyAddress',
            internalType: 'bool',
            type: 'bool',
          },
        ],
      },
    ],
    name: 'createPool',
    outputs: [
      {
        name: 'pool',
        internalType: 'contract ISuperfluidPool',
        type: 'address',
      },
    ],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      {
        name: 'pool',
        internalType: 'contract ISuperfluidPool',
        type: 'address',
      },
      { name: 'memberAddress', internalType: 'address', type: 'address' },
      { name: 'newUnits', internalType: 'uint128', type: 'uint128' },
      { name: 'ctx', internalType: 'bytes', type: 'bytes' },
    ],
    name: 'updateMemberUnits',
    outputs: [{ name: 'newCtx', internalType: 'bytes', type: 'bytes' }],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      {
        name: 'pool',
        internalType: 'contract ISuperfluidPool',
        type: 'address',
      },
      { name: 'memberAddress', internalType: 'address', type: 'address' },
      { name: 'ctx', internalType: 'bytes', type: 'bytes' },
    ],
    name: 'claimAll',
    outputs: [{ name: 'newCtx', internalType: 'bytes', type: 'bytes' }],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      {
        name: 'pool',
        internalType: 'contract ISuperfluidPool',
        type: 'address',
      },
      { name: 'ctx', internalType: 'bytes', type: 'bytes' },
    ],
    name: 'disconnectPool',
    outputs: [{ name: 'newCtx', internalType: 'bytes', type: 'bytes' }],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      {
        name: 'pool',
        internalType: 'contract ISuperfluidPool',
        type: 'address',
      },
      { name: 'doConnect', internalType: 'bool', type: 'bool' },
      { name: 'ctx', internalType: 'bytes', type: 'bytes' },
    ],
    name: 'connectPool',
    outputs: [{ name: 'newCtx', internalType: 'bytes', type: 'bytes' }],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      {
        name: 'pool',
        internalType: 'contract ISuperfluidPool',
        type: 'address',
      },
      { name: 'ctx', internalType: 'bytes', type: 'bytes' },
    ],
    name: 'connectPool',
    outputs: [{ name: 'newCtx', internalType: 'bytes', type: 'bytes' }],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      {
        name: 'pool',
        internalType: 'contract ISuperfluidPool',
        type: 'address',
      },
      { name: 'member', internalType: 'address', type: 'address' },
    ],
    name: 'isMemberConnected',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      {
        name: 'token',
        internalType: 'contract ISuperfluidToken',
        type: 'address',
      },
      {
        name: 'p',
        internalType: 'struct BasicParticle',
        type: 'tuple',
        components: [
          { name: '_settled_at', internalType: 'Time', type: 'uint32' },
          { name: '_flow_rate', internalType: 'FlowRate', type: 'int128' },
          { name: '_settled_value', internalType: 'Value', type: 'int256' },
        ],
      },
      { name: 't', internalType: 'Time', type: 'uint32' },
    ],
    name: 'appendIndexUpdateByPool',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      {
        name: 'superToken',
        internalType: 'contract ISuperfluidToken',
        type: 'address',
      },
      { name: 'claimRecipient', internalType: 'address', type: 'address' },
      { name: 'amount', internalType: 'int256', type: 'int256' },
    ],
    name: 'poolSettleClaim',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      {
        name: 'token',
        internalType: 'contract ISuperfluidToken',
        type: 'address',
      },
      { name: 'from', internalType: 'address', type: 'address' },
      {
        name: 'pool',
        internalType: 'contract ISuperfluidPool',
        type: 'address',
      },
      { name: 'requestedAmount', internalType: 'uint256', type: 'uint256' },
      { name: 'ctx', internalType: 'bytes', type: 'bytes' },
    ],
    name: 'distribute',
    outputs: [{ name: 'newCtx', internalType: 'bytes', type: 'bytes' }],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      {
        name: 'token',
        internalType: 'contract ISuperfluidToken',
        type: 'address',
      },
      { name: 'from', internalType: 'address', type: 'address' },
      {
        name: 'pool',
        internalType: 'contract ISuperfluidPool',
        type: 'address',
      },
      { name: 'requestedFlowRate', internalType: 'int96', type: 'int96' },
      { name: 'ctx', internalType: 'bytes', type: 'bytes' },
    ],
    name: 'distributeFlow',
    outputs: [{ name: 'newCtx', internalType: 'bytes', type: 'bytes' }],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      {
        name: 'token',
        internalType: 'contract ISuperfluidToken',
        type: 'address',
      },
      { name: 'account', internalType: 'address', type: 'address' },
    ],
    name: 'isPatricianPeriodNow',
    outputs: [
      {
        name: 'isCurrentlyPatricianPeriod',
        internalType: 'bool',
        type: 'bool',
      },
      { name: 'timestamp', internalType: 'uint256', type: 'uint256' },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      {
        name: 'token',
        internalType: 'contract ISuperfluidToken',
        type: 'address',
      },
      { name: 'account', internalType: 'address', type: 'address' },
      { name: 'timestamp', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'isPatricianPeriod',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      {
        name: 'pool',
        internalType: 'contract ISuperfluidPool',
        type: 'address',
      },
    ],
    name: 'getPoolAdjustmentFlowInfo',
    outputs: [
      { name: 'recipient', internalType: 'address', type: 'address' },
      { name: 'flowHash', internalType: 'bytes32', type: 'bytes32' },
      { name: 'flowRate', internalType: 'int96', type: 'int96' },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'pool', internalType: 'address', type: 'address' }],
    name: 'getPoolAdjustmentFlowRate',
    outputs: [{ name: '', internalType: 'int96', type: 'int96' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      {
        name: 'token',
        internalType: 'contract ISuperfluidToken',
        type: 'address',
      },
      { name: 'account', internalType: 'address', type: 'address' },
    ],
    name: 'isPool',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
    stateMutability: 'view',
  },
] as const

/**
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0xAAdBB3Eee3Bd080f5353d86DdF1916aCA3fAC842)
 * - [__View Contract on Op Mainnet Optimism Explorer__](https://optimistic.etherscan.io/address/0x68Ae17fa7a31b86F306c383277552fd4813b0d35)
 * - [__View Contract on Bnb Smart Chain Bsc Scan__](https://bscscan.com/address/0x3bbFA4C406719424C7f66CD97A8Fe27Af383d3e2)
 * - [__View Contract on Gnosis Gnosisscan__](https://gnosisscan.io/address/0xd7992D358A20478c82dDEd98B3D8A9da46e99b82)
 * - [__View Contract on Polygon Polygon Scan__](https://polygonscan.com/address/0x961dd5A052741B49B6CBf6759591f9D8576fCFb0)
 * - [__View Contract on Base Basescan__](https://basescan.org/address/0xfE6c87BE05feDB2059d2EC41bA0A09826C9FD7aa)
 * - [__View Contract on Arbitrum One Arbiscan__](https://arbiscan.io/address/0x1e299701792a2aF01408B122419d65Fd2dF0Ba02)
 * - [__View Contract on Celo Celo Explorer__](https://celoscan.io/address/0x308b7405272d11494716e30C6E972DbF6fb89555)
 * - [__View Contract on Avalanche Fuji Snow Trace__](https://testnet.snowtrace.io/address/0x51f571D934C59185f13d17301a36c07A2268B814)
 * - [__View Contract on Avalanche Snow Trace__](https://snowtrace.io/address/0xA7b197cD5b0cEF6d62c4A0a851E3581f5E62e4D2)
 * - [__View Contract on Base Sepolia Basescan__](https://sepolia.basescan.org/address/0x53F4f44C813Dc380182d0b2b67fe5832A12B97f8)
 * - [__View Contract on Scroll Sepolia Scrollscan__](https://sepolia.scrollscan.com/address/0x93fA9B627eE016990Fe5e654F923aaE8a480a75b)
 * - [__View Contract on Scroll Scrollscan__](https://scrollscan.com/address/0x97a9f293d7eD13f3fbD499cE684Ed4F103295a28)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x9823364056BcA85Dc3c4a3b96801314D082C8Eb9)
 * - [__View Contract on Op Sepolia Blockscout__](https://optimism-sepolia.blockscout.com/address/0xd453d38A001B47271488886532f1CCeAbf0c7eF3)
 * - [__View Contract on Degen Degen Chain Explorer__](https://explorer.degen.tips/address/0x210a01ad187003603B2287F78579ec103Eb70D9B)
 */
export const generalDistributionAgreementV1Address = {
  1: '0xAAdBB3Eee3Bd080f5353d86DdF1916aCA3fAC842',
  10: '0x68Ae17fa7a31b86F306c383277552fd4813b0d35',
  56: '0x3bbFA4C406719424C7f66CD97A8Fe27Af383d3e2',
  100: '0xd7992D358A20478c82dDEd98B3D8A9da46e99b82',
  137: '0x961dd5A052741B49B6CBf6759591f9D8576fCFb0',
  8453: '0xfE6c87BE05feDB2059d2EC41bA0A09826C9FD7aa',
  42161: '0x1e299701792a2aF01408B122419d65Fd2dF0Ba02',
  42220: '0x308b7405272d11494716e30C6E972DbF6fb89555',
  43113: '0x51f571D934C59185f13d17301a36c07A2268B814',
  43114: '0xA7b197cD5b0cEF6d62c4A0a851E3581f5E62e4D2',
  84532: '0x53F4f44C813Dc380182d0b2b67fe5832A12B97f8',
  534351: '0x93fA9B627eE016990Fe5e654F923aaE8a480a75b',
  534352: '0x97a9f293d7eD13f3fbD499cE684Ed4F103295a28',
  11155111: '0x9823364056BcA85Dc3c4a3b96801314D082C8Eb9',
  11155420: '0xd453d38A001B47271488886532f1CCeAbf0c7eF3',
  666666666: '0x210a01ad187003603B2287F78579ec103Eb70D9B',
} as const

/**
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0xAAdBB3Eee3Bd080f5353d86DdF1916aCA3fAC842)
 * - [__View Contract on Op Mainnet Optimism Explorer__](https://optimistic.etherscan.io/address/0x68Ae17fa7a31b86F306c383277552fd4813b0d35)
 * - [__View Contract on Bnb Smart Chain Bsc Scan__](https://bscscan.com/address/0x3bbFA4C406719424C7f66CD97A8Fe27Af383d3e2)
 * - [__View Contract on Gnosis Gnosisscan__](https://gnosisscan.io/address/0xd7992D358A20478c82dDEd98B3D8A9da46e99b82)
 * - [__View Contract on Polygon Polygon Scan__](https://polygonscan.com/address/0x961dd5A052741B49B6CBf6759591f9D8576fCFb0)
 * - [__View Contract on Base Basescan__](https://basescan.org/address/0xfE6c87BE05feDB2059d2EC41bA0A09826C9FD7aa)
 * - [__View Contract on Arbitrum One Arbiscan__](https://arbiscan.io/address/0x1e299701792a2aF01408B122419d65Fd2dF0Ba02)
 * - [__View Contract on Celo Celo Explorer__](https://celoscan.io/address/0x308b7405272d11494716e30C6E972DbF6fb89555)
 * - [__View Contract on Avalanche Fuji Snow Trace__](https://testnet.snowtrace.io/address/0x51f571D934C59185f13d17301a36c07A2268B814)
 * - [__View Contract on Avalanche Snow Trace__](https://snowtrace.io/address/0xA7b197cD5b0cEF6d62c4A0a851E3581f5E62e4D2)
 * - [__View Contract on Base Sepolia Basescan__](https://sepolia.basescan.org/address/0x53F4f44C813Dc380182d0b2b67fe5832A12B97f8)
 * - [__View Contract on Scroll Sepolia Scrollscan__](https://sepolia.scrollscan.com/address/0x93fA9B627eE016990Fe5e654F923aaE8a480a75b)
 * - [__View Contract on Scroll Scrollscan__](https://scrollscan.com/address/0x97a9f293d7eD13f3fbD499cE684Ed4F103295a28)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x9823364056BcA85Dc3c4a3b96801314D082C8Eb9)
 * - [__View Contract on Op Sepolia Blockscout__](https://optimism-sepolia.blockscout.com/address/0xd453d38A001B47271488886532f1CCeAbf0c7eF3)
 * - [__View Contract on Degen Degen Chain Explorer__](https://explorer.degen.tips/address/0x210a01ad187003603B2287F78579ec103Eb70D9B)
 */
export const generalDistributionAgreementV1Config = {
  address: generalDistributionAgreementV1Address,
  abi: generalDistributionAgreementV1Abi,
} as const

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// NativeAssetSuperToken
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const nativeAssetSuperTokenAbi = [
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'account',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'amount',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
    ],
    name: 'TokenDowngraded',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'account',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'amount',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
    ],
    name: 'TokenUpgraded',
  },
  { type: 'fallback', stateMutability: 'payable' },
  {
    type: 'function',
    inputs: [
      { name: 'initialAddress', internalType: 'address', type: 'address' },
    ],
    name: 'initializeProxy',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  { type: 'receive', stateMutability: 'payable' },
  {
    type: 'function',
    inputs: [],
    name: 'upgradeByETH',
    outputs: [],
    stateMutability: 'payable',
  },
  {
    type: 'function',
    inputs: [{ name: 'to', internalType: 'address', type: 'address' }],
    name: 'upgradeByETHTo',
    outputs: [],
    stateMutability: 'payable',
  },
  {
    type: 'function',
    inputs: [{ name: 'wad', internalType: 'uint256', type: 'uint256' }],
    name: 'downgradeToETH',
    outputs: [],
    stateMutability: 'nonpayable',
  },
] as const

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// PureSuperToken
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const pureSuperTokenAbi = [
  { type: 'fallback', stateMutability: 'payable' },
  {
    type: 'function',
    inputs: [
      { name: 'initialAddress', internalType: 'address', type: 'address' },
    ],
    name: 'initializeProxy',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  { type: 'receive', stateMutability: 'payable' },
  {
    type: 'function',
    inputs: [
      { name: 'name', internalType: 'string', type: 'string' },
      { name: 'symbol', internalType: 'string', type: 'string' },
      { name: 'initialSupply', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'initialize',
    outputs: [],
    stateMutability: 'nonpayable',
  },
] as const

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// SuperToken
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const superTokenAbi = [
  {
    type: 'constructor',
    inputs: [
      { name: 'host', internalType: 'contract ISuperfluid', type: 'address' },
      {
        name: 'constantOutflowNFT',
        internalType: 'contract IConstantOutflowNFT',
        type: 'address',
      },
      {
        name: 'constantInflowNFT',
        internalType: 'contract IConstantInflowNFT',
        type: 'address',
      },
      {
        name: 'poolAdminNFT',
        internalType: 'contract IPoolAdminNFT',
        type: 'address',
      },
      {
        name: 'poolMemberNFT',
        internalType: 'contract IPoolMemberNFT',
        type: 'address',
      },
    ],
    stateMutability: 'nonpayable',
  },
  { type: 'error', inputs: [], name: 'SF_TOKEN_AGREEMENT_ALREADY_EXISTS' },
  { type: 'error', inputs: [], name: 'SF_TOKEN_AGREEMENT_DOES_NOT_EXIST' },
  { type: 'error', inputs: [], name: 'SF_TOKEN_BURN_INSUFFICIENT_BALANCE' },
  { type: 'error', inputs: [], name: 'SF_TOKEN_MOVE_INSUFFICIENT_BALANCE' },
  { type: 'error', inputs: [], name: 'SF_TOKEN_ONLY_HOST' },
  { type: 'error', inputs: [], name: 'SF_TOKEN_ONLY_LISTED_AGREEMENT' },
  { type: 'error', inputs: [], name: 'SUPER_TOKEN_APPROVE_FROM_ZERO_ADDRESS' },
  { type: 'error', inputs: [], name: 'SUPER_TOKEN_APPROVE_TO_ZERO_ADDRESS' },
  { type: 'error', inputs: [], name: 'SUPER_TOKEN_BURN_FROM_ZERO_ADDRESS' },
  {
    type: 'error',
    inputs: [],
    name: 'SUPER_TOKEN_CALLER_IS_NOT_OPERATOR_FOR_HOLDER',
  },
  {
    type: 'error',
    inputs: [],
    name: 'SUPER_TOKEN_INFLATIONARY_DEFLATIONARY_NOT_SUPPORTED',
  },
  { type: 'error', inputs: [], name: 'SUPER_TOKEN_MINT_TO_ZERO_ADDRESS' },
  { type: 'error', inputs: [], name: 'SUPER_TOKEN_NFT_PROXY_ADDRESS_CHANGED' },
  {
    type: 'error',
    inputs: [],
    name: 'SUPER_TOKEN_NOT_ERC777_TOKENS_RECIPIENT',
  },
  { type: 'error', inputs: [], name: 'SUPER_TOKEN_NO_UNDERLYING_TOKEN' },
  { type: 'error', inputs: [], name: 'SUPER_TOKEN_ONLY_ADMIN' },
  { type: 'error', inputs: [], name: 'SUPER_TOKEN_ONLY_GOV_OWNER' },
  { type: 'error', inputs: [], name: 'SUPER_TOKEN_ONLY_SELF' },
  { type: 'error', inputs: [], name: 'SUPER_TOKEN_TRANSFER_FROM_ZERO_ADDRESS' },
  { type: 'error', inputs: [], name: 'SUPER_TOKEN_TRANSFER_TO_ZERO_ADDRESS' },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'oldAdmin',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'newAdmin',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
    ],
    name: 'AdminChanged',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'agreementClass',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      { name: 'id', internalType: 'bytes32', type: 'bytes32', indexed: false },
      {
        name: 'data',
        internalType: 'bytes32[]',
        type: 'bytes32[]',
        indexed: false,
      },
    ],
    name: 'AgreementCreated',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'agreementClass',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      { name: 'id', internalType: 'bytes32', type: 'bytes32', indexed: false },
      {
        name: 'penaltyAccount',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'rewardAccount',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'rewardAmount',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
    ],
    name: 'AgreementLiquidated',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'liquidatorAccount',
        internalType: 'address',
        type: 'address',
        indexed: false,
      },
      {
        name: 'agreementClass',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      { name: 'id', internalType: 'bytes32', type: 'bytes32', indexed: false },
      {
        name: 'penaltyAccount',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'bondAccount',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'rewardAmount',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
      {
        name: 'bailoutAmount',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
    ],
    name: 'AgreementLiquidatedBy',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'agreementClass',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      { name: 'id', internalType: 'bytes32', type: 'bytes32', indexed: false },
      {
        name: 'liquidatorAccount',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'targetAccount',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'rewardAmountReceiver',
        internalType: 'address',
        type: 'address',
        indexed: false,
      },
      {
        name: 'rewardAmount',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
      {
        name: 'targetAccountBalanceDelta',
        internalType: 'int256',
        type: 'int256',
        indexed: false,
      },
      {
        name: 'liquidationTypeData',
        internalType: 'bytes',
        type: 'bytes',
        indexed: false,
      },
    ],
    name: 'AgreementLiquidatedV2',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'agreementClass',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'account',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'slotId',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
    ],
    name: 'AgreementStateUpdated',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'agreementClass',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      { name: 'id', internalType: 'bytes32', type: 'bytes32', indexed: false },
    ],
    name: 'AgreementTerminated',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'agreementClass',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      { name: 'id', internalType: 'bytes32', type: 'bytes32', indexed: false },
      {
        name: 'data',
        internalType: 'bytes32[]',
        type: 'bytes32[]',
        indexed: false,
      },
    ],
    name: 'AgreementUpdated',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'owner',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'spender',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'value',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
    ],
    name: 'Approval',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'operator',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'tokenHolder',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
    ],
    name: 'AuthorizedOperator',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'bailoutAccount',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'bailoutAmount',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
    ],
    name: 'Bailout',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'operator',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      { name: 'from', internalType: 'address', type: 'address', indexed: true },
      {
        name: 'amount',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
      { name: 'data', internalType: 'bytes', type: 'bytes', indexed: false },
      {
        name: 'operatorData',
        internalType: 'bytes',
        type: 'bytes',
        indexed: false,
      },
    ],
    name: 'Burned',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'uuid',
        internalType: 'bytes32',
        type: 'bytes32',
        indexed: false,
      },
      {
        name: 'codeAddress',
        internalType: 'address',
        type: 'address',
        indexed: false,
      },
    ],
    name: 'CodeUpdated',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      { name: 'version', internalType: 'uint8', type: 'uint8', indexed: false },
    ],
    name: 'Initialized',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'operator',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      { name: 'to', internalType: 'address', type: 'address', indexed: true },
      {
        name: 'amount',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
      { name: 'data', internalType: 'bytes', type: 'bytes', indexed: false },
      {
        name: 'operatorData',
        internalType: 'bytes',
        type: 'bytes',
        indexed: false,
      },
    ],
    name: 'Minted',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'poolAdminNFT',
        internalType: 'contract IPoolAdminNFT',
        type: 'address',
        indexed: true,
      },
    ],
    name: 'PoolAdminNFTCreated',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'poolMemberNFT',
        internalType: 'contract IPoolMemberNFT',
        type: 'address',
        indexed: true,
      },
    ],
    name: 'PoolMemberNFTCreated',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'operator',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'tokenHolder',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
    ],
    name: 'RevokedOperator',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'operator',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      { name: 'from', internalType: 'address', type: 'address', indexed: true },
      { name: 'to', internalType: 'address', type: 'address', indexed: true },
      {
        name: 'amount',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
      { name: 'data', internalType: 'bytes', type: 'bytes', indexed: false },
      {
        name: 'operatorData',
        internalType: 'bytes',
        type: 'bytes',
        indexed: false,
      },
    ],
    name: 'Sent',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'account',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'amount',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
    ],
    name: 'TokenDowngraded',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'account',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'amount',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
    ],
    name: 'TokenUpgraded',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      { name: 'from', internalType: 'address', type: 'address', indexed: true },
      { name: 'to', internalType: 'address', type: 'address', indexed: true },
      {
        name: 'value',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
    ],
    name: 'Transfer',
  },
  {
    type: 'function',
    inputs: [],
    name: 'CONSTANT_INFLOW_NFT',
    outputs: [
      {
        name: '',
        internalType: 'contract IConstantInflowNFT',
        type: 'address',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'CONSTANT_OUTFLOW_NFT',
    outputs: [
      {
        name: '',
        internalType: 'contract IConstantOutflowNFT',
        type: 'address',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'POOL_ADMIN_NFT',
    outputs: [
      { name: '', internalType: 'contract IPoolAdminNFT', type: 'address' },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'POOL_MEMBER_NFT',
    outputs: [
      { name: '', internalType: 'contract IPoolMemberNFT', type: 'address' },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'castrate',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'id', internalType: 'bytes32', type: 'bytes32' },
      { name: 'data', internalType: 'bytes32[]', type: 'bytes32[]' },
    ],
    name: 'createAgreement',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: 'account', internalType: 'address', type: 'address' }],
    name: 'getAccountActiveAgreements',
    outputs: [
      {
        name: '',
        internalType: 'contract ISuperAgreement[]',
        type: 'address[]',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'agreementClass', internalType: 'address', type: 'address' },
      { name: 'id', internalType: 'bytes32', type: 'bytes32' },
      { name: 'dataLength', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'getAgreementData',
    outputs: [{ name: 'data', internalType: 'bytes32[]', type: 'bytes32[]' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'agreementClass', internalType: 'address', type: 'address' },
      { name: 'account', internalType: 'address', type: 'address' },
      { name: 'slotId', internalType: 'uint256', type: 'uint256' },
      { name: 'dataLength', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'getAgreementStateSlot',
    outputs: [
      { name: 'slotData', internalType: 'bytes32[]', type: 'bytes32[]' },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'getCodeAddress',
    outputs: [
      { name: 'codeAddress', internalType: 'address', type: 'address' },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'getHost',
    outputs: [{ name: 'host', internalType: 'address', type: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'account', internalType: 'address', type: 'address' },
      { name: 'timestamp', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'isAccountCritical',
    outputs: [{ name: 'isCritical', internalType: 'bool', type: 'bool' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'account', internalType: 'address', type: 'address' }],
    name: 'isAccountCriticalNow',
    outputs: [{ name: 'isCritical', internalType: 'bool', type: 'bool' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'account', internalType: 'address', type: 'address' },
      { name: 'timestamp', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'isAccountSolvent',
    outputs: [{ name: 'isSolvent', internalType: 'bool', type: 'bool' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'account', internalType: 'address', type: 'address' }],
    name: 'isAccountSolventNow',
    outputs: [{ name: 'isSolvent', internalType: 'bool', type: 'bool' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'id', internalType: 'bytes32', type: 'bytes32' },
      { name: 'liquidationTypeData', internalType: 'bytes', type: 'bytes' },
      { name: 'liquidatorAccount', internalType: 'address', type: 'address' },
      { name: 'useDefaultRewardAccount', internalType: 'bool', type: 'bool' },
      { name: 'targetAccount', internalType: 'address', type: 'address' },
      { name: 'rewardAmount', internalType: 'uint256', type: 'uint256' },
      {
        name: 'targetAccountBalanceDelta',
        internalType: 'int256',
        type: 'int256',
      },
    ],
    name: 'makeLiquidationPayoutsV2',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'account', internalType: 'address', type: 'address' },
      { name: 'timestamp', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'realtimeBalanceOf',
    outputs: [
      { name: 'availableBalance', internalType: 'int256', type: 'int256' },
      { name: 'deposit', internalType: 'uint256', type: 'uint256' },
      { name: 'owedDeposit', internalType: 'uint256', type: 'uint256' },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'account', internalType: 'address', type: 'address' }],
    name: 'realtimeBalanceOfNow',
    outputs: [
      { name: 'availableBalance', internalType: 'int256', type: 'int256' },
      { name: 'deposit', internalType: 'uint256', type: 'uint256' },
      { name: 'owedDeposit', internalType: 'uint256', type: 'uint256' },
      { name: 'timestamp', internalType: 'uint256', type: 'uint256' },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'account', internalType: 'address', type: 'address' },
      { name: 'delta', internalType: 'int256', type: 'int256' },
    ],
    name: 'settleBalance',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'id', internalType: 'bytes32', type: 'bytes32' },
      { name: 'dataLength', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'terminateAgreement',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'id', internalType: 'bytes32', type: 'bytes32' },
      { name: 'data', internalType: 'bytes32[]', type: 'bytes32[]' },
    ],
    name: 'updateAgreementData',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'account', internalType: 'address', type: 'address' },
      { name: 'slotId', internalType: 'uint256', type: 'uint256' },
      { name: 'slotData', internalType: 'bytes32[]', type: 'bytes32[]' },
    ],
    name: 'updateAgreementStateSlot',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      {
        name: 'underlyingToken',
        internalType: 'contract IERC20',
        type: 'address',
      },
      { name: 'underlyingDecimals', internalType: 'uint8', type: 'uint8' },
      { name: 'n', internalType: 'string', type: 'string' },
      { name: 's', internalType: 'string', type: 'string' },
    ],
    name: 'initialize',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      {
        name: 'underlyingToken',
        internalType: 'contract IERC20',
        type: 'address',
      },
      { name: 'underlyingDecimals', internalType: 'uint8', type: 'uint8' },
      { name: 'n', internalType: 'string', type: 'string' },
      { name: 's', internalType: 'string', type: 'string' },
      { name: 'admin', internalType: 'address', type: 'address' },
    ],
    name: 'initializeWithAdmin',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'proxiableUUID',
    outputs: [{ name: '', internalType: 'bytes32', type: 'bytes32' }],
    stateMutability: 'pure',
  },
  {
    type: 'function',
    inputs: [{ name: 'newAddress', internalType: 'address', type: 'address' }],
    name: 'updateCode',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: 'newAdmin', internalType: 'address', type: 'address' }],
    name: 'changeAdmin',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'getAdmin',
    outputs: [{ name: '', internalType: 'address', type: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'name',
    outputs: [{ name: '', internalType: 'string', type: 'string' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'symbol',
    outputs: [{ name: '', internalType: 'string', type: 'string' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'decimals',
    outputs: [{ name: '', internalType: 'uint8', type: 'uint8' }],
    stateMutability: 'pure',
  },
  {
    type: 'function',
    inputs: [],
    name: 'totalSupply',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'account', internalType: 'address', type: 'address' }],
    name: 'balanceOf',
    outputs: [{ name: 'balance', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'recipient', internalType: 'address', type: 'address' },
      { name: 'amount', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'transfer',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'account', internalType: 'address', type: 'address' },
      { name: 'spender', internalType: 'address', type: 'address' },
    ],
    name: 'allowance',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'spender', internalType: 'address', type: 'address' },
      { name: 'amount', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'approve',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'holder', internalType: 'address', type: 'address' },
      { name: 'recipient', internalType: 'address', type: 'address' },
      { name: 'amount', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'transferFrom',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'spender', internalType: 'address', type: 'address' },
      { name: 'addedValue', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'increaseAllowance',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'spender', internalType: 'address', type: 'address' },
      { name: 'subtractedValue', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'decreaseAllowance',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'granularity',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'pure',
  },
  {
    type: 'function',
    inputs: [
      { name: 'recipient', internalType: 'address', type: 'address' },
      { name: 'amount', internalType: 'uint256', type: 'uint256' },
      { name: 'userData', internalType: 'bytes', type: 'bytes' },
    ],
    name: 'send',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'amount', internalType: 'uint256', type: 'uint256' },
      { name: 'userData', internalType: 'bytes', type: 'bytes' },
    ],
    name: 'burn',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'operator', internalType: 'address', type: 'address' },
      { name: 'tokenHolder', internalType: 'address', type: 'address' },
    ],
    name: 'isOperatorFor',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'operator', internalType: 'address', type: 'address' }],
    name: 'authorizeOperator',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: 'operator', internalType: 'address', type: 'address' }],
    name: 'revokeOperator',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'defaultOperators',
    outputs: [{ name: '', internalType: 'address[]', type: 'address[]' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'sender', internalType: 'address', type: 'address' },
      { name: 'recipient', internalType: 'address', type: 'address' },
      { name: 'amount', internalType: 'uint256', type: 'uint256' },
      { name: 'userData', internalType: 'bytes', type: 'bytes' },
      { name: 'operatorData', internalType: 'bytes', type: 'bytes' },
    ],
    name: 'operatorSend',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'account', internalType: 'address', type: 'address' },
      { name: 'amount', internalType: 'uint256', type: 'uint256' },
      { name: 'userData', internalType: 'bytes', type: 'bytes' },
      { name: 'operatorData', internalType: 'bytes', type: 'bytes' },
    ],
    name: 'operatorBurn',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'account', internalType: 'address', type: 'address' },
      { name: 'amount', internalType: 'uint256', type: 'uint256' },
      { name: 'userData', internalType: 'bytes', type: 'bytes' },
    ],
    name: 'selfMint',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'account', internalType: 'address', type: 'address' },
      { name: 'amount', internalType: 'uint256', type: 'uint256' },
      { name: 'userData', internalType: 'bytes', type: 'bytes' },
    ],
    name: 'selfBurn',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'account', internalType: 'address', type: 'address' },
      { name: 'spender', internalType: 'address', type: 'address' },
      { name: 'amount', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'selfApproveFor',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'holder', internalType: 'address', type: 'address' },
      { name: 'spender', internalType: 'address', type: 'address' },
      { name: 'recipient', internalType: 'address', type: 'address' },
      { name: 'amount', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'selfTransferFrom',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: 'recipient', internalType: 'address', type: 'address' }],
    name: 'transferAll',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'getUnderlyingToken',
    outputs: [{ name: '', internalType: 'address', type: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'getUnderlyingDecimals',
    outputs: [{ name: '', internalType: 'uint8', type: 'uint8' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'amount', internalType: 'uint256', type: 'uint256' }],
    name: 'toUnderlyingAmount',
    outputs: [
      { name: 'underlyingAmount', internalType: 'uint256', type: 'uint256' },
      { name: 'adjustedAmount', internalType: 'uint256', type: 'uint256' },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'amount', internalType: 'uint256', type: 'uint256' }],
    name: 'upgrade',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'to', internalType: 'address', type: 'address' },
      { name: 'amount', internalType: 'uint256', type: 'uint256' },
      { name: 'userData', internalType: 'bytes', type: 'bytes' },
    ],
    name: 'upgradeTo',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: 'amount', internalType: 'uint256', type: 'uint256' }],
    name: 'downgrade',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'to', internalType: 'address', type: 'address' },
      { name: 'amount', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'downgradeTo',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'account', internalType: 'address', type: 'address' },
      { name: 'spender', internalType: 'address', type: 'address' },
      { name: 'amount', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'operationApprove',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'account', internalType: 'address', type: 'address' },
      { name: 'spender', internalType: 'address', type: 'address' },
      { name: 'addedValue', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'operationIncreaseAllowance',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'account', internalType: 'address', type: 'address' },
      { name: 'spender', internalType: 'address', type: 'address' },
      { name: 'subtractedValue', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'operationDecreaseAllowance',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'account', internalType: 'address', type: 'address' },
      { name: 'spender', internalType: 'address', type: 'address' },
      { name: 'recipient', internalType: 'address', type: 'address' },
      { name: 'amount', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'operationTransferFrom',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'spender', internalType: 'address', type: 'address' },
      { name: 'recipient', internalType: 'address', type: 'address' },
      { name: 'amount', internalType: 'uint256', type: 'uint256' },
      { name: 'userData', internalType: 'bytes', type: 'bytes' },
    ],
    name: 'operationSend',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'account', internalType: 'address', type: 'address' },
      { name: 'amount', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'operationUpgrade',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'account', internalType: 'address', type: 'address' },
      { name: 'amount', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'operationDowngrade',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'account', internalType: 'address', type: 'address' },
      { name: 'to', internalType: 'address', type: 'address' },
      { name: 'amount', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'operationUpgradeTo',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'account', internalType: 'address', type: 'address' },
      { name: 'to', internalType: 'address', type: 'address' },
      { name: 'amount', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'operationDowngradeTo',
    outputs: [],
    stateMutability: 'nonpayable',
  },
] as const

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// SuperfluidPool
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const superfluidPoolAbi = [
  {
    type: 'constructor',
    inputs: [
      {
        name: 'gda',
        internalType: 'contract GeneralDistributionAgreementV1',
        type: 'address',
      },
    ],
    stateMutability: 'nonpayable',
  },
  { type: 'error', inputs: [], name: 'SUPERFLUID_POOL_INVALID_TIME' },
  { type: 'error', inputs: [], name: 'SUPERFLUID_POOL_NOT_GDA' },
  { type: 'error', inputs: [], name: 'SUPERFLUID_POOL_NOT_POOL_ADMIN_OR_GDA' },
  { type: 'error', inputs: [], name: 'SUPERFLUID_POOL_NO_POOL_MEMBERS' },
  { type: 'error', inputs: [], name: 'SUPERFLUID_POOL_NO_ZERO_ADDRESS' },
  {
    type: 'error',
    inputs: [],
    name: 'SUPERFLUID_POOL_SELF_TRANSFER_NOT_ALLOWED',
  },
  {
    type: 'error',
    inputs: [],
    name: 'SUPERFLUID_POOL_TRANSFER_UNITS_NOT_ALLOWED',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'owner',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'spender',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'value',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
    ],
    name: 'Approval',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'token',
        internalType: 'contract ISuperfluidToken',
        type: 'address',
        indexed: true,
      },
      {
        name: 'member',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'claimedAmount',
        internalType: 'int256',
        type: 'int256',
        indexed: false,
      },
      {
        name: 'totalClaimed',
        internalType: 'int256',
        type: 'int256',
        indexed: false,
      },
    ],
    name: 'DistributionClaimed',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      { name: 'version', internalType: 'uint8', type: 'uint8', indexed: false },
    ],
    name: 'Initialized',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'token',
        internalType: 'contract ISuperfluidToken',
        type: 'address',
        indexed: true,
      },
      {
        name: 'member',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'oldUnits',
        internalType: 'uint128',
        type: 'uint128',
        indexed: false,
      },
      {
        name: 'newUnits',
        internalType: 'uint128',
        type: 'uint128',
        indexed: false,
      },
    ],
    name: 'MemberUnitsUpdated',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      { name: 'from', internalType: 'address', type: 'address', indexed: true },
      { name: 'to', internalType: 'address', type: 'address', indexed: true },
      {
        name: 'value',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
    ],
    name: 'Transfer',
  },
  {
    type: 'function',
    inputs: [],
    name: 'GDA',
    outputs: [
      {
        name: '',
        internalType: 'contract GeneralDistributionAgreementV1',
        type: 'address',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'admin',
    outputs: [{ name: '', internalType: 'address', type: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'castrate',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'distributionFromAnyAddress',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'superToken',
    outputs: [
      { name: '', internalType: 'contract ISuperfluidToken', type: 'address' },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'transferabilityForUnitsOwner',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'admin_', internalType: 'address', type: 'address' },
      {
        name: 'superToken_',
        internalType: 'contract ISuperfluidToken',
        type: 'address',
      },
      {
        name: 'transferabilityForUnitsOwner_',
        internalType: 'bool',
        type: 'bool',
      },
      {
        name: 'distributionFromAnyAddress_',
        internalType: 'bool',
        type: 'bool',
      },
    ],
    name: 'initialize',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'proxiableUUID',
    outputs: [{ name: '', internalType: 'bytes32', type: 'bytes32' }],
    stateMutability: 'pure',
  },
  {
    type: 'function',
    inputs: [],
    name: 'poolOperatorGetIndex',
    outputs: [
      {
        name: '',
        internalType: 'struct SuperfluidPool.PoolIndexData',
        type: 'tuple',
        components: [
          { name: 'totalUnits', internalType: 'uint128', type: 'uint128' },
          { name: 'wrappedSettledAt', internalType: 'uint32', type: 'uint32' },
          { name: 'wrappedFlowRate', internalType: 'int96', type: 'int96' },
          {
            name: 'wrappedSettledValue',
            internalType: 'int256',
            type: 'int256',
          },
        ],
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'getTotalUnits',
    outputs: [{ name: '', internalType: 'uint128', type: 'uint128' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'owner', internalType: 'address', type: 'address' },
      { name: 'spender', internalType: 'address', type: 'address' },
    ],
    name: 'allowance',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'spender', internalType: 'address', type: 'address' },
      { name: 'amount', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'approve',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'spender', internalType: 'address', type: 'address' },
      { name: 'addedValue', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'increaseAllowance',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'spender', internalType: 'address', type: 'address' },
      { name: 'subtractedValue', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'decreaseAllowance',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'to', internalType: 'address', type: 'address' },
      { name: 'amount', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'transfer',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'from', internalType: 'address', type: 'address' },
      { name: 'to', internalType: 'address', type: 'address' },
      { name: 'amount', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'transferFrom',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'totalSupply',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'getTotalConnectedUnits',
    outputs: [{ name: '', internalType: 'uint128', type: 'uint128' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'getTotalDisconnectedUnits',
    outputs: [{ name: '', internalType: 'uint128', type: 'uint128' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'memberAddr', internalType: 'address', type: 'address' }],
    name: 'getUnits',
    outputs: [{ name: '', internalType: 'uint128', type: 'uint128' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'account', internalType: 'address', type: 'address' }],
    name: 'balanceOf',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'getTotalFlowRate',
    outputs: [{ name: '', internalType: 'int96', type: 'int96' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'getTotalConnectedFlowRate',
    outputs: [{ name: '', internalType: 'int96', type: 'int96' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'getTotalDisconnectedFlowRate',
    outputs: [{ name: 'flowRate', internalType: 'int96', type: 'int96' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'time', internalType: 'uint32', type: 'uint32' }],
    name: 'getDisconnectedBalance',
    outputs: [{ name: 'balance', internalType: 'int256', type: 'int256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'memberAddr', internalType: 'address', type: 'address' }],
    name: 'getTotalAmountReceivedByMember',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'memberAddr', internalType: 'address', type: 'address' }],
    name: 'getMemberFlowRate',
    outputs: [{ name: '', internalType: 'int96', type: 'int96' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'memberAddr', internalType: 'address', type: 'address' }],
    name: 'getClaimableNow',
    outputs: [
      { name: 'claimableBalance', internalType: 'int256', type: 'int256' },
      { name: 'timestamp', internalType: 'uint256', type: 'uint256' },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'memberAddr', internalType: 'address', type: 'address' },
      { name: 'time', internalType: 'uint32', type: 'uint32' },
    ],
    name: 'getClaimable',
    outputs: [{ name: '', internalType: 'int256', type: 'int256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'memberAddr', internalType: 'address', type: 'address' },
      { name: 'newUnits', internalType: 'uint128', type: 'uint128' },
    ],
    name: 'updateMemberUnits',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: 'memberAddr', internalType: 'address', type: 'address' }],
    name: 'claimAll',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'claimAll',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      {
        name: 'index',
        internalType: 'struct PDPoolIndex',
        type: 'tuple',
        components: [
          { name: 'total_units', internalType: 'Unit', type: 'int128' },
          {
            name: '_wrapped_particle',
            internalType: 'struct BasicParticle',
            type: 'tuple',
            components: [
              { name: '_settled_at', internalType: 'Time', type: 'uint32' },
              { name: '_flow_rate', internalType: 'FlowRate', type: 'int128' },
              { name: '_settled_value', internalType: 'Value', type: 'int256' },
            ],
          },
        ],
      },
    ],
    name: 'operatorSetIndex',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'memberAddr', internalType: 'address', type: 'address' },
      { name: 'doConnect', internalType: 'bool', type: 'bool' },
      { name: 'time', internalType: 'uint32', type: 'uint32' },
    ],
    name: 'operatorConnectMember',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
    stateMutability: 'nonpayable',
  },
] as const

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// React
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link autoWrapManagerAbi}__
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x30aE282CF477E2eF28B14d0125aCEAd57Fe1d7a1)
 * - [__View Contract on Op Mainnet Optimism Explorer__](https://optimistic.etherscan.io/address/0x1fA76f2Cd0C3fe6c399A80111408d9C42C0CAC23)
 * - [__View Contract on Bnb Smart Chain Bsc Scan__](https://bscscan.com/address/0x2AcdD61ac1EFFe1535109449c31889bdE8d7f325)
 * - [__View Contract on Gnosis Gnosisscan__](https://gnosisscan.io/address/0x8082e58681350876aFe8f52d3Bf8672034A03Db0)
 * - [__View Contract on Polygon Polygon Scan__](https://polygonscan.com/address/0x2581c27E7f6D6AF452E63fCe884EDE3EDd716b32)
 * - [__View Contract on Base Basescan__](https://basescan.org/address/0x5D0acD0864Ad07ba4E1E0474AE69Da87482e14A9)
 * - [__View Contract on Arbitrum One Arbiscan__](https://arbiscan.io/address/0xf01825eAFAe5CD1Dab5593EFAF218efC8968D272)
 * - [__View Contract on Avalanche Fuji Snow Trace__](https://testnet.snowtrace.io/address/0x30aE282CF477E2eF28B14d0125aCEAd57Fe1d7a1)
 * - [__View Contract on Avalanche Snow Trace__](https://snowtrace.io/address/0x8082e58681350876aFe8f52d3Bf8672034A03Db0)
 * - [__View Contract on Op Sepolia Blockscout__](https://optimism-sepolia.blockscout.com/address/0xe567b32C10B0dB72d9490eB1B9A409C5ADed192C)
 */
export const useAutoWrapManagerRead = /*#__PURE__*/ createUseReadContract({
  abi: autoWrapManagerAbi,
  address: autoWrapManagerAddress,
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link autoWrapManagerAbi}__ and `functionName` set to `"approvedStrategies"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x30aE282CF477E2eF28B14d0125aCEAd57Fe1d7a1)
 * - [__View Contract on Op Mainnet Optimism Explorer__](https://optimistic.etherscan.io/address/0x1fA76f2Cd0C3fe6c399A80111408d9C42C0CAC23)
 * - [__View Contract on Bnb Smart Chain Bsc Scan__](https://bscscan.com/address/0x2AcdD61ac1EFFe1535109449c31889bdE8d7f325)
 * - [__View Contract on Gnosis Gnosisscan__](https://gnosisscan.io/address/0x8082e58681350876aFe8f52d3Bf8672034A03Db0)
 * - [__View Contract on Polygon Polygon Scan__](https://polygonscan.com/address/0x2581c27E7f6D6AF452E63fCe884EDE3EDd716b32)
 * - [__View Contract on Base Basescan__](https://basescan.org/address/0x5D0acD0864Ad07ba4E1E0474AE69Da87482e14A9)
 * - [__View Contract on Arbitrum One Arbiscan__](https://arbiscan.io/address/0xf01825eAFAe5CD1Dab5593EFAF218efC8968D272)
 * - [__View Contract on Avalanche Fuji Snow Trace__](https://testnet.snowtrace.io/address/0x30aE282CF477E2eF28B14d0125aCEAd57Fe1d7a1)
 * - [__View Contract on Avalanche Snow Trace__](https://snowtrace.io/address/0x8082e58681350876aFe8f52d3Bf8672034A03Db0)
 * - [__View Contract on Op Sepolia Blockscout__](https://optimism-sepolia.blockscout.com/address/0xe567b32C10B0dB72d9490eB1B9A409C5ADed192C)
 */
export const useAutoWrapManagerApprovedStrategies =
  /*#__PURE__*/ createUseReadContract({
    abi: autoWrapManagerAbi,
    address: autoWrapManagerAddress,
    functionName: 'approvedStrategies',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link autoWrapManagerAbi}__ and `functionName` set to `"cfaV1"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x30aE282CF477E2eF28B14d0125aCEAd57Fe1d7a1)
 * - [__View Contract on Op Mainnet Optimism Explorer__](https://optimistic.etherscan.io/address/0x1fA76f2Cd0C3fe6c399A80111408d9C42C0CAC23)
 * - [__View Contract on Bnb Smart Chain Bsc Scan__](https://bscscan.com/address/0x2AcdD61ac1EFFe1535109449c31889bdE8d7f325)
 * - [__View Contract on Gnosis Gnosisscan__](https://gnosisscan.io/address/0x8082e58681350876aFe8f52d3Bf8672034A03Db0)
 * - [__View Contract on Polygon Polygon Scan__](https://polygonscan.com/address/0x2581c27E7f6D6AF452E63fCe884EDE3EDd716b32)
 * - [__View Contract on Base Basescan__](https://basescan.org/address/0x5D0acD0864Ad07ba4E1E0474AE69Da87482e14A9)
 * - [__View Contract on Arbitrum One Arbiscan__](https://arbiscan.io/address/0xf01825eAFAe5CD1Dab5593EFAF218efC8968D272)
 * - [__View Contract on Avalanche Fuji Snow Trace__](https://testnet.snowtrace.io/address/0x30aE282CF477E2eF28B14d0125aCEAd57Fe1d7a1)
 * - [__View Contract on Avalanche Snow Trace__](https://snowtrace.io/address/0x8082e58681350876aFe8f52d3Bf8672034A03Db0)
 * - [__View Contract on Op Sepolia Blockscout__](https://optimism-sepolia.blockscout.com/address/0xe567b32C10B0dB72d9490eB1B9A409C5ADed192C)
 */
export const useAutoWrapManagerCfaV1 = /*#__PURE__*/ createUseReadContract({
  abi: autoWrapManagerAbi,
  address: autoWrapManagerAddress,
  functionName: 'cfaV1',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link autoWrapManagerAbi}__ and `functionName` set to `"checkWrap"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x30aE282CF477E2eF28B14d0125aCEAd57Fe1d7a1)
 * - [__View Contract on Op Mainnet Optimism Explorer__](https://optimistic.etherscan.io/address/0x1fA76f2Cd0C3fe6c399A80111408d9C42C0CAC23)
 * - [__View Contract on Bnb Smart Chain Bsc Scan__](https://bscscan.com/address/0x2AcdD61ac1EFFe1535109449c31889bdE8d7f325)
 * - [__View Contract on Gnosis Gnosisscan__](https://gnosisscan.io/address/0x8082e58681350876aFe8f52d3Bf8672034A03Db0)
 * - [__View Contract on Polygon Polygon Scan__](https://polygonscan.com/address/0x2581c27E7f6D6AF452E63fCe884EDE3EDd716b32)
 * - [__View Contract on Base Basescan__](https://basescan.org/address/0x5D0acD0864Ad07ba4E1E0474AE69Da87482e14A9)
 * - [__View Contract on Arbitrum One Arbiscan__](https://arbiscan.io/address/0xf01825eAFAe5CD1Dab5593EFAF218efC8968D272)
 * - [__View Contract on Avalanche Fuji Snow Trace__](https://testnet.snowtrace.io/address/0x30aE282CF477E2eF28B14d0125aCEAd57Fe1d7a1)
 * - [__View Contract on Avalanche Snow Trace__](https://snowtrace.io/address/0x8082e58681350876aFe8f52d3Bf8672034A03Db0)
 * - [__View Contract on Op Sepolia Blockscout__](https://optimism-sepolia.blockscout.com/address/0xe567b32C10B0dB72d9490eB1B9A409C5ADed192C)
 */
export const useAutoWrapManagerCheckWrap = /*#__PURE__*/ createUseReadContract({
  abi: autoWrapManagerAbi,
  address: autoWrapManagerAddress,
  functionName: 'checkWrap',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link autoWrapManagerAbi}__ and `functionName` set to `"checkWrapByIndex"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x30aE282CF477E2eF28B14d0125aCEAd57Fe1d7a1)
 * - [__View Contract on Op Mainnet Optimism Explorer__](https://optimistic.etherscan.io/address/0x1fA76f2Cd0C3fe6c399A80111408d9C42C0CAC23)
 * - [__View Contract on Bnb Smart Chain Bsc Scan__](https://bscscan.com/address/0x2AcdD61ac1EFFe1535109449c31889bdE8d7f325)
 * - [__View Contract on Gnosis Gnosisscan__](https://gnosisscan.io/address/0x8082e58681350876aFe8f52d3Bf8672034A03Db0)
 * - [__View Contract on Polygon Polygon Scan__](https://polygonscan.com/address/0x2581c27E7f6D6AF452E63fCe884EDE3EDd716b32)
 * - [__View Contract on Base Basescan__](https://basescan.org/address/0x5D0acD0864Ad07ba4E1E0474AE69Da87482e14A9)
 * - [__View Contract on Arbitrum One Arbiscan__](https://arbiscan.io/address/0xf01825eAFAe5CD1Dab5593EFAF218efC8968D272)
 * - [__View Contract on Avalanche Fuji Snow Trace__](https://testnet.snowtrace.io/address/0x30aE282CF477E2eF28B14d0125aCEAd57Fe1d7a1)
 * - [__View Contract on Avalanche Snow Trace__](https://snowtrace.io/address/0x8082e58681350876aFe8f52d3Bf8672034A03Db0)
 * - [__View Contract on Op Sepolia Blockscout__](https://optimism-sepolia.blockscout.com/address/0xe567b32C10B0dB72d9490eB1B9A409C5ADed192C)
 */
export const useAutoWrapManagerCheckWrapByIndex =
  /*#__PURE__*/ createUseReadContract({
    abi: autoWrapManagerAbi,
    address: autoWrapManagerAddress,
    functionName: 'checkWrapByIndex',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link autoWrapManagerAbi}__ and `functionName` set to `"getWrapSchedule"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x30aE282CF477E2eF28B14d0125aCEAd57Fe1d7a1)
 * - [__View Contract on Op Mainnet Optimism Explorer__](https://optimistic.etherscan.io/address/0x1fA76f2Cd0C3fe6c399A80111408d9C42C0CAC23)
 * - [__View Contract on Bnb Smart Chain Bsc Scan__](https://bscscan.com/address/0x2AcdD61ac1EFFe1535109449c31889bdE8d7f325)
 * - [__View Contract on Gnosis Gnosisscan__](https://gnosisscan.io/address/0x8082e58681350876aFe8f52d3Bf8672034A03Db0)
 * - [__View Contract on Polygon Polygon Scan__](https://polygonscan.com/address/0x2581c27E7f6D6AF452E63fCe884EDE3EDd716b32)
 * - [__View Contract on Base Basescan__](https://basescan.org/address/0x5D0acD0864Ad07ba4E1E0474AE69Da87482e14A9)
 * - [__View Contract on Arbitrum One Arbiscan__](https://arbiscan.io/address/0xf01825eAFAe5CD1Dab5593EFAF218efC8968D272)
 * - [__View Contract on Avalanche Fuji Snow Trace__](https://testnet.snowtrace.io/address/0x30aE282CF477E2eF28B14d0125aCEAd57Fe1d7a1)
 * - [__View Contract on Avalanche Snow Trace__](https://snowtrace.io/address/0x8082e58681350876aFe8f52d3Bf8672034A03Db0)
 * - [__View Contract on Op Sepolia Blockscout__](https://optimism-sepolia.blockscout.com/address/0xe567b32C10B0dB72d9490eB1B9A409C5ADed192C)
 */
export const useAutoWrapManagerGetWrapSchedule =
  /*#__PURE__*/ createUseReadContract({
    abi: autoWrapManagerAbi,
    address: autoWrapManagerAddress,
    functionName: 'getWrapSchedule',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link autoWrapManagerAbi}__ and `functionName` set to `"getWrapScheduleByIndex"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x30aE282CF477E2eF28B14d0125aCEAd57Fe1d7a1)
 * - [__View Contract on Op Mainnet Optimism Explorer__](https://optimistic.etherscan.io/address/0x1fA76f2Cd0C3fe6c399A80111408d9C42C0CAC23)
 * - [__View Contract on Bnb Smart Chain Bsc Scan__](https://bscscan.com/address/0x2AcdD61ac1EFFe1535109449c31889bdE8d7f325)
 * - [__View Contract on Gnosis Gnosisscan__](https://gnosisscan.io/address/0x8082e58681350876aFe8f52d3Bf8672034A03Db0)
 * - [__View Contract on Polygon Polygon Scan__](https://polygonscan.com/address/0x2581c27E7f6D6AF452E63fCe884EDE3EDd716b32)
 * - [__View Contract on Base Basescan__](https://basescan.org/address/0x5D0acD0864Ad07ba4E1E0474AE69Da87482e14A9)
 * - [__View Contract on Arbitrum One Arbiscan__](https://arbiscan.io/address/0xf01825eAFAe5CD1Dab5593EFAF218efC8968D272)
 * - [__View Contract on Avalanche Fuji Snow Trace__](https://testnet.snowtrace.io/address/0x30aE282CF477E2eF28B14d0125aCEAd57Fe1d7a1)
 * - [__View Contract on Avalanche Snow Trace__](https://snowtrace.io/address/0x8082e58681350876aFe8f52d3Bf8672034A03Db0)
 * - [__View Contract on Op Sepolia Blockscout__](https://optimism-sepolia.blockscout.com/address/0xe567b32C10B0dB72d9490eB1B9A409C5ADed192C)
 */
export const useAutoWrapManagerGetWrapScheduleByIndex =
  /*#__PURE__*/ createUseReadContract({
    abi: autoWrapManagerAbi,
    address: autoWrapManagerAddress,
    functionName: 'getWrapScheduleByIndex',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link autoWrapManagerAbi}__ and `functionName` set to `"getWrapScheduleIndex"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x30aE282CF477E2eF28B14d0125aCEAd57Fe1d7a1)
 * - [__View Contract on Op Mainnet Optimism Explorer__](https://optimistic.etherscan.io/address/0x1fA76f2Cd0C3fe6c399A80111408d9C42C0CAC23)
 * - [__View Contract on Bnb Smart Chain Bsc Scan__](https://bscscan.com/address/0x2AcdD61ac1EFFe1535109449c31889bdE8d7f325)
 * - [__View Contract on Gnosis Gnosisscan__](https://gnosisscan.io/address/0x8082e58681350876aFe8f52d3Bf8672034A03Db0)
 * - [__View Contract on Polygon Polygon Scan__](https://polygonscan.com/address/0x2581c27E7f6D6AF452E63fCe884EDE3EDd716b32)
 * - [__View Contract on Base Basescan__](https://basescan.org/address/0x5D0acD0864Ad07ba4E1E0474AE69Da87482e14A9)
 * - [__View Contract on Arbitrum One Arbiscan__](https://arbiscan.io/address/0xf01825eAFAe5CD1Dab5593EFAF218efC8968D272)
 * - [__View Contract on Avalanche Fuji Snow Trace__](https://testnet.snowtrace.io/address/0x30aE282CF477E2eF28B14d0125aCEAd57Fe1d7a1)
 * - [__View Contract on Avalanche Snow Trace__](https://snowtrace.io/address/0x8082e58681350876aFe8f52d3Bf8672034A03Db0)
 * - [__View Contract on Op Sepolia Blockscout__](https://optimism-sepolia.blockscout.com/address/0xe567b32C10B0dB72d9490eB1B9A409C5ADed192C)
 */
export const useAutoWrapManagerGetWrapScheduleIndex =
  /*#__PURE__*/ createUseReadContract({
    abi: autoWrapManagerAbi,
    address: autoWrapManagerAddress,
    functionName: 'getWrapScheduleIndex',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link autoWrapManagerAbi}__ and `functionName` set to `"minLower"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x30aE282CF477E2eF28B14d0125aCEAd57Fe1d7a1)
 * - [__View Contract on Op Mainnet Optimism Explorer__](https://optimistic.etherscan.io/address/0x1fA76f2Cd0C3fe6c399A80111408d9C42C0CAC23)
 * - [__View Contract on Bnb Smart Chain Bsc Scan__](https://bscscan.com/address/0x2AcdD61ac1EFFe1535109449c31889bdE8d7f325)
 * - [__View Contract on Gnosis Gnosisscan__](https://gnosisscan.io/address/0x8082e58681350876aFe8f52d3Bf8672034A03Db0)
 * - [__View Contract on Polygon Polygon Scan__](https://polygonscan.com/address/0x2581c27E7f6D6AF452E63fCe884EDE3EDd716b32)
 * - [__View Contract on Base Basescan__](https://basescan.org/address/0x5D0acD0864Ad07ba4E1E0474AE69Da87482e14A9)
 * - [__View Contract on Arbitrum One Arbiscan__](https://arbiscan.io/address/0xf01825eAFAe5CD1Dab5593EFAF218efC8968D272)
 * - [__View Contract on Avalanche Fuji Snow Trace__](https://testnet.snowtrace.io/address/0x30aE282CF477E2eF28B14d0125aCEAd57Fe1d7a1)
 * - [__View Contract on Avalanche Snow Trace__](https://snowtrace.io/address/0x8082e58681350876aFe8f52d3Bf8672034A03Db0)
 * - [__View Contract on Op Sepolia Blockscout__](https://optimism-sepolia.blockscout.com/address/0xe567b32C10B0dB72d9490eB1B9A409C5ADed192C)
 */
export const useAutoWrapManagerMinLower = /*#__PURE__*/ createUseReadContract({
  abi: autoWrapManagerAbi,
  address: autoWrapManagerAddress,
  functionName: 'minLower',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link autoWrapManagerAbi}__ and `functionName` set to `"minUpper"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x30aE282CF477E2eF28B14d0125aCEAd57Fe1d7a1)
 * - [__View Contract on Op Mainnet Optimism Explorer__](https://optimistic.etherscan.io/address/0x1fA76f2Cd0C3fe6c399A80111408d9C42C0CAC23)
 * - [__View Contract on Bnb Smart Chain Bsc Scan__](https://bscscan.com/address/0x2AcdD61ac1EFFe1535109449c31889bdE8d7f325)
 * - [__View Contract on Gnosis Gnosisscan__](https://gnosisscan.io/address/0x8082e58681350876aFe8f52d3Bf8672034A03Db0)
 * - [__View Contract on Polygon Polygon Scan__](https://polygonscan.com/address/0x2581c27E7f6D6AF452E63fCe884EDE3EDd716b32)
 * - [__View Contract on Base Basescan__](https://basescan.org/address/0x5D0acD0864Ad07ba4E1E0474AE69Da87482e14A9)
 * - [__View Contract on Arbitrum One Arbiscan__](https://arbiscan.io/address/0xf01825eAFAe5CD1Dab5593EFAF218efC8968D272)
 * - [__View Contract on Avalanche Fuji Snow Trace__](https://testnet.snowtrace.io/address/0x30aE282CF477E2eF28B14d0125aCEAd57Fe1d7a1)
 * - [__View Contract on Avalanche Snow Trace__](https://snowtrace.io/address/0x8082e58681350876aFe8f52d3Bf8672034A03Db0)
 * - [__View Contract on Op Sepolia Blockscout__](https://optimism-sepolia.blockscout.com/address/0xe567b32C10B0dB72d9490eB1B9A409C5ADed192C)
 */
export const useAutoWrapManagerMinUpper = /*#__PURE__*/ createUseReadContract({
  abi: autoWrapManagerAbi,
  address: autoWrapManagerAddress,
  functionName: 'minUpper',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link autoWrapManagerAbi}__ and `functionName` set to `"owner"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x30aE282CF477E2eF28B14d0125aCEAd57Fe1d7a1)
 * - [__View Contract on Op Mainnet Optimism Explorer__](https://optimistic.etherscan.io/address/0x1fA76f2Cd0C3fe6c399A80111408d9C42C0CAC23)
 * - [__View Contract on Bnb Smart Chain Bsc Scan__](https://bscscan.com/address/0x2AcdD61ac1EFFe1535109449c31889bdE8d7f325)
 * - [__View Contract on Gnosis Gnosisscan__](https://gnosisscan.io/address/0x8082e58681350876aFe8f52d3Bf8672034A03Db0)
 * - [__View Contract on Polygon Polygon Scan__](https://polygonscan.com/address/0x2581c27E7f6D6AF452E63fCe884EDE3EDd716b32)
 * - [__View Contract on Base Basescan__](https://basescan.org/address/0x5D0acD0864Ad07ba4E1E0474AE69Da87482e14A9)
 * - [__View Contract on Arbitrum One Arbiscan__](https://arbiscan.io/address/0xf01825eAFAe5CD1Dab5593EFAF218efC8968D272)
 * - [__View Contract on Avalanche Fuji Snow Trace__](https://testnet.snowtrace.io/address/0x30aE282CF477E2eF28B14d0125aCEAd57Fe1d7a1)
 * - [__View Contract on Avalanche Snow Trace__](https://snowtrace.io/address/0x8082e58681350876aFe8f52d3Bf8672034A03Db0)
 * - [__View Contract on Op Sepolia Blockscout__](https://optimism-sepolia.blockscout.com/address/0xe567b32C10B0dB72d9490eB1B9A409C5ADed192C)
 */
export const useAutoWrapManagerOwner = /*#__PURE__*/ createUseReadContract({
  abi: autoWrapManagerAbi,
  address: autoWrapManagerAddress,
  functionName: 'owner',
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link autoWrapManagerAbi}__
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x30aE282CF477E2eF28B14d0125aCEAd57Fe1d7a1)
 * - [__View Contract on Op Mainnet Optimism Explorer__](https://optimistic.etherscan.io/address/0x1fA76f2Cd0C3fe6c399A80111408d9C42C0CAC23)
 * - [__View Contract on Bnb Smart Chain Bsc Scan__](https://bscscan.com/address/0x2AcdD61ac1EFFe1535109449c31889bdE8d7f325)
 * - [__View Contract on Gnosis Gnosisscan__](https://gnosisscan.io/address/0x8082e58681350876aFe8f52d3Bf8672034A03Db0)
 * - [__View Contract on Polygon Polygon Scan__](https://polygonscan.com/address/0x2581c27E7f6D6AF452E63fCe884EDE3EDd716b32)
 * - [__View Contract on Base Basescan__](https://basescan.org/address/0x5D0acD0864Ad07ba4E1E0474AE69Da87482e14A9)
 * - [__View Contract on Arbitrum One Arbiscan__](https://arbiscan.io/address/0xf01825eAFAe5CD1Dab5593EFAF218efC8968D272)
 * - [__View Contract on Avalanche Fuji Snow Trace__](https://testnet.snowtrace.io/address/0x30aE282CF477E2eF28B14d0125aCEAd57Fe1d7a1)
 * - [__View Contract on Avalanche Snow Trace__](https://snowtrace.io/address/0x8082e58681350876aFe8f52d3Bf8672034A03Db0)
 * - [__View Contract on Op Sepolia Blockscout__](https://optimism-sepolia.blockscout.com/address/0xe567b32C10B0dB72d9490eB1B9A409C5ADed192C)
 */
export const useAutoWrapManagerWrite = /*#__PURE__*/ createUseWriteContract({
  abi: autoWrapManagerAbi,
  address: autoWrapManagerAddress,
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link autoWrapManagerAbi}__ and `functionName` set to `"addApprovedStrategy"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x30aE282CF477E2eF28B14d0125aCEAd57Fe1d7a1)
 * - [__View Contract on Op Mainnet Optimism Explorer__](https://optimistic.etherscan.io/address/0x1fA76f2Cd0C3fe6c399A80111408d9C42C0CAC23)
 * - [__View Contract on Bnb Smart Chain Bsc Scan__](https://bscscan.com/address/0x2AcdD61ac1EFFe1535109449c31889bdE8d7f325)
 * - [__View Contract on Gnosis Gnosisscan__](https://gnosisscan.io/address/0x8082e58681350876aFe8f52d3Bf8672034A03Db0)
 * - [__View Contract on Polygon Polygon Scan__](https://polygonscan.com/address/0x2581c27E7f6D6AF452E63fCe884EDE3EDd716b32)
 * - [__View Contract on Base Basescan__](https://basescan.org/address/0x5D0acD0864Ad07ba4E1E0474AE69Da87482e14A9)
 * - [__View Contract on Arbitrum One Arbiscan__](https://arbiscan.io/address/0xf01825eAFAe5CD1Dab5593EFAF218efC8968D272)
 * - [__View Contract on Avalanche Fuji Snow Trace__](https://testnet.snowtrace.io/address/0x30aE282CF477E2eF28B14d0125aCEAd57Fe1d7a1)
 * - [__View Contract on Avalanche Snow Trace__](https://snowtrace.io/address/0x8082e58681350876aFe8f52d3Bf8672034A03Db0)
 * - [__View Contract on Op Sepolia Blockscout__](https://optimism-sepolia.blockscout.com/address/0xe567b32C10B0dB72d9490eB1B9A409C5ADed192C)
 */
export const useAutoWrapManagerAddApprovedStrategy =
  /*#__PURE__*/ createUseWriteContract({
    abi: autoWrapManagerAbi,
    address: autoWrapManagerAddress,
    functionName: 'addApprovedStrategy',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link autoWrapManagerAbi}__ and `functionName` set to `"createWrapSchedule"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x30aE282CF477E2eF28B14d0125aCEAd57Fe1d7a1)
 * - [__View Contract on Op Mainnet Optimism Explorer__](https://optimistic.etherscan.io/address/0x1fA76f2Cd0C3fe6c399A80111408d9C42C0CAC23)
 * - [__View Contract on Bnb Smart Chain Bsc Scan__](https://bscscan.com/address/0x2AcdD61ac1EFFe1535109449c31889bdE8d7f325)
 * - [__View Contract on Gnosis Gnosisscan__](https://gnosisscan.io/address/0x8082e58681350876aFe8f52d3Bf8672034A03Db0)
 * - [__View Contract on Polygon Polygon Scan__](https://polygonscan.com/address/0x2581c27E7f6D6AF452E63fCe884EDE3EDd716b32)
 * - [__View Contract on Base Basescan__](https://basescan.org/address/0x5D0acD0864Ad07ba4E1E0474AE69Da87482e14A9)
 * - [__View Contract on Arbitrum One Arbiscan__](https://arbiscan.io/address/0xf01825eAFAe5CD1Dab5593EFAF218efC8968D272)
 * - [__View Contract on Avalanche Fuji Snow Trace__](https://testnet.snowtrace.io/address/0x30aE282CF477E2eF28B14d0125aCEAd57Fe1d7a1)
 * - [__View Contract on Avalanche Snow Trace__](https://snowtrace.io/address/0x8082e58681350876aFe8f52d3Bf8672034A03Db0)
 * - [__View Contract on Op Sepolia Blockscout__](https://optimism-sepolia.blockscout.com/address/0xe567b32C10B0dB72d9490eB1B9A409C5ADed192C)
 */
export const useAutoWrapManagerCreateWrapSchedule =
  /*#__PURE__*/ createUseWriteContract({
    abi: autoWrapManagerAbi,
    address: autoWrapManagerAddress,
    functionName: 'createWrapSchedule',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link autoWrapManagerAbi}__ and `functionName` set to `"deleteWrapSchedule"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x30aE282CF477E2eF28B14d0125aCEAd57Fe1d7a1)
 * - [__View Contract on Op Mainnet Optimism Explorer__](https://optimistic.etherscan.io/address/0x1fA76f2Cd0C3fe6c399A80111408d9C42C0CAC23)
 * - [__View Contract on Bnb Smart Chain Bsc Scan__](https://bscscan.com/address/0x2AcdD61ac1EFFe1535109449c31889bdE8d7f325)
 * - [__View Contract on Gnosis Gnosisscan__](https://gnosisscan.io/address/0x8082e58681350876aFe8f52d3Bf8672034A03Db0)
 * - [__View Contract on Polygon Polygon Scan__](https://polygonscan.com/address/0x2581c27E7f6D6AF452E63fCe884EDE3EDd716b32)
 * - [__View Contract on Base Basescan__](https://basescan.org/address/0x5D0acD0864Ad07ba4E1E0474AE69Da87482e14A9)
 * - [__View Contract on Arbitrum One Arbiscan__](https://arbiscan.io/address/0xf01825eAFAe5CD1Dab5593EFAF218efC8968D272)
 * - [__View Contract on Avalanche Fuji Snow Trace__](https://testnet.snowtrace.io/address/0x30aE282CF477E2eF28B14d0125aCEAd57Fe1d7a1)
 * - [__View Contract on Avalanche Snow Trace__](https://snowtrace.io/address/0x8082e58681350876aFe8f52d3Bf8672034A03Db0)
 * - [__View Contract on Op Sepolia Blockscout__](https://optimism-sepolia.blockscout.com/address/0xe567b32C10B0dB72d9490eB1B9A409C5ADed192C)
 */
export const useAutoWrapManagerDeleteWrapSchedule =
  /*#__PURE__*/ createUseWriteContract({
    abi: autoWrapManagerAbi,
    address: autoWrapManagerAddress,
    functionName: 'deleteWrapSchedule',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link autoWrapManagerAbi}__ and `functionName` set to `"deleteWrapScheduleByIndex"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x30aE282CF477E2eF28B14d0125aCEAd57Fe1d7a1)
 * - [__View Contract on Op Mainnet Optimism Explorer__](https://optimistic.etherscan.io/address/0x1fA76f2Cd0C3fe6c399A80111408d9C42C0CAC23)
 * - [__View Contract on Bnb Smart Chain Bsc Scan__](https://bscscan.com/address/0x2AcdD61ac1EFFe1535109449c31889bdE8d7f325)
 * - [__View Contract on Gnosis Gnosisscan__](https://gnosisscan.io/address/0x8082e58681350876aFe8f52d3Bf8672034A03Db0)
 * - [__View Contract on Polygon Polygon Scan__](https://polygonscan.com/address/0x2581c27E7f6D6AF452E63fCe884EDE3EDd716b32)
 * - [__View Contract on Base Basescan__](https://basescan.org/address/0x5D0acD0864Ad07ba4E1E0474AE69Da87482e14A9)
 * - [__View Contract on Arbitrum One Arbiscan__](https://arbiscan.io/address/0xf01825eAFAe5CD1Dab5593EFAF218efC8968D272)
 * - [__View Contract on Avalanche Fuji Snow Trace__](https://testnet.snowtrace.io/address/0x30aE282CF477E2eF28B14d0125aCEAd57Fe1d7a1)
 * - [__View Contract on Avalanche Snow Trace__](https://snowtrace.io/address/0x8082e58681350876aFe8f52d3Bf8672034A03Db0)
 * - [__View Contract on Op Sepolia Blockscout__](https://optimism-sepolia.blockscout.com/address/0xe567b32C10B0dB72d9490eB1B9A409C5ADed192C)
 */
export const useAutoWrapManagerDeleteWrapScheduleByIndex =
  /*#__PURE__*/ createUseWriteContract({
    abi: autoWrapManagerAbi,
    address: autoWrapManagerAddress,
    functionName: 'deleteWrapScheduleByIndex',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link autoWrapManagerAbi}__ and `functionName` set to `"executeWrap"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x30aE282CF477E2eF28B14d0125aCEAd57Fe1d7a1)
 * - [__View Contract on Op Mainnet Optimism Explorer__](https://optimistic.etherscan.io/address/0x1fA76f2Cd0C3fe6c399A80111408d9C42C0CAC23)
 * - [__View Contract on Bnb Smart Chain Bsc Scan__](https://bscscan.com/address/0x2AcdD61ac1EFFe1535109449c31889bdE8d7f325)
 * - [__View Contract on Gnosis Gnosisscan__](https://gnosisscan.io/address/0x8082e58681350876aFe8f52d3Bf8672034A03Db0)
 * - [__View Contract on Polygon Polygon Scan__](https://polygonscan.com/address/0x2581c27E7f6D6AF452E63fCe884EDE3EDd716b32)
 * - [__View Contract on Base Basescan__](https://basescan.org/address/0x5D0acD0864Ad07ba4E1E0474AE69Da87482e14A9)
 * - [__View Contract on Arbitrum One Arbiscan__](https://arbiscan.io/address/0xf01825eAFAe5CD1Dab5593EFAF218efC8968D272)
 * - [__View Contract on Avalanche Fuji Snow Trace__](https://testnet.snowtrace.io/address/0x30aE282CF477E2eF28B14d0125aCEAd57Fe1d7a1)
 * - [__View Contract on Avalanche Snow Trace__](https://snowtrace.io/address/0x8082e58681350876aFe8f52d3Bf8672034A03Db0)
 * - [__View Contract on Op Sepolia Blockscout__](https://optimism-sepolia.blockscout.com/address/0xe567b32C10B0dB72d9490eB1B9A409C5ADed192C)
 */
export const useAutoWrapManagerExecuteWrap =
  /*#__PURE__*/ createUseWriteContract({
    abi: autoWrapManagerAbi,
    address: autoWrapManagerAddress,
    functionName: 'executeWrap',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link autoWrapManagerAbi}__ and `functionName` set to `"executeWrapByIndex"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x30aE282CF477E2eF28B14d0125aCEAd57Fe1d7a1)
 * - [__View Contract on Op Mainnet Optimism Explorer__](https://optimistic.etherscan.io/address/0x1fA76f2Cd0C3fe6c399A80111408d9C42C0CAC23)
 * - [__View Contract on Bnb Smart Chain Bsc Scan__](https://bscscan.com/address/0x2AcdD61ac1EFFe1535109449c31889bdE8d7f325)
 * - [__View Contract on Gnosis Gnosisscan__](https://gnosisscan.io/address/0x8082e58681350876aFe8f52d3Bf8672034A03Db0)
 * - [__View Contract on Polygon Polygon Scan__](https://polygonscan.com/address/0x2581c27E7f6D6AF452E63fCe884EDE3EDd716b32)
 * - [__View Contract on Base Basescan__](https://basescan.org/address/0x5D0acD0864Ad07ba4E1E0474AE69Da87482e14A9)
 * - [__View Contract on Arbitrum One Arbiscan__](https://arbiscan.io/address/0xf01825eAFAe5CD1Dab5593EFAF218efC8968D272)
 * - [__View Contract on Avalanche Fuji Snow Trace__](https://testnet.snowtrace.io/address/0x30aE282CF477E2eF28B14d0125aCEAd57Fe1d7a1)
 * - [__View Contract on Avalanche Snow Trace__](https://snowtrace.io/address/0x8082e58681350876aFe8f52d3Bf8672034A03Db0)
 * - [__View Contract on Op Sepolia Blockscout__](https://optimism-sepolia.blockscout.com/address/0xe567b32C10B0dB72d9490eB1B9A409C5ADed192C)
 */
export const useAutoWrapManagerExecuteWrapByIndex =
  /*#__PURE__*/ createUseWriteContract({
    abi: autoWrapManagerAbi,
    address: autoWrapManagerAddress,
    functionName: 'executeWrapByIndex',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link autoWrapManagerAbi}__ and `functionName` set to `"removeApprovedStrategy"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x30aE282CF477E2eF28B14d0125aCEAd57Fe1d7a1)
 * - [__View Contract on Op Mainnet Optimism Explorer__](https://optimistic.etherscan.io/address/0x1fA76f2Cd0C3fe6c399A80111408d9C42C0CAC23)
 * - [__View Contract on Bnb Smart Chain Bsc Scan__](https://bscscan.com/address/0x2AcdD61ac1EFFe1535109449c31889bdE8d7f325)
 * - [__View Contract on Gnosis Gnosisscan__](https://gnosisscan.io/address/0x8082e58681350876aFe8f52d3Bf8672034A03Db0)
 * - [__View Contract on Polygon Polygon Scan__](https://polygonscan.com/address/0x2581c27E7f6D6AF452E63fCe884EDE3EDd716b32)
 * - [__View Contract on Base Basescan__](https://basescan.org/address/0x5D0acD0864Ad07ba4E1E0474AE69Da87482e14A9)
 * - [__View Contract on Arbitrum One Arbiscan__](https://arbiscan.io/address/0xf01825eAFAe5CD1Dab5593EFAF218efC8968D272)
 * - [__View Contract on Avalanche Fuji Snow Trace__](https://testnet.snowtrace.io/address/0x30aE282CF477E2eF28B14d0125aCEAd57Fe1d7a1)
 * - [__View Contract on Avalanche Snow Trace__](https://snowtrace.io/address/0x8082e58681350876aFe8f52d3Bf8672034A03Db0)
 * - [__View Contract on Op Sepolia Blockscout__](https://optimism-sepolia.blockscout.com/address/0xe567b32C10B0dB72d9490eB1B9A409C5ADed192C)
 */
export const useAutoWrapManagerRemoveApprovedStrategy =
  /*#__PURE__*/ createUseWriteContract({
    abi: autoWrapManagerAbi,
    address: autoWrapManagerAddress,
    functionName: 'removeApprovedStrategy',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link autoWrapManagerAbi}__ and `functionName` set to `"renounceOwnership"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x30aE282CF477E2eF28B14d0125aCEAd57Fe1d7a1)
 * - [__View Contract on Op Mainnet Optimism Explorer__](https://optimistic.etherscan.io/address/0x1fA76f2Cd0C3fe6c399A80111408d9C42C0CAC23)
 * - [__View Contract on Bnb Smart Chain Bsc Scan__](https://bscscan.com/address/0x2AcdD61ac1EFFe1535109449c31889bdE8d7f325)
 * - [__View Contract on Gnosis Gnosisscan__](https://gnosisscan.io/address/0x8082e58681350876aFe8f52d3Bf8672034A03Db0)
 * - [__View Contract on Polygon Polygon Scan__](https://polygonscan.com/address/0x2581c27E7f6D6AF452E63fCe884EDE3EDd716b32)
 * - [__View Contract on Base Basescan__](https://basescan.org/address/0x5D0acD0864Ad07ba4E1E0474AE69Da87482e14A9)
 * - [__View Contract on Arbitrum One Arbiscan__](https://arbiscan.io/address/0xf01825eAFAe5CD1Dab5593EFAF218efC8968D272)
 * - [__View Contract on Avalanche Fuji Snow Trace__](https://testnet.snowtrace.io/address/0x30aE282CF477E2eF28B14d0125aCEAd57Fe1d7a1)
 * - [__View Contract on Avalanche Snow Trace__](https://snowtrace.io/address/0x8082e58681350876aFe8f52d3Bf8672034A03Db0)
 * - [__View Contract on Op Sepolia Blockscout__](https://optimism-sepolia.blockscout.com/address/0xe567b32C10B0dB72d9490eB1B9A409C5ADed192C)
 */
export const useAutoWrapManagerRenounceOwnership =
  /*#__PURE__*/ createUseWriteContract({
    abi: autoWrapManagerAbi,
    address: autoWrapManagerAddress,
    functionName: 'renounceOwnership',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link autoWrapManagerAbi}__ and `functionName` set to `"setLimits"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x30aE282CF477E2eF28B14d0125aCEAd57Fe1d7a1)
 * - [__View Contract on Op Mainnet Optimism Explorer__](https://optimistic.etherscan.io/address/0x1fA76f2Cd0C3fe6c399A80111408d9C42C0CAC23)
 * - [__View Contract on Bnb Smart Chain Bsc Scan__](https://bscscan.com/address/0x2AcdD61ac1EFFe1535109449c31889bdE8d7f325)
 * - [__View Contract on Gnosis Gnosisscan__](https://gnosisscan.io/address/0x8082e58681350876aFe8f52d3Bf8672034A03Db0)
 * - [__View Contract on Polygon Polygon Scan__](https://polygonscan.com/address/0x2581c27E7f6D6AF452E63fCe884EDE3EDd716b32)
 * - [__View Contract on Base Basescan__](https://basescan.org/address/0x5D0acD0864Ad07ba4E1E0474AE69Da87482e14A9)
 * - [__View Contract on Arbitrum One Arbiscan__](https://arbiscan.io/address/0xf01825eAFAe5CD1Dab5593EFAF218efC8968D272)
 * - [__View Contract on Avalanche Fuji Snow Trace__](https://testnet.snowtrace.io/address/0x30aE282CF477E2eF28B14d0125aCEAd57Fe1d7a1)
 * - [__View Contract on Avalanche Snow Trace__](https://snowtrace.io/address/0x8082e58681350876aFe8f52d3Bf8672034A03Db0)
 * - [__View Contract on Op Sepolia Blockscout__](https://optimism-sepolia.blockscout.com/address/0xe567b32C10B0dB72d9490eB1B9A409C5ADed192C)
 */
export const useAutoWrapManagerSetLimits = /*#__PURE__*/ createUseWriteContract(
  {
    abi: autoWrapManagerAbi,
    address: autoWrapManagerAddress,
    functionName: 'setLimits',
  },
)

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link autoWrapManagerAbi}__ and `functionName` set to `"transferOwnership"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x30aE282CF477E2eF28B14d0125aCEAd57Fe1d7a1)
 * - [__View Contract on Op Mainnet Optimism Explorer__](https://optimistic.etherscan.io/address/0x1fA76f2Cd0C3fe6c399A80111408d9C42C0CAC23)
 * - [__View Contract on Bnb Smart Chain Bsc Scan__](https://bscscan.com/address/0x2AcdD61ac1EFFe1535109449c31889bdE8d7f325)
 * - [__View Contract on Gnosis Gnosisscan__](https://gnosisscan.io/address/0x8082e58681350876aFe8f52d3Bf8672034A03Db0)
 * - [__View Contract on Polygon Polygon Scan__](https://polygonscan.com/address/0x2581c27E7f6D6AF452E63fCe884EDE3EDd716b32)
 * - [__View Contract on Base Basescan__](https://basescan.org/address/0x5D0acD0864Ad07ba4E1E0474AE69Da87482e14A9)
 * - [__View Contract on Arbitrum One Arbiscan__](https://arbiscan.io/address/0xf01825eAFAe5CD1Dab5593EFAF218efC8968D272)
 * - [__View Contract on Avalanche Fuji Snow Trace__](https://testnet.snowtrace.io/address/0x30aE282CF477E2eF28B14d0125aCEAd57Fe1d7a1)
 * - [__View Contract on Avalanche Snow Trace__](https://snowtrace.io/address/0x8082e58681350876aFe8f52d3Bf8672034A03Db0)
 * - [__View Contract on Op Sepolia Blockscout__](https://optimism-sepolia.blockscout.com/address/0xe567b32C10B0dB72d9490eB1B9A409C5ADed192C)
 */
export const useAutoWrapManagerTransferOwnership =
  /*#__PURE__*/ createUseWriteContract({
    abi: autoWrapManagerAbi,
    address: autoWrapManagerAddress,
    functionName: 'transferOwnership',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link autoWrapManagerAbi}__
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x30aE282CF477E2eF28B14d0125aCEAd57Fe1d7a1)
 * - [__View Contract on Op Mainnet Optimism Explorer__](https://optimistic.etherscan.io/address/0x1fA76f2Cd0C3fe6c399A80111408d9C42C0CAC23)
 * - [__View Contract on Bnb Smart Chain Bsc Scan__](https://bscscan.com/address/0x2AcdD61ac1EFFe1535109449c31889bdE8d7f325)
 * - [__View Contract on Gnosis Gnosisscan__](https://gnosisscan.io/address/0x8082e58681350876aFe8f52d3Bf8672034A03Db0)
 * - [__View Contract on Polygon Polygon Scan__](https://polygonscan.com/address/0x2581c27E7f6D6AF452E63fCe884EDE3EDd716b32)
 * - [__View Contract on Base Basescan__](https://basescan.org/address/0x5D0acD0864Ad07ba4E1E0474AE69Da87482e14A9)
 * - [__View Contract on Arbitrum One Arbiscan__](https://arbiscan.io/address/0xf01825eAFAe5CD1Dab5593EFAF218efC8968D272)
 * - [__View Contract on Avalanche Fuji Snow Trace__](https://testnet.snowtrace.io/address/0x30aE282CF477E2eF28B14d0125aCEAd57Fe1d7a1)
 * - [__View Contract on Avalanche Snow Trace__](https://snowtrace.io/address/0x8082e58681350876aFe8f52d3Bf8672034A03Db0)
 * - [__View Contract on Op Sepolia Blockscout__](https://optimism-sepolia.blockscout.com/address/0xe567b32C10B0dB72d9490eB1B9A409C5ADed192C)
 */
export const usePrepareAutoWrapManagerWrite =
  /*#__PURE__*/ createUseSimulateContract({
    abi: autoWrapManagerAbi,
    address: autoWrapManagerAddress,
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link autoWrapManagerAbi}__ and `functionName` set to `"addApprovedStrategy"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x30aE282CF477E2eF28B14d0125aCEAd57Fe1d7a1)
 * - [__View Contract on Op Mainnet Optimism Explorer__](https://optimistic.etherscan.io/address/0x1fA76f2Cd0C3fe6c399A80111408d9C42C0CAC23)
 * - [__View Contract on Bnb Smart Chain Bsc Scan__](https://bscscan.com/address/0x2AcdD61ac1EFFe1535109449c31889bdE8d7f325)
 * - [__View Contract on Gnosis Gnosisscan__](https://gnosisscan.io/address/0x8082e58681350876aFe8f52d3Bf8672034A03Db0)
 * - [__View Contract on Polygon Polygon Scan__](https://polygonscan.com/address/0x2581c27E7f6D6AF452E63fCe884EDE3EDd716b32)
 * - [__View Contract on Base Basescan__](https://basescan.org/address/0x5D0acD0864Ad07ba4E1E0474AE69Da87482e14A9)
 * - [__View Contract on Arbitrum One Arbiscan__](https://arbiscan.io/address/0xf01825eAFAe5CD1Dab5593EFAF218efC8968D272)
 * - [__View Contract on Avalanche Fuji Snow Trace__](https://testnet.snowtrace.io/address/0x30aE282CF477E2eF28B14d0125aCEAd57Fe1d7a1)
 * - [__View Contract on Avalanche Snow Trace__](https://snowtrace.io/address/0x8082e58681350876aFe8f52d3Bf8672034A03Db0)
 * - [__View Contract on Op Sepolia Blockscout__](https://optimism-sepolia.blockscout.com/address/0xe567b32C10B0dB72d9490eB1B9A409C5ADed192C)
 */
export const usePrepareAutoWrapManagerAddApprovedStrategy =
  /*#__PURE__*/ createUseSimulateContract({
    abi: autoWrapManagerAbi,
    address: autoWrapManagerAddress,
    functionName: 'addApprovedStrategy',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link autoWrapManagerAbi}__ and `functionName` set to `"createWrapSchedule"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x30aE282CF477E2eF28B14d0125aCEAd57Fe1d7a1)
 * - [__View Contract on Op Mainnet Optimism Explorer__](https://optimistic.etherscan.io/address/0x1fA76f2Cd0C3fe6c399A80111408d9C42C0CAC23)
 * - [__View Contract on Bnb Smart Chain Bsc Scan__](https://bscscan.com/address/0x2AcdD61ac1EFFe1535109449c31889bdE8d7f325)
 * - [__View Contract on Gnosis Gnosisscan__](https://gnosisscan.io/address/0x8082e58681350876aFe8f52d3Bf8672034A03Db0)
 * - [__View Contract on Polygon Polygon Scan__](https://polygonscan.com/address/0x2581c27E7f6D6AF452E63fCe884EDE3EDd716b32)
 * - [__View Contract on Base Basescan__](https://basescan.org/address/0x5D0acD0864Ad07ba4E1E0474AE69Da87482e14A9)
 * - [__View Contract on Arbitrum One Arbiscan__](https://arbiscan.io/address/0xf01825eAFAe5CD1Dab5593EFAF218efC8968D272)
 * - [__View Contract on Avalanche Fuji Snow Trace__](https://testnet.snowtrace.io/address/0x30aE282CF477E2eF28B14d0125aCEAd57Fe1d7a1)
 * - [__View Contract on Avalanche Snow Trace__](https://snowtrace.io/address/0x8082e58681350876aFe8f52d3Bf8672034A03Db0)
 * - [__View Contract on Op Sepolia Blockscout__](https://optimism-sepolia.blockscout.com/address/0xe567b32C10B0dB72d9490eB1B9A409C5ADed192C)
 */
export const usePrepareAutoWrapManagerCreateWrapSchedule =
  /*#__PURE__*/ createUseSimulateContract({
    abi: autoWrapManagerAbi,
    address: autoWrapManagerAddress,
    functionName: 'createWrapSchedule',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link autoWrapManagerAbi}__ and `functionName` set to `"deleteWrapSchedule"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x30aE282CF477E2eF28B14d0125aCEAd57Fe1d7a1)
 * - [__View Contract on Op Mainnet Optimism Explorer__](https://optimistic.etherscan.io/address/0x1fA76f2Cd0C3fe6c399A80111408d9C42C0CAC23)
 * - [__View Contract on Bnb Smart Chain Bsc Scan__](https://bscscan.com/address/0x2AcdD61ac1EFFe1535109449c31889bdE8d7f325)
 * - [__View Contract on Gnosis Gnosisscan__](https://gnosisscan.io/address/0x8082e58681350876aFe8f52d3Bf8672034A03Db0)
 * - [__View Contract on Polygon Polygon Scan__](https://polygonscan.com/address/0x2581c27E7f6D6AF452E63fCe884EDE3EDd716b32)
 * - [__View Contract on Base Basescan__](https://basescan.org/address/0x5D0acD0864Ad07ba4E1E0474AE69Da87482e14A9)
 * - [__View Contract on Arbitrum One Arbiscan__](https://arbiscan.io/address/0xf01825eAFAe5CD1Dab5593EFAF218efC8968D272)
 * - [__View Contract on Avalanche Fuji Snow Trace__](https://testnet.snowtrace.io/address/0x30aE282CF477E2eF28B14d0125aCEAd57Fe1d7a1)
 * - [__View Contract on Avalanche Snow Trace__](https://snowtrace.io/address/0x8082e58681350876aFe8f52d3Bf8672034A03Db0)
 * - [__View Contract on Op Sepolia Blockscout__](https://optimism-sepolia.blockscout.com/address/0xe567b32C10B0dB72d9490eB1B9A409C5ADed192C)
 */
export const usePrepareAutoWrapManagerDeleteWrapSchedule =
  /*#__PURE__*/ createUseSimulateContract({
    abi: autoWrapManagerAbi,
    address: autoWrapManagerAddress,
    functionName: 'deleteWrapSchedule',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link autoWrapManagerAbi}__ and `functionName` set to `"deleteWrapScheduleByIndex"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x30aE282CF477E2eF28B14d0125aCEAd57Fe1d7a1)
 * - [__View Contract on Op Mainnet Optimism Explorer__](https://optimistic.etherscan.io/address/0x1fA76f2Cd0C3fe6c399A80111408d9C42C0CAC23)
 * - [__View Contract on Bnb Smart Chain Bsc Scan__](https://bscscan.com/address/0x2AcdD61ac1EFFe1535109449c31889bdE8d7f325)
 * - [__View Contract on Gnosis Gnosisscan__](https://gnosisscan.io/address/0x8082e58681350876aFe8f52d3Bf8672034A03Db0)
 * - [__View Contract on Polygon Polygon Scan__](https://polygonscan.com/address/0x2581c27E7f6D6AF452E63fCe884EDE3EDd716b32)
 * - [__View Contract on Base Basescan__](https://basescan.org/address/0x5D0acD0864Ad07ba4E1E0474AE69Da87482e14A9)
 * - [__View Contract on Arbitrum One Arbiscan__](https://arbiscan.io/address/0xf01825eAFAe5CD1Dab5593EFAF218efC8968D272)
 * - [__View Contract on Avalanche Fuji Snow Trace__](https://testnet.snowtrace.io/address/0x30aE282CF477E2eF28B14d0125aCEAd57Fe1d7a1)
 * - [__View Contract on Avalanche Snow Trace__](https://snowtrace.io/address/0x8082e58681350876aFe8f52d3Bf8672034A03Db0)
 * - [__View Contract on Op Sepolia Blockscout__](https://optimism-sepolia.blockscout.com/address/0xe567b32C10B0dB72d9490eB1B9A409C5ADed192C)
 */
export const usePrepareAutoWrapManagerDeleteWrapScheduleByIndex =
  /*#__PURE__*/ createUseSimulateContract({
    abi: autoWrapManagerAbi,
    address: autoWrapManagerAddress,
    functionName: 'deleteWrapScheduleByIndex',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link autoWrapManagerAbi}__ and `functionName` set to `"executeWrap"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x30aE282CF477E2eF28B14d0125aCEAd57Fe1d7a1)
 * - [__View Contract on Op Mainnet Optimism Explorer__](https://optimistic.etherscan.io/address/0x1fA76f2Cd0C3fe6c399A80111408d9C42C0CAC23)
 * - [__View Contract on Bnb Smart Chain Bsc Scan__](https://bscscan.com/address/0x2AcdD61ac1EFFe1535109449c31889bdE8d7f325)
 * - [__View Contract on Gnosis Gnosisscan__](https://gnosisscan.io/address/0x8082e58681350876aFe8f52d3Bf8672034A03Db0)
 * - [__View Contract on Polygon Polygon Scan__](https://polygonscan.com/address/0x2581c27E7f6D6AF452E63fCe884EDE3EDd716b32)
 * - [__View Contract on Base Basescan__](https://basescan.org/address/0x5D0acD0864Ad07ba4E1E0474AE69Da87482e14A9)
 * - [__View Contract on Arbitrum One Arbiscan__](https://arbiscan.io/address/0xf01825eAFAe5CD1Dab5593EFAF218efC8968D272)
 * - [__View Contract on Avalanche Fuji Snow Trace__](https://testnet.snowtrace.io/address/0x30aE282CF477E2eF28B14d0125aCEAd57Fe1d7a1)
 * - [__View Contract on Avalanche Snow Trace__](https://snowtrace.io/address/0x8082e58681350876aFe8f52d3Bf8672034A03Db0)
 * - [__View Contract on Op Sepolia Blockscout__](https://optimism-sepolia.blockscout.com/address/0xe567b32C10B0dB72d9490eB1B9A409C5ADed192C)
 */
export const usePrepareAutoWrapManagerExecuteWrap =
  /*#__PURE__*/ createUseSimulateContract({
    abi: autoWrapManagerAbi,
    address: autoWrapManagerAddress,
    functionName: 'executeWrap',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link autoWrapManagerAbi}__ and `functionName` set to `"executeWrapByIndex"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x30aE282CF477E2eF28B14d0125aCEAd57Fe1d7a1)
 * - [__View Contract on Op Mainnet Optimism Explorer__](https://optimistic.etherscan.io/address/0x1fA76f2Cd0C3fe6c399A80111408d9C42C0CAC23)
 * - [__View Contract on Bnb Smart Chain Bsc Scan__](https://bscscan.com/address/0x2AcdD61ac1EFFe1535109449c31889bdE8d7f325)
 * - [__View Contract on Gnosis Gnosisscan__](https://gnosisscan.io/address/0x8082e58681350876aFe8f52d3Bf8672034A03Db0)
 * - [__View Contract on Polygon Polygon Scan__](https://polygonscan.com/address/0x2581c27E7f6D6AF452E63fCe884EDE3EDd716b32)
 * - [__View Contract on Base Basescan__](https://basescan.org/address/0x5D0acD0864Ad07ba4E1E0474AE69Da87482e14A9)
 * - [__View Contract on Arbitrum One Arbiscan__](https://arbiscan.io/address/0xf01825eAFAe5CD1Dab5593EFAF218efC8968D272)
 * - [__View Contract on Avalanche Fuji Snow Trace__](https://testnet.snowtrace.io/address/0x30aE282CF477E2eF28B14d0125aCEAd57Fe1d7a1)
 * - [__View Contract on Avalanche Snow Trace__](https://snowtrace.io/address/0x8082e58681350876aFe8f52d3Bf8672034A03Db0)
 * - [__View Contract on Op Sepolia Blockscout__](https://optimism-sepolia.blockscout.com/address/0xe567b32C10B0dB72d9490eB1B9A409C5ADed192C)
 */
export const usePrepareAutoWrapManagerExecuteWrapByIndex =
  /*#__PURE__*/ createUseSimulateContract({
    abi: autoWrapManagerAbi,
    address: autoWrapManagerAddress,
    functionName: 'executeWrapByIndex',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link autoWrapManagerAbi}__ and `functionName` set to `"removeApprovedStrategy"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x30aE282CF477E2eF28B14d0125aCEAd57Fe1d7a1)
 * - [__View Contract on Op Mainnet Optimism Explorer__](https://optimistic.etherscan.io/address/0x1fA76f2Cd0C3fe6c399A80111408d9C42C0CAC23)
 * - [__View Contract on Bnb Smart Chain Bsc Scan__](https://bscscan.com/address/0x2AcdD61ac1EFFe1535109449c31889bdE8d7f325)
 * - [__View Contract on Gnosis Gnosisscan__](https://gnosisscan.io/address/0x8082e58681350876aFe8f52d3Bf8672034A03Db0)
 * - [__View Contract on Polygon Polygon Scan__](https://polygonscan.com/address/0x2581c27E7f6D6AF452E63fCe884EDE3EDd716b32)
 * - [__View Contract on Base Basescan__](https://basescan.org/address/0x5D0acD0864Ad07ba4E1E0474AE69Da87482e14A9)
 * - [__View Contract on Arbitrum One Arbiscan__](https://arbiscan.io/address/0xf01825eAFAe5CD1Dab5593EFAF218efC8968D272)
 * - [__View Contract on Avalanche Fuji Snow Trace__](https://testnet.snowtrace.io/address/0x30aE282CF477E2eF28B14d0125aCEAd57Fe1d7a1)
 * - [__View Contract on Avalanche Snow Trace__](https://snowtrace.io/address/0x8082e58681350876aFe8f52d3Bf8672034A03Db0)
 * - [__View Contract on Op Sepolia Blockscout__](https://optimism-sepolia.blockscout.com/address/0xe567b32C10B0dB72d9490eB1B9A409C5ADed192C)
 */
export const usePrepareAutoWrapManagerRemoveApprovedStrategy =
  /*#__PURE__*/ createUseSimulateContract({
    abi: autoWrapManagerAbi,
    address: autoWrapManagerAddress,
    functionName: 'removeApprovedStrategy',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link autoWrapManagerAbi}__ and `functionName` set to `"renounceOwnership"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x30aE282CF477E2eF28B14d0125aCEAd57Fe1d7a1)
 * - [__View Contract on Op Mainnet Optimism Explorer__](https://optimistic.etherscan.io/address/0x1fA76f2Cd0C3fe6c399A80111408d9C42C0CAC23)
 * - [__View Contract on Bnb Smart Chain Bsc Scan__](https://bscscan.com/address/0x2AcdD61ac1EFFe1535109449c31889bdE8d7f325)
 * - [__View Contract on Gnosis Gnosisscan__](https://gnosisscan.io/address/0x8082e58681350876aFe8f52d3Bf8672034A03Db0)
 * - [__View Contract on Polygon Polygon Scan__](https://polygonscan.com/address/0x2581c27E7f6D6AF452E63fCe884EDE3EDd716b32)
 * - [__View Contract on Base Basescan__](https://basescan.org/address/0x5D0acD0864Ad07ba4E1E0474AE69Da87482e14A9)
 * - [__View Contract on Arbitrum One Arbiscan__](https://arbiscan.io/address/0xf01825eAFAe5CD1Dab5593EFAF218efC8968D272)
 * - [__View Contract on Avalanche Fuji Snow Trace__](https://testnet.snowtrace.io/address/0x30aE282CF477E2eF28B14d0125aCEAd57Fe1d7a1)
 * - [__View Contract on Avalanche Snow Trace__](https://snowtrace.io/address/0x8082e58681350876aFe8f52d3Bf8672034A03Db0)
 * - [__View Contract on Op Sepolia Blockscout__](https://optimism-sepolia.blockscout.com/address/0xe567b32C10B0dB72d9490eB1B9A409C5ADed192C)
 */
export const usePrepareAutoWrapManagerRenounceOwnership =
  /*#__PURE__*/ createUseSimulateContract({
    abi: autoWrapManagerAbi,
    address: autoWrapManagerAddress,
    functionName: 'renounceOwnership',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link autoWrapManagerAbi}__ and `functionName` set to `"setLimits"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x30aE282CF477E2eF28B14d0125aCEAd57Fe1d7a1)
 * - [__View Contract on Op Mainnet Optimism Explorer__](https://optimistic.etherscan.io/address/0x1fA76f2Cd0C3fe6c399A80111408d9C42C0CAC23)
 * - [__View Contract on Bnb Smart Chain Bsc Scan__](https://bscscan.com/address/0x2AcdD61ac1EFFe1535109449c31889bdE8d7f325)
 * - [__View Contract on Gnosis Gnosisscan__](https://gnosisscan.io/address/0x8082e58681350876aFe8f52d3Bf8672034A03Db0)
 * - [__View Contract on Polygon Polygon Scan__](https://polygonscan.com/address/0x2581c27E7f6D6AF452E63fCe884EDE3EDd716b32)
 * - [__View Contract on Base Basescan__](https://basescan.org/address/0x5D0acD0864Ad07ba4E1E0474AE69Da87482e14A9)
 * - [__View Contract on Arbitrum One Arbiscan__](https://arbiscan.io/address/0xf01825eAFAe5CD1Dab5593EFAF218efC8968D272)
 * - [__View Contract on Avalanche Fuji Snow Trace__](https://testnet.snowtrace.io/address/0x30aE282CF477E2eF28B14d0125aCEAd57Fe1d7a1)
 * - [__View Contract on Avalanche Snow Trace__](https://snowtrace.io/address/0x8082e58681350876aFe8f52d3Bf8672034A03Db0)
 * - [__View Contract on Op Sepolia Blockscout__](https://optimism-sepolia.blockscout.com/address/0xe567b32C10B0dB72d9490eB1B9A409C5ADed192C)
 */
export const usePrepareAutoWrapManagerSetLimits =
  /*#__PURE__*/ createUseSimulateContract({
    abi: autoWrapManagerAbi,
    address: autoWrapManagerAddress,
    functionName: 'setLimits',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link autoWrapManagerAbi}__ and `functionName` set to `"transferOwnership"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x30aE282CF477E2eF28B14d0125aCEAd57Fe1d7a1)
 * - [__View Contract on Op Mainnet Optimism Explorer__](https://optimistic.etherscan.io/address/0x1fA76f2Cd0C3fe6c399A80111408d9C42C0CAC23)
 * - [__View Contract on Bnb Smart Chain Bsc Scan__](https://bscscan.com/address/0x2AcdD61ac1EFFe1535109449c31889bdE8d7f325)
 * - [__View Contract on Gnosis Gnosisscan__](https://gnosisscan.io/address/0x8082e58681350876aFe8f52d3Bf8672034A03Db0)
 * - [__View Contract on Polygon Polygon Scan__](https://polygonscan.com/address/0x2581c27E7f6D6AF452E63fCe884EDE3EDd716b32)
 * - [__View Contract on Base Basescan__](https://basescan.org/address/0x5D0acD0864Ad07ba4E1E0474AE69Da87482e14A9)
 * - [__View Contract on Arbitrum One Arbiscan__](https://arbiscan.io/address/0xf01825eAFAe5CD1Dab5593EFAF218efC8968D272)
 * - [__View Contract on Avalanche Fuji Snow Trace__](https://testnet.snowtrace.io/address/0x30aE282CF477E2eF28B14d0125aCEAd57Fe1d7a1)
 * - [__View Contract on Avalanche Snow Trace__](https://snowtrace.io/address/0x8082e58681350876aFe8f52d3Bf8672034A03Db0)
 * - [__View Contract on Op Sepolia Blockscout__](https://optimism-sepolia.blockscout.com/address/0xe567b32C10B0dB72d9490eB1B9A409C5ADed192C)
 */
export const usePrepareAutoWrapManagerTransferOwnership =
  /*#__PURE__*/ createUseSimulateContract({
    abi: autoWrapManagerAbi,
    address: autoWrapManagerAddress,
    functionName: 'transferOwnership',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link autoWrapManagerAbi}__
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x30aE282CF477E2eF28B14d0125aCEAd57Fe1d7a1)
 * - [__View Contract on Op Mainnet Optimism Explorer__](https://optimistic.etherscan.io/address/0x1fA76f2Cd0C3fe6c399A80111408d9C42C0CAC23)
 * - [__View Contract on Bnb Smart Chain Bsc Scan__](https://bscscan.com/address/0x2AcdD61ac1EFFe1535109449c31889bdE8d7f325)
 * - [__View Contract on Gnosis Gnosisscan__](https://gnosisscan.io/address/0x8082e58681350876aFe8f52d3Bf8672034A03Db0)
 * - [__View Contract on Polygon Polygon Scan__](https://polygonscan.com/address/0x2581c27E7f6D6AF452E63fCe884EDE3EDd716b32)
 * - [__View Contract on Base Basescan__](https://basescan.org/address/0x5D0acD0864Ad07ba4E1E0474AE69Da87482e14A9)
 * - [__View Contract on Arbitrum One Arbiscan__](https://arbiscan.io/address/0xf01825eAFAe5CD1Dab5593EFAF218efC8968D272)
 * - [__View Contract on Avalanche Fuji Snow Trace__](https://testnet.snowtrace.io/address/0x30aE282CF477E2eF28B14d0125aCEAd57Fe1d7a1)
 * - [__View Contract on Avalanche Snow Trace__](https://snowtrace.io/address/0x8082e58681350876aFe8f52d3Bf8672034A03Db0)
 * - [__View Contract on Op Sepolia Blockscout__](https://optimism-sepolia.blockscout.com/address/0xe567b32C10B0dB72d9490eB1B9A409C5ADed192C)
 */
export const useAutoWrapManagerEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: autoWrapManagerAbi,
    address: autoWrapManagerAddress,
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link autoWrapManagerAbi}__ and `eventName` set to `"AddedApprovedStrategy"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x30aE282CF477E2eF28B14d0125aCEAd57Fe1d7a1)
 * - [__View Contract on Op Mainnet Optimism Explorer__](https://optimistic.etherscan.io/address/0x1fA76f2Cd0C3fe6c399A80111408d9C42C0CAC23)
 * - [__View Contract on Bnb Smart Chain Bsc Scan__](https://bscscan.com/address/0x2AcdD61ac1EFFe1535109449c31889bdE8d7f325)
 * - [__View Contract on Gnosis Gnosisscan__](https://gnosisscan.io/address/0x8082e58681350876aFe8f52d3Bf8672034A03Db0)
 * - [__View Contract on Polygon Polygon Scan__](https://polygonscan.com/address/0x2581c27E7f6D6AF452E63fCe884EDE3EDd716b32)
 * - [__View Contract on Base Basescan__](https://basescan.org/address/0x5D0acD0864Ad07ba4E1E0474AE69Da87482e14A9)
 * - [__View Contract on Arbitrum One Arbiscan__](https://arbiscan.io/address/0xf01825eAFAe5CD1Dab5593EFAF218efC8968D272)
 * - [__View Contract on Avalanche Fuji Snow Trace__](https://testnet.snowtrace.io/address/0x30aE282CF477E2eF28B14d0125aCEAd57Fe1d7a1)
 * - [__View Contract on Avalanche Snow Trace__](https://snowtrace.io/address/0x8082e58681350876aFe8f52d3Bf8672034A03Db0)
 * - [__View Contract on Op Sepolia Blockscout__](https://optimism-sepolia.blockscout.com/address/0xe567b32C10B0dB72d9490eB1B9A409C5ADed192C)
 */
export const useAutoWrapManagerAddedApprovedStrategyEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: autoWrapManagerAbi,
    address: autoWrapManagerAddress,
    eventName: 'AddedApprovedStrategy',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link autoWrapManagerAbi}__ and `eventName` set to `"LimitsChanged"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x30aE282CF477E2eF28B14d0125aCEAd57Fe1d7a1)
 * - [__View Contract on Op Mainnet Optimism Explorer__](https://optimistic.etherscan.io/address/0x1fA76f2Cd0C3fe6c399A80111408d9C42C0CAC23)
 * - [__View Contract on Bnb Smart Chain Bsc Scan__](https://bscscan.com/address/0x2AcdD61ac1EFFe1535109449c31889bdE8d7f325)
 * - [__View Contract on Gnosis Gnosisscan__](https://gnosisscan.io/address/0x8082e58681350876aFe8f52d3Bf8672034A03Db0)
 * - [__View Contract on Polygon Polygon Scan__](https://polygonscan.com/address/0x2581c27E7f6D6AF452E63fCe884EDE3EDd716b32)
 * - [__View Contract on Base Basescan__](https://basescan.org/address/0x5D0acD0864Ad07ba4E1E0474AE69Da87482e14A9)
 * - [__View Contract on Arbitrum One Arbiscan__](https://arbiscan.io/address/0xf01825eAFAe5CD1Dab5593EFAF218efC8968D272)
 * - [__View Contract on Avalanche Fuji Snow Trace__](https://testnet.snowtrace.io/address/0x30aE282CF477E2eF28B14d0125aCEAd57Fe1d7a1)
 * - [__View Contract on Avalanche Snow Trace__](https://snowtrace.io/address/0x8082e58681350876aFe8f52d3Bf8672034A03Db0)
 * - [__View Contract on Op Sepolia Blockscout__](https://optimism-sepolia.blockscout.com/address/0xe567b32C10B0dB72d9490eB1B9A409C5ADed192C)
 */
export const useAutoWrapManagerLimitsChangedEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: autoWrapManagerAbi,
    address: autoWrapManagerAddress,
    eventName: 'LimitsChanged',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link autoWrapManagerAbi}__ and `eventName` set to `"OwnershipTransferred"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x30aE282CF477E2eF28B14d0125aCEAd57Fe1d7a1)
 * - [__View Contract on Op Mainnet Optimism Explorer__](https://optimistic.etherscan.io/address/0x1fA76f2Cd0C3fe6c399A80111408d9C42C0CAC23)
 * - [__View Contract on Bnb Smart Chain Bsc Scan__](https://bscscan.com/address/0x2AcdD61ac1EFFe1535109449c31889bdE8d7f325)
 * - [__View Contract on Gnosis Gnosisscan__](https://gnosisscan.io/address/0x8082e58681350876aFe8f52d3Bf8672034A03Db0)
 * - [__View Contract on Polygon Polygon Scan__](https://polygonscan.com/address/0x2581c27E7f6D6AF452E63fCe884EDE3EDd716b32)
 * - [__View Contract on Base Basescan__](https://basescan.org/address/0x5D0acD0864Ad07ba4E1E0474AE69Da87482e14A9)
 * - [__View Contract on Arbitrum One Arbiscan__](https://arbiscan.io/address/0xf01825eAFAe5CD1Dab5593EFAF218efC8968D272)
 * - [__View Contract on Avalanche Fuji Snow Trace__](https://testnet.snowtrace.io/address/0x30aE282CF477E2eF28B14d0125aCEAd57Fe1d7a1)
 * - [__View Contract on Avalanche Snow Trace__](https://snowtrace.io/address/0x8082e58681350876aFe8f52d3Bf8672034A03Db0)
 * - [__View Contract on Op Sepolia Blockscout__](https://optimism-sepolia.blockscout.com/address/0xe567b32C10B0dB72d9490eB1B9A409C5ADed192C)
 */
export const useAutoWrapManagerOwnershipTransferredEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: autoWrapManagerAbi,
    address: autoWrapManagerAddress,
    eventName: 'OwnershipTransferred',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link autoWrapManagerAbi}__ and `eventName` set to `"RemovedApprovedStrategy"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x30aE282CF477E2eF28B14d0125aCEAd57Fe1d7a1)
 * - [__View Contract on Op Mainnet Optimism Explorer__](https://optimistic.etherscan.io/address/0x1fA76f2Cd0C3fe6c399A80111408d9C42C0CAC23)
 * - [__View Contract on Bnb Smart Chain Bsc Scan__](https://bscscan.com/address/0x2AcdD61ac1EFFe1535109449c31889bdE8d7f325)
 * - [__View Contract on Gnosis Gnosisscan__](https://gnosisscan.io/address/0x8082e58681350876aFe8f52d3Bf8672034A03Db0)
 * - [__View Contract on Polygon Polygon Scan__](https://polygonscan.com/address/0x2581c27E7f6D6AF452E63fCe884EDE3EDd716b32)
 * - [__View Contract on Base Basescan__](https://basescan.org/address/0x5D0acD0864Ad07ba4E1E0474AE69Da87482e14A9)
 * - [__View Contract on Arbitrum One Arbiscan__](https://arbiscan.io/address/0xf01825eAFAe5CD1Dab5593EFAF218efC8968D272)
 * - [__View Contract on Avalanche Fuji Snow Trace__](https://testnet.snowtrace.io/address/0x30aE282CF477E2eF28B14d0125aCEAd57Fe1d7a1)
 * - [__View Contract on Avalanche Snow Trace__](https://snowtrace.io/address/0x8082e58681350876aFe8f52d3Bf8672034A03Db0)
 * - [__View Contract on Op Sepolia Blockscout__](https://optimism-sepolia.blockscout.com/address/0xe567b32C10B0dB72d9490eB1B9A409C5ADed192C)
 */
export const useAutoWrapManagerRemovedApprovedStrategyEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: autoWrapManagerAbi,
    address: autoWrapManagerAddress,
    eventName: 'RemovedApprovedStrategy',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link autoWrapManagerAbi}__ and `eventName` set to `"WrapExecuted"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x30aE282CF477E2eF28B14d0125aCEAd57Fe1d7a1)
 * - [__View Contract on Op Mainnet Optimism Explorer__](https://optimistic.etherscan.io/address/0x1fA76f2Cd0C3fe6c399A80111408d9C42C0CAC23)
 * - [__View Contract on Bnb Smart Chain Bsc Scan__](https://bscscan.com/address/0x2AcdD61ac1EFFe1535109449c31889bdE8d7f325)
 * - [__View Contract on Gnosis Gnosisscan__](https://gnosisscan.io/address/0x8082e58681350876aFe8f52d3Bf8672034A03Db0)
 * - [__View Contract on Polygon Polygon Scan__](https://polygonscan.com/address/0x2581c27E7f6D6AF452E63fCe884EDE3EDd716b32)
 * - [__View Contract on Base Basescan__](https://basescan.org/address/0x5D0acD0864Ad07ba4E1E0474AE69Da87482e14A9)
 * - [__View Contract on Arbitrum One Arbiscan__](https://arbiscan.io/address/0xf01825eAFAe5CD1Dab5593EFAF218efC8968D272)
 * - [__View Contract on Avalanche Fuji Snow Trace__](https://testnet.snowtrace.io/address/0x30aE282CF477E2eF28B14d0125aCEAd57Fe1d7a1)
 * - [__View Contract on Avalanche Snow Trace__](https://snowtrace.io/address/0x8082e58681350876aFe8f52d3Bf8672034A03Db0)
 * - [__View Contract on Op Sepolia Blockscout__](https://optimism-sepolia.blockscout.com/address/0xe567b32C10B0dB72d9490eB1B9A409C5ADed192C)
 */
export const useAutoWrapManagerWrapExecutedEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: autoWrapManagerAbi,
    address: autoWrapManagerAddress,
    eventName: 'WrapExecuted',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link autoWrapManagerAbi}__ and `eventName` set to `"WrapScheduleCreated"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x30aE282CF477E2eF28B14d0125aCEAd57Fe1d7a1)
 * - [__View Contract on Op Mainnet Optimism Explorer__](https://optimistic.etherscan.io/address/0x1fA76f2Cd0C3fe6c399A80111408d9C42C0CAC23)
 * - [__View Contract on Bnb Smart Chain Bsc Scan__](https://bscscan.com/address/0x2AcdD61ac1EFFe1535109449c31889bdE8d7f325)
 * - [__View Contract on Gnosis Gnosisscan__](https://gnosisscan.io/address/0x8082e58681350876aFe8f52d3Bf8672034A03Db0)
 * - [__View Contract on Polygon Polygon Scan__](https://polygonscan.com/address/0x2581c27E7f6D6AF452E63fCe884EDE3EDd716b32)
 * - [__View Contract on Base Basescan__](https://basescan.org/address/0x5D0acD0864Ad07ba4E1E0474AE69Da87482e14A9)
 * - [__View Contract on Arbitrum One Arbiscan__](https://arbiscan.io/address/0xf01825eAFAe5CD1Dab5593EFAF218efC8968D272)
 * - [__View Contract on Avalanche Fuji Snow Trace__](https://testnet.snowtrace.io/address/0x30aE282CF477E2eF28B14d0125aCEAd57Fe1d7a1)
 * - [__View Contract on Avalanche Snow Trace__](https://snowtrace.io/address/0x8082e58681350876aFe8f52d3Bf8672034A03Db0)
 * - [__View Contract on Op Sepolia Blockscout__](https://optimism-sepolia.blockscout.com/address/0xe567b32C10B0dB72d9490eB1B9A409C5ADed192C)
 */
export const useAutoWrapManagerWrapScheduleCreatedEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: autoWrapManagerAbi,
    address: autoWrapManagerAddress,
    eventName: 'WrapScheduleCreated',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link autoWrapManagerAbi}__ and `eventName` set to `"WrapScheduleDeleted"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x30aE282CF477E2eF28B14d0125aCEAd57Fe1d7a1)
 * - [__View Contract on Op Mainnet Optimism Explorer__](https://optimistic.etherscan.io/address/0x1fA76f2Cd0C3fe6c399A80111408d9C42C0CAC23)
 * - [__View Contract on Bnb Smart Chain Bsc Scan__](https://bscscan.com/address/0x2AcdD61ac1EFFe1535109449c31889bdE8d7f325)
 * - [__View Contract on Gnosis Gnosisscan__](https://gnosisscan.io/address/0x8082e58681350876aFe8f52d3Bf8672034A03Db0)
 * - [__View Contract on Polygon Polygon Scan__](https://polygonscan.com/address/0x2581c27E7f6D6AF452E63fCe884EDE3EDd716b32)
 * - [__View Contract on Base Basescan__](https://basescan.org/address/0x5D0acD0864Ad07ba4E1E0474AE69Da87482e14A9)
 * - [__View Contract on Arbitrum One Arbiscan__](https://arbiscan.io/address/0xf01825eAFAe5CD1Dab5593EFAF218efC8968D272)
 * - [__View Contract on Avalanche Fuji Snow Trace__](https://testnet.snowtrace.io/address/0x30aE282CF477E2eF28B14d0125aCEAd57Fe1d7a1)
 * - [__View Contract on Avalanche Snow Trace__](https://snowtrace.io/address/0x8082e58681350876aFe8f52d3Bf8672034A03Db0)
 * - [__View Contract on Op Sepolia Blockscout__](https://optimism-sepolia.blockscout.com/address/0xe567b32C10B0dB72d9490eB1B9A409C5ADed192C)
 */
export const useAutoWrapManagerWrapScheduleDeletedEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: autoWrapManagerAbi,
    address: autoWrapManagerAddress,
    eventName: 'WrapScheduleDeleted',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link constantFlowAgreementV1Abi}__
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x2844c1BBdA121E9E43105630b9C8310e5c72744b)
 * - [__View Contract on Op Mainnet Optimism Explorer__](https://optimistic.etherscan.io/address/0x204C6f131bb7F258b2Ea1593f5309911d8E458eD)
 * - [__View Contract on Bnb Smart Chain Bsc Scan__](https://bscscan.com/address/0x49c38108870e74Cb9420C0991a85D3edd6363F75)
 * - [__View Contract on Gnosis Gnosisscan__](https://gnosisscan.io/address/0xEbdA4ceF883A7B12c4E669Ebc58927FBa8447C7D)
 * - [__View Contract on Polygon Polygon Scan__](https://polygonscan.com/address/0x6EeE6060f715257b970700bc2656De21dEdF074C)
 * - [__View Contract on Base Basescan__](https://basescan.org/address/0x19ba78B9cDB05A877718841c574325fdB53601bb)
 * - [__View Contract on Arbitrum One Arbiscan__](https://arbiscan.io/address/0x731FdBB12944973B500518aea61942381d7e240D)
 * - [__View Contract on Celo Celo Explorer__](https://celoscan.io/address/0x9d369e78e1a682cE0F8d9aD849BeA4FE1c3bD3Ad)
 * - [__View Contract on Avalanche Fuji Snow Trace__](https://testnet.snowtrace.io/address/0x16843ac25Ccc58Aa7960ba05f61cBB17b36b130A)
 * - [__View Contract on Avalanche Snow Trace__](https://snowtrace.io/address/0x6946c5B38Ffea373b0a2340b4AEf0De8F6782e58)
 * - [__View Contract on Base Sepolia Basescan__](https://sepolia.basescan.org/address/0x6836F23d6171D74Ef62FcF776655aBcD2bcd62Ef)
 * - [__View Contract on Scroll Sepolia Scrollscan__](https://sepolia.scrollscan.com/address/0xbc46B4Aa41c055578306820013d4B65fff42711E)
 * - [__View Contract on Scroll Scrollscan__](https://scrollscan.com/address/0xB3bcD6da1eeB6c97258B3806A853A6dcD3B6C00c)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x6836F23d6171D74Ef62FcF776655aBcD2bcd62Ef)
 * - [__View Contract on Op Sepolia Blockscout__](https://optimism-sepolia.blockscout.com/address/0x8a3170AdbC67233196371226141736E4151e7C26)
 * - [__View Contract on Degen Degen Chain Explorer__](https://explorer.degen.tips/address/0x82cc052d1b17aC554a22A88D5876B56c6b51e95c)
 */
export const useConstantFlowAgreementV1Read =
  /*#__PURE__*/ createUseReadContract({
    abi: constantFlowAgreementV1Abi,
    address: constantFlowAgreementV1Address,
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link constantFlowAgreementV1Abi}__ and `functionName` set to `"CFA_HOOK_GAS_LIMIT"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x2844c1BBdA121E9E43105630b9C8310e5c72744b)
 * - [__View Contract on Op Mainnet Optimism Explorer__](https://optimistic.etherscan.io/address/0x204C6f131bb7F258b2Ea1593f5309911d8E458eD)
 * - [__View Contract on Bnb Smart Chain Bsc Scan__](https://bscscan.com/address/0x49c38108870e74Cb9420C0991a85D3edd6363F75)
 * - [__View Contract on Gnosis Gnosisscan__](https://gnosisscan.io/address/0xEbdA4ceF883A7B12c4E669Ebc58927FBa8447C7D)
 * - [__View Contract on Polygon Polygon Scan__](https://polygonscan.com/address/0x6EeE6060f715257b970700bc2656De21dEdF074C)
 * - [__View Contract on Base Basescan__](https://basescan.org/address/0x19ba78B9cDB05A877718841c574325fdB53601bb)
 * - [__View Contract on Arbitrum One Arbiscan__](https://arbiscan.io/address/0x731FdBB12944973B500518aea61942381d7e240D)
 * - [__View Contract on Celo Celo Explorer__](https://celoscan.io/address/0x9d369e78e1a682cE0F8d9aD849BeA4FE1c3bD3Ad)
 * - [__View Contract on Avalanche Fuji Snow Trace__](https://testnet.snowtrace.io/address/0x16843ac25Ccc58Aa7960ba05f61cBB17b36b130A)
 * - [__View Contract on Avalanche Snow Trace__](https://snowtrace.io/address/0x6946c5B38Ffea373b0a2340b4AEf0De8F6782e58)
 * - [__View Contract on Base Sepolia Basescan__](https://sepolia.basescan.org/address/0x6836F23d6171D74Ef62FcF776655aBcD2bcd62Ef)
 * - [__View Contract on Scroll Sepolia Scrollscan__](https://sepolia.scrollscan.com/address/0xbc46B4Aa41c055578306820013d4B65fff42711E)
 * - [__View Contract on Scroll Scrollscan__](https://scrollscan.com/address/0xB3bcD6da1eeB6c97258B3806A853A6dcD3B6C00c)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x6836F23d6171D74Ef62FcF776655aBcD2bcd62Ef)
 * - [__View Contract on Op Sepolia Blockscout__](https://optimism-sepolia.blockscout.com/address/0x8a3170AdbC67233196371226141736E4151e7C26)
 * - [__View Contract on Degen Degen Chain Explorer__](https://explorer.degen.tips/address/0x82cc052d1b17aC554a22A88D5876B56c6b51e95c)
 */
export const useConstantFlowAgreementV1CfaHookGasLimit =
  /*#__PURE__*/ createUseReadContract({
    abi: constantFlowAgreementV1Abi,
    address: constantFlowAgreementV1Address,
    functionName: 'CFA_HOOK_GAS_LIMIT',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link constantFlowAgreementV1Abi}__ and `functionName` set to `"DEFAULT_MINIMUM_DEPOSIT"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x2844c1BBdA121E9E43105630b9C8310e5c72744b)
 * - [__View Contract on Op Mainnet Optimism Explorer__](https://optimistic.etherscan.io/address/0x204C6f131bb7F258b2Ea1593f5309911d8E458eD)
 * - [__View Contract on Bnb Smart Chain Bsc Scan__](https://bscscan.com/address/0x49c38108870e74Cb9420C0991a85D3edd6363F75)
 * - [__View Contract on Gnosis Gnosisscan__](https://gnosisscan.io/address/0xEbdA4ceF883A7B12c4E669Ebc58927FBa8447C7D)
 * - [__View Contract on Polygon Polygon Scan__](https://polygonscan.com/address/0x6EeE6060f715257b970700bc2656De21dEdF074C)
 * - [__View Contract on Base Basescan__](https://basescan.org/address/0x19ba78B9cDB05A877718841c574325fdB53601bb)
 * - [__View Contract on Arbitrum One Arbiscan__](https://arbiscan.io/address/0x731FdBB12944973B500518aea61942381d7e240D)
 * - [__View Contract on Celo Celo Explorer__](https://celoscan.io/address/0x9d369e78e1a682cE0F8d9aD849BeA4FE1c3bD3Ad)
 * - [__View Contract on Avalanche Fuji Snow Trace__](https://testnet.snowtrace.io/address/0x16843ac25Ccc58Aa7960ba05f61cBB17b36b130A)
 * - [__View Contract on Avalanche Snow Trace__](https://snowtrace.io/address/0x6946c5B38Ffea373b0a2340b4AEf0De8F6782e58)
 * - [__View Contract on Base Sepolia Basescan__](https://sepolia.basescan.org/address/0x6836F23d6171D74Ef62FcF776655aBcD2bcd62Ef)
 * - [__View Contract on Scroll Sepolia Scrollscan__](https://sepolia.scrollscan.com/address/0xbc46B4Aa41c055578306820013d4B65fff42711E)
 * - [__View Contract on Scroll Scrollscan__](https://scrollscan.com/address/0xB3bcD6da1eeB6c97258B3806A853A6dcD3B6C00c)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x6836F23d6171D74Ef62FcF776655aBcD2bcd62Ef)
 * - [__View Contract on Op Sepolia Blockscout__](https://optimism-sepolia.blockscout.com/address/0x8a3170AdbC67233196371226141736E4151e7C26)
 * - [__View Contract on Degen Degen Chain Explorer__](https://explorer.degen.tips/address/0x82cc052d1b17aC554a22A88D5876B56c6b51e95c)
 */
export const useConstantFlowAgreementV1DefaultMinimumDeposit =
  /*#__PURE__*/ createUseReadContract({
    abi: constantFlowAgreementV1Abi,
    address: constantFlowAgreementV1Address,
    functionName: 'DEFAULT_MINIMUM_DEPOSIT',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link constantFlowAgreementV1Abi}__ and `functionName` set to `"MAXIMUM_DEPOSIT"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x2844c1BBdA121E9E43105630b9C8310e5c72744b)
 * - [__View Contract on Op Mainnet Optimism Explorer__](https://optimistic.etherscan.io/address/0x204C6f131bb7F258b2Ea1593f5309911d8E458eD)
 * - [__View Contract on Bnb Smart Chain Bsc Scan__](https://bscscan.com/address/0x49c38108870e74Cb9420C0991a85D3edd6363F75)
 * - [__View Contract on Gnosis Gnosisscan__](https://gnosisscan.io/address/0xEbdA4ceF883A7B12c4E669Ebc58927FBa8447C7D)
 * - [__View Contract on Polygon Polygon Scan__](https://polygonscan.com/address/0x6EeE6060f715257b970700bc2656De21dEdF074C)
 * - [__View Contract on Base Basescan__](https://basescan.org/address/0x19ba78B9cDB05A877718841c574325fdB53601bb)
 * - [__View Contract on Arbitrum One Arbiscan__](https://arbiscan.io/address/0x731FdBB12944973B500518aea61942381d7e240D)
 * - [__View Contract on Celo Celo Explorer__](https://celoscan.io/address/0x9d369e78e1a682cE0F8d9aD849BeA4FE1c3bD3Ad)
 * - [__View Contract on Avalanche Fuji Snow Trace__](https://testnet.snowtrace.io/address/0x16843ac25Ccc58Aa7960ba05f61cBB17b36b130A)
 * - [__View Contract on Avalanche Snow Trace__](https://snowtrace.io/address/0x6946c5B38Ffea373b0a2340b4AEf0De8F6782e58)
 * - [__View Contract on Base Sepolia Basescan__](https://sepolia.basescan.org/address/0x6836F23d6171D74Ef62FcF776655aBcD2bcd62Ef)
 * - [__View Contract on Scroll Sepolia Scrollscan__](https://sepolia.scrollscan.com/address/0xbc46B4Aa41c055578306820013d4B65fff42711E)
 * - [__View Contract on Scroll Scrollscan__](https://scrollscan.com/address/0xB3bcD6da1eeB6c97258B3806A853A6dcD3B6C00c)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x6836F23d6171D74Ef62FcF776655aBcD2bcd62Ef)
 * - [__View Contract on Op Sepolia Blockscout__](https://optimism-sepolia.blockscout.com/address/0x8a3170AdbC67233196371226141736E4151e7C26)
 * - [__View Contract on Degen Degen Chain Explorer__](https://explorer.degen.tips/address/0x82cc052d1b17aC554a22A88D5876B56c6b51e95c)
 */
export const useConstantFlowAgreementV1MaximumDeposit =
  /*#__PURE__*/ createUseReadContract({
    abi: constantFlowAgreementV1Abi,
    address: constantFlowAgreementV1Address,
    functionName: 'MAXIMUM_DEPOSIT',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link constantFlowAgreementV1Abi}__ and `functionName` set to `"MAXIMUM_FLOW_RATE"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x2844c1BBdA121E9E43105630b9C8310e5c72744b)
 * - [__View Contract on Op Mainnet Optimism Explorer__](https://optimistic.etherscan.io/address/0x204C6f131bb7F258b2Ea1593f5309911d8E458eD)
 * - [__View Contract on Bnb Smart Chain Bsc Scan__](https://bscscan.com/address/0x49c38108870e74Cb9420C0991a85D3edd6363F75)
 * - [__View Contract on Gnosis Gnosisscan__](https://gnosisscan.io/address/0xEbdA4ceF883A7B12c4E669Ebc58927FBa8447C7D)
 * - [__View Contract on Polygon Polygon Scan__](https://polygonscan.com/address/0x6EeE6060f715257b970700bc2656De21dEdF074C)
 * - [__View Contract on Base Basescan__](https://basescan.org/address/0x19ba78B9cDB05A877718841c574325fdB53601bb)
 * - [__View Contract on Arbitrum One Arbiscan__](https://arbiscan.io/address/0x731FdBB12944973B500518aea61942381d7e240D)
 * - [__View Contract on Celo Celo Explorer__](https://celoscan.io/address/0x9d369e78e1a682cE0F8d9aD849BeA4FE1c3bD3Ad)
 * - [__View Contract on Avalanche Fuji Snow Trace__](https://testnet.snowtrace.io/address/0x16843ac25Ccc58Aa7960ba05f61cBB17b36b130A)
 * - [__View Contract on Avalanche Snow Trace__](https://snowtrace.io/address/0x6946c5B38Ffea373b0a2340b4AEf0De8F6782e58)
 * - [__View Contract on Base Sepolia Basescan__](https://sepolia.basescan.org/address/0x6836F23d6171D74Ef62FcF776655aBcD2bcd62Ef)
 * - [__View Contract on Scroll Sepolia Scrollscan__](https://sepolia.scrollscan.com/address/0xbc46B4Aa41c055578306820013d4B65fff42711E)
 * - [__View Contract on Scroll Scrollscan__](https://scrollscan.com/address/0xB3bcD6da1eeB6c97258B3806A853A6dcD3B6C00c)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x6836F23d6171D74Ef62FcF776655aBcD2bcd62Ef)
 * - [__View Contract on Op Sepolia Blockscout__](https://optimism-sepolia.blockscout.com/address/0x8a3170AdbC67233196371226141736E4151e7C26)
 * - [__View Contract on Degen Degen Chain Explorer__](https://explorer.degen.tips/address/0x82cc052d1b17aC554a22A88D5876B56c6b51e95c)
 */
export const useConstantFlowAgreementV1MaximumFlowRate =
  /*#__PURE__*/ createUseReadContract({
    abi: constantFlowAgreementV1Abi,
    address: constantFlowAgreementV1Address,
    functionName: 'MAXIMUM_FLOW_RATE',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link constantFlowAgreementV1Abi}__ and `functionName` set to `"agreementType"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x2844c1BBdA121E9E43105630b9C8310e5c72744b)
 * - [__View Contract on Op Mainnet Optimism Explorer__](https://optimistic.etherscan.io/address/0x204C6f131bb7F258b2Ea1593f5309911d8E458eD)
 * - [__View Contract on Bnb Smart Chain Bsc Scan__](https://bscscan.com/address/0x49c38108870e74Cb9420C0991a85D3edd6363F75)
 * - [__View Contract on Gnosis Gnosisscan__](https://gnosisscan.io/address/0xEbdA4ceF883A7B12c4E669Ebc58927FBa8447C7D)
 * - [__View Contract on Polygon Polygon Scan__](https://polygonscan.com/address/0x6EeE6060f715257b970700bc2656De21dEdF074C)
 * - [__View Contract on Base Basescan__](https://basescan.org/address/0x19ba78B9cDB05A877718841c574325fdB53601bb)
 * - [__View Contract on Arbitrum One Arbiscan__](https://arbiscan.io/address/0x731FdBB12944973B500518aea61942381d7e240D)
 * - [__View Contract on Celo Celo Explorer__](https://celoscan.io/address/0x9d369e78e1a682cE0F8d9aD849BeA4FE1c3bD3Ad)
 * - [__View Contract on Avalanche Fuji Snow Trace__](https://testnet.snowtrace.io/address/0x16843ac25Ccc58Aa7960ba05f61cBB17b36b130A)
 * - [__View Contract on Avalanche Snow Trace__](https://snowtrace.io/address/0x6946c5B38Ffea373b0a2340b4AEf0De8F6782e58)
 * - [__View Contract on Base Sepolia Basescan__](https://sepolia.basescan.org/address/0x6836F23d6171D74Ef62FcF776655aBcD2bcd62Ef)
 * - [__View Contract on Scroll Sepolia Scrollscan__](https://sepolia.scrollscan.com/address/0xbc46B4Aa41c055578306820013d4B65fff42711E)
 * - [__View Contract on Scroll Scrollscan__](https://scrollscan.com/address/0xB3bcD6da1eeB6c97258B3806A853A6dcD3B6C00c)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x6836F23d6171D74Ef62FcF776655aBcD2bcd62Ef)
 * - [__View Contract on Op Sepolia Blockscout__](https://optimism-sepolia.blockscout.com/address/0x8a3170AdbC67233196371226141736E4151e7C26)
 * - [__View Contract on Degen Degen Chain Explorer__](https://explorer.degen.tips/address/0x82cc052d1b17aC554a22A88D5876B56c6b51e95c)
 */
export const useConstantFlowAgreementV1AgreementType =
  /*#__PURE__*/ createUseReadContract({
    abi: constantFlowAgreementV1Abi,
    address: constantFlowAgreementV1Address,
    functionName: 'agreementType',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link constantFlowAgreementV1Abi}__ and `functionName` set to `"getCodeAddress"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x2844c1BBdA121E9E43105630b9C8310e5c72744b)
 * - [__View Contract on Op Mainnet Optimism Explorer__](https://optimistic.etherscan.io/address/0x204C6f131bb7F258b2Ea1593f5309911d8E458eD)
 * - [__View Contract on Bnb Smart Chain Bsc Scan__](https://bscscan.com/address/0x49c38108870e74Cb9420C0991a85D3edd6363F75)
 * - [__View Contract on Gnosis Gnosisscan__](https://gnosisscan.io/address/0xEbdA4ceF883A7B12c4E669Ebc58927FBa8447C7D)
 * - [__View Contract on Polygon Polygon Scan__](https://polygonscan.com/address/0x6EeE6060f715257b970700bc2656De21dEdF074C)
 * - [__View Contract on Base Basescan__](https://basescan.org/address/0x19ba78B9cDB05A877718841c574325fdB53601bb)
 * - [__View Contract on Arbitrum One Arbiscan__](https://arbiscan.io/address/0x731FdBB12944973B500518aea61942381d7e240D)
 * - [__View Contract on Celo Celo Explorer__](https://celoscan.io/address/0x9d369e78e1a682cE0F8d9aD849BeA4FE1c3bD3Ad)
 * - [__View Contract on Avalanche Fuji Snow Trace__](https://testnet.snowtrace.io/address/0x16843ac25Ccc58Aa7960ba05f61cBB17b36b130A)
 * - [__View Contract on Avalanche Snow Trace__](https://snowtrace.io/address/0x6946c5B38Ffea373b0a2340b4AEf0De8F6782e58)
 * - [__View Contract on Base Sepolia Basescan__](https://sepolia.basescan.org/address/0x6836F23d6171D74Ef62FcF776655aBcD2bcd62Ef)
 * - [__View Contract on Scroll Sepolia Scrollscan__](https://sepolia.scrollscan.com/address/0xbc46B4Aa41c055578306820013d4B65fff42711E)
 * - [__View Contract on Scroll Scrollscan__](https://scrollscan.com/address/0xB3bcD6da1eeB6c97258B3806A853A6dcD3B6C00c)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x6836F23d6171D74Ef62FcF776655aBcD2bcd62Ef)
 * - [__View Contract on Op Sepolia Blockscout__](https://optimism-sepolia.blockscout.com/address/0x8a3170AdbC67233196371226141736E4151e7C26)
 * - [__View Contract on Degen Degen Chain Explorer__](https://explorer.degen.tips/address/0x82cc052d1b17aC554a22A88D5876B56c6b51e95c)
 */
export const useConstantFlowAgreementV1GetCodeAddress =
  /*#__PURE__*/ createUseReadContract({
    abi: constantFlowAgreementV1Abi,
    address: constantFlowAgreementV1Address,
    functionName: 'getCodeAddress',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link constantFlowAgreementV1Abi}__ and `functionName` set to `"proxiableUUID"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x2844c1BBdA121E9E43105630b9C8310e5c72744b)
 * - [__View Contract on Op Mainnet Optimism Explorer__](https://optimistic.etherscan.io/address/0x204C6f131bb7F258b2Ea1593f5309911d8E458eD)
 * - [__View Contract on Bnb Smart Chain Bsc Scan__](https://bscscan.com/address/0x49c38108870e74Cb9420C0991a85D3edd6363F75)
 * - [__View Contract on Gnosis Gnosisscan__](https://gnosisscan.io/address/0xEbdA4ceF883A7B12c4E669Ebc58927FBa8447C7D)
 * - [__View Contract on Polygon Polygon Scan__](https://polygonscan.com/address/0x6EeE6060f715257b970700bc2656De21dEdF074C)
 * - [__View Contract on Base Basescan__](https://basescan.org/address/0x19ba78B9cDB05A877718841c574325fdB53601bb)
 * - [__View Contract on Arbitrum One Arbiscan__](https://arbiscan.io/address/0x731FdBB12944973B500518aea61942381d7e240D)
 * - [__View Contract on Celo Celo Explorer__](https://celoscan.io/address/0x9d369e78e1a682cE0F8d9aD849BeA4FE1c3bD3Ad)
 * - [__View Contract on Avalanche Fuji Snow Trace__](https://testnet.snowtrace.io/address/0x16843ac25Ccc58Aa7960ba05f61cBB17b36b130A)
 * - [__View Contract on Avalanche Snow Trace__](https://snowtrace.io/address/0x6946c5B38Ffea373b0a2340b4AEf0De8F6782e58)
 * - [__View Contract on Base Sepolia Basescan__](https://sepolia.basescan.org/address/0x6836F23d6171D74Ef62FcF776655aBcD2bcd62Ef)
 * - [__View Contract on Scroll Sepolia Scrollscan__](https://sepolia.scrollscan.com/address/0xbc46B4Aa41c055578306820013d4B65fff42711E)
 * - [__View Contract on Scroll Scrollscan__](https://scrollscan.com/address/0xB3bcD6da1eeB6c97258B3806A853A6dcD3B6C00c)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x6836F23d6171D74Ef62FcF776655aBcD2bcd62Ef)
 * - [__View Contract on Op Sepolia Blockscout__](https://optimism-sepolia.blockscout.com/address/0x8a3170AdbC67233196371226141736E4151e7C26)
 * - [__View Contract on Degen Degen Chain Explorer__](https://explorer.degen.tips/address/0x82cc052d1b17aC554a22A88D5876B56c6b51e95c)
 */
export const useConstantFlowAgreementV1ProxiableUuid =
  /*#__PURE__*/ createUseReadContract({
    abi: constantFlowAgreementV1Abi,
    address: constantFlowAgreementV1Address,
    functionName: 'proxiableUUID',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link constantFlowAgreementV1Abi}__ and `functionName` set to `"realtimeBalanceOf"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x2844c1BBdA121E9E43105630b9C8310e5c72744b)
 * - [__View Contract on Op Mainnet Optimism Explorer__](https://optimistic.etherscan.io/address/0x204C6f131bb7F258b2Ea1593f5309911d8E458eD)
 * - [__View Contract on Bnb Smart Chain Bsc Scan__](https://bscscan.com/address/0x49c38108870e74Cb9420C0991a85D3edd6363F75)
 * - [__View Contract on Gnosis Gnosisscan__](https://gnosisscan.io/address/0xEbdA4ceF883A7B12c4E669Ebc58927FBa8447C7D)
 * - [__View Contract on Polygon Polygon Scan__](https://polygonscan.com/address/0x6EeE6060f715257b970700bc2656De21dEdF074C)
 * - [__View Contract on Base Basescan__](https://basescan.org/address/0x19ba78B9cDB05A877718841c574325fdB53601bb)
 * - [__View Contract on Arbitrum One Arbiscan__](https://arbiscan.io/address/0x731FdBB12944973B500518aea61942381d7e240D)
 * - [__View Contract on Celo Celo Explorer__](https://celoscan.io/address/0x9d369e78e1a682cE0F8d9aD849BeA4FE1c3bD3Ad)
 * - [__View Contract on Avalanche Fuji Snow Trace__](https://testnet.snowtrace.io/address/0x16843ac25Ccc58Aa7960ba05f61cBB17b36b130A)
 * - [__View Contract on Avalanche Snow Trace__](https://snowtrace.io/address/0x6946c5B38Ffea373b0a2340b4AEf0De8F6782e58)
 * - [__View Contract on Base Sepolia Basescan__](https://sepolia.basescan.org/address/0x6836F23d6171D74Ef62FcF776655aBcD2bcd62Ef)
 * - [__View Contract on Scroll Sepolia Scrollscan__](https://sepolia.scrollscan.com/address/0xbc46B4Aa41c055578306820013d4B65fff42711E)
 * - [__View Contract on Scroll Scrollscan__](https://scrollscan.com/address/0xB3bcD6da1eeB6c97258B3806A853A6dcD3B6C00c)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x6836F23d6171D74Ef62FcF776655aBcD2bcd62Ef)
 * - [__View Contract on Op Sepolia Blockscout__](https://optimism-sepolia.blockscout.com/address/0x8a3170AdbC67233196371226141736E4151e7C26)
 * - [__View Contract on Degen Degen Chain Explorer__](https://explorer.degen.tips/address/0x82cc052d1b17aC554a22A88D5876B56c6b51e95c)
 */
export const useConstantFlowAgreementV1RealtimeBalanceOf =
  /*#__PURE__*/ createUseReadContract({
    abi: constantFlowAgreementV1Abi,
    address: constantFlowAgreementV1Address,
    functionName: 'realtimeBalanceOf',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link constantFlowAgreementV1Abi}__ and `functionName` set to `"getMaximumFlowRateFromDeposit"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x2844c1BBdA121E9E43105630b9C8310e5c72744b)
 * - [__View Contract on Op Mainnet Optimism Explorer__](https://optimistic.etherscan.io/address/0x204C6f131bb7F258b2Ea1593f5309911d8E458eD)
 * - [__View Contract on Bnb Smart Chain Bsc Scan__](https://bscscan.com/address/0x49c38108870e74Cb9420C0991a85D3edd6363F75)
 * - [__View Contract on Gnosis Gnosisscan__](https://gnosisscan.io/address/0xEbdA4ceF883A7B12c4E669Ebc58927FBa8447C7D)
 * - [__View Contract on Polygon Polygon Scan__](https://polygonscan.com/address/0x6EeE6060f715257b970700bc2656De21dEdF074C)
 * - [__View Contract on Base Basescan__](https://basescan.org/address/0x19ba78B9cDB05A877718841c574325fdB53601bb)
 * - [__View Contract on Arbitrum One Arbiscan__](https://arbiscan.io/address/0x731FdBB12944973B500518aea61942381d7e240D)
 * - [__View Contract on Celo Celo Explorer__](https://celoscan.io/address/0x9d369e78e1a682cE0F8d9aD849BeA4FE1c3bD3Ad)
 * - [__View Contract on Avalanche Fuji Snow Trace__](https://testnet.snowtrace.io/address/0x16843ac25Ccc58Aa7960ba05f61cBB17b36b130A)
 * - [__View Contract on Avalanche Snow Trace__](https://snowtrace.io/address/0x6946c5B38Ffea373b0a2340b4AEf0De8F6782e58)
 * - [__View Contract on Base Sepolia Basescan__](https://sepolia.basescan.org/address/0x6836F23d6171D74Ef62FcF776655aBcD2bcd62Ef)
 * - [__View Contract on Scroll Sepolia Scrollscan__](https://sepolia.scrollscan.com/address/0xbc46B4Aa41c055578306820013d4B65fff42711E)
 * - [__View Contract on Scroll Scrollscan__](https://scrollscan.com/address/0xB3bcD6da1eeB6c97258B3806A853A6dcD3B6C00c)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x6836F23d6171D74Ef62FcF776655aBcD2bcd62Ef)
 * - [__View Contract on Op Sepolia Blockscout__](https://optimism-sepolia.blockscout.com/address/0x8a3170AdbC67233196371226141736E4151e7C26)
 * - [__View Contract on Degen Degen Chain Explorer__](https://explorer.degen.tips/address/0x82cc052d1b17aC554a22A88D5876B56c6b51e95c)
 */
export const useConstantFlowAgreementV1GetMaximumFlowRateFromDeposit =
  /*#__PURE__*/ createUseReadContract({
    abi: constantFlowAgreementV1Abi,
    address: constantFlowAgreementV1Address,
    functionName: 'getMaximumFlowRateFromDeposit',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link constantFlowAgreementV1Abi}__ and `functionName` set to `"getDepositRequiredForFlowRate"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x2844c1BBdA121E9E43105630b9C8310e5c72744b)
 * - [__View Contract on Op Mainnet Optimism Explorer__](https://optimistic.etherscan.io/address/0x204C6f131bb7F258b2Ea1593f5309911d8E458eD)
 * - [__View Contract on Bnb Smart Chain Bsc Scan__](https://bscscan.com/address/0x49c38108870e74Cb9420C0991a85D3edd6363F75)
 * - [__View Contract on Gnosis Gnosisscan__](https://gnosisscan.io/address/0xEbdA4ceF883A7B12c4E669Ebc58927FBa8447C7D)
 * - [__View Contract on Polygon Polygon Scan__](https://polygonscan.com/address/0x6EeE6060f715257b970700bc2656De21dEdF074C)
 * - [__View Contract on Base Basescan__](https://basescan.org/address/0x19ba78B9cDB05A877718841c574325fdB53601bb)
 * - [__View Contract on Arbitrum One Arbiscan__](https://arbiscan.io/address/0x731FdBB12944973B500518aea61942381d7e240D)
 * - [__View Contract on Celo Celo Explorer__](https://celoscan.io/address/0x9d369e78e1a682cE0F8d9aD849BeA4FE1c3bD3Ad)
 * - [__View Contract on Avalanche Fuji Snow Trace__](https://testnet.snowtrace.io/address/0x16843ac25Ccc58Aa7960ba05f61cBB17b36b130A)
 * - [__View Contract on Avalanche Snow Trace__](https://snowtrace.io/address/0x6946c5B38Ffea373b0a2340b4AEf0De8F6782e58)
 * - [__View Contract on Base Sepolia Basescan__](https://sepolia.basescan.org/address/0x6836F23d6171D74Ef62FcF776655aBcD2bcd62Ef)
 * - [__View Contract on Scroll Sepolia Scrollscan__](https://sepolia.scrollscan.com/address/0xbc46B4Aa41c055578306820013d4B65fff42711E)
 * - [__View Contract on Scroll Scrollscan__](https://scrollscan.com/address/0xB3bcD6da1eeB6c97258B3806A853A6dcD3B6C00c)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x6836F23d6171D74Ef62FcF776655aBcD2bcd62Ef)
 * - [__View Contract on Op Sepolia Blockscout__](https://optimism-sepolia.blockscout.com/address/0x8a3170AdbC67233196371226141736E4151e7C26)
 * - [__View Contract on Degen Degen Chain Explorer__](https://explorer.degen.tips/address/0x82cc052d1b17aC554a22A88D5876B56c6b51e95c)
 */
export const useConstantFlowAgreementV1GetDepositRequiredForFlowRate =
  /*#__PURE__*/ createUseReadContract({
    abi: constantFlowAgreementV1Abi,
    address: constantFlowAgreementV1Address,
    functionName: 'getDepositRequiredForFlowRate',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link constantFlowAgreementV1Abi}__ and `functionName` set to `"isPatricianPeriodNow"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x2844c1BBdA121E9E43105630b9C8310e5c72744b)
 * - [__View Contract on Op Mainnet Optimism Explorer__](https://optimistic.etherscan.io/address/0x204C6f131bb7F258b2Ea1593f5309911d8E458eD)
 * - [__View Contract on Bnb Smart Chain Bsc Scan__](https://bscscan.com/address/0x49c38108870e74Cb9420C0991a85D3edd6363F75)
 * - [__View Contract on Gnosis Gnosisscan__](https://gnosisscan.io/address/0xEbdA4ceF883A7B12c4E669Ebc58927FBa8447C7D)
 * - [__View Contract on Polygon Polygon Scan__](https://polygonscan.com/address/0x6EeE6060f715257b970700bc2656De21dEdF074C)
 * - [__View Contract on Base Basescan__](https://basescan.org/address/0x19ba78B9cDB05A877718841c574325fdB53601bb)
 * - [__View Contract on Arbitrum One Arbiscan__](https://arbiscan.io/address/0x731FdBB12944973B500518aea61942381d7e240D)
 * - [__View Contract on Celo Celo Explorer__](https://celoscan.io/address/0x9d369e78e1a682cE0F8d9aD849BeA4FE1c3bD3Ad)
 * - [__View Contract on Avalanche Fuji Snow Trace__](https://testnet.snowtrace.io/address/0x16843ac25Ccc58Aa7960ba05f61cBB17b36b130A)
 * - [__View Contract on Avalanche Snow Trace__](https://snowtrace.io/address/0x6946c5B38Ffea373b0a2340b4AEf0De8F6782e58)
 * - [__View Contract on Base Sepolia Basescan__](https://sepolia.basescan.org/address/0x6836F23d6171D74Ef62FcF776655aBcD2bcd62Ef)
 * - [__View Contract on Scroll Sepolia Scrollscan__](https://sepolia.scrollscan.com/address/0xbc46B4Aa41c055578306820013d4B65fff42711E)
 * - [__View Contract on Scroll Scrollscan__](https://scrollscan.com/address/0xB3bcD6da1eeB6c97258B3806A853A6dcD3B6C00c)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x6836F23d6171D74Ef62FcF776655aBcD2bcd62Ef)
 * - [__View Contract on Op Sepolia Blockscout__](https://optimism-sepolia.blockscout.com/address/0x8a3170AdbC67233196371226141736E4151e7C26)
 * - [__View Contract on Degen Degen Chain Explorer__](https://explorer.degen.tips/address/0x82cc052d1b17aC554a22A88D5876B56c6b51e95c)
 */
export const useConstantFlowAgreementV1IsPatricianPeriodNow =
  /*#__PURE__*/ createUseReadContract({
    abi: constantFlowAgreementV1Abi,
    address: constantFlowAgreementV1Address,
    functionName: 'isPatricianPeriodNow',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link constantFlowAgreementV1Abi}__ and `functionName` set to `"isPatricianPeriod"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x2844c1BBdA121E9E43105630b9C8310e5c72744b)
 * - [__View Contract on Op Mainnet Optimism Explorer__](https://optimistic.etherscan.io/address/0x204C6f131bb7F258b2Ea1593f5309911d8E458eD)
 * - [__View Contract on Bnb Smart Chain Bsc Scan__](https://bscscan.com/address/0x49c38108870e74Cb9420C0991a85D3edd6363F75)
 * - [__View Contract on Gnosis Gnosisscan__](https://gnosisscan.io/address/0xEbdA4ceF883A7B12c4E669Ebc58927FBa8447C7D)
 * - [__View Contract on Polygon Polygon Scan__](https://polygonscan.com/address/0x6EeE6060f715257b970700bc2656De21dEdF074C)
 * - [__View Contract on Base Basescan__](https://basescan.org/address/0x19ba78B9cDB05A877718841c574325fdB53601bb)
 * - [__View Contract on Arbitrum One Arbiscan__](https://arbiscan.io/address/0x731FdBB12944973B500518aea61942381d7e240D)
 * - [__View Contract on Celo Celo Explorer__](https://celoscan.io/address/0x9d369e78e1a682cE0F8d9aD849BeA4FE1c3bD3Ad)
 * - [__View Contract on Avalanche Fuji Snow Trace__](https://testnet.snowtrace.io/address/0x16843ac25Ccc58Aa7960ba05f61cBB17b36b130A)
 * - [__View Contract on Avalanche Snow Trace__](https://snowtrace.io/address/0x6946c5B38Ffea373b0a2340b4AEf0De8F6782e58)
 * - [__View Contract on Base Sepolia Basescan__](https://sepolia.basescan.org/address/0x6836F23d6171D74Ef62FcF776655aBcD2bcd62Ef)
 * - [__View Contract on Scroll Sepolia Scrollscan__](https://sepolia.scrollscan.com/address/0xbc46B4Aa41c055578306820013d4B65fff42711E)
 * - [__View Contract on Scroll Scrollscan__](https://scrollscan.com/address/0xB3bcD6da1eeB6c97258B3806A853A6dcD3B6C00c)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x6836F23d6171D74Ef62FcF776655aBcD2bcd62Ef)
 * - [__View Contract on Op Sepolia Blockscout__](https://optimism-sepolia.blockscout.com/address/0x8a3170AdbC67233196371226141736E4151e7C26)
 * - [__View Contract on Degen Degen Chain Explorer__](https://explorer.degen.tips/address/0x82cc052d1b17aC554a22A88D5876B56c6b51e95c)
 */
export const useConstantFlowAgreementV1IsPatricianPeriod =
  /*#__PURE__*/ createUseReadContract({
    abi: constantFlowAgreementV1Abi,
    address: constantFlowAgreementV1Address,
    functionName: 'isPatricianPeriod',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link constantFlowAgreementV1Abi}__ and `functionName` set to `"getFlow"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x2844c1BBdA121E9E43105630b9C8310e5c72744b)
 * - [__View Contract on Op Mainnet Optimism Explorer__](https://optimistic.etherscan.io/address/0x204C6f131bb7F258b2Ea1593f5309911d8E458eD)
 * - [__View Contract on Bnb Smart Chain Bsc Scan__](https://bscscan.com/address/0x49c38108870e74Cb9420C0991a85D3edd6363F75)
 * - [__View Contract on Gnosis Gnosisscan__](https://gnosisscan.io/address/0xEbdA4ceF883A7B12c4E669Ebc58927FBa8447C7D)
 * - [__View Contract on Polygon Polygon Scan__](https://polygonscan.com/address/0x6EeE6060f715257b970700bc2656De21dEdF074C)
 * - [__View Contract on Base Basescan__](https://basescan.org/address/0x19ba78B9cDB05A877718841c574325fdB53601bb)
 * - [__View Contract on Arbitrum One Arbiscan__](https://arbiscan.io/address/0x731FdBB12944973B500518aea61942381d7e240D)
 * - [__View Contract on Celo Celo Explorer__](https://celoscan.io/address/0x9d369e78e1a682cE0F8d9aD849BeA4FE1c3bD3Ad)
 * - [__View Contract on Avalanche Fuji Snow Trace__](https://testnet.snowtrace.io/address/0x16843ac25Ccc58Aa7960ba05f61cBB17b36b130A)
 * - [__View Contract on Avalanche Snow Trace__](https://snowtrace.io/address/0x6946c5B38Ffea373b0a2340b4AEf0De8F6782e58)
 * - [__View Contract on Base Sepolia Basescan__](https://sepolia.basescan.org/address/0x6836F23d6171D74Ef62FcF776655aBcD2bcd62Ef)
 * - [__View Contract on Scroll Sepolia Scrollscan__](https://sepolia.scrollscan.com/address/0xbc46B4Aa41c055578306820013d4B65fff42711E)
 * - [__View Contract on Scroll Scrollscan__](https://scrollscan.com/address/0xB3bcD6da1eeB6c97258B3806A853A6dcD3B6C00c)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x6836F23d6171D74Ef62FcF776655aBcD2bcd62Ef)
 * - [__View Contract on Op Sepolia Blockscout__](https://optimism-sepolia.blockscout.com/address/0x8a3170AdbC67233196371226141736E4151e7C26)
 * - [__View Contract on Degen Degen Chain Explorer__](https://explorer.degen.tips/address/0x82cc052d1b17aC554a22A88D5876B56c6b51e95c)
 */
export const useConstantFlowAgreementV1GetFlow =
  /*#__PURE__*/ createUseReadContract({
    abi: constantFlowAgreementV1Abi,
    address: constantFlowAgreementV1Address,
    functionName: 'getFlow',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link constantFlowAgreementV1Abi}__ and `functionName` set to `"getFlowByID"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x2844c1BBdA121E9E43105630b9C8310e5c72744b)
 * - [__View Contract on Op Mainnet Optimism Explorer__](https://optimistic.etherscan.io/address/0x204C6f131bb7F258b2Ea1593f5309911d8E458eD)
 * - [__View Contract on Bnb Smart Chain Bsc Scan__](https://bscscan.com/address/0x49c38108870e74Cb9420C0991a85D3edd6363F75)
 * - [__View Contract on Gnosis Gnosisscan__](https://gnosisscan.io/address/0xEbdA4ceF883A7B12c4E669Ebc58927FBa8447C7D)
 * - [__View Contract on Polygon Polygon Scan__](https://polygonscan.com/address/0x6EeE6060f715257b970700bc2656De21dEdF074C)
 * - [__View Contract on Base Basescan__](https://basescan.org/address/0x19ba78B9cDB05A877718841c574325fdB53601bb)
 * - [__View Contract on Arbitrum One Arbiscan__](https://arbiscan.io/address/0x731FdBB12944973B500518aea61942381d7e240D)
 * - [__View Contract on Celo Celo Explorer__](https://celoscan.io/address/0x9d369e78e1a682cE0F8d9aD849BeA4FE1c3bD3Ad)
 * - [__View Contract on Avalanche Fuji Snow Trace__](https://testnet.snowtrace.io/address/0x16843ac25Ccc58Aa7960ba05f61cBB17b36b130A)
 * - [__View Contract on Avalanche Snow Trace__](https://snowtrace.io/address/0x6946c5B38Ffea373b0a2340b4AEf0De8F6782e58)
 * - [__View Contract on Base Sepolia Basescan__](https://sepolia.basescan.org/address/0x6836F23d6171D74Ef62FcF776655aBcD2bcd62Ef)
 * - [__View Contract on Scroll Sepolia Scrollscan__](https://sepolia.scrollscan.com/address/0xbc46B4Aa41c055578306820013d4B65fff42711E)
 * - [__View Contract on Scroll Scrollscan__](https://scrollscan.com/address/0xB3bcD6da1eeB6c97258B3806A853A6dcD3B6C00c)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x6836F23d6171D74Ef62FcF776655aBcD2bcd62Ef)
 * - [__View Contract on Op Sepolia Blockscout__](https://optimism-sepolia.blockscout.com/address/0x8a3170AdbC67233196371226141736E4151e7C26)
 * - [__View Contract on Degen Degen Chain Explorer__](https://explorer.degen.tips/address/0x82cc052d1b17aC554a22A88D5876B56c6b51e95c)
 */
export const useConstantFlowAgreementV1GetFlowById =
  /*#__PURE__*/ createUseReadContract({
    abi: constantFlowAgreementV1Abi,
    address: constantFlowAgreementV1Address,
    functionName: 'getFlowByID',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link constantFlowAgreementV1Abi}__ and `functionName` set to `"getAccountFlowInfo"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x2844c1BBdA121E9E43105630b9C8310e5c72744b)
 * - [__View Contract on Op Mainnet Optimism Explorer__](https://optimistic.etherscan.io/address/0x204C6f131bb7F258b2Ea1593f5309911d8E458eD)
 * - [__View Contract on Bnb Smart Chain Bsc Scan__](https://bscscan.com/address/0x49c38108870e74Cb9420C0991a85D3edd6363F75)
 * - [__View Contract on Gnosis Gnosisscan__](https://gnosisscan.io/address/0xEbdA4ceF883A7B12c4E669Ebc58927FBa8447C7D)
 * - [__View Contract on Polygon Polygon Scan__](https://polygonscan.com/address/0x6EeE6060f715257b970700bc2656De21dEdF074C)
 * - [__View Contract on Base Basescan__](https://basescan.org/address/0x19ba78B9cDB05A877718841c574325fdB53601bb)
 * - [__View Contract on Arbitrum One Arbiscan__](https://arbiscan.io/address/0x731FdBB12944973B500518aea61942381d7e240D)
 * - [__View Contract on Celo Celo Explorer__](https://celoscan.io/address/0x9d369e78e1a682cE0F8d9aD849BeA4FE1c3bD3Ad)
 * - [__View Contract on Avalanche Fuji Snow Trace__](https://testnet.snowtrace.io/address/0x16843ac25Ccc58Aa7960ba05f61cBB17b36b130A)
 * - [__View Contract on Avalanche Snow Trace__](https://snowtrace.io/address/0x6946c5B38Ffea373b0a2340b4AEf0De8F6782e58)
 * - [__View Contract on Base Sepolia Basescan__](https://sepolia.basescan.org/address/0x6836F23d6171D74Ef62FcF776655aBcD2bcd62Ef)
 * - [__View Contract on Scroll Sepolia Scrollscan__](https://sepolia.scrollscan.com/address/0xbc46B4Aa41c055578306820013d4B65fff42711E)
 * - [__View Contract on Scroll Scrollscan__](https://scrollscan.com/address/0xB3bcD6da1eeB6c97258B3806A853A6dcD3B6C00c)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x6836F23d6171D74Ef62FcF776655aBcD2bcd62Ef)
 * - [__View Contract on Op Sepolia Blockscout__](https://optimism-sepolia.blockscout.com/address/0x8a3170AdbC67233196371226141736E4151e7C26)
 * - [__View Contract on Degen Degen Chain Explorer__](https://explorer.degen.tips/address/0x82cc052d1b17aC554a22A88D5876B56c6b51e95c)
 */
export const useConstantFlowAgreementV1GetAccountFlowInfo =
  /*#__PURE__*/ createUseReadContract({
    abi: constantFlowAgreementV1Abi,
    address: constantFlowAgreementV1Address,
    functionName: 'getAccountFlowInfo',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link constantFlowAgreementV1Abi}__ and `functionName` set to `"getNetFlow"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x2844c1BBdA121E9E43105630b9C8310e5c72744b)
 * - [__View Contract on Op Mainnet Optimism Explorer__](https://optimistic.etherscan.io/address/0x204C6f131bb7F258b2Ea1593f5309911d8E458eD)
 * - [__View Contract on Bnb Smart Chain Bsc Scan__](https://bscscan.com/address/0x49c38108870e74Cb9420C0991a85D3edd6363F75)
 * - [__View Contract on Gnosis Gnosisscan__](https://gnosisscan.io/address/0xEbdA4ceF883A7B12c4E669Ebc58927FBa8447C7D)
 * - [__View Contract on Polygon Polygon Scan__](https://polygonscan.com/address/0x6EeE6060f715257b970700bc2656De21dEdF074C)
 * - [__View Contract on Base Basescan__](https://basescan.org/address/0x19ba78B9cDB05A877718841c574325fdB53601bb)
 * - [__View Contract on Arbitrum One Arbiscan__](https://arbiscan.io/address/0x731FdBB12944973B500518aea61942381d7e240D)
 * - [__View Contract on Celo Celo Explorer__](https://celoscan.io/address/0x9d369e78e1a682cE0F8d9aD849BeA4FE1c3bD3Ad)
 * - [__View Contract on Avalanche Fuji Snow Trace__](https://testnet.snowtrace.io/address/0x16843ac25Ccc58Aa7960ba05f61cBB17b36b130A)
 * - [__View Contract on Avalanche Snow Trace__](https://snowtrace.io/address/0x6946c5B38Ffea373b0a2340b4AEf0De8F6782e58)
 * - [__View Contract on Base Sepolia Basescan__](https://sepolia.basescan.org/address/0x6836F23d6171D74Ef62FcF776655aBcD2bcd62Ef)
 * - [__View Contract on Scroll Sepolia Scrollscan__](https://sepolia.scrollscan.com/address/0xbc46B4Aa41c055578306820013d4B65fff42711E)
 * - [__View Contract on Scroll Scrollscan__](https://scrollscan.com/address/0xB3bcD6da1eeB6c97258B3806A853A6dcD3B6C00c)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x6836F23d6171D74Ef62FcF776655aBcD2bcd62Ef)
 * - [__View Contract on Op Sepolia Blockscout__](https://optimism-sepolia.blockscout.com/address/0x8a3170AdbC67233196371226141736E4151e7C26)
 * - [__View Contract on Degen Degen Chain Explorer__](https://explorer.degen.tips/address/0x82cc052d1b17aC554a22A88D5876B56c6b51e95c)
 */
export const useConstantFlowAgreementV1GetNetFlow =
  /*#__PURE__*/ createUseReadContract({
    abi: constantFlowAgreementV1Abi,
    address: constantFlowAgreementV1Address,
    functionName: 'getNetFlow',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link constantFlowAgreementV1Abi}__ and `functionName` set to `"addPermissions"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x2844c1BBdA121E9E43105630b9C8310e5c72744b)
 * - [__View Contract on Op Mainnet Optimism Explorer__](https://optimistic.etherscan.io/address/0x204C6f131bb7F258b2Ea1593f5309911d8E458eD)
 * - [__View Contract on Bnb Smart Chain Bsc Scan__](https://bscscan.com/address/0x49c38108870e74Cb9420C0991a85D3edd6363F75)
 * - [__View Contract on Gnosis Gnosisscan__](https://gnosisscan.io/address/0xEbdA4ceF883A7B12c4E669Ebc58927FBa8447C7D)
 * - [__View Contract on Polygon Polygon Scan__](https://polygonscan.com/address/0x6EeE6060f715257b970700bc2656De21dEdF074C)
 * - [__View Contract on Base Basescan__](https://basescan.org/address/0x19ba78B9cDB05A877718841c574325fdB53601bb)
 * - [__View Contract on Arbitrum One Arbiscan__](https://arbiscan.io/address/0x731FdBB12944973B500518aea61942381d7e240D)
 * - [__View Contract on Celo Celo Explorer__](https://celoscan.io/address/0x9d369e78e1a682cE0F8d9aD849BeA4FE1c3bD3Ad)
 * - [__View Contract on Avalanche Fuji Snow Trace__](https://testnet.snowtrace.io/address/0x16843ac25Ccc58Aa7960ba05f61cBB17b36b130A)
 * - [__View Contract on Avalanche Snow Trace__](https://snowtrace.io/address/0x6946c5B38Ffea373b0a2340b4AEf0De8F6782e58)
 * - [__View Contract on Base Sepolia Basescan__](https://sepolia.basescan.org/address/0x6836F23d6171D74Ef62FcF776655aBcD2bcd62Ef)
 * - [__View Contract on Scroll Sepolia Scrollscan__](https://sepolia.scrollscan.com/address/0xbc46B4Aa41c055578306820013d4B65fff42711E)
 * - [__View Contract on Scroll Scrollscan__](https://scrollscan.com/address/0xB3bcD6da1eeB6c97258B3806A853A6dcD3B6C00c)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x6836F23d6171D74Ef62FcF776655aBcD2bcd62Ef)
 * - [__View Contract on Op Sepolia Blockscout__](https://optimism-sepolia.blockscout.com/address/0x8a3170AdbC67233196371226141736E4151e7C26)
 * - [__View Contract on Degen Degen Chain Explorer__](https://explorer.degen.tips/address/0x82cc052d1b17aC554a22A88D5876B56c6b51e95c)
 */
export const useConstantFlowAgreementV1AddPermissions =
  /*#__PURE__*/ createUseReadContract({
    abi: constantFlowAgreementV1Abi,
    address: constantFlowAgreementV1Address,
    functionName: 'addPermissions',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link constantFlowAgreementV1Abi}__ and `functionName` set to `"removePermissions"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x2844c1BBdA121E9E43105630b9C8310e5c72744b)
 * - [__View Contract on Op Mainnet Optimism Explorer__](https://optimistic.etherscan.io/address/0x204C6f131bb7F258b2Ea1593f5309911d8E458eD)
 * - [__View Contract on Bnb Smart Chain Bsc Scan__](https://bscscan.com/address/0x49c38108870e74Cb9420C0991a85D3edd6363F75)
 * - [__View Contract on Gnosis Gnosisscan__](https://gnosisscan.io/address/0xEbdA4ceF883A7B12c4E669Ebc58927FBa8447C7D)
 * - [__View Contract on Polygon Polygon Scan__](https://polygonscan.com/address/0x6EeE6060f715257b970700bc2656De21dEdF074C)
 * - [__View Contract on Base Basescan__](https://basescan.org/address/0x19ba78B9cDB05A877718841c574325fdB53601bb)
 * - [__View Contract on Arbitrum One Arbiscan__](https://arbiscan.io/address/0x731FdBB12944973B500518aea61942381d7e240D)
 * - [__View Contract on Celo Celo Explorer__](https://celoscan.io/address/0x9d369e78e1a682cE0F8d9aD849BeA4FE1c3bD3Ad)
 * - [__View Contract on Avalanche Fuji Snow Trace__](https://testnet.snowtrace.io/address/0x16843ac25Ccc58Aa7960ba05f61cBB17b36b130A)
 * - [__View Contract on Avalanche Snow Trace__](https://snowtrace.io/address/0x6946c5B38Ffea373b0a2340b4AEf0De8F6782e58)
 * - [__View Contract on Base Sepolia Basescan__](https://sepolia.basescan.org/address/0x6836F23d6171D74Ef62FcF776655aBcD2bcd62Ef)
 * - [__View Contract on Scroll Sepolia Scrollscan__](https://sepolia.scrollscan.com/address/0xbc46B4Aa41c055578306820013d4B65fff42711E)
 * - [__View Contract on Scroll Scrollscan__](https://scrollscan.com/address/0xB3bcD6da1eeB6c97258B3806A853A6dcD3B6C00c)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x6836F23d6171D74Ef62FcF776655aBcD2bcd62Ef)
 * - [__View Contract on Op Sepolia Blockscout__](https://optimism-sepolia.blockscout.com/address/0x8a3170AdbC67233196371226141736E4151e7C26)
 * - [__View Contract on Degen Degen Chain Explorer__](https://explorer.degen.tips/address/0x82cc052d1b17aC554a22A88D5876B56c6b51e95c)
 */
export const useConstantFlowAgreementV1RemovePermissions =
  /*#__PURE__*/ createUseReadContract({
    abi: constantFlowAgreementV1Abi,
    address: constantFlowAgreementV1Address,
    functionName: 'removePermissions',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link constantFlowAgreementV1Abi}__ and `functionName` set to `"getFlowOperatorData"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x2844c1BBdA121E9E43105630b9C8310e5c72744b)
 * - [__View Contract on Op Mainnet Optimism Explorer__](https://optimistic.etherscan.io/address/0x204C6f131bb7F258b2Ea1593f5309911d8E458eD)
 * - [__View Contract on Bnb Smart Chain Bsc Scan__](https://bscscan.com/address/0x49c38108870e74Cb9420C0991a85D3edd6363F75)
 * - [__View Contract on Gnosis Gnosisscan__](https://gnosisscan.io/address/0xEbdA4ceF883A7B12c4E669Ebc58927FBa8447C7D)
 * - [__View Contract on Polygon Polygon Scan__](https://polygonscan.com/address/0x6EeE6060f715257b970700bc2656De21dEdF074C)
 * - [__View Contract on Base Basescan__](https://basescan.org/address/0x19ba78B9cDB05A877718841c574325fdB53601bb)
 * - [__View Contract on Arbitrum One Arbiscan__](https://arbiscan.io/address/0x731FdBB12944973B500518aea61942381d7e240D)
 * - [__View Contract on Celo Celo Explorer__](https://celoscan.io/address/0x9d369e78e1a682cE0F8d9aD849BeA4FE1c3bD3Ad)
 * - [__View Contract on Avalanche Fuji Snow Trace__](https://testnet.snowtrace.io/address/0x16843ac25Ccc58Aa7960ba05f61cBB17b36b130A)
 * - [__View Contract on Avalanche Snow Trace__](https://snowtrace.io/address/0x6946c5B38Ffea373b0a2340b4AEf0De8F6782e58)
 * - [__View Contract on Base Sepolia Basescan__](https://sepolia.basescan.org/address/0x6836F23d6171D74Ef62FcF776655aBcD2bcd62Ef)
 * - [__View Contract on Scroll Sepolia Scrollscan__](https://sepolia.scrollscan.com/address/0xbc46B4Aa41c055578306820013d4B65fff42711E)
 * - [__View Contract on Scroll Scrollscan__](https://scrollscan.com/address/0xB3bcD6da1eeB6c97258B3806A853A6dcD3B6C00c)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x6836F23d6171D74Ef62FcF776655aBcD2bcd62Ef)
 * - [__View Contract on Op Sepolia Blockscout__](https://optimism-sepolia.blockscout.com/address/0x8a3170AdbC67233196371226141736E4151e7C26)
 * - [__View Contract on Degen Degen Chain Explorer__](https://explorer.degen.tips/address/0x82cc052d1b17aC554a22A88D5876B56c6b51e95c)
 */
export const useConstantFlowAgreementV1GetFlowOperatorData =
  /*#__PURE__*/ createUseReadContract({
    abi: constantFlowAgreementV1Abi,
    address: constantFlowAgreementV1Address,
    functionName: 'getFlowOperatorData',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link constantFlowAgreementV1Abi}__ and `functionName` set to `"getFlowOperatorDataByID"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x2844c1BBdA121E9E43105630b9C8310e5c72744b)
 * - [__View Contract on Op Mainnet Optimism Explorer__](https://optimistic.etherscan.io/address/0x204C6f131bb7F258b2Ea1593f5309911d8E458eD)
 * - [__View Contract on Bnb Smart Chain Bsc Scan__](https://bscscan.com/address/0x49c38108870e74Cb9420C0991a85D3edd6363F75)
 * - [__View Contract on Gnosis Gnosisscan__](https://gnosisscan.io/address/0xEbdA4ceF883A7B12c4E669Ebc58927FBa8447C7D)
 * - [__View Contract on Polygon Polygon Scan__](https://polygonscan.com/address/0x6EeE6060f715257b970700bc2656De21dEdF074C)
 * - [__View Contract on Base Basescan__](https://basescan.org/address/0x19ba78B9cDB05A877718841c574325fdB53601bb)
 * - [__View Contract on Arbitrum One Arbiscan__](https://arbiscan.io/address/0x731FdBB12944973B500518aea61942381d7e240D)
 * - [__View Contract on Celo Celo Explorer__](https://celoscan.io/address/0x9d369e78e1a682cE0F8d9aD849BeA4FE1c3bD3Ad)
 * - [__View Contract on Avalanche Fuji Snow Trace__](https://testnet.snowtrace.io/address/0x16843ac25Ccc58Aa7960ba05f61cBB17b36b130A)
 * - [__View Contract on Avalanche Snow Trace__](https://snowtrace.io/address/0x6946c5B38Ffea373b0a2340b4AEf0De8F6782e58)
 * - [__View Contract on Base Sepolia Basescan__](https://sepolia.basescan.org/address/0x6836F23d6171D74Ef62FcF776655aBcD2bcd62Ef)
 * - [__View Contract on Scroll Sepolia Scrollscan__](https://sepolia.scrollscan.com/address/0xbc46B4Aa41c055578306820013d4B65fff42711E)
 * - [__View Contract on Scroll Scrollscan__](https://scrollscan.com/address/0xB3bcD6da1eeB6c97258B3806A853A6dcD3B6C00c)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x6836F23d6171D74Ef62FcF776655aBcD2bcd62Ef)
 * - [__View Contract on Op Sepolia Blockscout__](https://optimism-sepolia.blockscout.com/address/0x8a3170AdbC67233196371226141736E4151e7C26)
 * - [__View Contract on Degen Degen Chain Explorer__](https://explorer.degen.tips/address/0x82cc052d1b17aC554a22A88D5876B56c6b51e95c)
 */
export const useConstantFlowAgreementV1GetFlowOperatorDataById =
  /*#__PURE__*/ createUseReadContract({
    abi: constantFlowAgreementV1Abi,
    address: constantFlowAgreementV1Address,
    functionName: 'getFlowOperatorDataByID',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link constantFlowAgreementV1Abi}__
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x2844c1BBdA121E9E43105630b9C8310e5c72744b)
 * - [__View Contract on Op Mainnet Optimism Explorer__](https://optimistic.etherscan.io/address/0x204C6f131bb7F258b2Ea1593f5309911d8E458eD)
 * - [__View Contract on Bnb Smart Chain Bsc Scan__](https://bscscan.com/address/0x49c38108870e74Cb9420C0991a85D3edd6363F75)
 * - [__View Contract on Gnosis Gnosisscan__](https://gnosisscan.io/address/0xEbdA4ceF883A7B12c4E669Ebc58927FBa8447C7D)
 * - [__View Contract on Polygon Polygon Scan__](https://polygonscan.com/address/0x6EeE6060f715257b970700bc2656De21dEdF074C)
 * - [__View Contract on Base Basescan__](https://basescan.org/address/0x19ba78B9cDB05A877718841c574325fdB53601bb)
 * - [__View Contract on Arbitrum One Arbiscan__](https://arbiscan.io/address/0x731FdBB12944973B500518aea61942381d7e240D)
 * - [__View Contract on Celo Celo Explorer__](https://celoscan.io/address/0x9d369e78e1a682cE0F8d9aD849BeA4FE1c3bD3Ad)
 * - [__View Contract on Avalanche Fuji Snow Trace__](https://testnet.snowtrace.io/address/0x16843ac25Ccc58Aa7960ba05f61cBB17b36b130A)
 * - [__View Contract on Avalanche Snow Trace__](https://snowtrace.io/address/0x6946c5B38Ffea373b0a2340b4AEf0De8F6782e58)
 * - [__View Contract on Base Sepolia Basescan__](https://sepolia.basescan.org/address/0x6836F23d6171D74Ef62FcF776655aBcD2bcd62Ef)
 * - [__View Contract on Scroll Sepolia Scrollscan__](https://sepolia.scrollscan.com/address/0xbc46B4Aa41c055578306820013d4B65fff42711E)
 * - [__View Contract on Scroll Scrollscan__](https://scrollscan.com/address/0xB3bcD6da1eeB6c97258B3806A853A6dcD3B6C00c)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x6836F23d6171D74Ef62FcF776655aBcD2bcd62Ef)
 * - [__View Contract on Op Sepolia Blockscout__](https://optimism-sepolia.blockscout.com/address/0x8a3170AdbC67233196371226141736E4151e7C26)
 * - [__View Contract on Degen Degen Chain Explorer__](https://explorer.degen.tips/address/0x82cc052d1b17aC554a22A88D5876B56c6b51e95c)
 */
export const useConstantFlowAgreementV1Write =
  /*#__PURE__*/ createUseWriteContract({
    abi: constantFlowAgreementV1Abi,
    address: constantFlowAgreementV1Address,
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link constantFlowAgreementV1Abi}__ and `functionName` set to `"castrate"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x2844c1BBdA121E9E43105630b9C8310e5c72744b)
 * - [__View Contract on Op Mainnet Optimism Explorer__](https://optimistic.etherscan.io/address/0x204C6f131bb7F258b2Ea1593f5309911d8E458eD)
 * - [__View Contract on Bnb Smart Chain Bsc Scan__](https://bscscan.com/address/0x49c38108870e74Cb9420C0991a85D3edd6363F75)
 * - [__View Contract on Gnosis Gnosisscan__](https://gnosisscan.io/address/0xEbdA4ceF883A7B12c4E669Ebc58927FBa8447C7D)
 * - [__View Contract on Polygon Polygon Scan__](https://polygonscan.com/address/0x6EeE6060f715257b970700bc2656De21dEdF074C)
 * - [__View Contract on Base Basescan__](https://basescan.org/address/0x19ba78B9cDB05A877718841c574325fdB53601bb)
 * - [__View Contract on Arbitrum One Arbiscan__](https://arbiscan.io/address/0x731FdBB12944973B500518aea61942381d7e240D)
 * - [__View Contract on Celo Celo Explorer__](https://celoscan.io/address/0x9d369e78e1a682cE0F8d9aD849BeA4FE1c3bD3Ad)
 * - [__View Contract on Avalanche Fuji Snow Trace__](https://testnet.snowtrace.io/address/0x16843ac25Ccc58Aa7960ba05f61cBB17b36b130A)
 * - [__View Contract on Avalanche Snow Trace__](https://snowtrace.io/address/0x6946c5B38Ffea373b0a2340b4AEf0De8F6782e58)
 * - [__View Contract on Base Sepolia Basescan__](https://sepolia.basescan.org/address/0x6836F23d6171D74Ef62FcF776655aBcD2bcd62Ef)
 * - [__View Contract on Scroll Sepolia Scrollscan__](https://sepolia.scrollscan.com/address/0xbc46B4Aa41c055578306820013d4B65fff42711E)
 * - [__View Contract on Scroll Scrollscan__](https://scrollscan.com/address/0xB3bcD6da1eeB6c97258B3806A853A6dcD3B6C00c)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x6836F23d6171D74Ef62FcF776655aBcD2bcd62Ef)
 * - [__View Contract on Op Sepolia Blockscout__](https://optimism-sepolia.blockscout.com/address/0x8a3170AdbC67233196371226141736E4151e7C26)
 * - [__View Contract on Degen Degen Chain Explorer__](https://explorer.degen.tips/address/0x82cc052d1b17aC554a22A88D5876B56c6b51e95c)
 */
export const useConstantFlowAgreementV1Castrate =
  /*#__PURE__*/ createUseWriteContract({
    abi: constantFlowAgreementV1Abi,
    address: constantFlowAgreementV1Address,
    functionName: 'castrate',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link constantFlowAgreementV1Abi}__ and `functionName` set to `"updateCode"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x2844c1BBdA121E9E43105630b9C8310e5c72744b)
 * - [__View Contract on Op Mainnet Optimism Explorer__](https://optimistic.etherscan.io/address/0x204C6f131bb7F258b2Ea1593f5309911d8E458eD)
 * - [__View Contract on Bnb Smart Chain Bsc Scan__](https://bscscan.com/address/0x49c38108870e74Cb9420C0991a85D3edd6363F75)
 * - [__View Contract on Gnosis Gnosisscan__](https://gnosisscan.io/address/0xEbdA4ceF883A7B12c4E669Ebc58927FBa8447C7D)
 * - [__View Contract on Polygon Polygon Scan__](https://polygonscan.com/address/0x6EeE6060f715257b970700bc2656De21dEdF074C)
 * - [__View Contract on Base Basescan__](https://basescan.org/address/0x19ba78B9cDB05A877718841c574325fdB53601bb)
 * - [__View Contract on Arbitrum One Arbiscan__](https://arbiscan.io/address/0x731FdBB12944973B500518aea61942381d7e240D)
 * - [__View Contract on Celo Celo Explorer__](https://celoscan.io/address/0x9d369e78e1a682cE0F8d9aD849BeA4FE1c3bD3Ad)
 * - [__View Contract on Avalanche Fuji Snow Trace__](https://testnet.snowtrace.io/address/0x16843ac25Ccc58Aa7960ba05f61cBB17b36b130A)
 * - [__View Contract on Avalanche Snow Trace__](https://snowtrace.io/address/0x6946c5B38Ffea373b0a2340b4AEf0De8F6782e58)
 * - [__View Contract on Base Sepolia Basescan__](https://sepolia.basescan.org/address/0x6836F23d6171D74Ef62FcF776655aBcD2bcd62Ef)
 * - [__View Contract on Scroll Sepolia Scrollscan__](https://sepolia.scrollscan.com/address/0xbc46B4Aa41c055578306820013d4B65fff42711E)
 * - [__View Contract on Scroll Scrollscan__](https://scrollscan.com/address/0xB3bcD6da1eeB6c97258B3806A853A6dcD3B6C00c)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x6836F23d6171D74Ef62FcF776655aBcD2bcd62Ef)
 * - [__View Contract on Op Sepolia Blockscout__](https://optimism-sepolia.blockscout.com/address/0x8a3170AdbC67233196371226141736E4151e7C26)
 * - [__View Contract on Degen Degen Chain Explorer__](https://explorer.degen.tips/address/0x82cc052d1b17aC554a22A88D5876B56c6b51e95c)
 */
export const useConstantFlowAgreementV1UpdateCode =
  /*#__PURE__*/ createUseWriteContract({
    abi: constantFlowAgreementV1Abi,
    address: constantFlowAgreementV1Address,
    functionName: 'updateCode',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link constantFlowAgreementV1Abi}__ and `functionName` set to `"createFlow"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x2844c1BBdA121E9E43105630b9C8310e5c72744b)
 * - [__View Contract on Op Mainnet Optimism Explorer__](https://optimistic.etherscan.io/address/0x204C6f131bb7F258b2Ea1593f5309911d8E458eD)
 * - [__View Contract on Bnb Smart Chain Bsc Scan__](https://bscscan.com/address/0x49c38108870e74Cb9420C0991a85D3edd6363F75)
 * - [__View Contract on Gnosis Gnosisscan__](https://gnosisscan.io/address/0xEbdA4ceF883A7B12c4E669Ebc58927FBa8447C7D)
 * - [__View Contract on Polygon Polygon Scan__](https://polygonscan.com/address/0x6EeE6060f715257b970700bc2656De21dEdF074C)
 * - [__View Contract on Base Basescan__](https://basescan.org/address/0x19ba78B9cDB05A877718841c574325fdB53601bb)
 * - [__View Contract on Arbitrum One Arbiscan__](https://arbiscan.io/address/0x731FdBB12944973B500518aea61942381d7e240D)
 * - [__View Contract on Celo Celo Explorer__](https://celoscan.io/address/0x9d369e78e1a682cE0F8d9aD849BeA4FE1c3bD3Ad)
 * - [__View Contract on Avalanche Fuji Snow Trace__](https://testnet.snowtrace.io/address/0x16843ac25Ccc58Aa7960ba05f61cBB17b36b130A)
 * - [__View Contract on Avalanche Snow Trace__](https://snowtrace.io/address/0x6946c5B38Ffea373b0a2340b4AEf0De8F6782e58)
 * - [__View Contract on Base Sepolia Basescan__](https://sepolia.basescan.org/address/0x6836F23d6171D74Ef62FcF776655aBcD2bcd62Ef)
 * - [__View Contract on Scroll Sepolia Scrollscan__](https://sepolia.scrollscan.com/address/0xbc46B4Aa41c055578306820013d4B65fff42711E)
 * - [__View Contract on Scroll Scrollscan__](https://scrollscan.com/address/0xB3bcD6da1eeB6c97258B3806A853A6dcD3B6C00c)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x6836F23d6171D74Ef62FcF776655aBcD2bcd62Ef)
 * - [__View Contract on Op Sepolia Blockscout__](https://optimism-sepolia.blockscout.com/address/0x8a3170AdbC67233196371226141736E4151e7C26)
 * - [__View Contract on Degen Degen Chain Explorer__](https://explorer.degen.tips/address/0x82cc052d1b17aC554a22A88D5876B56c6b51e95c)
 */
export const useConstantFlowAgreementV1CreateFlow =
  /*#__PURE__*/ createUseWriteContract({
    abi: constantFlowAgreementV1Abi,
    address: constantFlowAgreementV1Address,
    functionName: 'createFlow',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link constantFlowAgreementV1Abi}__ and `functionName` set to `"updateFlow"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x2844c1BBdA121E9E43105630b9C8310e5c72744b)
 * - [__View Contract on Op Mainnet Optimism Explorer__](https://optimistic.etherscan.io/address/0x204C6f131bb7F258b2Ea1593f5309911d8E458eD)
 * - [__View Contract on Bnb Smart Chain Bsc Scan__](https://bscscan.com/address/0x49c38108870e74Cb9420C0991a85D3edd6363F75)
 * - [__View Contract on Gnosis Gnosisscan__](https://gnosisscan.io/address/0xEbdA4ceF883A7B12c4E669Ebc58927FBa8447C7D)
 * - [__View Contract on Polygon Polygon Scan__](https://polygonscan.com/address/0x6EeE6060f715257b970700bc2656De21dEdF074C)
 * - [__View Contract on Base Basescan__](https://basescan.org/address/0x19ba78B9cDB05A877718841c574325fdB53601bb)
 * - [__View Contract on Arbitrum One Arbiscan__](https://arbiscan.io/address/0x731FdBB12944973B500518aea61942381d7e240D)
 * - [__View Contract on Celo Celo Explorer__](https://celoscan.io/address/0x9d369e78e1a682cE0F8d9aD849BeA4FE1c3bD3Ad)
 * - [__View Contract on Avalanche Fuji Snow Trace__](https://testnet.snowtrace.io/address/0x16843ac25Ccc58Aa7960ba05f61cBB17b36b130A)
 * - [__View Contract on Avalanche Snow Trace__](https://snowtrace.io/address/0x6946c5B38Ffea373b0a2340b4AEf0De8F6782e58)
 * - [__View Contract on Base Sepolia Basescan__](https://sepolia.basescan.org/address/0x6836F23d6171D74Ef62FcF776655aBcD2bcd62Ef)
 * - [__View Contract on Scroll Sepolia Scrollscan__](https://sepolia.scrollscan.com/address/0xbc46B4Aa41c055578306820013d4B65fff42711E)
 * - [__View Contract on Scroll Scrollscan__](https://scrollscan.com/address/0xB3bcD6da1eeB6c97258B3806A853A6dcD3B6C00c)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x6836F23d6171D74Ef62FcF776655aBcD2bcd62Ef)
 * - [__View Contract on Op Sepolia Blockscout__](https://optimism-sepolia.blockscout.com/address/0x8a3170AdbC67233196371226141736E4151e7C26)
 * - [__View Contract on Degen Degen Chain Explorer__](https://explorer.degen.tips/address/0x82cc052d1b17aC554a22A88D5876B56c6b51e95c)
 */
export const useConstantFlowAgreementV1UpdateFlow =
  /*#__PURE__*/ createUseWriteContract({
    abi: constantFlowAgreementV1Abi,
    address: constantFlowAgreementV1Address,
    functionName: 'updateFlow',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link constantFlowAgreementV1Abi}__ and `functionName` set to `"deleteFlow"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x2844c1BBdA121E9E43105630b9C8310e5c72744b)
 * - [__View Contract on Op Mainnet Optimism Explorer__](https://optimistic.etherscan.io/address/0x204C6f131bb7F258b2Ea1593f5309911d8E458eD)
 * - [__View Contract on Bnb Smart Chain Bsc Scan__](https://bscscan.com/address/0x49c38108870e74Cb9420C0991a85D3edd6363F75)
 * - [__View Contract on Gnosis Gnosisscan__](https://gnosisscan.io/address/0xEbdA4ceF883A7B12c4E669Ebc58927FBa8447C7D)
 * - [__View Contract on Polygon Polygon Scan__](https://polygonscan.com/address/0x6EeE6060f715257b970700bc2656De21dEdF074C)
 * - [__View Contract on Base Basescan__](https://basescan.org/address/0x19ba78B9cDB05A877718841c574325fdB53601bb)
 * - [__View Contract on Arbitrum One Arbiscan__](https://arbiscan.io/address/0x731FdBB12944973B500518aea61942381d7e240D)
 * - [__View Contract on Celo Celo Explorer__](https://celoscan.io/address/0x9d369e78e1a682cE0F8d9aD849BeA4FE1c3bD3Ad)
 * - [__View Contract on Avalanche Fuji Snow Trace__](https://testnet.snowtrace.io/address/0x16843ac25Ccc58Aa7960ba05f61cBB17b36b130A)
 * - [__View Contract on Avalanche Snow Trace__](https://snowtrace.io/address/0x6946c5B38Ffea373b0a2340b4AEf0De8F6782e58)
 * - [__View Contract on Base Sepolia Basescan__](https://sepolia.basescan.org/address/0x6836F23d6171D74Ef62FcF776655aBcD2bcd62Ef)
 * - [__View Contract on Scroll Sepolia Scrollscan__](https://sepolia.scrollscan.com/address/0xbc46B4Aa41c055578306820013d4B65fff42711E)
 * - [__View Contract on Scroll Scrollscan__](https://scrollscan.com/address/0xB3bcD6da1eeB6c97258B3806A853A6dcD3B6C00c)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x6836F23d6171D74Ef62FcF776655aBcD2bcd62Ef)
 * - [__View Contract on Op Sepolia Blockscout__](https://optimism-sepolia.blockscout.com/address/0x8a3170AdbC67233196371226141736E4151e7C26)
 * - [__View Contract on Degen Degen Chain Explorer__](https://explorer.degen.tips/address/0x82cc052d1b17aC554a22A88D5876B56c6b51e95c)
 */
export const useConstantFlowAgreementV1DeleteFlow =
  /*#__PURE__*/ createUseWriteContract({
    abi: constantFlowAgreementV1Abi,
    address: constantFlowAgreementV1Address,
    functionName: 'deleteFlow',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link constantFlowAgreementV1Abi}__ and `functionName` set to `"createFlowByOperator"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x2844c1BBdA121E9E43105630b9C8310e5c72744b)
 * - [__View Contract on Op Mainnet Optimism Explorer__](https://optimistic.etherscan.io/address/0x204C6f131bb7F258b2Ea1593f5309911d8E458eD)
 * - [__View Contract on Bnb Smart Chain Bsc Scan__](https://bscscan.com/address/0x49c38108870e74Cb9420C0991a85D3edd6363F75)
 * - [__View Contract on Gnosis Gnosisscan__](https://gnosisscan.io/address/0xEbdA4ceF883A7B12c4E669Ebc58927FBa8447C7D)
 * - [__View Contract on Polygon Polygon Scan__](https://polygonscan.com/address/0x6EeE6060f715257b970700bc2656De21dEdF074C)
 * - [__View Contract on Base Basescan__](https://basescan.org/address/0x19ba78B9cDB05A877718841c574325fdB53601bb)
 * - [__View Contract on Arbitrum One Arbiscan__](https://arbiscan.io/address/0x731FdBB12944973B500518aea61942381d7e240D)
 * - [__View Contract on Celo Celo Explorer__](https://celoscan.io/address/0x9d369e78e1a682cE0F8d9aD849BeA4FE1c3bD3Ad)
 * - [__View Contract on Avalanche Fuji Snow Trace__](https://testnet.snowtrace.io/address/0x16843ac25Ccc58Aa7960ba05f61cBB17b36b130A)
 * - [__View Contract on Avalanche Snow Trace__](https://snowtrace.io/address/0x6946c5B38Ffea373b0a2340b4AEf0De8F6782e58)
 * - [__View Contract on Base Sepolia Basescan__](https://sepolia.basescan.org/address/0x6836F23d6171D74Ef62FcF776655aBcD2bcd62Ef)
 * - [__View Contract on Scroll Sepolia Scrollscan__](https://sepolia.scrollscan.com/address/0xbc46B4Aa41c055578306820013d4B65fff42711E)
 * - [__View Contract on Scroll Scrollscan__](https://scrollscan.com/address/0xB3bcD6da1eeB6c97258B3806A853A6dcD3B6C00c)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x6836F23d6171D74Ef62FcF776655aBcD2bcd62Ef)
 * - [__View Contract on Op Sepolia Blockscout__](https://optimism-sepolia.blockscout.com/address/0x8a3170AdbC67233196371226141736E4151e7C26)
 * - [__View Contract on Degen Degen Chain Explorer__](https://explorer.degen.tips/address/0x82cc052d1b17aC554a22A88D5876B56c6b51e95c)
 */
export const useConstantFlowAgreementV1CreateFlowByOperator =
  /*#__PURE__*/ createUseWriteContract({
    abi: constantFlowAgreementV1Abi,
    address: constantFlowAgreementV1Address,
    functionName: 'createFlowByOperator',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link constantFlowAgreementV1Abi}__ and `functionName` set to `"updateFlowByOperator"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x2844c1BBdA121E9E43105630b9C8310e5c72744b)
 * - [__View Contract on Op Mainnet Optimism Explorer__](https://optimistic.etherscan.io/address/0x204C6f131bb7F258b2Ea1593f5309911d8E458eD)
 * - [__View Contract on Bnb Smart Chain Bsc Scan__](https://bscscan.com/address/0x49c38108870e74Cb9420C0991a85D3edd6363F75)
 * - [__View Contract on Gnosis Gnosisscan__](https://gnosisscan.io/address/0xEbdA4ceF883A7B12c4E669Ebc58927FBa8447C7D)
 * - [__View Contract on Polygon Polygon Scan__](https://polygonscan.com/address/0x6EeE6060f715257b970700bc2656De21dEdF074C)
 * - [__View Contract on Base Basescan__](https://basescan.org/address/0x19ba78B9cDB05A877718841c574325fdB53601bb)
 * - [__View Contract on Arbitrum One Arbiscan__](https://arbiscan.io/address/0x731FdBB12944973B500518aea61942381d7e240D)
 * - [__View Contract on Celo Celo Explorer__](https://celoscan.io/address/0x9d369e78e1a682cE0F8d9aD849BeA4FE1c3bD3Ad)
 * - [__View Contract on Avalanche Fuji Snow Trace__](https://testnet.snowtrace.io/address/0x16843ac25Ccc58Aa7960ba05f61cBB17b36b130A)
 * - [__View Contract on Avalanche Snow Trace__](https://snowtrace.io/address/0x6946c5B38Ffea373b0a2340b4AEf0De8F6782e58)
 * - [__View Contract on Base Sepolia Basescan__](https://sepolia.basescan.org/address/0x6836F23d6171D74Ef62FcF776655aBcD2bcd62Ef)
 * - [__View Contract on Scroll Sepolia Scrollscan__](https://sepolia.scrollscan.com/address/0xbc46B4Aa41c055578306820013d4B65fff42711E)
 * - [__View Contract on Scroll Scrollscan__](https://scrollscan.com/address/0xB3bcD6da1eeB6c97258B3806A853A6dcD3B6C00c)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x6836F23d6171D74Ef62FcF776655aBcD2bcd62Ef)
 * - [__View Contract on Op Sepolia Blockscout__](https://optimism-sepolia.blockscout.com/address/0x8a3170AdbC67233196371226141736E4151e7C26)
 * - [__View Contract on Degen Degen Chain Explorer__](https://explorer.degen.tips/address/0x82cc052d1b17aC554a22A88D5876B56c6b51e95c)
 */
export const useConstantFlowAgreementV1UpdateFlowByOperator =
  /*#__PURE__*/ createUseWriteContract({
    abi: constantFlowAgreementV1Abi,
    address: constantFlowAgreementV1Address,
    functionName: 'updateFlowByOperator',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link constantFlowAgreementV1Abi}__ and `functionName` set to `"deleteFlowByOperator"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x2844c1BBdA121E9E43105630b9C8310e5c72744b)
 * - [__View Contract on Op Mainnet Optimism Explorer__](https://optimistic.etherscan.io/address/0x204C6f131bb7F258b2Ea1593f5309911d8E458eD)
 * - [__View Contract on Bnb Smart Chain Bsc Scan__](https://bscscan.com/address/0x49c38108870e74Cb9420C0991a85D3edd6363F75)
 * - [__View Contract on Gnosis Gnosisscan__](https://gnosisscan.io/address/0xEbdA4ceF883A7B12c4E669Ebc58927FBa8447C7D)
 * - [__View Contract on Polygon Polygon Scan__](https://polygonscan.com/address/0x6EeE6060f715257b970700bc2656De21dEdF074C)
 * - [__View Contract on Base Basescan__](https://basescan.org/address/0x19ba78B9cDB05A877718841c574325fdB53601bb)
 * - [__View Contract on Arbitrum One Arbiscan__](https://arbiscan.io/address/0x731FdBB12944973B500518aea61942381d7e240D)
 * - [__View Contract on Celo Celo Explorer__](https://celoscan.io/address/0x9d369e78e1a682cE0F8d9aD849BeA4FE1c3bD3Ad)
 * - [__View Contract on Avalanche Fuji Snow Trace__](https://testnet.snowtrace.io/address/0x16843ac25Ccc58Aa7960ba05f61cBB17b36b130A)
 * - [__View Contract on Avalanche Snow Trace__](https://snowtrace.io/address/0x6946c5B38Ffea373b0a2340b4AEf0De8F6782e58)
 * - [__View Contract on Base Sepolia Basescan__](https://sepolia.basescan.org/address/0x6836F23d6171D74Ef62FcF776655aBcD2bcd62Ef)
 * - [__View Contract on Scroll Sepolia Scrollscan__](https://sepolia.scrollscan.com/address/0xbc46B4Aa41c055578306820013d4B65fff42711E)
 * - [__View Contract on Scroll Scrollscan__](https://scrollscan.com/address/0xB3bcD6da1eeB6c97258B3806A853A6dcD3B6C00c)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x6836F23d6171D74Ef62FcF776655aBcD2bcd62Ef)
 * - [__View Contract on Op Sepolia Blockscout__](https://optimism-sepolia.blockscout.com/address/0x8a3170AdbC67233196371226141736E4151e7C26)
 * - [__View Contract on Degen Degen Chain Explorer__](https://explorer.degen.tips/address/0x82cc052d1b17aC554a22A88D5876B56c6b51e95c)
 */
export const useConstantFlowAgreementV1DeleteFlowByOperator =
  /*#__PURE__*/ createUseWriteContract({
    abi: constantFlowAgreementV1Abi,
    address: constantFlowAgreementV1Address,
    functionName: 'deleteFlowByOperator',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link constantFlowAgreementV1Abi}__ and `functionName` set to `"increaseFlowRateAllowance"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x2844c1BBdA121E9E43105630b9C8310e5c72744b)
 * - [__View Contract on Op Mainnet Optimism Explorer__](https://optimistic.etherscan.io/address/0x204C6f131bb7F258b2Ea1593f5309911d8E458eD)
 * - [__View Contract on Bnb Smart Chain Bsc Scan__](https://bscscan.com/address/0x49c38108870e74Cb9420C0991a85D3edd6363F75)
 * - [__View Contract on Gnosis Gnosisscan__](https://gnosisscan.io/address/0xEbdA4ceF883A7B12c4E669Ebc58927FBa8447C7D)
 * - [__View Contract on Polygon Polygon Scan__](https://polygonscan.com/address/0x6EeE6060f715257b970700bc2656De21dEdF074C)
 * - [__View Contract on Base Basescan__](https://basescan.org/address/0x19ba78B9cDB05A877718841c574325fdB53601bb)
 * - [__View Contract on Arbitrum One Arbiscan__](https://arbiscan.io/address/0x731FdBB12944973B500518aea61942381d7e240D)
 * - [__View Contract on Celo Celo Explorer__](https://celoscan.io/address/0x9d369e78e1a682cE0F8d9aD849BeA4FE1c3bD3Ad)
 * - [__View Contract on Avalanche Fuji Snow Trace__](https://testnet.snowtrace.io/address/0x16843ac25Ccc58Aa7960ba05f61cBB17b36b130A)
 * - [__View Contract on Avalanche Snow Trace__](https://snowtrace.io/address/0x6946c5B38Ffea373b0a2340b4AEf0De8F6782e58)
 * - [__View Contract on Base Sepolia Basescan__](https://sepolia.basescan.org/address/0x6836F23d6171D74Ef62FcF776655aBcD2bcd62Ef)
 * - [__View Contract on Scroll Sepolia Scrollscan__](https://sepolia.scrollscan.com/address/0xbc46B4Aa41c055578306820013d4B65fff42711E)
 * - [__View Contract on Scroll Scrollscan__](https://scrollscan.com/address/0xB3bcD6da1eeB6c97258B3806A853A6dcD3B6C00c)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x6836F23d6171D74Ef62FcF776655aBcD2bcd62Ef)
 * - [__View Contract on Op Sepolia Blockscout__](https://optimism-sepolia.blockscout.com/address/0x8a3170AdbC67233196371226141736E4151e7C26)
 * - [__View Contract on Degen Degen Chain Explorer__](https://explorer.degen.tips/address/0x82cc052d1b17aC554a22A88D5876B56c6b51e95c)
 */
export const useConstantFlowAgreementV1IncreaseFlowRateAllowance =
  /*#__PURE__*/ createUseWriteContract({
    abi: constantFlowAgreementV1Abi,
    address: constantFlowAgreementV1Address,
    functionName: 'increaseFlowRateAllowance',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link constantFlowAgreementV1Abi}__ and `functionName` set to `"decreaseFlowRateAllowance"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x2844c1BBdA121E9E43105630b9C8310e5c72744b)
 * - [__View Contract on Op Mainnet Optimism Explorer__](https://optimistic.etherscan.io/address/0x204C6f131bb7F258b2Ea1593f5309911d8E458eD)
 * - [__View Contract on Bnb Smart Chain Bsc Scan__](https://bscscan.com/address/0x49c38108870e74Cb9420C0991a85D3edd6363F75)
 * - [__View Contract on Gnosis Gnosisscan__](https://gnosisscan.io/address/0xEbdA4ceF883A7B12c4E669Ebc58927FBa8447C7D)
 * - [__View Contract on Polygon Polygon Scan__](https://polygonscan.com/address/0x6EeE6060f715257b970700bc2656De21dEdF074C)
 * - [__View Contract on Base Basescan__](https://basescan.org/address/0x19ba78B9cDB05A877718841c574325fdB53601bb)
 * - [__View Contract on Arbitrum One Arbiscan__](https://arbiscan.io/address/0x731FdBB12944973B500518aea61942381d7e240D)
 * - [__View Contract on Celo Celo Explorer__](https://celoscan.io/address/0x9d369e78e1a682cE0F8d9aD849BeA4FE1c3bD3Ad)
 * - [__View Contract on Avalanche Fuji Snow Trace__](https://testnet.snowtrace.io/address/0x16843ac25Ccc58Aa7960ba05f61cBB17b36b130A)
 * - [__View Contract on Avalanche Snow Trace__](https://snowtrace.io/address/0x6946c5B38Ffea373b0a2340b4AEf0De8F6782e58)
 * - [__View Contract on Base Sepolia Basescan__](https://sepolia.basescan.org/address/0x6836F23d6171D74Ef62FcF776655aBcD2bcd62Ef)
 * - [__View Contract on Scroll Sepolia Scrollscan__](https://sepolia.scrollscan.com/address/0xbc46B4Aa41c055578306820013d4B65fff42711E)
 * - [__View Contract on Scroll Scrollscan__](https://scrollscan.com/address/0xB3bcD6da1eeB6c97258B3806A853A6dcD3B6C00c)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x6836F23d6171D74Ef62FcF776655aBcD2bcd62Ef)
 * - [__View Contract on Op Sepolia Blockscout__](https://optimism-sepolia.blockscout.com/address/0x8a3170AdbC67233196371226141736E4151e7C26)
 * - [__View Contract on Degen Degen Chain Explorer__](https://explorer.degen.tips/address/0x82cc052d1b17aC554a22A88D5876B56c6b51e95c)
 */
export const useConstantFlowAgreementV1DecreaseFlowRateAllowance =
  /*#__PURE__*/ createUseWriteContract({
    abi: constantFlowAgreementV1Abi,
    address: constantFlowAgreementV1Address,
    functionName: 'decreaseFlowRateAllowance',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link constantFlowAgreementV1Abi}__ and `functionName` set to `"updateFlowOperatorPermissions"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x2844c1BBdA121E9E43105630b9C8310e5c72744b)
 * - [__View Contract on Op Mainnet Optimism Explorer__](https://optimistic.etherscan.io/address/0x204C6f131bb7F258b2Ea1593f5309911d8E458eD)
 * - [__View Contract on Bnb Smart Chain Bsc Scan__](https://bscscan.com/address/0x49c38108870e74Cb9420C0991a85D3edd6363F75)
 * - [__View Contract on Gnosis Gnosisscan__](https://gnosisscan.io/address/0xEbdA4ceF883A7B12c4E669Ebc58927FBa8447C7D)
 * - [__View Contract on Polygon Polygon Scan__](https://polygonscan.com/address/0x6EeE6060f715257b970700bc2656De21dEdF074C)
 * - [__View Contract on Base Basescan__](https://basescan.org/address/0x19ba78B9cDB05A877718841c574325fdB53601bb)
 * - [__View Contract on Arbitrum One Arbiscan__](https://arbiscan.io/address/0x731FdBB12944973B500518aea61942381d7e240D)
 * - [__View Contract on Celo Celo Explorer__](https://celoscan.io/address/0x9d369e78e1a682cE0F8d9aD849BeA4FE1c3bD3Ad)
 * - [__View Contract on Avalanche Fuji Snow Trace__](https://testnet.snowtrace.io/address/0x16843ac25Ccc58Aa7960ba05f61cBB17b36b130A)
 * - [__View Contract on Avalanche Snow Trace__](https://snowtrace.io/address/0x6946c5B38Ffea373b0a2340b4AEf0De8F6782e58)
 * - [__View Contract on Base Sepolia Basescan__](https://sepolia.basescan.org/address/0x6836F23d6171D74Ef62FcF776655aBcD2bcd62Ef)
 * - [__View Contract on Scroll Sepolia Scrollscan__](https://sepolia.scrollscan.com/address/0xbc46B4Aa41c055578306820013d4B65fff42711E)
 * - [__View Contract on Scroll Scrollscan__](https://scrollscan.com/address/0xB3bcD6da1eeB6c97258B3806A853A6dcD3B6C00c)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x6836F23d6171D74Ef62FcF776655aBcD2bcd62Ef)
 * - [__View Contract on Op Sepolia Blockscout__](https://optimism-sepolia.blockscout.com/address/0x8a3170AdbC67233196371226141736E4151e7C26)
 * - [__View Contract on Degen Degen Chain Explorer__](https://explorer.degen.tips/address/0x82cc052d1b17aC554a22A88D5876B56c6b51e95c)
 */
export const useConstantFlowAgreementV1UpdateFlowOperatorPermissions =
  /*#__PURE__*/ createUseWriteContract({
    abi: constantFlowAgreementV1Abi,
    address: constantFlowAgreementV1Address,
    functionName: 'updateFlowOperatorPermissions',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link constantFlowAgreementV1Abi}__ and `functionName` set to `"increaseFlowRateAllowanceWithPermissions"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x2844c1BBdA121E9E43105630b9C8310e5c72744b)
 * - [__View Contract on Op Mainnet Optimism Explorer__](https://optimistic.etherscan.io/address/0x204C6f131bb7F258b2Ea1593f5309911d8E458eD)
 * - [__View Contract on Bnb Smart Chain Bsc Scan__](https://bscscan.com/address/0x49c38108870e74Cb9420C0991a85D3edd6363F75)
 * - [__View Contract on Gnosis Gnosisscan__](https://gnosisscan.io/address/0xEbdA4ceF883A7B12c4E669Ebc58927FBa8447C7D)
 * - [__View Contract on Polygon Polygon Scan__](https://polygonscan.com/address/0x6EeE6060f715257b970700bc2656De21dEdF074C)
 * - [__View Contract on Base Basescan__](https://basescan.org/address/0x19ba78B9cDB05A877718841c574325fdB53601bb)
 * - [__View Contract on Arbitrum One Arbiscan__](https://arbiscan.io/address/0x731FdBB12944973B500518aea61942381d7e240D)
 * - [__View Contract on Celo Celo Explorer__](https://celoscan.io/address/0x9d369e78e1a682cE0F8d9aD849BeA4FE1c3bD3Ad)
 * - [__View Contract on Avalanche Fuji Snow Trace__](https://testnet.snowtrace.io/address/0x16843ac25Ccc58Aa7960ba05f61cBB17b36b130A)
 * - [__View Contract on Avalanche Snow Trace__](https://snowtrace.io/address/0x6946c5B38Ffea373b0a2340b4AEf0De8F6782e58)
 * - [__View Contract on Base Sepolia Basescan__](https://sepolia.basescan.org/address/0x6836F23d6171D74Ef62FcF776655aBcD2bcd62Ef)
 * - [__View Contract on Scroll Sepolia Scrollscan__](https://sepolia.scrollscan.com/address/0xbc46B4Aa41c055578306820013d4B65fff42711E)
 * - [__View Contract on Scroll Scrollscan__](https://scrollscan.com/address/0xB3bcD6da1eeB6c97258B3806A853A6dcD3B6C00c)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x6836F23d6171D74Ef62FcF776655aBcD2bcd62Ef)
 * - [__View Contract on Op Sepolia Blockscout__](https://optimism-sepolia.blockscout.com/address/0x8a3170AdbC67233196371226141736E4151e7C26)
 * - [__View Contract on Degen Degen Chain Explorer__](https://explorer.degen.tips/address/0x82cc052d1b17aC554a22A88D5876B56c6b51e95c)
 */
export const useConstantFlowAgreementV1IncreaseFlowRateAllowanceWithPermissions =
  /*#__PURE__*/ createUseWriteContract({
    abi: constantFlowAgreementV1Abi,
    address: constantFlowAgreementV1Address,
    functionName: 'increaseFlowRateAllowanceWithPermissions',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link constantFlowAgreementV1Abi}__ and `functionName` set to `"decreaseFlowRateAllowanceWithPermissions"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x2844c1BBdA121E9E43105630b9C8310e5c72744b)
 * - [__View Contract on Op Mainnet Optimism Explorer__](https://optimistic.etherscan.io/address/0x204C6f131bb7F258b2Ea1593f5309911d8E458eD)
 * - [__View Contract on Bnb Smart Chain Bsc Scan__](https://bscscan.com/address/0x49c38108870e74Cb9420C0991a85D3edd6363F75)
 * - [__View Contract on Gnosis Gnosisscan__](https://gnosisscan.io/address/0xEbdA4ceF883A7B12c4E669Ebc58927FBa8447C7D)
 * - [__View Contract on Polygon Polygon Scan__](https://polygonscan.com/address/0x6EeE6060f715257b970700bc2656De21dEdF074C)
 * - [__View Contract on Base Basescan__](https://basescan.org/address/0x19ba78B9cDB05A877718841c574325fdB53601bb)
 * - [__View Contract on Arbitrum One Arbiscan__](https://arbiscan.io/address/0x731FdBB12944973B500518aea61942381d7e240D)
 * - [__View Contract on Celo Celo Explorer__](https://celoscan.io/address/0x9d369e78e1a682cE0F8d9aD849BeA4FE1c3bD3Ad)
 * - [__View Contract on Avalanche Fuji Snow Trace__](https://testnet.snowtrace.io/address/0x16843ac25Ccc58Aa7960ba05f61cBB17b36b130A)
 * - [__View Contract on Avalanche Snow Trace__](https://snowtrace.io/address/0x6946c5B38Ffea373b0a2340b4AEf0De8F6782e58)
 * - [__View Contract on Base Sepolia Basescan__](https://sepolia.basescan.org/address/0x6836F23d6171D74Ef62FcF776655aBcD2bcd62Ef)
 * - [__View Contract on Scroll Sepolia Scrollscan__](https://sepolia.scrollscan.com/address/0xbc46B4Aa41c055578306820013d4B65fff42711E)
 * - [__View Contract on Scroll Scrollscan__](https://scrollscan.com/address/0xB3bcD6da1eeB6c97258B3806A853A6dcD3B6C00c)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x6836F23d6171D74Ef62FcF776655aBcD2bcd62Ef)
 * - [__View Contract on Op Sepolia Blockscout__](https://optimism-sepolia.blockscout.com/address/0x8a3170AdbC67233196371226141736E4151e7C26)
 * - [__View Contract on Degen Degen Chain Explorer__](https://explorer.degen.tips/address/0x82cc052d1b17aC554a22A88D5876B56c6b51e95c)
 */
export const useConstantFlowAgreementV1DecreaseFlowRateAllowanceWithPermissions =
  /*#__PURE__*/ createUseWriteContract({
    abi: constantFlowAgreementV1Abi,
    address: constantFlowAgreementV1Address,
    functionName: 'decreaseFlowRateAllowanceWithPermissions',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link constantFlowAgreementV1Abi}__ and `functionName` set to `"authorizeFlowOperatorWithFullControl"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x2844c1BBdA121E9E43105630b9C8310e5c72744b)
 * - [__View Contract on Op Mainnet Optimism Explorer__](https://optimistic.etherscan.io/address/0x204C6f131bb7F258b2Ea1593f5309911d8E458eD)
 * - [__View Contract on Bnb Smart Chain Bsc Scan__](https://bscscan.com/address/0x49c38108870e74Cb9420C0991a85D3edd6363F75)
 * - [__View Contract on Gnosis Gnosisscan__](https://gnosisscan.io/address/0xEbdA4ceF883A7B12c4E669Ebc58927FBa8447C7D)
 * - [__View Contract on Polygon Polygon Scan__](https://polygonscan.com/address/0x6EeE6060f715257b970700bc2656De21dEdF074C)
 * - [__View Contract on Base Basescan__](https://basescan.org/address/0x19ba78B9cDB05A877718841c574325fdB53601bb)
 * - [__View Contract on Arbitrum One Arbiscan__](https://arbiscan.io/address/0x731FdBB12944973B500518aea61942381d7e240D)
 * - [__View Contract on Celo Celo Explorer__](https://celoscan.io/address/0x9d369e78e1a682cE0F8d9aD849BeA4FE1c3bD3Ad)
 * - [__View Contract on Avalanche Fuji Snow Trace__](https://testnet.snowtrace.io/address/0x16843ac25Ccc58Aa7960ba05f61cBB17b36b130A)
 * - [__View Contract on Avalanche Snow Trace__](https://snowtrace.io/address/0x6946c5B38Ffea373b0a2340b4AEf0De8F6782e58)
 * - [__View Contract on Base Sepolia Basescan__](https://sepolia.basescan.org/address/0x6836F23d6171D74Ef62FcF776655aBcD2bcd62Ef)
 * - [__View Contract on Scroll Sepolia Scrollscan__](https://sepolia.scrollscan.com/address/0xbc46B4Aa41c055578306820013d4B65fff42711E)
 * - [__View Contract on Scroll Scrollscan__](https://scrollscan.com/address/0xB3bcD6da1eeB6c97258B3806A853A6dcD3B6C00c)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x6836F23d6171D74Ef62FcF776655aBcD2bcd62Ef)
 * - [__View Contract on Op Sepolia Blockscout__](https://optimism-sepolia.blockscout.com/address/0x8a3170AdbC67233196371226141736E4151e7C26)
 * - [__View Contract on Degen Degen Chain Explorer__](https://explorer.degen.tips/address/0x82cc052d1b17aC554a22A88D5876B56c6b51e95c)
 */
export const useConstantFlowAgreementV1AuthorizeFlowOperatorWithFullControl =
  /*#__PURE__*/ createUseWriteContract({
    abi: constantFlowAgreementV1Abi,
    address: constantFlowAgreementV1Address,
    functionName: 'authorizeFlowOperatorWithFullControl',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link constantFlowAgreementV1Abi}__ and `functionName` set to `"revokeFlowOperatorWithFullControl"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x2844c1BBdA121E9E43105630b9C8310e5c72744b)
 * - [__View Contract on Op Mainnet Optimism Explorer__](https://optimistic.etherscan.io/address/0x204C6f131bb7F258b2Ea1593f5309911d8E458eD)
 * - [__View Contract on Bnb Smart Chain Bsc Scan__](https://bscscan.com/address/0x49c38108870e74Cb9420C0991a85D3edd6363F75)
 * - [__View Contract on Gnosis Gnosisscan__](https://gnosisscan.io/address/0xEbdA4ceF883A7B12c4E669Ebc58927FBa8447C7D)
 * - [__View Contract on Polygon Polygon Scan__](https://polygonscan.com/address/0x6EeE6060f715257b970700bc2656De21dEdF074C)
 * - [__View Contract on Base Basescan__](https://basescan.org/address/0x19ba78B9cDB05A877718841c574325fdB53601bb)
 * - [__View Contract on Arbitrum One Arbiscan__](https://arbiscan.io/address/0x731FdBB12944973B500518aea61942381d7e240D)
 * - [__View Contract on Celo Celo Explorer__](https://celoscan.io/address/0x9d369e78e1a682cE0F8d9aD849BeA4FE1c3bD3Ad)
 * - [__View Contract on Avalanche Fuji Snow Trace__](https://testnet.snowtrace.io/address/0x16843ac25Ccc58Aa7960ba05f61cBB17b36b130A)
 * - [__View Contract on Avalanche Snow Trace__](https://snowtrace.io/address/0x6946c5B38Ffea373b0a2340b4AEf0De8F6782e58)
 * - [__View Contract on Base Sepolia Basescan__](https://sepolia.basescan.org/address/0x6836F23d6171D74Ef62FcF776655aBcD2bcd62Ef)
 * - [__View Contract on Scroll Sepolia Scrollscan__](https://sepolia.scrollscan.com/address/0xbc46B4Aa41c055578306820013d4B65fff42711E)
 * - [__View Contract on Scroll Scrollscan__](https://scrollscan.com/address/0xB3bcD6da1eeB6c97258B3806A853A6dcD3B6C00c)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x6836F23d6171D74Ef62FcF776655aBcD2bcd62Ef)
 * - [__View Contract on Op Sepolia Blockscout__](https://optimism-sepolia.blockscout.com/address/0x8a3170AdbC67233196371226141736E4151e7C26)
 * - [__View Contract on Degen Degen Chain Explorer__](https://explorer.degen.tips/address/0x82cc052d1b17aC554a22A88D5876B56c6b51e95c)
 */
export const useConstantFlowAgreementV1RevokeFlowOperatorWithFullControl =
  /*#__PURE__*/ createUseWriteContract({
    abi: constantFlowAgreementV1Abi,
    address: constantFlowAgreementV1Address,
    functionName: 'revokeFlowOperatorWithFullControl',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link constantFlowAgreementV1Abi}__
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x2844c1BBdA121E9E43105630b9C8310e5c72744b)
 * - [__View Contract on Op Mainnet Optimism Explorer__](https://optimistic.etherscan.io/address/0x204C6f131bb7F258b2Ea1593f5309911d8E458eD)
 * - [__View Contract on Bnb Smart Chain Bsc Scan__](https://bscscan.com/address/0x49c38108870e74Cb9420C0991a85D3edd6363F75)
 * - [__View Contract on Gnosis Gnosisscan__](https://gnosisscan.io/address/0xEbdA4ceF883A7B12c4E669Ebc58927FBa8447C7D)
 * - [__View Contract on Polygon Polygon Scan__](https://polygonscan.com/address/0x6EeE6060f715257b970700bc2656De21dEdF074C)
 * - [__View Contract on Base Basescan__](https://basescan.org/address/0x19ba78B9cDB05A877718841c574325fdB53601bb)
 * - [__View Contract on Arbitrum One Arbiscan__](https://arbiscan.io/address/0x731FdBB12944973B500518aea61942381d7e240D)
 * - [__View Contract on Celo Celo Explorer__](https://celoscan.io/address/0x9d369e78e1a682cE0F8d9aD849BeA4FE1c3bD3Ad)
 * - [__View Contract on Avalanche Fuji Snow Trace__](https://testnet.snowtrace.io/address/0x16843ac25Ccc58Aa7960ba05f61cBB17b36b130A)
 * - [__View Contract on Avalanche Snow Trace__](https://snowtrace.io/address/0x6946c5B38Ffea373b0a2340b4AEf0De8F6782e58)
 * - [__View Contract on Base Sepolia Basescan__](https://sepolia.basescan.org/address/0x6836F23d6171D74Ef62FcF776655aBcD2bcd62Ef)
 * - [__View Contract on Scroll Sepolia Scrollscan__](https://sepolia.scrollscan.com/address/0xbc46B4Aa41c055578306820013d4B65fff42711E)
 * - [__View Contract on Scroll Scrollscan__](https://scrollscan.com/address/0xB3bcD6da1eeB6c97258B3806A853A6dcD3B6C00c)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x6836F23d6171D74Ef62FcF776655aBcD2bcd62Ef)
 * - [__View Contract on Op Sepolia Blockscout__](https://optimism-sepolia.blockscout.com/address/0x8a3170AdbC67233196371226141736E4151e7C26)
 * - [__View Contract on Degen Degen Chain Explorer__](https://explorer.degen.tips/address/0x82cc052d1b17aC554a22A88D5876B56c6b51e95c)
 */
export const usePrepareConstantFlowAgreementV1Write =
  /*#__PURE__*/ createUseSimulateContract({
    abi: constantFlowAgreementV1Abi,
    address: constantFlowAgreementV1Address,
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link constantFlowAgreementV1Abi}__ and `functionName` set to `"castrate"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x2844c1BBdA121E9E43105630b9C8310e5c72744b)
 * - [__View Contract on Op Mainnet Optimism Explorer__](https://optimistic.etherscan.io/address/0x204C6f131bb7F258b2Ea1593f5309911d8E458eD)
 * - [__View Contract on Bnb Smart Chain Bsc Scan__](https://bscscan.com/address/0x49c38108870e74Cb9420C0991a85D3edd6363F75)
 * - [__View Contract on Gnosis Gnosisscan__](https://gnosisscan.io/address/0xEbdA4ceF883A7B12c4E669Ebc58927FBa8447C7D)
 * - [__View Contract on Polygon Polygon Scan__](https://polygonscan.com/address/0x6EeE6060f715257b970700bc2656De21dEdF074C)
 * - [__View Contract on Base Basescan__](https://basescan.org/address/0x19ba78B9cDB05A877718841c574325fdB53601bb)
 * - [__View Contract on Arbitrum One Arbiscan__](https://arbiscan.io/address/0x731FdBB12944973B500518aea61942381d7e240D)
 * - [__View Contract on Celo Celo Explorer__](https://celoscan.io/address/0x9d369e78e1a682cE0F8d9aD849BeA4FE1c3bD3Ad)
 * - [__View Contract on Avalanche Fuji Snow Trace__](https://testnet.snowtrace.io/address/0x16843ac25Ccc58Aa7960ba05f61cBB17b36b130A)
 * - [__View Contract on Avalanche Snow Trace__](https://snowtrace.io/address/0x6946c5B38Ffea373b0a2340b4AEf0De8F6782e58)
 * - [__View Contract on Base Sepolia Basescan__](https://sepolia.basescan.org/address/0x6836F23d6171D74Ef62FcF776655aBcD2bcd62Ef)
 * - [__View Contract on Scroll Sepolia Scrollscan__](https://sepolia.scrollscan.com/address/0xbc46B4Aa41c055578306820013d4B65fff42711E)
 * - [__View Contract on Scroll Scrollscan__](https://scrollscan.com/address/0xB3bcD6da1eeB6c97258B3806A853A6dcD3B6C00c)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x6836F23d6171D74Ef62FcF776655aBcD2bcd62Ef)
 * - [__View Contract on Op Sepolia Blockscout__](https://optimism-sepolia.blockscout.com/address/0x8a3170AdbC67233196371226141736E4151e7C26)
 * - [__View Contract on Degen Degen Chain Explorer__](https://explorer.degen.tips/address/0x82cc052d1b17aC554a22A88D5876B56c6b51e95c)
 */
export const usePrepareConstantFlowAgreementV1Castrate =
  /*#__PURE__*/ createUseSimulateContract({
    abi: constantFlowAgreementV1Abi,
    address: constantFlowAgreementV1Address,
    functionName: 'castrate',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link constantFlowAgreementV1Abi}__ and `functionName` set to `"updateCode"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x2844c1BBdA121E9E43105630b9C8310e5c72744b)
 * - [__View Contract on Op Mainnet Optimism Explorer__](https://optimistic.etherscan.io/address/0x204C6f131bb7F258b2Ea1593f5309911d8E458eD)
 * - [__View Contract on Bnb Smart Chain Bsc Scan__](https://bscscan.com/address/0x49c38108870e74Cb9420C0991a85D3edd6363F75)
 * - [__View Contract on Gnosis Gnosisscan__](https://gnosisscan.io/address/0xEbdA4ceF883A7B12c4E669Ebc58927FBa8447C7D)
 * - [__View Contract on Polygon Polygon Scan__](https://polygonscan.com/address/0x6EeE6060f715257b970700bc2656De21dEdF074C)
 * - [__View Contract on Base Basescan__](https://basescan.org/address/0x19ba78B9cDB05A877718841c574325fdB53601bb)
 * - [__View Contract on Arbitrum One Arbiscan__](https://arbiscan.io/address/0x731FdBB12944973B500518aea61942381d7e240D)
 * - [__View Contract on Celo Celo Explorer__](https://celoscan.io/address/0x9d369e78e1a682cE0F8d9aD849BeA4FE1c3bD3Ad)
 * - [__View Contract on Avalanche Fuji Snow Trace__](https://testnet.snowtrace.io/address/0x16843ac25Ccc58Aa7960ba05f61cBB17b36b130A)
 * - [__View Contract on Avalanche Snow Trace__](https://snowtrace.io/address/0x6946c5B38Ffea373b0a2340b4AEf0De8F6782e58)
 * - [__View Contract on Base Sepolia Basescan__](https://sepolia.basescan.org/address/0x6836F23d6171D74Ef62FcF776655aBcD2bcd62Ef)
 * - [__View Contract on Scroll Sepolia Scrollscan__](https://sepolia.scrollscan.com/address/0xbc46B4Aa41c055578306820013d4B65fff42711E)
 * - [__View Contract on Scroll Scrollscan__](https://scrollscan.com/address/0xB3bcD6da1eeB6c97258B3806A853A6dcD3B6C00c)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x6836F23d6171D74Ef62FcF776655aBcD2bcd62Ef)
 * - [__View Contract on Op Sepolia Blockscout__](https://optimism-sepolia.blockscout.com/address/0x8a3170AdbC67233196371226141736E4151e7C26)
 * - [__View Contract on Degen Degen Chain Explorer__](https://explorer.degen.tips/address/0x82cc052d1b17aC554a22A88D5876B56c6b51e95c)
 */
export const usePrepareConstantFlowAgreementV1UpdateCode =
  /*#__PURE__*/ createUseSimulateContract({
    abi: constantFlowAgreementV1Abi,
    address: constantFlowAgreementV1Address,
    functionName: 'updateCode',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link constantFlowAgreementV1Abi}__ and `functionName` set to `"createFlow"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x2844c1BBdA121E9E43105630b9C8310e5c72744b)
 * - [__View Contract on Op Mainnet Optimism Explorer__](https://optimistic.etherscan.io/address/0x204C6f131bb7F258b2Ea1593f5309911d8E458eD)
 * - [__View Contract on Bnb Smart Chain Bsc Scan__](https://bscscan.com/address/0x49c38108870e74Cb9420C0991a85D3edd6363F75)
 * - [__View Contract on Gnosis Gnosisscan__](https://gnosisscan.io/address/0xEbdA4ceF883A7B12c4E669Ebc58927FBa8447C7D)
 * - [__View Contract on Polygon Polygon Scan__](https://polygonscan.com/address/0x6EeE6060f715257b970700bc2656De21dEdF074C)
 * - [__View Contract on Base Basescan__](https://basescan.org/address/0x19ba78B9cDB05A877718841c574325fdB53601bb)
 * - [__View Contract on Arbitrum One Arbiscan__](https://arbiscan.io/address/0x731FdBB12944973B500518aea61942381d7e240D)
 * - [__View Contract on Celo Celo Explorer__](https://celoscan.io/address/0x9d369e78e1a682cE0F8d9aD849BeA4FE1c3bD3Ad)
 * - [__View Contract on Avalanche Fuji Snow Trace__](https://testnet.snowtrace.io/address/0x16843ac25Ccc58Aa7960ba05f61cBB17b36b130A)
 * - [__View Contract on Avalanche Snow Trace__](https://snowtrace.io/address/0x6946c5B38Ffea373b0a2340b4AEf0De8F6782e58)
 * - [__View Contract on Base Sepolia Basescan__](https://sepolia.basescan.org/address/0x6836F23d6171D74Ef62FcF776655aBcD2bcd62Ef)
 * - [__View Contract on Scroll Sepolia Scrollscan__](https://sepolia.scrollscan.com/address/0xbc46B4Aa41c055578306820013d4B65fff42711E)
 * - [__View Contract on Scroll Scrollscan__](https://scrollscan.com/address/0xB3bcD6da1eeB6c97258B3806A853A6dcD3B6C00c)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x6836F23d6171D74Ef62FcF776655aBcD2bcd62Ef)
 * - [__View Contract on Op Sepolia Blockscout__](https://optimism-sepolia.blockscout.com/address/0x8a3170AdbC67233196371226141736E4151e7C26)
 * - [__View Contract on Degen Degen Chain Explorer__](https://explorer.degen.tips/address/0x82cc052d1b17aC554a22A88D5876B56c6b51e95c)
 */
export const usePrepareConstantFlowAgreementV1CreateFlow =
  /*#__PURE__*/ createUseSimulateContract({
    abi: constantFlowAgreementV1Abi,
    address: constantFlowAgreementV1Address,
    functionName: 'createFlow',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link constantFlowAgreementV1Abi}__ and `functionName` set to `"updateFlow"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x2844c1BBdA121E9E43105630b9C8310e5c72744b)
 * - [__View Contract on Op Mainnet Optimism Explorer__](https://optimistic.etherscan.io/address/0x204C6f131bb7F258b2Ea1593f5309911d8E458eD)
 * - [__View Contract on Bnb Smart Chain Bsc Scan__](https://bscscan.com/address/0x49c38108870e74Cb9420C0991a85D3edd6363F75)
 * - [__View Contract on Gnosis Gnosisscan__](https://gnosisscan.io/address/0xEbdA4ceF883A7B12c4E669Ebc58927FBa8447C7D)
 * - [__View Contract on Polygon Polygon Scan__](https://polygonscan.com/address/0x6EeE6060f715257b970700bc2656De21dEdF074C)
 * - [__View Contract on Base Basescan__](https://basescan.org/address/0x19ba78B9cDB05A877718841c574325fdB53601bb)
 * - [__View Contract on Arbitrum One Arbiscan__](https://arbiscan.io/address/0x731FdBB12944973B500518aea61942381d7e240D)
 * - [__View Contract on Celo Celo Explorer__](https://celoscan.io/address/0x9d369e78e1a682cE0F8d9aD849BeA4FE1c3bD3Ad)
 * - [__View Contract on Avalanche Fuji Snow Trace__](https://testnet.snowtrace.io/address/0x16843ac25Ccc58Aa7960ba05f61cBB17b36b130A)
 * - [__View Contract on Avalanche Snow Trace__](https://snowtrace.io/address/0x6946c5B38Ffea373b0a2340b4AEf0De8F6782e58)
 * - [__View Contract on Base Sepolia Basescan__](https://sepolia.basescan.org/address/0x6836F23d6171D74Ef62FcF776655aBcD2bcd62Ef)
 * - [__View Contract on Scroll Sepolia Scrollscan__](https://sepolia.scrollscan.com/address/0xbc46B4Aa41c055578306820013d4B65fff42711E)
 * - [__View Contract on Scroll Scrollscan__](https://scrollscan.com/address/0xB3bcD6da1eeB6c97258B3806A853A6dcD3B6C00c)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x6836F23d6171D74Ef62FcF776655aBcD2bcd62Ef)
 * - [__View Contract on Op Sepolia Blockscout__](https://optimism-sepolia.blockscout.com/address/0x8a3170AdbC67233196371226141736E4151e7C26)
 * - [__View Contract on Degen Degen Chain Explorer__](https://explorer.degen.tips/address/0x82cc052d1b17aC554a22A88D5876B56c6b51e95c)
 */
export const usePrepareConstantFlowAgreementV1UpdateFlow =
  /*#__PURE__*/ createUseSimulateContract({
    abi: constantFlowAgreementV1Abi,
    address: constantFlowAgreementV1Address,
    functionName: 'updateFlow',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link constantFlowAgreementV1Abi}__ and `functionName` set to `"deleteFlow"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x2844c1BBdA121E9E43105630b9C8310e5c72744b)
 * - [__View Contract on Op Mainnet Optimism Explorer__](https://optimistic.etherscan.io/address/0x204C6f131bb7F258b2Ea1593f5309911d8E458eD)
 * - [__View Contract on Bnb Smart Chain Bsc Scan__](https://bscscan.com/address/0x49c38108870e74Cb9420C0991a85D3edd6363F75)
 * - [__View Contract on Gnosis Gnosisscan__](https://gnosisscan.io/address/0xEbdA4ceF883A7B12c4E669Ebc58927FBa8447C7D)
 * - [__View Contract on Polygon Polygon Scan__](https://polygonscan.com/address/0x6EeE6060f715257b970700bc2656De21dEdF074C)
 * - [__View Contract on Base Basescan__](https://basescan.org/address/0x19ba78B9cDB05A877718841c574325fdB53601bb)
 * - [__View Contract on Arbitrum One Arbiscan__](https://arbiscan.io/address/0x731FdBB12944973B500518aea61942381d7e240D)
 * - [__View Contract on Celo Celo Explorer__](https://celoscan.io/address/0x9d369e78e1a682cE0F8d9aD849BeA4FE1c3bD3Ad)
 * - [__View Contract on Avalanche Fuji Snow Trace__](https://testnet.snowtrace.io/address/0x16843ac25Ccc58Aa7960ba05f61cBB17b36b130A)
 * - [__View Contract on Avalanche Snow Trace__](https://snowtrace.io/address/0x6946c5B38Ffea373b0a2340b4AEf0De8F6782e58)
 * - [__View Contract on Base Sepolia Basescan__](https://sepolia.basescan.org/address/0x6836F23d6171D74Ef62FcF776655aBcD2bcd62Ef)
 * - [__View Contract on Scroll Sepolia Scrollscan__](https://sepolia.scrollscan.com/address/0xbc46B4Aa41c055578306820013d4B65fff42711E)
 * - [__View Contract on Scroll Scrollscan__](https://scrollscan.com/address/0xB3bcD6da1eeB6c97258B3806A853A6dcD3B6C00c)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x6836F23d6171D74Ef62FcF776655aBcD2bcd62Ef)
 * - [__View Contract on Op Sepolia Blockscout__](https://optimism-sepolia.blockscout.com/address/0x8a3170AdbC67233196371226141736E4151e7C26)
 * - [__View Contract on Degen Degen Chain Explorer__](https://explorer.degen.tips/address/0x82cc052d1b17aC554a22A88D5876B56c6b51e95c)
 */
export const usePrepareConstantFlowAgreementV1DeleteFlow =
  /*#__PURE__*/ createUseSimulateContract({
    abi: constantFlowAgreementV1Abi,
    address: constantFlowAgreementV1Address,
    functionName: 'deleteFlow',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link constantFlowAgreementV1Abi}__ and `functionName` set to `"createFlowByOperator"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x2844c1BBdA121E9E43105630b9C8310e5c72744b)
 * - [__View Contract on Op Mainnet Optimism Explorer__](https://optimistic.etherscan.io/address/0x204C6f131bb7F258b2Ea1593f5309911d8E458eD)
 * - [__View Contract on Bnb Smart Chain Bsc Scan__](https://bscscan.com/address/0x49c38108870e74Cb9420C0991a85D3edd6363F75)
 * - [__View Contract on Gnosis Gnosisscan__](https://gnosisscan.io/address/0xEbdA4ceF883A7B12c4E669Ebc58927FBa8447C7D)
 * - [__View Contract on Polygon Polygon Scan__](https://polygonscan.com/address/0x6EeE6060f715257b970700bc2656De21dEdF074C)
 * - [__View Contract on Base Basescan__](https://basescan.org/address/0x19ba78B9cDB05A877718841c574325fdB53601bb)
 * - [__View Contract on Arbitrum One Arbiscan__](https://arbiscan.io/address/0x731FdBB12944973B500518aea61942381d7e240D)
 * - [__View Contract on Celo Celo Explorer__](https://celoscan.io/address/0x9d369e78e1a682cE0F8d9aD849BeA4FE1c3bD3Ad)
 * - [__View Contract on Avalanche Fuji Snow Trace__](https://testnet.snowtrace.io/address/0x16843ac25Ccc58Aa7960ba05f61cBB17b36b130A)
 * - [__View Contract on Avalanche Snow Trace__](https://snowtrace.io/address/0x6946c5B38Ffea373b0a2340b4AEf0De8F6782e58)
 * - [__View Contract on Base Sepolia Basescan__](https://sepolia.basescan.org/address/0x6836F23d6171D74Ef62FcF776655aBcD2bcd62Ef)
 * - [__View Contract on Scroll Sepolia Scrollscan__](https://sepolia.scrollscan.com/address/0xbc46B4Aa41c055578306820013d4B65fff42711E)
 * - [__View Contract on Scroll Scrollscan__](https://scrollscan.com/address/0xB3bcD6da1eeB6c97258B3806A853A6dcD3B6C00c)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x6836F23d6171D74Ef62FcF776655aBcD2bcd62Ef)
 * - [__View Contract on Op Sepolia Blockscout__](https://optimism-sepolia.blockscout.com/address/0x8a3170AdbC67233196371226141736E4151e7C26)
 * - [__View Contract on Degen Degen Chain Explorer__](https://explorer.degen.tips/address/0x82cc052d1b17aC554a22A88D5876B56c6b51e95c)
 */
export const usePrepareConstantFlowAgreementV1CreateFlowByOperator =
  /*#__PURE__*/ createUseSimulateContract({
    abi: constantFlowAgreementV1Abi,
    address: constantFlowAgreementV1Address,
    functionName: 'createFlowByOperator',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link constantFlowAgreementV1Abi}__ and `functionName` set to `"updateFlowByOperator"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x2844c1BBdA121E9E43105630b9C8310e5c72744b)
 * - [__View Contract on Op Mainnet Optimism Explorer__](https://optimistic.etherscan.io/address/0x204C6f131bb7F258b2Ea1593f5309911d8E458eD)
 * - [__View Contract on Bnb Smart Chain Bsc Scan__](https://bscscan.com/address/0x49c38108870e74Cb9420C0991a85D3edd6363F75)
 * - [__View Contract on Gnosis Gnosisscan__](https://gnosisscan.io/address/0xEbdA4ceF883A7B12c4E669Ebc58927FBa8447C7D)
 * - [__View Contract on Polygon Polygon Scan__](https://polygonscan.com/address/0x6EeE6060f715257b970700bc2656De21dEdF074C)
 * - [__View Contract on Base Basescan__](https://basescan.org/address/0x19ba78B9cDB05A877718841c574325fdB53601bb)
 * - [__View Contract on Arbitrum One Arbiscan__](https://arbiscan.io/address/0x731FdBB12944973B500518aea61942381d7e240D)
 * - [__View Contract on Celo Celo Explorer__](https://celoscan.io/address/0x9d369e78e1a682cE0F8d9aD849BeA4FE1c3bD3Ad)
 * - [__View Contract on Avalanche Fuji Snow Trace__](https://testnet.snowtrace.io/address/0x16843ac25Ccc58Aa7960ba05f61cBB17b36b130A)
 * - [__View Contract on Avalanche Snow Trace__](https://snowtrace.io/address/0x6946c5B38Ffea373b0a2340b4AEf0De8F6782e58)
 * - [__View Contract on Base Sepolia Basescan__](https://sepolia.basescan.org/address/0x6836F23d6171D74Ef62FcF776655aBcD2bcd62Ef)
 * - [__View Contract on Scroll Sepolia Scrollscan__](https://sepolia.scrollscan.com/address/0xbc46B4Aa41c055578306820013d4B65fff42711E)
 * - [__View Contract on Scroll Scrollscan__](https://scrollscan.com/address/0xB3bcD6da1eeB6c97258B3806A853A6dcD3B6C00c)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x6836F23d6171D74Ef62FcF776655aBcD2bcd62Ef)
 * - [__View Contract on Op Sepolia Blockscout__](https://optimism-sepolia.blockscout.com/address/0x8a3170AdbC67233196371226141736E4151e7C26)
 * - [__View Contract on Degen Degen Chain Explorer__](https://explorer.degen.tips/address/0x82cc052d1b17aC554a22A88D5876B56c6b51e95c)
 */
export const usePrepareConstantFlowAgreementV1UpdateFlowByOperator =
  /*#__PURE__*/ createUseSimulateContract({
    abi: constantFlowAgreementV1Abi,
    address: constantFlowAgreementV1Address,
    functionName: 'updateFlowByOperator',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link constantFlowAgreementV1Abi}__ and `functionName` set to `"deleteFlowByOperator"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x2844c1BBdA121E9E43105630b9C8310e5c72744b)
 * - [__View Contract on Op Mainnet Optimism Explorer__](https://optimistic.etherscan.io/address/0x204C6f131bb7F258b2Ea1593f5309911d8E458eD)
 * - [__View Contract on Bnb Smart Chain Bsc Scan__](https://bscscan.com/address/0x49c38108870e74Cb9420C0991a85D3edd6363F75)
 * - [__View Contract on Gnosis Gnosisscan__](https://gnosisscan.io/address/0xEbdA4ceF883A7B12c4E669Ebc58927FBa8447C7D)
 * - [__View Contract on Polygon Polygon Scan__](https://polygonscan.com/address/0x6EeE6060f715257b970700bc2656De21dEdF074C)
 * - [__View Contract on Base Basescan__](https://basescan.org/address/0x19ba78B9cDB05A877718841c574325fdB53601bb)
 * - [__View Contract on Arbitrum One Arbiscan__](https://arbiscan.io/address/0x731FdBB12944973B500518aea61942381d7e240D)
 * - [__View Contract on Celo Celo Explorer__](https://celoscan.io/address/0x9d369e78e1a682cE0F8d9aD849BeA4FE1c3bD3Ad)
 * - [__View Contract on Avalanche Fuji Snow Trace__](https://testnet.snowtrace.io/address/0x16843ac25Ccc58Aa7960ba05f61cBB17b36b130A)
 * - [__View Contract on Avalanche Snow Trace__](https://snowtrace.io/address/0x6946c5B38Ffea373b0a2340b4AEf0De8F6782e58)
 * - [__View Contract on Base Sepolia Basescan__](https://sepolia.basescan.org/address/0x6836F23d6171D74Ef62FcF776655aBcD2bcd62Ef)
 * - [__View Contract on Scroll Sepolia Scrollscan__](https://sepolia.scrollscan.com/address/0xbc46B4Aa41c055578306820013d4B65fff42711E)
 * - [__View Contract on Scroll Scrollscan__](https://scrollscan.com/address/0xB3bcD6da1eeB6c97258B3806A853A6dcD3B6C00c)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x6836F23d6171D74Ef62FcF776655aBcD2bcd62Ef)
 * - [__View Contract on Op Sepolia Blockscout__](https://optimism-sepolia.blockscout.com/address/0x8a3170AdbC67233196371226141736E4151e7C26)
 * - [__View Contract on Degen Degen Chain Explorer__](https://explorer.degen.tips/address/0x82cc052d1b17aC554a22A88D5876B56c6b51e95c)
 */
export const usePrepareConstantFlowAgreementV1DeleteFlowByOperator =
  /*#__PURE__*/ createUseSimulateContract({
    abi: constantFlowAgreementV1Abi,
    address: constantFlowAgreementV1Address,
    functionName: 'deleteFlowByOperator',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link constantFlowAgreementV1Abi}__ and `functionName` set to `"increaseFlowRateAllowance"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x2844c1BBdA121E9E43105630b9C8310e5c72744b)
 * - [__View Contract on Op Mainnet Optimism Explorer__](https://optimistic.etherscan.io/address/0x204C6f131bb7F258b2Ea1593f5309911d8E458eD)
 * - [__View Contract on Bnb Smart Chain Bsc Scan__](https://bscscan.com/address/0x49c38108870e74Cb9420C0991a85D3edd6363F75)
 * - [__View Contract on Gnosis Gnosisscan__](https://gnosisscan.io/address/0xEbdA4ceF883A7B12c4E669Ebc58927FBa8447C7D)
 * - [__View Contract on Polygon Polygon Scan__](https://polygonscan.com/address/0x6EeE6060f715257b970700bc2656De21dEdF074C)
 * - [__View Contract on Base Basescan__](https://basescan.org/address/0x19ba78B9cDB05A877718841c574325fdB53601bb)
 * - [__View Contract on Arbitrum One Arbiscan__](https://arbiscan.io/address/0x731FdBB12944973B500518aea61942381d7e240D)
 * - [__View Contract on Celo Celo Explorer__](https://celoscan.io/address/0x9d369e78e1a682cE0F8d9aD849BeA4FE1c3bD3Ad)
 * - [__View Contract on Avalanche Fuji Snow Trace__](https://testnet.snowtrace.io/address/0x16843ac25Ccc58Aa7960ba05f61cBB17b36b130A)
 * - [__View Contract on Avalanche Snow Trace__](https://snowtrace.io/address/0x6946c5B38Ffea373b0a2340b4AEf0De8F6782e58)
 * - [__View Contract on Base Sepolia Basescan__](https://sepolia.basescan.org/address/0x6836F23d6171D74Ef62FcF776655aBcD2bcd62Ef)
 * - [__View Contract on Scroll Sepolia Scrollscan__](https://sepolia.scrollscan.com/address/0xbc46B4Aa41c055578306820013d4B65fff42711E)
 * - [__View Contract on Scroll Scrollscan__](https://scrollscan.com/address/0xB3bcD6da1eeB6c97258B3806A853A6dcD3B6C00c)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x6836F23d6171D74Ef62FcF776655aBcD2bcd62Ef)
 * - [__View Contract on Op Sepolia Blockscout__](https://optimism-sepolia.blockscout.com/address/0x8a3170AdbC67233196371226141736E4151e7C26)
 * - [__View Contract on Degen Degen Chain Explorer__](https://explorer.degen.tips/address/0x82cc052d1b17aC554a22A88D5876B56c6b51e95c)
 */
export const usePrepareConstantFlowAgreementV1IncreaseFlowRateAllowance =
  /*#__PURE__*/ createUseSimulateContract({
    abi: constantFlowAgreementV1Abi,
    address: constantFlowAgreementV1Address,
    functionName: 'increaseFlowRateAllowance',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link constantFlowAgreementV1Abi}__ and `functionName` set to `"decreaseFlowRateAllowance"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x2844c1BBdA121E9E43105630b9C8310e5c72744b)
 * - [__View Contract on Op Mainnet Optimism Explorer__](https://optimistic.etherscan.io/address/0x204C6f131bb7F258b2Ea1593f5309911d8E458eD)
 * - [__View Contract on Bnb Smart Chain Bsc Scan__](https://bscscan.com/address/0x49c38108870e74Cb9420C0991a85D3edd6363F75)
 * - [__View Contract on Gnosis Gnosisscan__](https://gnosisscan.io/address/0xEbdA4ceF883A7B12c4E669Ebc58927FBa8447C7D)
 * - [__View Contract on Polygon Polygon Scan__](https://polygonscan.com/address/0x6EeE6060f715257b970700bc2656De21dEdF074C)
 * - [__View Contract on Base Basescan__](https://basescan.org/address/0x19ba78B9cDB05A877718841c574325fdB53601bb)
 * - [__View Contract on Arbitrum One Arbiscan__](https://arbiscan.io/address/0x731FdBB12944973B500518aea61942381d7e240D)
 * - [__View Contract on Celo Celo Explorer__](https://celoscan.io/address/0x9d369e78e1a682cE0F8d9aD849BeA4FE1c3bD3Ad)
 * - [__View Contract on Avalanche Fuji Snow Trace__](https://testnet.snowtrace.io/address/0x16843ac25Ccc58Aa7960ba05f61cBB17b36b130A)
 * - [__View Contract on Avalanche Snow Trace__](https://snowtrace.io/address/0x6946c5B38Ffea373b0a2340b4AEf0De8F6782e58)
 * - [__View Contract on Base Sepolia Basescan__](https://sepolia.basescan.org/address/0x6836F23d6171D74Ef62FcF776655aBcD2bcd62Ef)
 * - [__View Contract on Scroll Sepolia Scrollscan__](https://sepolia.scrollscan.com/address/0xbc46B4Aa41c055578306820013d4B65fff42711E)
 * - [__View Contract on Scroll Scrollscan__](https://scrollscan.com/address/0xB3bcD6da1eeB6c97258B3806A853A6dcD3B6C00c)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x6836F23d6171D74Ef62FcF776655aBcD2bcd62Ef)
 * - [__View Contract on Op Sepolia Blockscout__](https://optimism-sepolia.blockscout.com/address/0x8a3170AdbC67233196371226141736E4151e7C26)
 * - [__View Contract on Degen Degen Chain Explorer__](https://explorer.degen.tips/address/0x82cc052d1b17aC554a22A88D5876B56c6b51e95c)
 */
export const usePrepareConstantFlowAgreementV1DecreaseFlowRateAllowance =
  /*#__PURE__*/ createUseSimulateContract({
    abi: constantFlowAgreementV1Abi,
    address: constantFlowAgreementV1Address,
    functionName: 'decreaseFlowRateAllowance',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link constantFlowAgreementV1Abi}__ and `functionName` set to `"updateFlowOperatorPermissions"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x2844c1BBdA121E9E43105630b9C8310e5c72744b)
 * - [__View Contract on Op Mainnet Optimism Explorer__](https://optimistic.etherscan.io/address/0x204C6f131bb7F258b2Ea1593f5309911d8E458eD)
 * - [__View Contract on Bnb Smart Chain Bsc Scan__](https://bscscan.com/address/0x49c38108870e74Cb9420C0991a85D3edd6363F75)
 * - [__View Contract on Gnosis Gnosisscan__](https://gnosisscan.io/address/0xEbdA4ceF883A7B12c4E669Ebc58927FBa8447C7D)
 * - [__View Contract on Polygon Polygon Scan__](https://polygonscan.com/address/0x6EeE6060f715257b970700bc2656De21dEdF074C)
 * - [__View Contract on Base Basescan__](https://basescan.org/address/0x19ba78B9cDB05A877718841c574325fdB53601bb)
 * - [__View Contract on Arbitrum One Arbiscan__](https://arbiscan.io/address/0x731FdBB12944973B500518aea61942381d7e240D)
 * - [__View Contract on Celo Celo Explorer__](https://celoscan.io/address/0x9d369e78e1a682cE0F8d9aD849BeA4FE1c3bD3Ad)
 * - [__View Contract on Avalanche Fuji Snow Trace__](https://testnet.snowtrace.io/address/0x16843ac25Ccc58Aa7960ba05f61cBB17b36b130A)
 * - [__View Contract on Avalanche Snow Trace__](https://snowtrace.io/address/0x6946c5B38Ffea373b0a2340b4AEf0De8F6782e58)
 * - [__View Contract on Base Sepolia Basescan__](https://sepolia.basescan.org/address/0x6836F23d6171D74Ef62FcF776655aBcD2bcd62Ef)
 * - [__View Contract on Scroll Sepolia Scrollscan__](https://sepolia.scrollscan.com/address/0xbc46B4Aa41c055578306820013d4B65fff42711E)
 * - [__View Contract on Scroll Scrollscan__](https://scrollscan.com/address/0xB3bcD6da1eeB6c97258B3806A853A6dcD3B6C00c)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x6836F23d6171D74Ef62FcF776655aBcD2bcd62Ef)
 * - [__View Contract on Op Sepolia Blockscout__](https://optimism-sepolia.blockscout.com/address/0x8a3170AdbC67233196371226141736E4151e7C26)
 * - [__View Contract on Degen Degen Chain Explorer__](https://explorer.degen.tips/address/0x82cc052d1b17aC554a22A88D5876B56c6b51e95c)
 */
export const usePrepareConstantFlowAgreementV1UpdateFlowOperatorPermissions =
  /*#__PURE__*/ createUseSimulateContract({
    abi: constantFlowAgreementV1Abi,
    address: constantFlowAgreementV1Address,
    functionName: 'updateFlowOperatorPermissions',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link constantFlowAgreementV1Abi}__ and `functionName` set to `"increaseFlowRateAllowanceWithPermissions"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x2844c1BBdA121E9E43105630b9C8310e5c72744b)
 * - [__View Contract on Op Mainnet Optimism Explorer__](https://optimistic.etherscan.io/address/0x204C6f131bb7F258b2Ea1593f5309911d8E458eD)
 * - [__View Contract on Bnb Smart Chain Bsc Scan__](https://bscscan.com/address/0x49c38108870e74Cb9420C0991a85D3edd6363F75)
 * - [__View Contract on Gnosis Gnosisscan__](https://gnosisscan.io/address/0xEbdA4ceF883A7B12c4E669Ebc58927FBa8447C7D)
 * - [__View Contract on Polygon Polygon Scan__](https://polygonscan.com/address/0x6EeE6060f715257b970700bc2656De21dEdF074C)
 * - [__View Contract on Base Basescan__](https://basescan.org/address/0x19ba78B9cDB05A877718841c574325fdB53601bb)
 * - [__View Contract on Arbitrum One Arbiscan__](https://arbiscan.io/address/0x731FdBB12944973B500518aea61942381d7e240D)
 * - [__View Contract on Celo Celo Explorer__](https://celoscan.io/address/0x9d369e78e1a682cE0F8d9aD849BeA4FE1c3bD3Ad)
 * - [__View Contract on Avalanche Fuji Snow Trace__](https://testnet.snowtrace.io/address/0x16843ac25Ccc58Aa7960ba05f61cBB17b36b130A)
 * - [__View Contract on Avalanche Snow Trace__](https://snowtrace.io/address/0x6946c5B38Ffea373b0a2340b4AEf0De8F6782e58)
 * - [__View Contract on Base Sepolia Basescan__](https://sepolia.basescan.org/address/0x6836F23d6171D74Ef62FcF776655aBcD2bcd62Ef)
 * - [__View Contract on Scroll Sepolia Scrollscan__](https://sepolia.scrollscan.com/address/0xbc46B4Aa41c055578306820013d4B65fff42711E)
 * - [__View Contract on Scroll Scrollscan__](https://scrollscan.com/address/0xB3bcD6da1eeB6c97258B3806A853A6dcD3B6C00c)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x6836F23d6171D74Ef62FcF776655aBcD2bcd62Ef)
 * - [__View Contract on Op Sepolia Blockscout__](https://optimism-sepolia.blockscout.com/address/0x8a3170AdbC67233196371226141736E4151e7C26)
 * - [__View Contract on Degen Degen Chain Explorer__](https://explorer.degen.tips/address/0x82cc052d1b17aC554a22A88D5876B56c6b51e95c)
 */
export const usePrepareConstantFlowAgreementV1IncreaseFlowRateAllowanceWithPermissions =
  /*#__PURE__*/ createUseSimulateContract({
    abi: constantFlowAgreementV1Abi,
    address: constantFlowAgreementV1Address,
    functionName: 'increaseFlowRateAllowanceWithPermissions',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link constantFlowAgreementV1Abi}__ and `functionName` set to `"decreaseFlowRateAllowanceWithPermissions"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x2844c1BBdA121E9E43105630b9C8310e5c72744b)
 * - [__View Contract on Op Mainnet Optimism Explorer__](https://optimistic.etherscan.io/address/0x204C6f131bb7F258b2Ea1593f5309911d8E458eD)
 * - [__View Contract on Bnb Smart Chain Bsc Scan__](https://bscscan.com/address/0x49c38108870e74Cb9420C0991a85D3edd6363F75)
 * - [__View Contract on Gnosis Gnosisscan__](https://gnosisscan.io/address/0xEbdA4ceF883A7B12c4E669Ebc58927FBa8447C7D)
 * - [__View Contract on Polygon Polygon Scan__](https://polygonscan.com/address/0x6EeE6060f715257b970700bc2656De21dEdF074C)
 * - [__View Contract on Base Basescan__](https://basescan.org/address/0x19ba78B9cDB05A877718841c574325fdB53601bb)
 * - [__View Contract on Arbitrum One Arbiscan__](https://arbiscan.io/address/0x731FdBB12944973B500518aea61942381d7e240D)
 * - [__View Contract on Celo Celo Explorer__](https://celoscan.io/address/0x9d369e78e1a682cE0F8d9aD849BeA4FE1c3bD3Ad)
 * - [__View Contract on Avalanche Fuji Snow Trace__](https://testnet.snowtrace.io/address/0x16843ac25Ccc58Aa7960ba05f61cBB17b36b130A)
 * - [__View Contract on Avalanche Snow Trace__](https://snowtrace.io/address/0x6946c5B38Ffea373b0a2340b4AEf0De8F6782e58)
 * - [__View Contract on Base Sepolia Basescan__](https://sepolia.basescan.org/address/0x6836F23d6171D74Ef62FcF776655aBcD2bcd62Ef)
 * - [__View Contract on Scroll Sepolia Scrollscan__](https://sepolia.scrollscan.com/address/0xbc46B4Aa41c055578306820013d4B65fff42711E)
 * - [__View Contract on Scroll Scrollscan__](https://scrollscan.com/address/0xB3bcD6da1eeB6c97258B3806A853A6dcD3B6C00c)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x6836F23d6171D74Ef62FcF776655aBcD2bcd62Ef)
 * - [__View Contract on Op Sepolia Blockscout__](https://optimism-sepolia.blockscout.com/address/0x8a3170AdbC67233196371226141736E4151e7C26)
 * - [__View Contract on Degen Degen Chain Explorer__](https://explorer.degen.tips/address/0x82cc052d1b17aC554a22A88D5876B56c6b51e95c)
 */
export const usePrepareConstantFlowAgreementV1DecreaseFlowRateAllowanceWithPermissions =
  /*#__PURE__*/ createUseSimulateContract({
    abi: constantFlowAgreementV1Abi,
    address: constantFlowAgreementV1Address,
    functionName: 'decreaseFlowRateAllowanceWithPermissions',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link constantFlowAgreementV1Abi}__ and `functionName` set to `"authorizeFlowOperatorWithFullControl"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x2844c1BBdA121E9E43105630b9C8310e5c72744b)
 * - [__View Contract on Op Mainnet Optimism Explorer__](https://optimistic.etherscan.io/address/0x204C6f131bb7F258b2Ea1593f5309911d8E458eD)
 * - [__View Contract on Bnb Smart Chain Bsc Scan__](https://bscscan.com/address/0x49c38108870e74Cb9420C0991a85D3edd6363F75)
 * - [__View Contract on Gnosis Gnosisscan__](https://gnosisscan.io/address/0xEbdA4ceF883A7B12c4E669Ebc58927FBa8447C7D)
 * - [__View Contract on Polygon Polygon Scan__](https://polygonscan.com/address/0x6EeE6060f715257b970700bc2656De21dEdF074C)
 * - [__View Contract on Base Basescan__](https://basescan.org/address/0x19ba78B9cDB05A877718841c574325fdB53601bb)
 * - [__View Contract on Arbitrum One Arbiscan__](https://arbiscan.io/address/0x731FdBB12944973B500518aea61942381d7e240D)
 * - [__View Contract on Celo Celo Explorer__](https://celoscan.io/address/0x9d369e78e1a682cE0F8d9aD849BeA4FE1c3bD3Ad)
 * - [__View Contract on Avalanche Fuji Snow Trace__](https://testnet.snowtrace.io/address/0x16843ac25Ccc58Aa7960ba05f61cBB17b36b130A)
 * - [__View Contract on Avalanche Snow Trace__](https://snowtrace.io/address/0x6946c5B38Ffea373b0a2340b4AEf0De8F6782e58)
 * - [__View Contract on Base Sepolia Basescan__](https://sepolia.basescan.org/address/0x6836F23d6171D74Ef62FcF776655aBcD2bcd62Ef)
 * - [__View Contract on Scroll Sepolia Scrollscan__](https://sepolia.scrollscan.com/address/0xbc46B4Aa41c055578306820013d4B65fff42711E)
 * - [__View Contract on Scroll Scrollscan__](https://scrollscan.com/address/0xB3bcD6da1eeB6c97258B3806A853A6dcD3B6C00c)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x6836F23d6171D74Ef62FcF776655aBcD2bcd62Ef)
 * - [__View Contract on Op Sepolia Blockscout__](https://optimism-sepolia.blockscout.com/address/0x8a3170AdbC67233196371226141736E4151e7C26)
 * - [__View Contract on Degen Degen Chain Explorer__](https://explorer.degen.tips/address/0x82cc052d1b17aC554a22A88D5876B56c6b51e95c)
 */
export const usePrepareConstantFlowAgreementV1AuthorizeFlowOperatorWithFullControl =
  /*#__PURE__*/ createUseSimulateContract({
    abi: constantFlowAgreementV1Abi,
    address: constantFlowAgreementV1Address,
    functionName: 'authorizeFlowOperatorWithFullControl',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link constantFlowAgreementV1Abi}__ and `functionName` set to `"revokeFlowOperatorWithFullControl"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x2844c1BBdA121E9E43105630b9C8310e5c72744b)
 * - [__View Contract on Op Mainnet Optimism Explorer__](https://optimistic.etherscan.io/address/0x204C6f131bb7F258b2Ea1593f5309911d8E458eD)
 * - [__View Contract on Bnb Smart Chain Bsc Scan__](https://bscscan.com/address/0x49c38108870e74Cb9420C0991a85D3edd6363F75)
 * - [__View Contract on Gnosis Gnosisscan__](https://gnosisscan.io/address/0xEbdA4ceF883A7B12c4E669Ebc58927FBa8447C7D)
 * - [__View Contract on Polygon Polygon Scan__](https://polygonscan.com/address/0x6EeE6060f715257b970700bc2656De21dEdF074C)
 * - [__View Contract on Base Basescan__](https://basescan.org/address/0x19ba78B9cDB05A877718841c574325fdB53601bb)
 * - [__View Contract on Arbitrum One Arbiscan__](https://arbiscan.io/address/0x731FdBB12944973B500518aea61942381d7e240D)
 * - [__View Contract on Celo Celo Explorer__](https://celoscan.io/address/0x9d369e78e1a682cE0F8d9aD849BeA4FE1c3bD3Ad)
 * - [__View Contract on Avalanche Fuji Snow Trace__](https://testnet.snowtrace.io/address/0x16843ac25Ccc58Aa7960ba05f61cBB17b36b130A)
 * - [__View Contract on Avalanche Snow Trace__](https://snowtrace.io/address/0x6946c5B38Ffea373b0a2340b4AEf0De8F6782e58)
 * - [__View Contract on Base Sepolia Basescan__](https://sepolia.basescan.org/address/0x6836F23d6171D74Ef62FcF776655aBcD2bcd62Ef)
 * - [__View Contract on Scroll Sepolia Scrollscan__](https://sepolia.scrollscan.com/address/0xbc46B4Aa41c055578306820013d4B65fff42711E)
 * - [__View Contract on Scroll Scrollscan__](https://scrollscan.com/address/0xB3bcD6da1eeB6c97258B3806A853A6dcD3B6C00c)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x6836F23d6171D74Ef62FcF776655aBcD2bcd62Ef)
 * - [__View Contract on Op Sepolia Blockscout__](https://optimism-sepolia.blockscout.com/address/0x8a3170AdbC67233196371226141736E4151e7C26)
 * - [__View Contract on Degen Degen Chain Explorer__](https://explorer.degen.tips/address/0x82cc052d1b17aC554a22A88D5876B56c6b51e95c)
 */
export const usePrepareConstantFlowAgreementV1RevokeFlowOperatorWithFullControl =
  /*#__PURE__*/ createUseSimulateContract({
    abi: constantFlowAgreementV1Abi,
    address: constantFlowAgreementV1Address,
    functionName: 'revokeFlowOperatorWithFullControl',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link constantFlowAgreementV1Abi}__
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x2844c1BBdA121E9E43105630b9C8310e5c72744b)
 * - [__View Contract on Op Mainnet Optimism Explorer__](https://optimistic.etherscan.io/address/0x204C6f131bb7F258b2Ea1593f5309911d8E458eD)
 * - [__View Contract on Bnb Smart Chain Bsc Scan__](https://bscscan.com/address/0x49c38108870e74Cb9420C0991a85D3edd6363F75)
 * - [__View Contract on Gnosis Gnosisscan__](https://gnosisscan.io/address/0xEbdA4ceF883A7B12c4E669Ebc58927FBa8447C7D)
 * - [__View Contract on Polygon Polygon Scan__](https://polygonscan.com/address/0x6EeE6060f715257b970700bc2656De21dEdF074C)
 * - [__View Contract on Base Basescan__](https://basescan.org/address/0x19ba78B9cDB05A877718841c574325fdB53601bb)
 * - [__View Contract on Arbitrum One Arbiscan__](https://arbiscan.io/address/0x731FdBB12944973B500518aea61942381d7e240D)
 * - [__View Contract on Celo Celo Explorer__](https://celoscan.io/address/0x9d369e78e1a682cE0F8d9aD849BeA4FE1c3bD3Ad)
 * - [__View Contract on Avalanche Fuji Snow Trace__](https://testnet.snowtrace.io/address/0x16843ac25Ccc58Aa7960ba05f61cBB17b36b130A)
 * - [__View Contract on Avalanche Snow Trace__](https://snowtrace.io/address/0x6946c5B38Ffea373b0a2340b4AEf0De8F6782e58)
 * - [__View Contract on Base Sepolia Basescan__](https://sepolia.basescan.org/address/0x6836F23d6171D74Ef62FcF776655aBcD2bcd62Ef)
 * - [__View Contract on Scroll Sepolia Scrollscan__](https://sepolia.scrollscan.com/address/0xbc46B4Aa41c055578306820013d4B65fff42711E)
 * - [__View Contract on Scroll Scrollscan__](https://scrollscan.com/address/0xB3bcD6da1eeB6c97258B3806A853A6dcD3B6C00c)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x6836F23d6171D74Ef62FcF776655aBcD2bcd62Ef)
 * - [__View Contract on Op Sepolia Blockscout__](https://optimism-sepolia.blockscout.com/address/0x8a3170AdbC67233196371226141736E4151e7C26)
 * - [__View Contract on Degen Degen Chain Explorer__](https://explorer.degen.tips/address/0x82cc052d1b17aC554a22A88D5876B56c6b51e95c)
 */
export const useConstantFlowAgreementV1Event =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: constantFlowAgreementV1Abi,
    address: constantFlowAgreementV1Address,
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link constantFlowAgreementV1Abi}__ and `eventName` set to `"CodeUpdated"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x2844c1BBdA121E9E43105630b9C8310e5c72744b)
 * - [__View Contract on Op Mainnet Optimism Explorer__](https://optimistic.etherscan.io/address/0x204C6f131bb7F258b2Ea1593f5309911d8E458eD)
 * - [__View Contract on Bnb Smart Chain Bsc Scan__](https://bscscan.com/address/0x49c38108870e74Cb9420C0991a85D3edd6363F75)
 * - [__View Contract on Gnosis Gnosisscan__](https://gnosisscan.io/address/0xEbdA4ceF883A7B12c4E669Ebc58927FBa8447C7D)
 * - [__View Contract on Polygon Polygon Scan__](https://polygonscan.com/address/0x6EeE6060f715257b970700bc2656De21dEdF074C)
 * - [__View Contract on Base Basescan__](https://basescan.org/address/0x19ba78B9cDB05A877718841c574325fdB53601bb)
 * - [__View Contract on Arbitrum One Arbiscan__](https://arbiscan.io/address/0x731FdBB12944973B500518aea61942381d7e240D)
 * - [__View Contract on Celo Celo Explorer__](https://celoscan.io/address/0x9d369e78e1a682cE0F8d9aD849BeA4FE1c3bD3Ad)
 * - [__View Contract on Avalanche Fuji Snow Trace__](https://testnet.snowtrace.io/address/0x16843ac25Ccc58Aa7960ba05f61cBB17b36b130A)
 * - [__View Contract on Avalanche Snow Trace__](https://snowtrace.io/address/0x6946c5B38Ffea373b0a2340b4AEf0De8F6782e58)
 * - [__View Contract on Base Sepolia Basescan__](https://sepolia.basescan.org/address/0x6836F23d6171D74Ef62FcF776655aBcD2bcd62Ef)
 * - [__View Contract on Scroll Sepolia Scrollscan__](https://sepolia.scrollscan.com/address/0xbc46B4Aa41c055578306820013d4B65fff42711E)
 * - [__View Contract on Scroll Scrollscan__](https://scrollscan.com/address/0xB3bcD6da1eeB6c97258B3806A853A6dcD3B6C00c)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x6836F23d6171D74Ef62FcF776655aBcD2bcd62Ef)
 * - [__View Contract on Op Sepolia Blockscout__](https://optimism-sepolia.blockscout.com/address/0x8a3170AdbC67233196371226141736E4151e7C26)
 * - [__View Contract on Degen Degen Chain Explorer__](https://explorer.degen.tips/address/0x82cc052d1b17aC554a22A88D5876B56c6b51e95c)
 */
export const useConstantFlowAgreementV1CodeUpdatedEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: constantFlowAgreementV1Abi,
    address: constantFlowAgreementV1Address,
    eventName: 'CodeUpdated',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link constantFlowAgreementV1Abi}__ and `eventName` set to `"FlowOperatorUpdated"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x2844c1BBdA121E9E43105630b9C8310e5c72744b)
 * - [__View Contract on Op Mainnet Optimism Explorer__](https://optimistic.etherscan.io/address/0x204C6f131bb7F258b2Ea1593f5309911d8E458eD)
 * - [__View Contract on Bnb Smart Chain Bsc Scan__](https://bscscan.com/address/0x49c38108870e74Cb9420C0991a85D3edd6363F75)
 * - [__View Contract on Gnosis Gnosisscan__](https://gnosisscan.io/address/0xEbdA4ceF883A7B12c4E669Ebc58927FBa8447C7D)
 * - [__View Contract on Polygon Polygon Scan__](https://polygonscan.com/address/0x6EeE6060f715257b970700bc2656De21dEdF074C)
 * - [__View Contract on Base Basescan__](https://basescan.org/address/0x19ba78B9cDB05A877718841c574325fdB53601bb)
 * - [__View Contract on Arbitrum One Arbiscan__](https://arbiscan.io/address/0x731FdBB12944973B500518aea61942381d7e240D)
 * - [__View Contract on Celo Celo Explorer__](https://celoscan.io/address/0x9d369e78e1a682cE0F8d9aD849BeA4FE1c3bD3Ad)
 * - [__View Contract on Avalanche Fuji Snow Trace__](https://testnet.snowtrace.io/address/0x16843ac25Ccc58Aa7960ba05f61cBB17b36b130A)
 * - [__View Contract on Avalanche Snow Trace__](https://snowtrace.io/address/0x6946c5B38Ffea373b0a2340b4AEf0De8F6782e58)
 * - [__View Contract on Base Sepolia Basescan__](https://sepolia.basescan.org/address/0x6836F23d6171D74Ef62FcF776655aBcD2bcd62Ef)
 * - [__View Contract on Scroll Sepolia Scrollscan__](https://sepolia.scrollscan.com/address/0xbc46B4Aa41c055578306820013d4B65fff42711E)
 * - [__View Contract on Scroll Scrollscan__](https://scrollscan.com/address/0xB3bcD6da1eeB6c97258B3806A853A6dcD3B6C00c)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x6836F23d6171D74Ef62FcF776655aBcD2bcd62Ef)
 * - [__View Contract on Op Sepolia Blockscout__](https://optimism-sepolia.blockscout.com/address/0x8a3170AdbC67233196371226141736E4151e7C26)
 * - [__View Contract on Degen Degen Chain Explorer__](https://explorer.degen.tips/address/0x82cc052d1b17aC554a22A88D5876B56c6b51e95c)
 */
export const useConstantFlowAgreementV1FlowOperatorUpdatedEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: constantFlowAgreementV1Abi,
    address: constantFlowAgreementV1Address,
    eventName: 'FlowOperatorUpdated',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link constantFlowAgreementV1Abi}__ and `eventName` set to `"FlowUpdated"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x2844c1BBdA121E9E43105630b9C8310e5c72744b)
 * - [__View Contract on Op Mainnet Optimism Explorer__](https://optimistic.etherscan.io/address/0x204C6f131bb7F258b2Ea1593f5309911d8E458eD)
 * - [__View Contract on Bnb Smart Chain Bsc Scan__](https://bscscan.com/address/0x49c38108870e74Cb9420C0991a85D3edd6363F75)
 * - [__View Contract on Gnosis Gnosisscan__](https://gnosisscan.io/address/0xEbdA4ceF883A7B12c4E669Ebc58927FBa8447C7D)
 * - [__View Contract on Polygon Polygon Scan__](https://polygonscan.com/address/0x6EeE6060f715257b970700bc2656De21dEdF074C)
 * - [__View Contract on Base Basescan__](https://basescan.org/address/0x19ba78B9cDB05A877718841c574325fdB53601bb)
 * - [__View Contract on Arbitrum One Arbiscan__](https://arbiscan.io/address/0x731FdBB12944973B500518aea61942381d7e240D)
 * - [__View Contract on Celo Celo Explorer__](https://celoscan.io/address/0x9d369e78e1a682cE0F8d9aD849BeA4FE1c3bD3Ad)
 * - [__View Contract on Avalanche Fuji Snow Trace__](https://testnet.snowtrace.io/address/0x16843ac25Ccc58Aa7960ba05f61cBB17b36b130A)
 * - [__View Contract on Avalanche Snow Trace__](https://snowtrace.io/address/0x6946c5B38Ffea373b0a2340b4AEf0De8F6782e58)
 * - [__View Contract on Base Sepolia Basescan__](https://sepolia.basescan.org/address/0x6836F23d6171D74Ef62FcF776655aBcD2bcd62Ef)
 * - [__View Contract on Scroll Sepolia Scrollscan__](https://sepolia.scrollscan.com/address/0xbc46B4Aa41c055578306820013d4B65fff42711E)
 * - [__View Contract on Scroll Scrollscan__](https://scrollscan.com/address/0xB3bcD6da1eeB6c97258B3806A853A6dcD3B6C00c)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x6836F23d6171D74Ef62FcF776655aBcD2bcd62Ef)
 * - [__View Contract on Op Sepolia Blockscout__](https://optimism-sepolia.blockscout.com/address/0x8a3170AdbC67233196371226141736E4151e7C26)
 * - [__View Contract on Degen Degen Chain Explorer__](https://explorer.degen.tips/address/0x82cc052d1b17aC554a22A88D5876B56c6b51e95c)
 */
export const useConstantFlowAgreementV1FlowUpdatedEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: constantFlowAgreementV1Abi,
    address: constantFlowAgreementV1Address,
    eventName: 'FlowUpdated',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link constantFlowAgreementV1Abi}__ and `eventName` set to `"FlowUpdatedExtension"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x2844c1BBdA121E9E43105630b9C8310e5c72744b)
 * - [__View Contract on Op Mainnet Optimism Explorer__](https://optimistic.etherscan.io/address/0x204C6f131bb7F258b2Ea1593f5309911d8E458eD)
 * - [__View Contract on Bnb Smart Chain Bsc Scan__](https://bscscan.com/address/0x49c38108870e74Cb9420C0991a85D3edd6363F75)
 * - [__View Contract on Gnosis Gnosisscan__](https://gnosisscan.io/address/0xEbdA4ceF883A7B12c4E669Ebc58927FBa8447C7D)
 * - [__View Contract on Polygon Polygon Scan__](https://polygonscan.com/address/0x6EeE6060f715257b970700bc2656De21dEdF074C)
 * - [__View Contract on Base Basescan__](https://basescan.org/address/0x19ba78B9cDB05A877718841c574325fdB53601bb)
 * - [__View Contract on Arbitrum One Arbiscan__](https://arbiscan.io/address/0x731FdBB12944973B500518aea61942381d7e240D)
 * - [__View Contract on Celo Celo Explorer__](https://celoscan.io/address/0x9d369e78e1a682cE0F8d9aD849BeA4FE1c3bD3Ad)
 * - [__View Contract on Avalanche Fuji Snow Trace__](https://testnet.snowtrace.io/address/0x16843ac25Ccc58Aa7960ba05f61cBB17b36b130A)
 * - [__View Contract on Avalanche Snow Trace__](https://snowtrace.io/address/0x6946c5B38Ffea373b0a2340b4AEf0De8F6782e58)
 * - [__View Contract on Base Sepolia Basescan__](https://sepolia.basescan.org/address/0x6836F23d6171D74Ef62FcF776655aBcD2bcd62Ef)
 * - [__View Contract on Scroll Sepolia Scrollscan__](https://sepolia.scrollscan.com/address/0xbc46B4Aa41c055578306820013d4B65fff42711E)
 * - [__View Contract on Scroll Scrollscan__](https://scrollscan.com/address/0xB3bcD6da1eeB6c97258B3806A853A6dcD3B6C00c)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x6836F23d6171D74Ef62FcF776655aBcD2bcd62Ef)
 * - [__View Contract on Op Sepolia Blockscout__](https://optimism-sepolia.blockscout.com/address/0x8a3170AdbC67233196371226141736E4151e7C26)
 * - [__View Contract on Degen Degen Chain Explorer__](https://explorer.degen.tips/address/0x82cc052d1b17aC554a22A88D5876B56c6b51e95c)
 */
export const useConstantFlowAgreementV1FlowUpdatedExtensionEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: constantFlowAgreementV1Abi,
    address: constantFlowAgreementV1Address,
    eventName: 'FlowUpdatedExtension',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link constantFlowAgreementV1Abi}__ and `eventName` set to `"Initialized"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x2844c1BBdA121E9E43105630b9C8310e5c72744b)
 * - [__View Contract on Op Mainnet Optimism Explorer__](https://optimistic.etherscan.io/address/0x204C6f131bb7F258b2Ea1593f5309911d8E458eD)
 * - [__View Contract on Bnb Smart Chain Bsc Scan__](https://bscscan.com/address/0x49c38108870e74Cb9420C0991a85D3edd6363F75)
 * - [__View Contract on Gnosis Gnosisscan__](https://gnosisscan.io/address/0xEbdA4ceF883A7B12c4E669Ebc58927FBa8447C7D)
 * - [__View Contract on Polygon Polygon Scan__](https://polygonscan.com/address/0x6EeE6060f715257b970700bc2656De21dEdF074C)
 * - [__View Contract on Base Basescan__](https://basescan.org/address/0x19ba78B9cDB05A877718841c574325fdB53601bb)
 * - [__View Contract on Arbitrum One Arbiscan__](https://arbiscan.io/address/0x731FdBB12944973B500518aea61942381d7e240D)
 * - [__View Contract on Celo Celo Explorer__](https://celoscan.io/address/0x9d369e78e1a682cE0F8d9aD849BeA4FE1c3bD3Ad)
 * - [__View Contract on Avalanche Fuji Snow Trace__](https://testnet.snowtrace.io/address/0x16843ac25Ccc58Aa7960ba05f61cBB17b36b130A)
 * - [__View Contract on Avalanche Snow Trace__](https://snowtrace.io/address/0x6946c5B38Ffea373b0a2340b4AEf0De8F6782e58)
 * - [__View Contract on Base Sepolia Basescan__](https://sepolia.basescan.org/address/0x6836F23d6171D74Ef62FcF776655aBcD2bcd62Ef)
 * - [__View Contract on Scroll Sepolia Scrollscan__](https://sepolia.scrollscan.com/address/0xbc46B4Aa41c055578306820013d4B65fff42711E)
 * - [__View Contract on Scroll Scrollscan__](https://scrollscan.com/address/0xB3bcD6da1eeB6c97258B3806A853A6dcD3B6C00c)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x6836F23d6171D74Ef62FcF776655aBcD2bcd62Ef)
 * - [__View Contract on Op Sepolia Blockscout__](https://optimism-sepolia.blockscout.com/address/0x8a3170AdbC67233196371226141736E4151e7C26)
 * - [__View Contract on Degen Degen Chain Explorer__](https://explorer.degen.tips/address/0x82cc052d1b17aC554a22A88D5876B56c6b51e95c)
 */
export const useConstantFlowAgreementV1InitializedEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: constantFlowAgreementV1Abi,
    address: constantFlowAgreementV1Address,
    eventName: 'Initialized',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link erc20Abi}__
 */
export const useErc20Read = /*#__PURE__*/ createUseReadContract({
  abi: erc20Abi,
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link erc20Abi}__ and `functionName` set to `"allowance"`
 */
export const useErc20Allowance = /*#__PURE__*/ createUseReadContract({
  abi: erc20Abi,
  functionName: 'allowance',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link erc20Abi}__ and `functionName` set to `"balanceOf"`
 */
export const useErc20BalanceOf = /*#__PURE__*/ createUseReadContract({
  abi: erc20Abi,
  functionName: 'balanceOf',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link erc20Abi}__ and `functionName` set to `"decimals"`
 */
export const useErc20Decimals = /*#__PURE__*/ createUseReadContract({
  abi: erc20Abi,
  functionName: 'decimals',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link erc20Abi}__ and `functionName` set to `"name"`
 */
export const useErc20Name = /*#__PURE__*/ createUseReadContract({
  abi: erc20Abi,
  functionName: 'name',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link erc20Abi}__ and `functionName` set to `"symbol"`
 */
export const useErc20Symbol = /*#__PURE__*/ createUseReadContract({
  abi: erc20Abi,
  functionName: 'symbol',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link erc20Abi}__ and `functionName` set to `"totalSupply"`
 */
export const useErc20TotalSupply = /*#__PURE__*/ createUseReadContract({
  abi: erc20Abi,
  functionName: 'totalSupply',
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link erc20Abi}__
 */
export const useErc20Write = /*#__PURE__*/ createUseWriteContract({
  abi: erc20Abi,
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link erc20Abi}__ and `functionName` set to `"approve"`
 */
export const useErc20Approve = /*#__PURE__*/ createUseWriteContract({
  abi: erc20Abi,
  functionName: 'approve',
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link erc20Abi}__ and `functionName` set to `"transfer"`
 */
export const useErc20Transfer = /*#__PURE__*/ createUseWriteContract({
  abi: erc20Abi,
  functionName: 'transfer',
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link erc20Abi}__ and `functionName` set to `"transferFrom"`
 */
export const useErc20TransferFrom = /*#__PURE__*/ createUseWriteContract({
  abi: erc20Abi,
  functionName: 'transferFrom',
})

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link erc20Abi}__
 */
export const usePrepareErc20Write = /*#__PURE__*/ createUseSimulateContract({
  abi: erc20Abi,
})

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link erc20Abi}__ and `functionName` set to `"approve"`
 */
export const usePrepareErc20Approve = /*#__PURE__*/ createUseSimulateContract({
  abi: erc20Abi,
  functionName: 'approve',
})

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link erc20Abi}__ and `functionName` set to `"transfer"`
 */
export const usePrepareErc20Transfer = /*#__PURE__*/ createUseSimulateContract({
  abi: erc20Abi,
  functionName: 'transfer',
})

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link erc20Abi}__ and `functionName` set to `"transferFrom"`
 */
export const usePrepareErc20TransferFrom =
  /*#__PURE__*/ createUseSimulateContract({
    abi: erc20Abi,
    functionName: 'transferFrom',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link erc20Abi}__
 */
export const useErc20Event = /*#__PURE__*/ createUseWatchContractEvent({
  abi: erc20Abi,
})

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link erc20Abi}__ and `eventName` set to `"Approval"`
 */
export const useErc20ApprovalEvent = /*#__PURE__*/ createUseWatchContractEvent({
  abi: erc20Abi,
  eventName: 'Approval',
})

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link erc20Abi}__ and `eventName` set to `"Transfer"`
 */
export const useErc20TransferEvent = /*#__PURE__*/ createUseWatchContractEvent({
  abi: erc20Abi,
  eventName: 'Transfer',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link generalDistributionAgreementV1Abi}__
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0xAAdBB3Eee3Bd080f5353d86DdF1916aCA3fAC842)
 * - [__View Contract on Op Mainnet Optimism Explorer__](https://optimistic.etherscan.io/address/0x68Ae17fa7a31b86F306c383277552fd4813b0d35)
 * - [__View Contract on Bnb Smart Chain Bsc Scan__](https://bscscan.com/address/0x3bbFA4C406719424C7f66CD97A8Fe27Af383d3e2)
 * - [__View Contract on Gnosis Gnosisscan__](https://gnosisscan.io/address/0xd7992D358A20478c82dDEd98B3D8A9da46e99b82)
 * - [__View Contract on Polygon Polygon Scan__](https://polygonscan.com/address/0x961dd5A052741B49B6CBf6759591f9D8576fCFb0)
 * - [__View Contract on Base Basescan__](https://basescan.org/address/0xfE6c87BE05feDB2059d2EC41bA0A09826C9FD7aa)
 * - [__View Contract on Arbitrum One Arbiscan__](https://arbiscan.io/address/0x1e299701792a2aF01408B122419d65Fd2dF0Ba02)
 * - [__View Contract on Celo Celo Explorer__](https://celoscan.io/address/0x308b7405272d11494716e30C6E972DbF6fb89555)
 * - [__View Contract on Avalanche Fuji Snow Trace__](https://testnet.snowtrace.io/address/0x51f571D934C59185f13d17301a36c07A2268B814)
 * - [__View Contract on Avalanche Snow Trace__](https://snowtrace.io/address/0xA7b197cD5b0cEF6d62c4A0a851E3581f5E62e4D2)
 * - [__View Contract on Base Sepolia Basescan__](https://sepolia.basescan.org/address/0x53F4f44C813Dc380182d0b2b67fe5832A12B97f8)
 * - [__View Contract on Scroll Sepolia Scrollscan__](https://sepolia.scrollscan.com/address/0x93fA9B627eE016990Fe5e654F923aaE8a480a75b)
 * - [__View Contract on Scroll Scrollscan__](https://scrollscan.com/address/0x97a9f293d7eD13f3fbD499cE684Ed4F103295a28)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x9823364056BcA85Dc3c4a3b96801314D082C8Eb9)
 * - [__View Contract on Op Sepolia Blockscout__](https://optimism-sepolia.blockscout.com/address/0xd453d38A001B47271488886532f1CCeAbf0c7eF3)
 * - [__View Contract on Degen Degen Chain Explorer__](https://explorer.degen.tips/address/0x210a01ad187003603B2287F78579ec103Eb70D9B)
 */
export const useGeneralDistributionAgreementV1Read =
  /*#__PURE__*/ createUseReadContract({
    abi: generalDistributionAgreementV1Abi,
    address: generalDistributionAgreementV1Address,
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link generalDistributionAgreementV1Abi}__ and `functionName` set to `"SLOTS_BITMAP_LIBRARY_ADDRESS"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0xAAdBB3Eee3Bd080f5353d86DdF1916aCA3fAC842)
 * - [__View Contract on Op Mainnet Optimism Explorer__](https://optimistic.etherscan.io/address/0x68Ae17fa7a31b86F306c383277552fd4813b0d35)
 * - [__View Contract on Bnb Smart Chain Bsc Scan__](https://bscscan.com/address/0x3bbFA4C406719424C7f66CD97A8Fe27Af383d3e2)
 * - [__View Contract on Gnosis Gnosisscan__](https://gnosisscan.io/address/0xd7992D358A20478c82dDEd98B3D8A9da46e99b82)
 * - [__View Contract on Polygon Polygon Scan__](https://polygonscan.com/address/0x961dd5A052741B49B6CBf6759591f9D8576fCFb0)
 * - [__View Contract on Base Basescan__](https://basescan.org/address/0xfE6c87BE05feDB2059d2EC41bA0A09826C9FD7aa)
 * - [__View Contract on Arbitrum One Arbiscan__](https://arbiscan.io/address/0x1e299701792a2aF01408B122419d65Fd2dF0Ba02)
 * - [__View Contract on Celo Celo Explorer__](https://celoscan.io/address/0x308b7405272d11494716e30C6E972DbF6fb89555)
 * - [__View Contract on Avalanche Fuji Snow Trace__](https://testnet.snowtrace.io/address/0x51f571D934C59185f13d17301a36c07A2268B814)
 * - [__View Contract on Avalanche Snow Trace__](https://snowtrace.io/address/0xA7b197cD5b0cEF6d62c4A0a851E3581f5E62e4D2)
 * - [__View Contract on Base Sepolia Basescan__](https://sepolia.basescan.org/address/0x53F4f44C813Dc380182d0b2b67fe5832A12B97f8)
 * - [__View Contract on Scroll Sepolia Scrollscan__](https://sepolia.scrollscan.com/address/0x93fA9B627eE016990Fe5e654F923aaE8a480a75b)
 * - [__View Contract on Scroll Scrollscan__](https://scrollscan.com/address/0x97a9f293d7eD13f3fbD499cE684Ed4F103295a28)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x9823364056BcA85Dc3c4a3b96801314D082C8Eb9)
 * - [__View Contract on Op Sepolia Blockscout__](https://optimism-sepolia.blockscout.com/address/0xd453d38A001B47271488886532f1CCeAbf0c7eF3)
 * - [__View Contract on Degen Degen Chain Explorer__](https://explorer.degen.tips/address/0x210a01ad187003603B2287F78579ec103Eb70D9B)
 */
export const useGeneralDistributionAgreementV1SlotsBitmapLibraryAddress =
  /*#__PURE__*/ createUseReadContract({
    abi: generalDistributionAgreementV1Abi,
    address: generalDistributionAgreementV1Address,
    functionName: 'SLOTS_BITMAP_LIBRARY_ADDRESS',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link generalDistributionAgreementV1Abi}__ and `functionName` set to `"SUPERFLUID_POOL_DEPLOYER_ADDRESS"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0xAAdBB3Eee3Bd080f5353d86DdF1916aCA3fAC842)
 * - [__View Contract on Op Mainnet Optimism Explorer__](https://optimistic.etherscan.io/address/0x68Ae17fa7a31b86F306c383277552fd4813b0d35)
 * - [__View Contract on Bnb Smart Chain Bsc Scan__](https://bscscan.com/address/0x3bbFA4C406719424C7f66CD97A8Fe27Af383d3e2)
 * - [__View Contract on Gnosis Gnosisscan__](https://gnosisscan.io/address/0xd7992D358A20478c82dDEd98B3D8A9da46e99b82)
 * - [__View Contract on Polygon Polygon Scan__](https://polygonscan.com/address/0x961dd5A052741B49B6CBf6759591f9D8576fCFb0)
 * - [__View Contract on Base Basescan__](https://basescan.org/address/0xfE6c87BE05feDB2059d2EC41bA0A09826C9FD7aa)
 * - [__View Contract on Arbitrum One Arbiscan__](https://arbiscan.io/address/0x1e299701792a2aF01408B122419d65Fd2dF0Ba02)
 * - [__View Contract on Celo Celo Explorer__](https://celoscan.io/address/0x308b7405272d11494716e30C6E972DbF6fb89555)
 * - [__View Contract on Avalanche Fuji Snow Trace__](https://testnet.snowtrace.io/address/0x51f571D934C59185f13d17301a36c07A2268B814)
 * - [__View Contract on Avalanche Snow Trace__](https://snowtrace.io/address/0xA7b197cD5b0cEF6d62c4A0a851E3581f5E62e4D2)
 * - [__View Contract on Base Sepolia Basescan__](https://sepolia.basescan.org/address/0x53F4f44C813Dc380182d0b2b67fe5832A12B97f8)
 * - [__View Contract on Scroll Sepolia Scrollscan__](https://sepolia.scrollscan.com/address/0x93fA9B627eE016990Fe5e654F923aaE8a480a75b)
 * - [__View Contract on Scroll Scrollscan__](https://scrollscan.com/address/0x97a9f293d7eD13f3fbD499cE684Ed4F103295a28)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x9823364056BcA85Dc3c4a3b96801314D082C8Eb9)
 * - [__View Contract on Op Sepolia Blockscout__](https://optimism-sepolia.blockscout.com/address/0xd453d38A001B47271488886532f1CCeAbf0c7eF3)
 * - [__View Contract on Degen Degen Chain Explorer__](https://explorer.degen.tips/address/0x210a01ad187003603B2287F78579ec103Eb70D9B)
 */
export const useGeneralDistributionAgreementV1SuperfluidPoolDeployerAddress =
  /*#__PURE__*/ createUseReadContract({
    abi: generalDistributionAgreementV1Abi,
    address: generalDistributionAgreementV1Address,
    functionName: 'SUPERFLUID_POOL_DEPLOYER_ADDRESS',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link generalDistributionAgreementV1Abi}__ and `functionName` set to `"agreementType"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0xAAdBB3Eee3Bd080f5353d86DdF1916aCA3fAC842)
 * - [__View Contract on Op Mainnet Optimism Explorer__](https://optimistic.etherscan.io/address/0x68Ae17fa7a31b86F306c383277552fd4813b0d35)
 * - [__View Contract on Bnb Smart Chain Bsc Scan__](https://bscscan.com/address/0x3bbFA4C406719424C7f66CD97A8Fe27Af383d3e2)
 * - [__View Contract on Gnosis Gnosisscan__](https://gnosisscan.io/address/0xd7992D358A20478c82dDEd98B3D8A9da46e99b82)
 * - [__View Contract on Polygon Polygon Scan__](https://polygonscan.com/address/0x961dd5A052741B49B6CBf6759591f9D8576fCFb0)
 * - [__View Contract on Base Basescan__](https://basescan.org/address/0xfE6c87BE05feDB2059d2EC41bA0A09826C9FD7aa)
 * - [__View Contract on Arbitrum One Arbiscan__](https://arbiscan.io/address/0x1e299701792a2aF01408B122419d65Fd2dF0Ba02)
 * - [__View Contract on Celo Celo Explorer__](https://celoscan.io/address/0x308b7405272d11494716e30C6E972DbF6fb89555)
 * - [__View Contract on Avalanche Fuji Snow Trace__](https://testnet.snowtrace.io/address/0x51f571D934C59185f13d17301a36c07A2268B814)
 * - [__View Contract on Avalanche Snow Trace__](https://snowtrace.io/address/0xA7b197cD5b0cEF6d62c4A0a851E3581f5E62e4D2)
 * - [__View Contract on Base Sepolia Basescan__](https://sepolia.basescan.org/address/0x53F4f44C813Dc380182d0b2b67fe5832A12B97f8)
 * - [__View Contract on Scroll Sepolia Scrollscan__](https://sepolia.scrollscan.com/address/0x93fA9B627eE016990Fe5e654F923aaE8a480a75b)
 * - [__View Contract on Scroll Scrollscan__](https://scrollscan.com/address/0x97a9f293d7eD13f3fbD499cE684Ed4F103295a28)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x9823364056BcA85Dc3c4a3b96801314D082C8Eb9)
 * - [__View Contract on Op Sepolia Blockscout__](https://optimism-sepolia.blockscout.com/address/0xd453d38A001B47271488886532f1CCeAbf0c7eF3)
 * - [__View Contract on Degen Degen Chain Explorer__](https://explorer.degen.tips/address/0x210a01ad187003603B2287F78579ec103Eb70D9B)
 */
export const useGeneralDistributionAgreementV1AgreementType =
  /*#__PURE__*/ createUseReadContract({
    abi: generalDistributionAgreementV1Abi,
    address: generalDistributionAgreementV1Address,
    functionName: 'agreementType',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link generalDistributionAgreementV1Abi}__ and `functionName` set to `"getCodeAddress"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0xAAdBB3Eee3Bd080f5353d86DdF1916aCA3fAC842)
 * - [__View Contract on Op Mainnet Optimism Explorer__](https://optimistic.etherscan.io/address/0x68Ae17fa7a31b86F306c383277552fd4813b0d35)
 * - [__View Contract on Bnb Smart Chain Bsc Scan__](https://bscscan.com/address/0x3bbFA4C406719424C7f66CD97A8Fe27Af383d3e2)
 * - [__View Contract on Gnosis Gnosisscan__](https://gnosisscan.io/address/0xd7992D358A20478c82dDEd98B3D8A9da46e99b82)
 * - [__View Contract on Polygon Polygon Scan__](https://polygonscan.com/address/0x961dd5A052741B49B6CBf6759591f9D8576fCFb0)
 * - [__View Contract on Base Basescan__](https://basescan.org/address/0xfE6c87BE05feDB2059d2EC41bA0A09826C9FD7aa)
 * - [__View Contract on Arbitrum One Arbiscan__](https://arbiscan.io/address/0x1e299701792a2aF01408B122419d65Fd2dF0Ba02)
 * - [__View Contract on Celo Celo Explorer__](https://celoscan.io/address/0x308b7405272d11494716e30C6E972DbF6fb89555)
 * - [__View Contract on Avalanche Fuji Snow Trace__](https://testnet.snowtrace.io/address/0x51f571D934C59185f13d17301a36c07A2268B814)
 * - [__View Contract on Avalanche Snow Trace__](https://snowtrace.io/address/0xA7b197cD5b0cEF6d62c4A0a851E3581f5E62e4D2)
 * - [__View Contract on Base Sepolia Basescan__](https://sepolia.basescan.org/address/0x53F4f44C813Dc380182d0b2b67fe5832A12B97f8)
 * - [__View Contract on Scroll Sepolia Scrollscan__](https://sepolia.scrollscan.com/address/0x93fA9B627eE016990Fe5e654F923aaE8a480a75b)
 * - [__View Contract on Scroll Scrollscan__](https://scrollscan.com/address/0x97a9f293d7eD13f3fbD499cE684Ed4F103295a28)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x9823364056BcA85Dc3c4a3b96801314D082C8Eb9)
 * - [__View Contract on Op Sepolia Blockscout__](https://optimism-sepolia.blockscout.com/address/0xd453d38A001B47271488886532f1CCeAbf0c7eF3)
 * - [__View Contract on Degen Degen Chain Explorer__](https://explorer.degen.tips/address/0x210a01ad187003603B2287F78579ec103Eb70D9B)
 */
export const useGeneralDistributionAgreementV1GetCodeAddress =
  /*#__PURE__*/ createUseReadContract({
    abi: generalDistributionAgreementV1Abi,
    address: generalDistributionAgreementV1Address,
    functionName: 'getCodeAddress',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link generalDistributionAgreementV1Abi}__ and `functionName` set to `"proxiableUUID"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0xAAdBB3Eee3Bd080f5353d86DdF1916aCA3fAC842)
 * - [__View Contract on Op Mainnet Optimism Explorer__](https://optimistic.etherscan.io/address/0x68Ae17fa7a31b86F306c383277552fd4813b0d35)
 * - [__View Contract on Bnb Smart Chain Bsc Scan__](https://bscscan.com/address/0x3bbFA4C406719424C7f66CD97A8Fe27Af383d3e2)
 * - [__View Contract on Gnosis Gnosisscan__](https://gnosisscan.io/address/0xd7992D358A20478c82dDEd98B3D8A9da46e99b82)
 * - [__View Contract on Polygon Polygon Scan__](https://polygonscan.com/address/0x961dd5A052741B49B6CBf6759591f9D8576fCFb0)
 * - [__View Contract on Base Basescan__](https://basescan.org/address/0xfE6c87BE05feDB2059d2EC41bA0A09826C9FD7aa)
 * - [__View Contract on Arbitrum One Arbiscan__](https://arbiscan.io/address/0x1e299701792a2aF01408B122419d65Fd2dF0Ba02)
 * - [__View Contract on Celo Celo Explorer__](https://celoscan.io/address/0x308b7405272d11494716e30C6E972DbF6fb89555)
 * - [__View Contract on Avalanche Fuji Snow Trace__](https://testnet.snowtrace.io/address/0x51f571D934C59185f13d17301a36c07A2268B814)
 * - [__View Contract on Avalanche Snow Trace__](https://snowtrace.io/address/0xA7b197cD5b0cEF6d62c4A0a851E3581f5E62e4D2)
 * - [__View Contract on Base Sepolia Basescan__](https://sepolia.basescan.org/address/0x53F4f44C813Dc380182d0b2b67fe5832A12B97f8)
 * - [__View Contract on Scroll Sepolia Scrollscan__](https://sepolia.scrollscan.com/address/0x93fA9B627eE016990Fe5e654F923aaE8a480a75b)
 * - [__View Contract on Scroll Scrollscan__](https://scrollscan.com/address/0x97a9f293d7eD13f3fbD499cE684Ed4F103295a28)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x9823364056BcA85Dc3c4a3b96801314D082C8Eb9)
 * - [__View Contract on Op Sepolia Blockscout__](https://optimism-sepolia.blockscout.com/address/0xd453d38A001B47271488886532f1CCeAbf0c7eF3)
 * - [__View Contract on Degen Degen Chain Explorer__](https://explorer.degen.tips/address/0x210a01ad187003603B2287F78579ec103Eb70D9B)
 */
export const useGeneralDistributionAgreementV1ProxiableUuid =
  /*#__PURE__*/ createUseReadContract({
    abi: generalDistributionAgreementV1Abi,
    address: generalDistributionAgreementV1Address,
    functionName: 'proxiableUUID',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link generalDistributionAgreementV1Abi}__ and `functionName` set to `"superfluidPoolBeacon"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0xAAdBB3Eee3Bd080f5353d86DdF1916aCA3fAC842)
 * - [__View Contract on Op Mainnet Optimism Explorer__](https://optimistic.etherscan.io/address/0x68Ae17fa7a31b86F306c383277552fd4813b0d35)
 * - [__View Contract on Bnb Smart Chain Bsc Scan__](https://bscscan.com/address/0x3bbFA4C406719424C7f66CD97A8Fe27Af383d3e2)
 * - [__View Contract on Gnosis Gnosisscan__](https://gnosisscan.io/address/0xd7992D358A20478c82dDEd98B3D8A9da46e99b82)
 * - [__View Contract on Polygon Polygon Scan__](https://polygonscan.com/address/0x961dd5A052741B49B6CBf6759591f9D8576fCFb0)
 * - [__View Contract on Base Basescan__](https://basescan.org/address/0xfE6c87BE05feDB2059d2EC41bA0A09826C9FD7aa)
 * - [__View Contract on Arbitrum One Arbiscan__](https://arbiscan.io/address/0x1e299701792a2aF01408B122419d65Fd2dF0Ba02)
 * - [__View Contract on Celo Celo Explorer__](https://celoscan.io/address/0x308b7405272d11494716e30C6E972DbF6fb89555)
 * - [__View Contract on Avalanche Fuji Snow Trace__](https://testnet.snowtrace.io/address/0x51f571D934C59185f13d17301a36c07A2268B814)
 * - [__View Contract on Avalanche Snow Trace__](https://snowtrace.io/address/0xA7b197cD5b0cEF6d62c4A0a851E3581f5E62e4D2)
 * - [__View Contract on Base Sepolia Basescan__](https://sepolia.basescan.org/address/0x53F4f44C813Dc380182d0b2b67fe5832A12B97f8)
 * - [__View Contract on Scroll Sepolia Scrollscan__](https://sepolia.scrollscan.com/address/0x93fA9B627eE016990Fe5e654F923aaE8a480a75b)
 * - [__View Contract on Scroll Scrollscan__](https://scrollscan.com/address/0x97a9f293d7eD13f3fbD499cE684Ed4F103295a28)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x9823364056BcA85Dc3c4a3b96801314D082C8Eb9)
 * - [__View Contract on Op Sepolia Blockscout__](https://optimism-sepolia.blockscout.com/address/0xd453d38A001B47271488886532f1CCeAbf0c7eF3)
 * - [__View Contract on Degen Degen Chain Explorer__](https://explorer.degen.tips/address/0x210a01ad187003603B2287F78579ec103Eb70D9B)
 */
export const useGeneralDistributionAgreementV1SuperfluidPoolBeacon =
  /*#__PURE__*/ createUseReadContract({
    abi: generalDistributionAgreementV1Abi,
    address: generalDistributionAgreementV1Address,
    functionName: 'superfluidPoolBeacon',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link generalDistributionAgreementV1Abi}__ and `functionName` set to `"realtimeBalanceOf"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0xAAdBB3Eee3Bd080f5353d86DdF1916aCA3fAC842)
 * - [__View Contract on Op Mainnet Optimism Explorer__](https://optimistic.etherscan.io/address/0x68Ae17fa7a31b86F306c383277552fd4813b0d35)
 * - [__View Contract on Bnb Smart Chain Bsc Scan__](https://bscscan.com/address/0x3bbFA4C406719424C7f66CD97A8Fe27Af383d3e2)
 * - [__View Contract on Gnosis Gnosisscan__](https://gnosisscan.io/address/0xd7992D358A20478c82dDEd98B3D8A9da46e99b82)
 * - [__View Contract on Polygon Polygon Scan__](https://polygonscan.com/address/0x961dd5A052741B49B6CBf6759591f9D8576fCFb0)
 * - [__View Contract on Base Basescan__](https://basescan.org/address/0xfE6c87BE05feDB2059d2EC41bA0A09826C9FD7aa)
 * - [__View Contract on Arbitrum One Arbiscan__](https://arbiscan.io/address/0x1e299701792a2aF01408B122419d65Fd2dF0Ba02)
 * - [__View Contract on Celo Celo Explorer__](https://celoscan.io/address/0x308b7405272d11494716e30C6E972DbF6fb89555)
 * - [__View Contract on Avalanche Fuji Snow Trace__](https://testnet.snowtrace.io/address/0x51f571D934C59185f13d17301a36c07A2268B814)
 * - [__View Contract on Avalanche Snow Trace__](https://snowtrace.io/address/0xA7b197cD5b0cEF6d62c4A0a851E3581f5E62e4D2)
 * - [__View Contract on Base Sepolia Basescan__](https://sepolia.basescan.org/address/0x53F4f44C813Dc380182d0b2b67fe5832A12B97f8)
 * - [__View Contract on Scroll Sepolia Scrollscan__](https://sepolia.scrollscan.com/address/0x93fA9B627eE016990Fe5e654F923aaE8a480a75b)
 * - [__View Contract on Scroll Scrollscan__](https://scrollscan.com/address/0x97a9f293d7eD13f3fbD499cE684Ed4F103295a28)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x9823364056BcA85Dc3c4a3b96801314D082C8Eb9)
 * - [__View Contract on Op Sepolia Blockscout__](https://optimism-sepolia.blockscout.com/address/0xd453d38A001B47271488886532f1CCeAbf0c7eF3)
 * - [__View Contract on Degen Degen Chain Explorer__](https://explorer.degen.tips/address/0x210a01ad187003603B2287F78579ec103Eb70D9B)
 */
export const useGeneralDistributionAgreementV1RealtimeBalanceOf =
  /*#__PURE__*/ createUseReadContract({
    abi: generalDistributionAgreementV1Abi,
    address: generalDistributionAgreementV1Address,
    functionName: 'realtimeBalanceOf',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link generalDistributionAgreementV1Abi}__ and `functionName` set to `"realtimeBalanceOfNow"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0xAAdBB3Eee3Bd080f5353d86DdF1916aCA3fAC842)
 * - [__View Contract on Op Mainnet Optimism Explorer__](https://optimistic.etherscan.io/address/0x68Ae17fa7a31b86F306c383277552fd4813b0d35)
 * - [__View Contract on Bnb Smart Chain Bsc Scan__](https://bscscan.com/address/0x3bbFA4C406719424C7f66CD97A8Fe27Af383d3e2)
 * - [__View Contract on Gnosis Gnosisscan__](https://gnosisscan.io/address/0xd7992D358A20478c82dDEd98B3D8A9da46e99b82)
 * - [__View Contract on Polygon Polygon Scan__](https://polygonscan.com/address/0x961dd5A052741B49B6CBf6759591f9D8576fCFb0)
 * - [__View Contract on Base Basescan__](https://basescan.org/address/0xfE6c87BE05feDB2059d2EC41bA0A09826C9FD7aa)
 * - [__View Contract on Arbitrum One Arbiscan__](https://arbiscan.io/address/0x1e299701792a2aF01408B122419d65Fd2dF0Ba02)
 * - [__View Contract on Celo Celo Explorer__](https://celoscan.io/address/0x308b7405272d11494716e30C6E972DbF6fb89555)
 * - [__View Contract on Avalanche Fuji Snow Trace__](https://testnet.snowtrace.io/address/0x51f571D934C59185f13d17301a36c07A2268B814)
 * - [__View Contract on Avalanche Snow Trace__](https://snowtrace.io/address/0xA7b197cD5b0cEF6d62c4A0a851E3581f5E62e4D2)
 * - [__View Contract on Base Sepolia Basescan__](https://sepolia.basescan.org/address/0x53F4f44C813Dc380182d0b2b67fe5832A12B97f8)
 * - [__View Contract on Scroll Sepolia Scrollscan__](https://sepolia.scrollscan.com/address/0x93fA9B627eE016990Fe5e654F923aaE8a480a75b)
 * - [__View Contract on Scroll Scrollscan__](https://scrollscan.com/address/0x97a9f293d7eD13f3fbD499cE684Ed4F103295a28)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x9823364056BcA85Dc3c4a3b96801314D082C8Eb9)
 * - [__View Contract on Op Sepolia Blockscout__](https://optimism-sepolia.blockscout.com/address/0xd453d38A001B47271488886532f1CCeAbf0c7eF3)
 * - [__View Contract on Degen Degen Chain Explorer__](https://explorer.degen.tips/address/0x210a01ad187003603B2287F78579ec103Eb70D9B)
 */
export const useGeneralDistributionAgreementV1RealtimeBalanceOfNow =
  /*#__PURE__*/ createUseReadContract({
    abi: generalDistributionAgreementV1Abi,
    address: generalDistributionAgreementV1Address,
    functionName: 'realtimeBalanceOfNow',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link generalDistributionAgreementV1Abi}__ and `functionName` set to `"getNetFlow"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0xAAdBB3Eee3Bd080f5353d86DdF1916aCA3fAC842)
 * - [__View Contract on Op Mainnet Optimism Explorer__](https://optimistic.etherscan.io/address/0x68Ae17fa7a31b86F306c383277552fd4813b0d35)
 * - [__View Contract on Bnb Smart Chain Bsc Scan__](https://bscscan.com/address/0x3bbFA4C406719424C7f66CD97A8Fe27Af383d3e2)
 * - [__View Contract on Gnosis Gnosisscan__](https://gnosisscan.io/address/0xd7992D358A20478c82dDEd98B3D8A9da46e99b82)
 * - [__View Contract on Polygon Polygon Scan__](https://polygonscan.com/address/0x961dd5A052741B49B6CBf6759591f9D8576fCFb0)
 * - [__View Contract on Base Basescan__](https://basescan.org/address/0xfE6c87BE05feDB2059d2EC41bA0A09826C9FD7aa)
 * - [__View Contract on Arbitrum One Arbiscan__](https://arbiscan.io/address/0x1e299701792a2aF01408B122419d65Fd2dF0Ba02)
 * - [__View Contract on Celo Celo Explorer__](https://celoscan.io/address/0x308b7405272d11494716e30C6E972DbF6fb89555)
 * - [__View Contract on Avalanche Fuji Snow Trace__](https://testnet.snowtrace.io/address/0x51f571D934C59185f13d17301a36c07A2268B814)
 * - [__View Contract on Avalanche Snow Trace__](https://snowtrace.io/address/0xA7b197cD5b0cEF6d62c4A0a851E3581f5E62e4D2)
 * - [__View Contract on Base Sepolia Basescan__](https://sepolia.basescan.org/address/0x53F4f44C813Dc380182d0b2b67fe5832A12B97f8)
 * - [__View Contract on Scroll Sepolia Scrollscan__](https://sepolia.scrollscan.com/address/0x93fA9B627eE016990Fe5e654F923aaE8a480a75b)
 * - [__View Contract on Scroll Scrollscan__](https://scrollscan.com/address/0x97a9f293d7eD13f3fbD499cE684Ed4F103295a28)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x9823364056BcA85Dc3c4a3b96801314D082C8Eb9)
 * - [__View Contract on Op Sepolia Blockscout__](https://optimism-sepolia.blockscout.com/address/0xd453d38A001B47271488886532f1CCeAbf0c7eF3)
 * - [__View Contract on Degen Degen Chain Explorer__](https://explorer.degen.tips/address/0x210a01ad187003603B2287F78579ec103Eb70D9B)
 */
export const useGeneralDistributionAgreementV1GetNetFlow =
  /*#__PURE__*/ createUseReadContract({
    abi: generalDistributionAgreementV1Abi,
    address: generalDistributionAgreementV1Address,
    functionName: 'getNetFlow',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link generalDistributionAgreementV1Abi}__ and `functionName` set to `"getFlowRate"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0xAAdBB3Eee3Bd080f5353d86DdF1916aCA3fAC842)
 * - [__View Contract on Op Mainnet Optimism Explorer__](https://optimistic.etherscan.io/address/0x68Ae17fa7a31b86F306c383277552fd4813b0d35)
 * - [__View Contract on Bnb Smart Chain Bsc Scan__](https://bscscan.com/address/0x3bbFA4C406719424C7f66CD97A8Fe27Af383d3e2)
 * - [__View Contract on Gnosis Gnosisscan__](https://gnosisscan.io/address/0xd7992D358A20478c82dDEd98B3D8A9da46e99b82)
 * - [__View Contract on Polygon Polygon Scan__](https://polygonscan.com/address/0x961dd5A052741B49B6CBf6759591f9D8576fCFb0)
 * - [__View Contract on Base Basescan__](https://basescan.org/address/0xfE6c87BE05feDB2059d2EC41bA0A09826C9FD7aa)
 * - [__View Contract on Arbitrum One Arbiscan__](https://arbiscan.io/address/0x1e299701792a2aF01408B122419d65Fd2dF0Ba02)
 * - [__View Contract on Celo Celo Explorer__](https://celoscan.io/address/0x308b7405272d11494716e30C6E972DbF6fb89555)
 * - [__View Contract on Avalanche Fuji Snow Trace__](https://testnet.snowtrace.io/address/0x51f571D934C59185f13d17301a36c07A2268B814)
 * - [__View Contract on Avalanche Snow Trace__](https://snowtrace.io/address/0xA7b197cD5b0cEF6d62c4A0a851E3581f5E62e4D2)
 * - [__View Contract on Base Sepolia Basescan__](https://sepolia.basescan.org/address/0x53F4f44C813Dc380182d0b2b67fe5832A12B97f8)
 * - [__View Contract on Scroll Sepolia Scrollscan__](https://sepolia.scrollscan.com/address/0x93fA9B627eE016990Fe5e654F923aaE8a480a75b)
 * - [__View Contract on Scroll Scrollscan__](https://scrollscan.com/address/0x97a9f293d7eD13f3fbD499cE684Ed4F103295a28)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x9823364056BcA85Dc3c4a3b96801314D082C8Eb9)
 * - [__View Contract on Op Sepolia Blockscout__](https://optimism-sepolia.blockscout.com/address/0xd453d38A001B47271488886532f1CCeAbf0c7eF3)
 * - [__View Contract on Degen Degen Chain Explorer__](https://explorer.degen.tips/address/0x210a01ad187003603B2287F78579ec103Eb70D9B)
 */
export const useGeneralDistributionAgreementV1GetFlowRate =
  /*#__PURE__*/ createUseReadContract({
    abi: generalDistributionAgreementV1Abi,
    address: generalDistributionAgreementV1Address,
    functionName: 'getFlowRate',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link generalDistributionAgreementV1Abi}__ and `functionName` set to `"getFlow"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0xAAdBB3Eee3Bd080f5353d86DdF1916aCA3fAC842)
 * - [__View Contract on Op Mainnet Optimism Explorer__](https://optimistic.etherscan.io/address/0x68Ae17fa7a31b86F306c383277552fd4813b0d35)
 * - [__View Contract on Bnb Smart Chain Bsc Scan__](https://bscscan.com/address/0x3bbFA4C406719424C7f66CD97A8Fe27Af383d3e2)
 * - [__View Contract on Gnosis Gnosisscan__](https://gnosisscan.io/address/0xd7992D358A20478c82dDEd98B3D8A9da46e99b82)
 * - [__View Contract on Polygon Polygon Scan__](https://polygonscan.com/address/0x961dd5A052741B49B6CBf6759591f9D8576fCFb0)
 * - [__View Contract on Base Basescan__](https://basescan.org/address/0xfE6c87BE05feDB2059d2EC41bA0A09826C9FD7aa)
 * - [__View Contract on Arbitrum One Arbiscan__](https://arbiscan.io/address/0x1e299701792a2aF01408B122419d65Fd2dF0Ba02)
 * - [__View Contract on Celo Celo Explorer__](https://celoscan.io/address/0x308b7405272d11494716e30C6E972DbF6fb89555)
 * - [__View Contract on Avalanche Fuji Snow Trace__](https://testnet.snowtrace.io/address/0x51f571D934C59185f13d17301a36c07A2268B814)
 * - [__View Contract on Avalanche Snow Trace__](https://snowtrace.io/address/0xA7b197cD5b0cEF6d62c4A0a851E3581f5E62e4D2)
 * - [__View Contract on Base Sepolia Basescan__](https://sepolia.basescan.org/address/0x53F4f44C813Dc380182d0b2b67fe5832A12B97f8)
 * - [__View Contract on Scroll Sepolia Scrollscan__](https://sepolia.scrollscan.com/address/0x93fA9B627eE016990Fe5e654F923aaE8a480a75b)
 * - [__View Contract on Scroll Scrollscan__](https://scrollscan.com/address/0x97a9f293d7eD13f3fbD499cE684Ed4F103295a28)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x9823364056BcA85Dc3c4a3b96801314D082C8Eb9)
 * - [__View Contract on Op Sepolia Blockscout__](https://optimism-sepolia.blockscout.com/address/0xd453d38A001B47271488886532f1CCeAbf0c7eF3)
 * - [__View Contract on Degen Degen Chain Explorer__](https://explorer.degen.tips/address/0x210a01ad187003603B2287F78579ec103Eb70D9B)
 */
export const useGeneralDistributionAgreementV1GetFlow =
  /*#__PURE__*/ createUseReadContract({
    abi: generalDistributionAgreementV1Abi,
    address: generalDistributionAgreementV1Address,
    functionName: 'getFlow',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link generalDistributionAgreementV1Abi}__ and `functionName` set to `"getAccountFlowInfo"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0xAAdBB3Eee3Bd080f5353d86DdF1916aCA3fAC842)
 * - [__View Contract on Op Mainnet Optimism Explorer__](https://optimistic.etherscan.io/address/0x68Ae17fa7a31b86F306c383277552fd4813b0d35)
 * - [__View Contract on Bnb Smart Chain Bsc Scan__](https://bscscan.com/address/0x3bbFA4C406719424C7f66CD97A8Fe27Af383d3e2)
 * - [__View Contract on Gnosis Gnosisscan__](https://gnosisscan.io/address/0xd7992D358A20478c82dDEd98B3D8A9da46e99b82)
 * - [__View Contract on Polygon Polygon Scan__](https://polygonscan.com/address/0x961dd5A052741B49B6CBf6759591f9D8576fCFb0)
 * - [__View Contract on Base Basescan__](https://basescan.org/address/0xfE6c87BE05feDB2059d2EC41bA0A09826C9FD7aa)
 * - [__View Contract on Arbitrum One Arbiscan__](https://arbiscan.io/address/0x1e299701792a2aF01408B122419d65Fd2dF0Ba02)
 * - [__View Contract on Celo Celo Explorer__](https://celoscan.io/address/0x308b7405272d11494716e30C6E972DbF6fb89555)
 * - [__View Contract on Avalanche Fuji Snow Trace__](https://testnet.snowtrace.io/address/0x51f571D934C59185f13d17301a36c07A2268B814)
 * - [__View Contract on Avalanche Snow Trace__](https://snowtrace.io/address/0xA7b197cD5b0cEF6d62c4A0a851E3581f5E62e4D2)
 * - [__View Contract on Base Sepolia Basescan__](https://sepolia.basescan.org/address/0x53F4f44C813Dc380182d0b2b67fe5832A12B97f8)
 * - [__View Contract on Scroll Sepolia Scrollscan__](https://sepolia.scrollscan.com/address/0x93fA9B627eE016990Fe5e654F923aaE8a480a75b)
 * - [__View Contract on Scroll Scrollscan__](https://scrollscan.com/address/0x97a9f293d7eD13f3fbD499cE684Ed4F103295a28)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x9823364056BcA85Dc3c4a3b96801314D082C8Eb9)
 * - [__View Contract on Op Sepolia Blockscout__](https://optimism-sepolia.blockscout.com/address/0xd453d38A001B47271488886532f1CCeAbf0c7eF3)
 * - [__View Contract on Degen Degen Chain Explorer__](https://explorer.degen.tips/address/0x210a01ad187003603B2287F78579ec103Eb70D9B)
 */
export const useGeneralDistributionAgreementV1GetAccountFlowInfo =
  /*#__PURE__*/ createUseReadContract({
    abi: generalDistributionAgreementV1Abi,
    address: generalDistributionAgreementV1Address,
    functionName: 'getAccountFlowInfo',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link generalDistributionAgreementV1Abi}__ and `functionName` set to `"estimateFlowDistributionActualFlowRate"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0xAAdBB3Eee3Bd080f5353d86DdF1916aCA3fAC842)
 * - [__View Contract on Op Mainnet Optimism Explorer__](https://optimistic.etherscan.io/address/0x68Ae17fa7a31b86F306c383277552fd4813b0d35)
 * - [__View Contract on Bnb Smart Chain Bsc Scan__](https://bscscan.com/address/0x3bbFA4C406719424C7f66CD97A8Fe27Af383d3e2)
 * - [__View Contract on Gnosis Gnosisscan__](https://gnosisscan.io/address/0xd7992D358A20478c82dDEd98B3D8A9da46e99b82)
 * - [__View Contract on Polygon Polygon Scan__](https://polygonscan.com/address/0x961dd5A052741B49B6CBf6759591f9D8576fCFb0)
 * - [__View Contract on Base Basescan__](https://basescan.org/address/0xfE6c87BE05feDB2059d2EC41bA0A09826C9FD7aa)
 * - [__View Contract on Arbitrum One Arbiscan__](https://arbiscan.io/address/0x1e299701792a2aF01408B122419d65Fd2dF0Ba02)
 * - [__View Contract on Celo Celo Explorer__](https://celoscan.io/address/0x308b7405272d11494716e30C6E972DbF6fb89555)
 * - [__View Contract on Avalanche Fuji Snow Trace__](https://testnet.snowtrace.io/address/0x51f571D934C59185f13d17301a36c07A2268B814)
 * - [__View Contract on Avalanche Snow Trace__](https://snowtrace.io/address/0xA7b197cD5b0cEF6d62c4A0a851E3581f5E62e4D2)
 * - [__View Contract on Base Sepolia Basescan__](https://sepolia.basescan.org/address/0x53F4f44C813Dc380182d0b2b67fe5832A12B97f8)
 * - [__View Contract on Scroll Sepolia Scrollscan__](https://sepolia.scrollscan.com/address/0x93fA9B627eE016990Fe5e654F923aaE8a480a75b)
 * - [__View Contract on Scroll Scrollscan__](https://scrollscan.com/address/0x97a9f293d7eD13f3fbD499cE684Ed4F103295a28)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x9823364056BcA85Dc3c4a3b96801314D082C8Eb9)
 * - [__View Contract on Op Sepolia Blockscout__](https://optimism-sepolia.blockscout.com/address/0xd453d38A001B47271488886532f1CCeAbf0c7eF3)
 * - [__View Contract on Degen Degen Chain Explorer__](https://explorer.degen.tips/address/0x210a01ad187003603B2287F78579ec103Eb70D9B)
 */
export const useGeneralDistributionAgreementV1EstimateFlowDistributionActualFlowRate =
  /*#__PURE__*/ createUseReadContract({
    abi: generalDistributionAgreementV1Abi,
    address: generalDistributionAgreementV1Address,
    functionName: 'estimateFlowDistributionActualFlowRate',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link generalDistributionAgreementV1Abi}__ and `functionName` set to `"estimateDistributionActualAmount"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0xAAdBB3Eee3Bd080f5353d86DdF1916aCA3fAC842)
 * - [__View Contract on Op Mainnet Optimism Explorer__](https://optimistic.etherscan.io/address/0x68Ae17fa7a31b86F306c383277552fd4813b0d35)
 * - [__View Contract on Bnb Smart Chain Bsc Scan__](https://bscscan.com/address/0x3bbFA4C406719424C7f66CD97A8Fe27Af383d3e2)
 * - [__View Contract on Gnosis Gnosisscan__](https://gnosisscan.io/address/0xd7992D358A20478c82dDEd98B3D8A9da46e99b82)
 * - [__View Contract on Polygon Polygon Scan__](https://polygonscan.com/address/0x961dd5A052741B49B6CBf6759591f9D8576fCFb0)
 * - [__View Contract on Base Basescan__](https://basescan.org/address/0xfE6c87BE05feDB2059d2EC41bA0A09826C9FD7aa)
 * - [__View Contract on Arbitrum One Arbiscan__](https://arbiscan.io/address/0x1e299701792a2aF01408B122419d65Fd2dF0Ba02)
 * - [__View Contract on Celo Celo Explorer__](https://celoscan.io/address/0x308b7405272d11494716e30C6E972DbF6fb89555)
 * - [__View Contract on Avalanche Fuji Snow Trace__](https://testnet.snowtrace.io/address/0x51f571D934C59185f13d17301a36c07A2268B814)
 * - [__View Contract on Avalanche Snow Trace__](https://snowtrace.io/address/0xA7b197cD5b0cEF6d62c4A0a851E3581f5E62e4D2)
 * - [__View Contract on Base Sepolia Basescan__](https://sepolia.basescan.org/address/0x53F4f44C813Dc380182d0b2b67fe5832A12B97f8)
 * - [__View Contract on Scroll Sepolia Scrollscan__](https://sepolia.scrollscan.com/address/0x93fA9B627eE016990Fe5e654F923aaE8a480a75b)
 * - [__View Contract on Scroll Scrollscan__](https://scrollscan.com/address/0x97a9f293d7eD13f3fbD499cE684Ed4F103295a28)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x9823364056BcA85Dc3c4a3b96801314D082C8Eb9)
 * - [__View Contract on Op Sepolia Blockscout__](https://optimism-sepolia.blockscout.com/address/0xd453d38A001B47271488886532f1CCeAbf0c7eF3)
 * - [__View Contract on Degen Degen Chain Explorer__](https://explorer.degen.tips/address/0x210a01ad187003603B2287F78579ec103Eb70D9B)
 */
export const useGeneralDistributionAgreementV1EstimateDistributionActualAmount =
  /*#__PURE__*/ createUseReadContract({
    abi: generalDistributionAgreementV1Abi,
    address: generalDistributionAgreementV1Address,
    functionName: 'estimateDistributionActualAmount',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link generalDistributionAgreementV1Abi}__ and `functionName` set to `"isMemberConnected"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0xAAdBB3Eee3Bd080f5353d86DdF1916aCA3fAC842)
 * - [__View Contract on Op Mainnet Optimism Explorer__](https://optimistic.etherscan.io/address/0x68Ae17fa7a31b86F306c383277552fd4813b0d35)
 * - [__View Contract on Bnb Smart Chain Bsc Scan__](https://bscscan.com/address/0x3bbFA4C406719424C7f66CD97A8Fe27Af383d3e2)
 * - [__View Contract on Gnosis Gnosisscan__](https://gnosisscan.io/address/0xd7992D358A20478c82dDEd98B3D8A9da46e99b82)
 * - [__View Contract on Polygon Polygon Scan__](https://polygonscan.com/address/0x961dd5A052741B49B6CBf6759591f9D8576fCFb0)
 * - [__View Contract on Base Basescan__](https://basescan.org/address/0xfE6c87BE05feDB2059d2EC41bA0A09826C9FD7aa)
 * - [__View Contract on Arbitrum One Arbiscan__](https://arbiscan.io/address/0x1e299701792a2aF01408B122419d65Fd2dF0Ba02)
 * - [__View Contract on Celo Celo Explorer__](https://celoscan.io/address/0x308b7405272d11494716e30C6E972DbF6fb89555)
 * - [__View Contract on Avalanche Fuji Snow Trace__](https://testnet.snowtrace.io/address/0x51f571D934C59185f13d17301a36c07A2268B814)
 * - [__View Contract on Avalanche Snow Trace__](https://snowtrace.io/address/0xA7b197cD5b0cEF6d62c4A0a851E3581f5E62e4D2)
 * - [__View Contract on Base Sepolia Basescan__](https://sepolia.basescan.org/address/0x53F4f44C813Dc380182d0b2b67fe5832A12B97f8)
 * - [__View Contract on Scroll Sepolia Scrollscan__](https://sepolia.scrollscan.com/address/0x93fA9B627eE016990Fe5e654F923aaE8a480a75b)
 * - [__View Contract on Scroll Scrollscan__](https://scrollscan.com/address/0x97a9f293d7eD13f3fbD499cE684Ed4F103295a28)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x9823364056BcA85Dc3c4a3b96801314D082C8Eb9)
 * - [__View Contract on Op Sepolia Blockscout__](https://optimism-sepolia.blockscout.com/address/0xd453d38A001B47271488886532f1CCeAbf0c7eF3)
 * - [__View Contract on Degen Degen Chain Explorer__](https://explorer.degen.tips/address/0x210a01ad187003603B2287F78579ec103Eb70D9B)
 */
export const useGeneralDistributionAgreementV1IsMemberConnected =
  /*#__PURE__*/ createUseReadContract({
    abi: generalDistributionAgreementV1Abi,
    address: generalDistributionAgreementV1Address,
    functionName: 'isMemberConnected',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link generalDistributionAgreementV1Abi}__ and `functionName` set to `"isPatricianPeriodNow"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0xAAdBB3Eee3Bd080f5353d86DdF1916aCA3fAC842)
 * - [__View Contract on Op Mainnet Optimism Explorer__](https://optimistic.etherscan.io/address/0x68Ae17fa7a31b86F306c383277552fd4813b0d35)
 * - [__View Contract on Bnb Smart Chain Bsc Scan__](https://bscscan.com/address/0x3bbFA4C406719424C7f66CD97A8Fe27Af383d3e2)
 * - [__View Contract on Gnosis Gnosisscan__](https://gnosisscan.io/address/0xd7992D358A20478c82dDEd98B3D8A9da46e99b82)
 * - [__View Contract on Polygon Polygon Scan__](https://polygonscan.com/address/0x961dd5A052741B49B6CBf6759591f9D8576fCFb0)
 * - [__View Contract on Base Basescan__](https://basescan.org/address/0xfE6c87BE05feDB2059d2EC41bA0A09826C9FD7aa)
 * - [__View Contract on Arbitrum One Arbiscan__](https://arbiscan.io/address/0x1e299701792a2aF01408B122419d65Fd2dF0Ba02)
 * - [__View Contract on Celo Celo Explorer__](https://celoscan.io/address/0x308b7405272d11494716e30C6E972DbF6fb89555)
 * - [__View Contract on Avalanche Fuji Snow Trace__](https://testnet.snowtrace.io/address/0x51f571D934C59185f13d17301a36c07A2268B814)
 * - [__View Contract on Avalanche Snow Trace__](https://snowtrace.io/address/0xA7b197cD5b0cEF6d62c4A0a851E3581f5E62e4D2)
 * - [__View Contract on Base Sepolia Basescan__](https://sepolia.basescan.org/address/0x53F4f44C813Dc380182d0b2b67fe5832A12B97f8)
 * - [__View Contract on Scroll Sepolia Scrollscan__](https://sepolia.scrollscan.com/address/0x93fA9B627eE016990Fe5e654F923aaE8a480a75b)
 * - [__View Contract on Scroll Scrollscan__](https://scrollscan.com/address/0x97a9f293d7eD13f3fbD499cE684Ed4F103295a28)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x9823364056BcA85Dc3c4a3b96801314D082C8Eb9)
 * - [__View Contract on Op Sepolia Blockscout__](https://optimism-sepolia.blockscout.com/address/0xd453d38A001B47271488886532f1CCeAbf0c7eF3)
 * - [__View Contract on Degen Degen Chain Explorer__](https://explorer.degen.tips/address/0x210a01ad187003603B2287F78579ec103Eb70D9B)
 */
export const useGeneralDistributionAgreementV1IsPatricianPeriodNow =
  /*#__PURE__*/ createUseReadContract({
    abi: generalDistributionAgreementV1Abi,
    address: generalDistributionAgreementV1Address,
    functionName: 'isPatricianPeriodNow',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link generalDistributionAgreementV1Abi}__ and `functionName` set to `"isPatricianPeriod"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0xAAdBB3Eee3Bd080f5353d86DdF1916aCA3fAC842)
 * - [__View Contract on Op Mainnet Optimism Explorer__](https://optimistic.etherscan.io/address/0x68Ae17fa7a31b86F306c383277552fd4813b0d35)
 * - [__View Contract on Bnb Smart Chain Bsc Scan__](https://bscscan.com/address/0x3bbFA4C406719424C7f66CD97A8Fe27Af383d3e2)
 * - [__View Contract on Gnosis Gnosisscan__](https://gnosisscan.io/address/0xd7992D358A20478c82dDEd98B3D8A9da46e99b82)
 * - [__View Contract on Polygon Polygon Scan__](https://polygonscan.com/address/0x961dd5A052741B49B6CBf6759591f9D8576fCFb0)
 * - [__View Contract on Base Basescan__](https://basescan.org/address/0xfE6c87BE05feDB2059d2EC41bA0A09826C9FD7aa)
 * - [__View Contract on Arbitrum One Arbiscan__](https://arbiscan.io/address/0x1e299701792a2aF01408B122419d65Fd2dF0Ba02)
 * - [__View Contract on Celo Celo Explorer__](https://celoscan.io/address/0x308b7405272d11494716e30C6E972DbF6fb89555)
 * - [__View Contract on Avalanche Fuji Snow Trace__](https://testnet.snowtrace.io/address/0x51f571D934C59185f13d17301a36c07A2268B814)
 * - [__View Contract on Avalanche Snow Trace__](https://snowtrace.io/address/0xA7b197cD5b0cEF6d62c4A0a851E3581f5E62e4D2)
 * - [__View Contract on Base Sepolia Basescan__](https://sepolia.basescan.org/address/0x53F4f44C813Dc380182d0b2b67fe5832A12B97f8)
 * - [__View Contract on Scroll Sepolia Scrollscan__](https://sepolia.scrollscan.com/address/0x93fA9B627eE016990Fe5e654F923aaE8a480a75b)
 * - [__View Contract on Scroll Scrollscan__](https://scrollscan.com/address/0x97a9f293d7eD13f3fbD499cE684Ed4F103295a28)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x9823364056BcA85Dc3c4a3b96801314D082C8Eb9)
 * - [__View Contract on Op Sepolia Blockscout__](https://optimism-sepolia.blockscout.com/address/0xd453d38A001B47271488886532f1CCeAbf0c7eF3)
 * - [__View Contract on Degen Degen Chain Explorer__](https://explorer.degen.tips/address/0x210a01ad187003603B2287F78579ec103Eb70D9B)
 */
export const useGeneralDistributionAgreementV1IsPatricianPeriod =
  /*#__PURE__*/ createUseReadContract({
    abi: generalDistributionAgreementV1Abi,
    address: generalDistributionAgreementV1Address,
    functionName: 'isPatricianPeriod',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link generalDistributionAgreementV1Abi}__ and `functionName` set to `"getPoolAdjustmentFlowInfo"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0xAAdBB3Eee3Bd080f5353d86DdF1916aCA3fAC842)
 * - [__View Contract on Op Mainnet Optimism Explorer__](https://optimistic.etherscan.io/address/0x68Ae17fa7a31b86F306c383277552fd4813b0d35)
 * - [__View Contract on Bnb Smart Chain Bsc Scan__](https://bscscan.com/address/0x3bbFA4C406719424C7f66CD97A8Fe27Af383d3e2)
 * - [__View Contract on Gnosis Gnosisscan__](https://gnosisscan.io/address/0xd7992D358A20478c82dDEd98B3D8A9da46e99b82)
 * - [__View Contract on Polygon Polygon Scan__](https://polygonscan.com/address/0x961dd5A052741B49B6CBf6759591f9D8576fCFb0)
 * - [__View Contract on Base Basescan__](https://basescan.org/address/0xfE6c87BE05feDB2059d2EC41bA0A09826C9FD7aa)
 * - [__View Contract on Arbitrum One Arbiscan__](https://arbiscan.io/address/0x1e299701792a2aF01408B122419d65Fd2dF0Ba02)
 * - [__View Contract on Celo Celo Explorer__](https://celoscan.io/address/0x308b7405272d11494716e30C6E972DbF6fb89555)
 * - [__View Contract on Avalanche Fuji Snow Trace__](https://testnet.snowtrace.io/address/0x51f571D934C59185f13d17301a36c07A2268B814)
 * - [__View Contract on Avalanche Snow Trace__](https://snowtrace.io/address/0xA7b197cD5b0cEF6d62c4A0a851E3581f5E62e4D2)
 * - [__View Contract on Base Sepolia Basescan__](https://sepolia.basescan.org/address/0x53F4f44C813Dc380182d0b2b67fe5832A12B97f8)
 * - [__View Contract on Scroll Sepolia Scrollscan__](https://sepolia.scrollscan.com/address/0x93fA9B627eE016990Fe5e654F923aaE8a480a75b)
 * - [__View Contract on Scroll Scrollscan__](https://scrollscan.com/address/0x97a9f293d7eD13f3fbD499cE684Ed4F103295a28)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x9823364056BcA85Dc3c4a3b96801314D082C8Eb9)
 * - [__View Contract on Op Sepolia Blockscout__](https://optimism-sepolia.blockscout.com/address/0xd453d38A001B47271488886532f1CCeAbf0c7eF3)
 * - [__View Contract on Degen Degen Chain Explorer__](https://explorer.degen.tips/address/0x210a01ad187003603B2287F78579ec103Eb70D9B)
 */
export const useGeneralDistributionAgreementV1GetPoolAdjustmentFlowInfo =
  /*#__PURE__*/ createUseReadContract({
    abi: generalDistributionAgreementV1Abi,
    address: generalDistributionAgreementV1Address,
    functionName: 'getPoolAdjustmentFlowInfo',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link generalDistributionAgreementV1Abi}__ and `functionName` set to `"getPoolAdjustmentFlowRate"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0xAAdBB3Eee3Bd080f5353d86DdF1916aCA3fAC842)
 * - [__View Contract on Op Mainnet Optimism Explorer__](https://optimistic.etherscan.io/address/0x68Ae17fa7a31b86F306c383277552fd4813b0d35)
 * - [__View Contract on Bnb Smart Chain Bsc Scan__](https://bscscan.com/address/0x3bbFA4C406719424C7f66CD97A8Fe27Af383d3e2)
 * - [__View Contract on Gnosis Gnosisscan__](https://gnosisscan.io/address/0xd7992D358A20478c82dDEd98B3D8A9da46e99b82)
 * - [__View Contract on Polygon Polygon Scan__](https://polygonscan.com/address/0x961dd5A052741B49B6CBf6759591f9D8576fCFb0)
 * - [__View Contract on Base Basescan__](https://basescan.org/address/0xfE6c87BE05feDB2059d2EC41bA0A09826C9FD7aa)
 * - [__View Contract on Arbitrum One Arbiscan__](https://arbiscan.io/address/0x1e299701792a2aF01408B122419d65Fd2dF0Ba02)
 * - [__View Contract on Celo Celo Explorer__](https://celoscan.io/address/0x308b7405272d11494716e30C6E972DbF6fb89555)
 * - [__View Contract on Avalanche Fuji Snow Trace__](https://testnet.snowtrace.io/address/0x51f571D934C59185f13d17301a36c07A2268B814)
 * - [__View Contract on Avalanche Snow Trace__](https://snowtrace.io/address/0xA7b197cD5b0cEF6d62c4A0a851E3581f5E62e4D2)
 * - [__View Contract on Base Sepolia Basescan__](https://sepolia.basescan.org/address/0x53F4f44C813Dc380182d0b2b67fe5832A12B97f8)
 * - [__View Contract on Scroll Sepolia Scrollscan__](https://sepolia.scrollscan.com/address/0x93fA9B627eE016990Fe5e654F923aaE8a480a75b)
 * - [__View Contract on Scroll Scrollscan__](https://scrollscan.com/address/0x97a9f293d7eD13f3fbD499cE684Ed4F103295a28)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x9823364056BcA85Dc3c4a3b96801314D082C8Eb9)
 * - [__View Contract on Op Sepolia Blockscout__](https://optimism-sepolia.blockscout.com/address/0xd453d38A001B47271488886532f1CCeAbf0c7eF3)
 * - [__View Contract on Degen Degen Chain Explorer__](https://explorer.degen.tips/address/0x210a01ad187003603B2287F78579ec103Eb70D9B)
 */
export const useGeneralDistributionAgreementV1GetPoolAdjustmentFlowRate =
  /*#__PURE__*/ createUseReadContract({
    abi: generalDistributionAgreementV1Abi,
    address: generalDistributionAgreementV1Address,
    functionName: 'getPoolAdjustmentFlowRate',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link generalDistributionAgreementV1Abi}__ and `functionName` set to `"isPool"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0xAAdBB3Eee3Bd080f5353d86DdF1916aCA3fAC842)
 * - [__View Contract on Op Mainnet Optimism Explorer__](https://optimistic.etherscan.io/address/0x68Ae17fa7a31b86F306c383277552fd4813b0d35)
 * - [__View Contract on Bnb Smart Chain Bsc Scan__](https://bscscan.com/address/0x3bbFA4C406719424C7f66CD97A8Fe27Af383d3e2)
 * - [__View Contract on Gnosis Gnosisscan__](https://gnosisscan.io/address/0xd7992D358A20478c82dDEd98B3D8A9da46e99b82)
 * - [__View Contract on Polygon Polygon Scan__](https://polygonscan.com/address/0x961dd5A052741B49B6CBf6759591f9D8576fCFb0)
 * - [__View Contract on Base Basescan__](https://basescan.org/address/0xfE6c87BE05feDB2059d2EC41bA0A09826C9FD7aa)
 * - [__View Contract on Arbitrum One Arbiscan__](https://arbiscan.io/address/0x1e299701792a2aF01408B122419d65Fd2dF0Ba02)
 * - [__View Contract on Celo Celo Explorer__](https://celoscan.io/address/0x308b7405272d11494716e30C6E972DbF6fb89555)
 * - [__View Contract on Avalanche Fuji Snow Trace__](https://testnet.snowtrace.io/address/0x51f571D934C59185f13d17301a36c07A2268B814)
 * - [__View Contract on Avalanche Snow Trace__](https://snowtrace.io/address/0xA7b197cD5b0cEF6d62c4A0a851E3581f5E62e4D2)
 * - [__View Contract on Base Sepolia Basescan__](https://sepolia.basescan.org/address/0x53F4f44C813Dc380182d0b2b67fe5832A12B97f8)
 * - [__View Contract on Scroll Sepolia Scrollscan__](https://sepolia.scrollscan.com/address/0x93fA9B627eE016990Fe5e654F923aaE8a480a75b)
 * - [__View Contract on Scroll Scrollscan__](https://scrollscan.com/address/0x97a9f293d7eD13f3fbD499cE684Ed4F103295a28)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x9823364056BcA85Dc3c4a3b96801314D082C8Eb9)
 * - [__View Contract on Op Sepolia Blockscout__](https://optimism-sepolia.blockscout.com/address/0xd453d38A001B47271488886532f1CCeAbf0c7eF3)
 * - [__View Contract on Degen Degen Chain Explorer__](https://explorer.degen.tips/address/0x210a01ad187003603B2287F78579ec103Eb70D9B)
 */
export const useGeneralDistributionAgreementV1IsPool =
  /*#__PURE__*/ createUseReadContract({
    abi: generalDistributionAgreementV1Abi,
    address: generalDistributionAgreementV1Address,
    functionName: 'isPool',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link generalDistributionAgreementV1Abi}__
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0xAAdBB3Eee3Bd080f5353d86DdF1916aCA3fAC842)
 * - [__View Contract on Op Mainnet Optimism Explorer__](https://optimistic.etherscan.io/address/0x68Ae17fa7a31b86F306c383277552fd4813b0d35)
 * - [__View Contract on Bnb Smart Chain Bsc Scan__](https://bscscan.com/address/0x3bbFA4C406719424C7f66CD97A8Fe27Af383d3e2)
 * - [__View Contract on Gnosis Gnosisscan__](https://gnosisscan.io/address/0xd7992D358A20478c82dDEd98B3D8A9da46e99b82)
 * - [__View Contract on Polygon Polygon Scan__](https://polygonscan.com/address/0x961dd5A052741B49B6CBf6759591f9D8576fCFb0)
 * - [__View Contract on Base Basescan__](https://basescan.org/address/0xfE6c87BE05feDB2059d2EC41bA0A09826C9FD7aa)
 * - [__View Contract on Arbitrum One Arbiscan__](https://arbiscan.io/address/0x1e299701792a2aF01408B122419d65Fd2dF0Ba02)
 * - [__View Contract on Celo Celo Explorer__](https://celoscan.io/address/0x308b7405272d11494716e30C6E972DbF6fb89555)
 * - [__View Contract on Avalanche Fuji Snow Trace__](https://testnet.snowtrace.io/address/0x51f571D934C59185f13d17301a36c07A2268B814)
 * - [__View Contract on Avalanche Snow Trace__](https://snowtrace.io/address/0xA7b197cD5b0cEF6d62c4A0a851E3581f5E62e4D2)
 * - [__View Contract on Base Sepolia Basescan__](https://sepolia.basescan.org/address/0x53F4f44C813Dc380182d0b2b67fe5832A12B97f8)
 * - [__View Contract on Scroll Sepolia Scrollscan__](https://sepolia.scrollscan.com/address/0x93fA9B627eE016990Fe5e654F923aaE8a480a75b)
 * - [__View Contract on Scroll Scrollscan__](https://scrollscan.com/address/0x97a9f293d7eD13f3fbD499cE684Ed4F103295a28)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x9823364056BcA85Dc3c4a3b96801314D082C8Eb9)
 * - [__View Contract on Op Sepolia Blockscout__](https://optimism-sepolia.blockscout.com/address/0xd453d38A001B47271488886532f1CCeAbf0c7eF3)
 * - [__View Contract on Degen Degen Chain Explorer__](https://explorer.degen.tips/address/0x210a01ad187003603B2287F78579ec103Eb70D9B)
 */
export const useGeneralDistributionAgreementV1Write =
  /*#__PURE__*/ createUseWriteContract({
    abi: generalDistributionAgreementV1Abi,
    address: generalDistributionAgreementV1Address,
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link generalDistributionAgreementV1Abi}__ and `functionName` set to `"castrate"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0xAAdBB3Eee3Bd080f5353d86DdF1916aCA3fAC842)
 * - [__View Contract on Op Mainnet Optimism Explorer__](https://optimistic.etherscan.io/address/0x68Ae17fa7a31b86F306c383277552fd4813b0d35)
 * - [__View Contract on Bnb Smart Chain Bsc Scan__](https://bscscan.com/address/0x3bbFA4C406719424C7f66CD97A8Fe27Af383d3e2)
 * - [__View Contract on Gnosis Gnosisscan__](https://gnosisscan.io/address/0xd7992D358A20478c82dDEd98B3D8A9da46e99b82)
 * - [__View Contract on Polygon Polygon Scan__](https://polygonscan.com/address/0x961dd5A052741B49B6CBf6759591f9D8576fCFb0)
 * - [__View Contract on Base Basescan__](https://basescan.org/address/0xfE6c87BE05feDB2059d2EC41bA0A09826C9FD7aa)
 * - [__View Contract on Arbitrum One Arbiscan__](https://arbiscan.io/address/0x1e299701792a2aF01408B122419d65Fd2dF0Ba02)
 * - [__View Contract on Celo Celo Explorer__](https://celoscan.io/address/0x308b7405272d11494716e30C6E972DbF6fb89555)
 * - [__View Contract on Avalanche Fuji Snow Trace__](https://testnet.snowtrace.io/address/0x51f571D934C59185f13d17301a36c07A2268B814)
 * - [__View Contract on Avalanche Snow Trace__](https://snowtrace.io/address/0xA7b197cD5b0cEF6d62c4A0a851E3581f5E62e4D2)
 * - [__View Contract on Base Sepolia Basescan__](https://sepolia.basescan.org/address/0x53F4f44C813Dc380182d0b2b67fe5832A12B97f8)
 * - [__View Contract on Scroll Sepolia Scrollscan__](https://sepolia.scrollscan.com/address/0x93fA9B627eE016990Fe5e654F923aaE8a480a75b)
 * - [__View Contract on Scroll Scrollscan__](https://scrollscan.com/address/0x97a9f293d7eD13f3fbD499cE684Ed4F103295a28)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x9823364056BcA85Dc3c4a3b96801314D082C8Eb9)
 * - [__View Contract on Op Sepolia Blockscout__](https://optimism-sepolia.blockscout.com/address/0xd453d38A001B47271488886532f1CCeAbf0c7eF3)
 * - [__View Contract on Degen Degen Chain Explorer__](https://explorer.degen.tips/address/0x210a01ad187003603B2287F78579ec103Eb70D9B)
 */
export const useGeneralDistributionAgreementV1Castrate =
  /*#__PURE__*/ createUseWriteContract({
    abi: generalDistributionAgreementV1Abi,
    address: generalDistributionAgreementV1Address,
    functionName: 'castrate',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link generalDistributionAgreementV1Abi}__ and `functionName` set to `"updateCode"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0xAAdBB3Eee3Bd080f5353d86DdF1916aCA3fAC842)
 * - [__View Contract on Op Mainnet Optimism Explorer__](https://optimistic.etherscan.io/address/0x68Ae17fa7a31b86F306c383277552fd4813b0d35)
 * - [__View Contract on Bnb Smart Chain Bsc Scan__](https://bscscan.com/address/0x3bbFA4C406719424C7f66CD97A8Fe27Af383d3e2)
 * - [__View Contract on Gnosis Gnosisscan__](https://gnosisscan.io/address/0xd7992D358A20478c82dDEd98B3D8A9da46e99b82)
 * - [__View Contract on Polygon Polygon Scan__](https://polygonscan.com/address/0x961dd5A052741B49B6CBf6759591f9D8576fCFb0)
 * - [__View Contract on Base Basescan__](https://basescan.org/address/0xfE6c87BE05feDB2059d2EC41bA0A09826C9FD7aa)
 * - [__View Contract on Arbitrum One Arbiscan__](https://arbiscan.io/address/0x1e299701792a2aF01408B122419d65Fd2dF0Ba02)
 * - [__View Contract on Celo Celo Explorer__](https://celoscan.io/address/0x308b7405272d11494716e30C6E972DbF6fb89555)
 * - [__View Contract on Avalanche Fuji Snow Trace__](https://testnet.snowtrace.io/address/0x51f571D934C59185f13d17301a36c07A2268B814)
 * - [__View Contract on Avalanche Snow Trace__](https://snowtrace.io/address/0xA7b197cD5b0cEF6d62c4A0a851E3581f5E62e4D2)
 * - [__View Contract on Base Sepolia Basescan__](https://sepolia.basescan.org/address/0x53F4f44C813Dc380182d0b2b67fe5832A12B97f8)
 * - [__View Contract on Scroll Sepolia Scrollscan__](https://sepolia.scrollscan.com/address/0x93fA9B627eE016990Fe5e654F923aaE8a480a75b)
 * - [__View Contract on Scroll Scrollscan__](https://scrollscan.com/address/0x97a9f293d7eD13f3fbD499cE684Ed4F103295a28)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x9823364056BcA85Dc3c4a3b96801314D082C8Eb9)
 * - [__View Contract on Op Sepolia Blockscout__](https://optimism-sepolia.blockscout.com/address/0xd453d38A001B47271488886532f1CCeAbf0c7eF3)
 * - [__View Contract on Degen Degen Chain Explorer__](https://explorer.degen.tips/address/0x210a01ad187003603B2287F78579ec103Eb70D9B)
 */
export const useGeneralDistributionAgreementV1UpdateCode =
  /*#__PURE__*/ createUseWriteContract({
    abi: generalDistributionAgreementV1Abi,
    address: generalDistributionAgreementV1Address,
    functionName: 'updateCode',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link generalDistributionAgreementV1Abi}__ and `functionName` set to `"createPool"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0xAAdBB3Eee3Bd080f5353d86DdF1916aCA3fAC842)
 * - [__View Contract on Op Mainnet Optimism Explorer__](https://optimistic.etherscan.io/address/0x68Ae17fa7a31b86F306c383277552fd4813b0d35)
 * - [__View Contract on Bnb Smart Chain Bsc Scan__](https://bscscan.com/address/0x3bbFA4C406719424C7f66CD97A8Fe27Af383d3e2)
 * - [__View Contract on Gnosis Gnosisscan__](https://gnosisscan.io/address/0xd7992D358A20478c82dDEd98B3D8A9da46e99b82)
 * - [__View Contract on Polygon Polygon Scan__](https://polygonscan.com/address/0x961dd5A052741B49B6CBf6759591f9D8576fCFb0)
 * - [__View Contract on Base Basescan__](https://basescan.org/address/0xfE6c87BE05feDB2059d2EC41bA0A09826C9FD7aa)
 * - [__View Contract on Arbitrum One Arbiscan__](https://arbiscan.io/address/0x1e299701792a2aF01408B122419d65Fd2dF0Ba02)
 * - [__View Contract on Celo Celo Explorer__](https://celoscan.io/address/0x308b7405272d11494716e30C6E972DbF6fb89555)
 * - [__View Contract on Avalanche Fuji Snow Trace__](https://testnet.snowtrace.io/address/0x51f571D934C59185f13d17301a36c07A2268B814)
 * - [__View Contract on Avalanche Snow Trace__](https://snowtrace.io/address/0xA7b197cD5b0cEF6d62c4A0a851E3581f5E62e4D2)
 * - [__View Contract on Base Sepolia Basescan__](https://sepolia.basescan.org/address/0x53F4f44C813Dc380182d0b2b67fe5832A12B97f8)
 * - [__View Contract on Scroll Sepolia Scrollscan__](https://sepolia.scrollscan.com/address/0x93fA9B627eE016990Fe5e654F923aaE8a480a75b)
 * - [__View Contract on Scroll Scrollscan__](https://scrollscan.com/address/0x97a9f293d7eD13f3fbD499cE684Ed4F103295a28)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x9823364056BcA85Dc3c4a3b96801314D082C8Eb9)
 * - [__View Contract on Op Sepolia Blockscout__](https://optimism-sepolia.blockscout.com/address/0xd453d38A001B47271488886532f1CCeAbf0c7eF3)
 * - [__View Contract on Degen Degen Chain Explorer__](https://explorer.degen.tips/address/0x210a01ad187003603B2287F78579ec103Eb70D9B)
 */
export const useGeneralDistributionAgreementV1CreatePool =
  /*#__PURE__*/ createUseWriteContract({
    abi: generalDistributionAgreementV1Abi,
    address: generalDistributionAgreementV1Address,
    functionName: 'createPool',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link generalDistributionAgreementV1Abi}__ and `functionName` set to `"updateMemberUnits"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0xAAdBB3Eee3Bd080f5353d86DdF1916aCA3fAC842)
 * - [__View Contract on Op Mainnet Optimism Explorer__](https://optimistic.etherscan.io/address/0x68Ae17fa7a31b86F306c383277552fd4813b0d35)
 * - [__View Contract on Bnb Smart Chain Bsc Scan__](https://bscscan.com/address/0x3bbFA4C406719424C7f66CD97A8Fe27Af383d3e2)
 * - [__View Contract on Gnosis Gnosisscan__](https://gnosisscan.io/address/0xd7992D358A20478c82dDEd98B3D8A9da46e99b82)
 * - [__View Contract on Polygon Polygon Scan__](https://polygonscan.com/address/0x961dd5A052741B49B6CBf6759591f9D8576fCFb0)
 * - [__View Contract on Base Basescan__](https://basescan.org/address/0xfE6c87BE05feDB2059d2EC41bA0A09826C9FD7aa)
 * - [__View Contract on Arbitrum One Arbiscan__](https://arbiscan.io/address/0x1e299701792a2aF01408B122419d65Fd2dF0Ba02)
 * - [__View Contract on Celo Celo Explorer__](https://celoscan.io/address/0x308b7405272d11494716e30C6E972DbF6fb89555)
 * - [__View Contract on Avalanche Fuji Snow Trace__](https://testnet.snowtrace.io/address/0x51f571D934C59185f13d17301a36c07A2268B814)
 * - [__View Contract on Avalanche Snow Trace__](https://snowtrace.io/address/0xA7b197cD5b0cEF6d62c4A0a851E3581f5E62e4D2)
 * - [__View Contract on Base Sepolia Basescan__](https://sepolia.basescan.org/address/0x53F4f44C813Dc380182d0b2b67fe5832A12B97f8)
 * - [__View Contract on Scroll Sepolia Scrollscan__](https://sepolia.scrollscan.com/address/0x93fA9B627eE016990Fe5e654F923aaE8a480a75b)
 * - [__View Contract on Scroll Scrollscan__](https://scrollscan.com/address/0x97a9f293d7eD13f3fbD499cE684Ed4F103295a28)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x9823364056BcA85Dc3c4a3b96801314D082C8Eb9)
 * - [__View Contract on Op Sepolia Blockscout__](https://optimism-sepolia.blockscout.com/address/0xd453d38A001B47271488886532f1CCeAbf0c7eF3)
 * - [__View Contract on Degen Degen Chain Explorer__](https://explorer.degen.tips/address/0x210a01ad187003603B2287F78579ec103Eb70D9B)
 */
export const useGeneralDistributionAgreementV1UpdateMemberUnits =
  /*#__PURE__*/ createUseWriteContract({
    abi: generalDistributionAgreementV1Abi,
    address: generalDistributionAgreementV1Address,
    functionName: 'updateMemberUnits',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link generalDistributionAgreementV1Abi}__ and `functionName` set to `"claimAll"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0xAAdBB3Eee3Bd080f5353d86DdF1916aCA3fAC842)
 * - [__View Contract on Op Mainnet Optimism Explorer__](https://optimistic.etherscan.io/address/0x68Ae17fa7a31b86F306c383277552fd4813b0d35)
 * - [__View Contract on Bnb Smart Chain Bsc Scan__](https://bscscan.com/address/0x3bbFA4C406719424C7f66CD97A8Fe27Af383d3e2)
 * - [__View Contract on Gnosis Gnosisscan__](https://gnosisscan.io/address/0xd7992D358A20478c82dDEd98B3D8A9da46e99b82)
 * - [__View Contract on Polygon Polygon Scan__](https://polygonscan.com/address/0x961dd5A052741B49B6CBf6759591f9D8576fCFb0)
 * - [__View Contract on Base Basescan__](https://basescan.org/address/0xfE6c87BE05feDB2059d2EC41bA0A09826C9FD7aa)
 * - [__View Contract on Arbitrum One Arbiscan__](https://arbiscan.io/address/0x1e299701792a2aF01408B122419d65Fd2dF0Ba02)
 * - [__View Contract on Celo Celo Explorer__](https://celoscan.io/address/0x308b7405272d11494716e30C6E972DbF6fb89555)
 * - [__View Contract on Avalanche Fuji Snow Trace__](https://testnet.snowtrace.io/address/0x51f571D934C59185f13d17301a36c07A2268B814)
 * - [__View Contract on Avalanche Snow Trace__](https://snowtrace.io/address/0xA7b197cD5b0cEF6d62c4A0a851E3581f5E62e4D2)
 * - [__View Contract on Base Sepolia Basescan__](https://sepolia.basescan.org/address/0x53F4f44C813Dc380182d0b2b67fe5832A12B97f8)
 * - [__View Contract on Scroll Sepolia Scrollscan__](https://sepolia.scrollscan.com/address/0x93fA9B627eE016990Fe5e654F923aaE8a480a75b)
 * - [__View Contract on Scroll Scrollscan__](https://scrollscan.com/address/0x97a9f293d7eD13f3fbD499cE684Ed4F103295a28)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x9823364056BcA85Dc3c4a3b96801314D082C8Eb9)
 * - [__View Contract on Op Sepolia Blockscout__](https://optimism-sepolia.blockscout.com/address/0xd453d38A001B47271488886532f1CCeAbf0c7eF3)
 * - [__View Contract on Degen Degen Chain Explorer__](https://explorer.degen.tips/address/0x210a01ad187003603B2287F78579ec103Eb70D9B)
 */
export const useGeneralDistributionAgreementV1ClaimAll =
  /*#__PURE__*/ createUseWriteContract({
    abi: generalDistributionAgreementV1Abi,
    address: generalDistributionAgreementV1Address,
    functionName: 'claimAll',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link generalDistributionAgreementV1Abi}__ and `functionName` set to `"disconnectPool"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0xAAdBB3Eee3Bd080f5353d86DdF1916aCA3fAC842)
 * - [__View Contract on Op Mainnet Optimism Explorer__](https://optimistic.etherscan.io/address/0x68Ae17fa7a31b86F306c383277552fd4813b0d35)
 * - [__View Contract on Bnb Smart Chain Bsc Scan__](https://bscscan.com/address/0x3bbFA4C406719424C7f66CD97A8Fe27Af383d3e2)
 * - [__View Contract on Gnosis Gnosisscan__](https://gnosisscan.io/address/0xd7992D358A20478c82dDEd98B3D8A9da46e99b82)
 * - [__View Contract on Polygon Polygon Scan__](https://polygonscan.com/address/0x961dd5A052741B49B6CBf6759591f9D8576fCFb0)
 * - [__View Contract on Base Basescan__](https://basescan.org/address/0xfE6c87BE05feDB2059d2EC41bA0A09826C9FD7aa)
 * - [__View Contract on Arbitrum One Arbiscan__](https://arbiscan.io/address/0x1e299701792a2aF01408B122419d65Fd2dF0Ba02)
 * - [__View Contract on Celo Celo Explorer__](https://celoscan.io/address/0x308b7405272d11494716e30C6E972DbF6fb89555)
 * - [__View Contract on Avalanche Fuji Snow Trace__](https://testnet.snowtrace.io/address/0x51f571D934C59185f13d17301a36c07A2268B814)
 * - [__View Contract on Avalanche Snow Trace__](https://snowtrace.io/address/0xA7b197cD5b0cEF6d62c4A0a851E3581f5E62e4D2)
 * - [__View Contract on Base Sepolia Basescan__](https://sepolia.basescan.org/address/0x53F4f44C813Dc380182d0b2b67fe5832A12B97f8)
 * - [__View Contract on Scroll Sepolia Scrollscan__](https://sepolia.scrollscan.com/address/0x93fA9B627eE016990Fe5e654F923aaE8a480a75b)
 * - [__View Contract on Scroll Scrollscan__](https://scrollscan.com/address/0x97a9f293d7eD13f3fbD499cE684Ed4F103295a28)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x9823364056BcA85Dc3c4a3b96801314D082C8Eb9)
 * - [__View Contract on Op Sepolia Blockscout__](https://optimism-sepolia.blockscout.com/address/0xd453d38A001B47271488886532f1CCeAbf0c7eF3)
 * - [__View Contract on Degen Degen Chain Explorer__](https://explorer.degen.tips/address/0x210a01ad187003603B2287F78579ec103Eb70D9B)
 */
export const useGeneralDistributionAgreementV1DisconnectPool =
  /*#__PURE__*/ createUseWriteContract({
    abi: generalDistributionAgreementV1Abi,
    address: generalDistributionAgreementV1Address,
    functionName: 'disconnectPool',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link generalDistributionAgreementV1Abi}__ and `functionName` set to `"connectPool"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0xAAdBB3Eee3Bd080f5353d86DdF1916aCA3fAC842)
 * - [__View Contract on Op Mainnet Optimism Explorer__](https://optimistic.etherscan.io/address/0x68Ae17fa7a31b86F306c383277552fd4813b0d35)
 * - [__View Contract on Bnb Smart Chain Bsc Scan__](https://bscscan.com/address/0x3bbFA4C406719424C7f66CD97A8Fe27Af383d3e2)
 * - [__View Contract on Gnosis Gnosisscan__](https://gnosisscan.io/address/0xd7992D358A20478c82dDEd98B3D8A9da46e99b82)
 * - [__View Contract on Polygon Polygon Scan__](https://polygonscan.com/address/0x961dd5A052741B49B6CBf6759591f9D8576fCFb0)
 * - [__View Contract on Base Basescan__](https://basescan.org/address/0xfE6c87BE05feDB2059d2EC41bA0A09826C9FD7aa)
 * - [__View Contract on Arbitrum One Arbiscan__](https://arbiscan.io/address/0x1e299701792a2aF01408B122419d65Fd2dF0Ba02)
 * - [__View Contract on Celo Celo Explorer__](https://celoscan.io/address/0x308b7405272d11494716e30C6E972DbF6fb89555)
 * - [__View Contract on Avalanche Fuji Snow Trace__](https://testnet.snowtrace.io/address/0x51f571D934C59185f13d17301a36c07A2268B814)
 * - [__View Contract on Avalanche Snow Trace__](https://snowtrace.io/address/0xA7b197cD5b0cEF6d62c4A0a851E3581f5E62e4D2)
 * - [__View Contract on Base Sepolia Basescan__](https://sepolia.basescan.org/address/0x53F4f44C813Dc380182d0b2b67fe5832A12B97f8)
 * - [__View Contract on Scroll Sepolia Scrollscan__](https://sepolia.scrollscan.com/address/0x93fA9B627eE016990Fe5e654F923aaE8a480a75b)
 * - [__View Contract on Scroll Scrollscan__](https://scrollscan.com/address/0x97a9f293d7eD13f3fbD499cE684Ed4F103295a28)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x9823364056BcA85Dc3c4a3b96801314D082C8Eb9)
 * - [__View Contract on Op Sepolia Blockscout__](https://optimism-sepolia.blockscout.com/address/0xd453d38A001B47271488886532f1CCeAbf0c7eF3)
 * - [__View Contract on Degen Degen Chain Explorer__](https://explorer.degen.tips/address/0x210a01ad187003603B2287F78579ec103Eb70D9B)
 */
export const useGeneralDistributionAgreementV1ConnectPool =
  /*#__PURE__*/ createUseWriteContract({
    abi: generalDistributionAgreementV1Abi,
    address: generalDistributionAgreementV1Address,
    functionName: 'connectPool',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link generalDistributionAgreementV1Abi}__ and `functionName` set to `"appendIndexUpdateByPool"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0xAAdBB3Eee3Bd080f5353d86DdF1916aCA3fAC842)
 * - [__View Contract on Op Mainnet Optimism Explorer__](https://optimistic.etherscan.io/address/0x68Ae17fa7a31b86F306c383277552fd4813b0d35)
 * - [__View Contract on Bnb Smart Chain Bsc Scan__](https://bscscan.com/address/0x3bbFA4C406719424C7f66CD97A8Fe27Af383d3e2)
 * - [__View Contract on Gnosis Gnosisscan__](https://gnosisscan.io/address/0xd7992D358A20478c82dDEd98B3D8A9da46e99b82)
 * - [__View Contract on Polygon Polygon Scan__](https://polygonscan.com/address/0x961dd5A052741B49B6CBf6759591f9D8576fCFb0)
 * - [__View Contract on Base Basescan__](https://basescan.org/address/0xfE6c87BE05feDB2059d2EC41bA0A09826C9FD7aa)
 * - [__View Contract on Arbitrum One Arbiscan__](https://arbiscan.io/address/0x1e299701792a2aF01408B122419d65Fd2dF0Ba02)
 * - [__View Contract on Celo Celo Explorer__](https://celoscan.io/address/0x308b7405272d11494716e30C6E972DbF6fb89555)
 * - [__View Contract on Avalanche Fuji Snow Trace__](https://testnet.snowtrace.io/address/0x51f571D934C59185f13d17301a36c07A2268B814)
 * - [__View Contract on Avalanche Snow Trace__](https://snowtrace.io/address/0xA7b197cD5b0cEF6d62c4A0a851E3581f5E62e4D2)
 * - [__View Contract on Base Sepolia Basescan__](https://sepolia.basescan.org/address/0x53F4f44C813Dc380182d0b2b67fe5832A12B97f8)
 * - [__View Contract on Scroll Sepolia Scrollscan__](https://sepolia.scrollscan.com/address/0x93fA9B627eE016990Fe5e654F923aaE8a480a75b)
 * - [__View Contract on Scroll Scrollscan__](https://scrollscan.com/address/0x97a9f293d7eD13f3fbD499cE684Ed4F103295a28)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x9823364056BcA85Dc3c4a3b96801314D082C8Eb9)
 * - [__View Contract on Op Sepolia Blockscout__](https://optimism-sepolia.blockscout.com/address/0xd453d38A001B47271488886532f1CCeAbf0c7eF3)
 * - [__View Contract on Degen Degen Chain Explorer__](https://explorer.degen.tips/address/0x210a01ad187003603B2287F78579ec103Eb70D9B)
 */
export const useGeneralDistributionAgreementV1AppendIndexUpdateByPool =
  /*#__PURE__*/ createUseWriteContract({
    abi: generalDistributionAgreementV1Abi,
    address: generalDistributionAgreementV1Address,
    functionName: 'appendIndexUpdateByPool',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link generalDistributionAgreementV1Abi}__ and `functionName` set to `"poolSettleClaim"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0xAAdBB3Eee3Bd080f5353d86DdF1916aCA3fAC842)
 * - [__View Contract on Op Mainnet Optimism Explorer__](https://optimistic.etherscan.io/address/0x68Ae17fa7a31b86F306c383277552fd4813b0d35)
 * - [__View Contract on Bnb Smart Chain Bsc Scan__](https://bscscan.com/address/0x3bbFA4C406719424C7f66CD97A8Fe27Af383d3e2)
 * - [__View Contract on Gnosis Gnosisscan__](https://gnosisscan.io/address/0xd7992D358A20478c82dDEd98B3D8A9da46e99b82)
 * - [__View Contract on Polygon Polygon Scan__](https://polygonscan.com/address/0x961dd5A052741B49B6CBf6759591f9D8576fCFb0)
 * - [__View Contract on Base Basescan__](https://basescan.org/address/0xfE6c87BE05feDB2059d2EC41bA0A09826C9FD7aa)
 * - [__View Contract on Arbitrum One Arbiscan__](https://arbiscan.io/address/0x1e299701792a2aF01408B122419d65Fd2dF0Ba02)
 * - [__View Contract on Celo Celo Explorer__](https://celoscan.io/address/0x308b7405272d11494716e30C6E972DbF6fb89555)
 * - [__View Contract on Avalanche Fuji Snow Trace__](https://testnet.snowtrace.io/address/0x51f571D934C59185f13d17301a36c07A2268B814)
 * - [__View Contract on Avalanche Snow Trace__](https://snowtrace.io/address/0xA7b197cD5b0cEF6d62c4A0a851E3581f5E62e4D2)
 * - [__View Contract on Base Sepolia Basescan__](https://sepolia.basescan.org/address/0x53F4f44C813Dc380182d0b2b67fe5832A12B97f8)
 * - [__View Contract on Scroll Sepolia Scrollscan__](https://sepolia.scrollscan.com/address/0x93fA9B627eE016990Fe5e654F923aaE8a480a75b)
 * - [__View Contract on Scroll Scrollscan__](https://scrollscan.com/address/0x97a9f293d7eD13f3fbD499cE684Ed4F103295a28)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x9823364056BcA85Dc3c4a3b96801314D082C8Eb9)
 * - [__View Contract on Op Sepolia Blockscout__](https://optimism-sepolia.blockscout.com/address/0xd453d38A001B47271488886532f1CCeAbf0c7eF3)
 * - [__View Contract on Degen Degen Chain Explorer__](https://explorer.degen.tips/address/0x210a01ad187003603B2287F78579ec103Eb70D9B)
 */
export const useGeneralDistributionAgreementV1PoolSettleClaim =
  /*#__PURE__*/ createUseWriteContract({
    abi: generalDistributionAgreementV1Abi,
    address: generalDistributionAgreementV1Address,
    functionName: 'poolSettleClaim',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link generalDistributionAgreementV1Abi}__ and `functionName` set to `"distribute"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0xAAdBB3Eee3Bd080f5353d86DdF1916aCA3fAC842)
 * - [__View Contract on Op Mainnet Optimism Explorer__](https://optimistic.etherscan.io/address/0x68Ae17fa7a31b86F306c383277552fd4813b0d35)
 * - [__View Contract on Bnb Smart Chain Bsc Scan__](https://bscscan.com/address/0x3bbFA4C406719424C7f66CD97A8Fe27Af383d3e2)
 * - [__View Contract on Gnosis Gnosisscan__](https://gnosisscan.io/address/0xd7992D358A20478c82dDEd98B3D8A9da46e99b82)
 * - [__View Contract on Polygon Polygon Scan__](https://polygonscan.com/address/0x961dd5A052741B49B6CBf6759591f9D8576fCFb0)
 * - [__View Contract on Base Basescan__](https://basescan.org/address/0xfE6c87BE05feDB2059d2EC41bA0A09826C9FD7aa)
 * - [__View Contract on Arbitrum One Arbiscan__](https://arbiscan.io/address/0x1e299701792a2aF01408B122419d65Fd2dF0Ba02)
 * - [__View Contract on Celo Celo Explorer__](https://celoscan.io/address/0x308b7405272d11494716e30C6E972DbF6fb89555)
 * - [__View Contract on Avalanche Fuji Snow Trace__](https://testnet.snowtrace.io/address/0x51f571D934C59185f13d17301a36c07A2268B814)
 * - [__View Contract on Avalanche Snow Trace__](https://snowtrace.io/address/0xA7b197cD5b0cEF6d62c4A0a851E3581f5E62e4D2)
 * - [__View Contract on Base Sepolia Basescan__](https://sepolia.basescan.org/address/0x53F4f44C813Dc380182d0b2b67fe5832A12B97f8)
 * - [__View Contract on Scroll Sepolia Scrollscan__](https://sepolia.scrollscan.com/address/0x93fA9B627eE016990Fe5e654F923aaE8a480a75b)
 * - [__View Contract on Scroll Scrollscan__](https://scrollscan.com/address/0x97a9f293d7eD13f3fbD499cE684Ed4F103295a28)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x9823364056BcA85Dc3c4a3b96801314D082C8Eb9)
 * - [__View Contract on Op Sepolia Blockscout__](https://optimism-sepolia.blockscout.com/address/0xd453d38A001B47271488886532f1CCeAbf0c7eF3)
 * - [__View Contract on Degen Degen Chain Explorer__](https://explorer.degen.tips/address/0x210a01ad187003603B2287F78579ec103Eb70D9B)
 */
export const useGeneralDistributionAgreementV1Distribute =
  /*#__PURE__*/ createUseWriteContract({
    abi: generalDistributionAgreementV1Abi,
    address: generalDistributionAgreementV1Address,
    functionName: 'distribute',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link generalDistributionAgreementV1Abi}__ and `functionName` set to `"distributeFlow"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0xAAdBB3Eee3Bd080f5353d86DdF1916aCA3fAC842)
 * - [__View Contract on Op Mainnet Optimism Explorer__](https://optimistic.etherscan.io/address/0x68Ae17fa7a31b86F306c383277552fd4813b0d35)
 * - [__View Contract on Bnb Smart Chain Bsc Scan__](https://bscscan.com/address/0x3bbFA4C406719424C7f66CD97A8Fe27Af383d3e2)
 * - [__View Contract on Gnosis Gnosisscan__](https://gnosisscan.io/address/0xd7992D358A20478c82dDEd98B3D8A9da46e99b82)
 * - [__View Contract on Polygon Polygon Scan__](https://polygonscan.com/address/0x961dd5A052741B49B6CBf6759591f9D8576fCFb0)
 * - [__View Contract on Base Basescan__](https://basescan.org/address/0xfE6c87BE05feDB2059d2EC41bA0A09826C9FD7aa)
 * - [__View Contract on Arbitrum One Arbiscan__](https://arbiscan.io/address/0x1e299701792a2aF01408B122419d65Fd2dF0Ba02)
 * - [__View Contract on Celo Celo Explorer__](https://celoscan.io/address/0x308b7405272d11494716e30C6E972DbF6fb89555)
 * - [__View Contract on Avalanche Fuji Snow Trace__](https://testnet.snowtrace.io/address/0x51f571D934C59185f13d17301a36c07A2268B814)
 * - [__View Contract on Avalanche Snow Trace__](https://snowtrace.io/address/0xA7b197cD5b0cEF6d62c4A0a851E3581f5E62e4D2)
 * - [__View Contract on Base Sepolia Basescan__](https://sepolia.basescan.org/address/0x53F4f44C813Dc380182d0b2b67fe5832A12B97f8)
 * - [__View Contract on Scroll Sepolia Scrollscan__](https://sepolia.scrollscan.com/address/0x93fA9B627eE016990Fe5e654F923aaE8a480a75b)
 * - [__View Contract on Scroll Scrollscan__](https://scrollscan.com/address/0x97a9f293d7eD13f3fbD499cE684Ed4F103295a28)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x9823364056BcA85Dc3c4a3b96801314D082C8Eb9)
 * - [__View Contract on Op Sepolia Blockscout__](https://optimism-sepolia.blockscout.com/address/0xd453d38A001B47271488886532f1CCeAbf0c7eF3)
 * - [__View Contract on Degen Degen Chain Explorer__](https://explorer.degen.tips/address/0x210a01ad187003603B2287F78579ec103Eb70D9B)
 */
export const useGeneralDistributionAgreementV1DistributeFlow =
  /*#__PURE__*/ createUseWriteContract({
    abi: generalDistributionAgreementV1Abi,
    address: generalDistributionAgreementV1Address,
    functionName: 'distributeFlow',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link generalDistributionAgreementV1Abi}__
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0xAAdBB3Eee3Bd080f5353d86DdF1916aCA3fAC842)
 * - [__View Contract on Op Mainnet Optimism Explorer__](https://optimistic.etherscan.io/address/0x68Ae17fa7a31b86F306c383277552fd4813b0d35)
 * - [__View Contract on Bnb Smart Chain Bsc Scan__](https://bscscan.com/address/0x3bbFA4C406719424C7f66CD97A8Fe27Af383d3e2)
 * - [__View Contract on Gnosis Gnosisscan__](https://gnosisscan.io/address/0xd7992D358A20478c82dDEd98B3D8A9da46e99b82)
 * - [__View Contract on Polygon Polygon Scan__](https://polygonscan.com/address/0x961dd5A052741B49B6CBf6759591f9D8576fCFb0)
 * - [__View Contract on Base Basescan__](https://basescan.org/address/0xfE6c87BE05feDB2059d2EC41bA0A09826C9FD7aa)
 * - [__View Contract on Arbitrum One Arbiscan__](https://arbiscan.io/address/0x1e299701792a2aF01408B122419d65Fd2dF0Ba02)
 * - [__View Contract on Celo Celo Explorer__](https://celoscan.io/address/0x308b7405272d11494716e30C6E972DbF6fb89555)
 * - [__View Contract on Avalanche Fuji Snow Trace__](https://testnet.snowtrace.io/address/0x51f571D934C59185f13d17301a36c07A2268B814)
 * - [__View Contract on Avalanche Snow Trace__](https://snowtrace.io/address/0xA7b197cD5b0cEF6d62c4A0a851E3581f5E62e4D2)
 * - [__View Contract on Base Sepolia Basescan__](https://sepolia.basescan.org/address/0x53F4f44C813Dc380182d0b2b67fe5832A12B97f8)
 * - [__View Contract on Scroll Sepolia Scrollscan__](https://sepolia.scrollscan.com/address/0x93fA9B627eE016990Fe5e654F923aaE8a480a75b)
 * - [__View Contract on Scroll Scrollscan__](https://scrollscan.com/address/0x97a9f293d7eD13f3fbD499cE684Ed4F103295a28)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x9823364056BcA85Dc3c4a3b96801314D082C8Eb9)
 * - [__View Contract on Op Sepolia Blockscout__](https://optimism-sepolia.blockscout.com/address/0xd453d38A001B47271488886532f1CCeAbf0c7eF3)
 * - [__View Contract on Degen Degen Chain Explorer__](https://explorer.degen.tips/address/0x210a01ad187003603B2287F78579ec103Eb70D9B)
 */
export const usePrepareGeneralDistributionAgreementV1Write =
  /*#__PURE__*/ createUseSimulateContract({
    abi: generalDistributionAgreementV1Abi,
    address: generalDistributionAgreementV1Address,
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link generalDistributionAgreementV1Abi}__ and `functionName` set to `"castrate"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0xAAdBB3Eee3Bd080f5353d86DdF1916aCA3fAC842)
 * - [__View Contract on Op Mainnet Optimism Explorer__](https://optimistic.etherscan.io/address/0x68Ae17fa7a31b86F306c383277552fd4813b0d35)
 * - [__View Contract on Bnb Smart Chain Bsc Scan__](https://bscscan.com/address/0x3bbFA4C406719424C7f66CD97A8Fe27Af383d3e2)
 * - [__View Contract on Gnosis Gnosisscan__](https://gnosisscan.io/address/0xd7992D358A20478c82dDEd98B3D8A9da46e99b82)
 * - [__View Contract on Polygon Polygon Scan__](https://polygonscan.com/address/0x961dd5A052741B49B6CBf6759591f9D8576fCFb0)
 * - [__View Contract on Base Basescan__](https://basescan.org/address/0xfE6c87BE05feDB2059d2EC41bA0A09826C9FD7aa)
 * - [__View Contract on Arbitrum One Arbiscan__](https://arbiscan.io/address/0x1e299701792a2aF01408B122419d65Fd2dF0Ba02)
 * - [__View Contract on Celo Celo Explorer__](https://celoscan.io/address/0x308b7405272d11494716e30C6E972DbF6fb89555)
 * - [__View Contract on Avalanche Fuji Snow Trace__](https://testnet.snowtrace.io/address/0x51f571D934C59185f13d17301a36c07A2268B814)
 * - [__View Contract on Avalanche Snow Trace__](https://snowtrace.io/address/0xA7b197cD5b0cEF6d62c4A0a851E3581f5E62e4D2)
 * - [__View Contract on Base Sepolia Basescan__](https://sepolia.basescan.org/address/0x53F4f44C813Dc380182d0b2b67fe5832A12B97f8)
 * - [__View Contract on Scroll Sepolia Scrollscan__](https://sepolia.scrollscan.com/address/0x93fA9B627eE016990Fe5e654F923aaE8a480a75b)
 * - [__View Contract on Scroll Scrollscan__](https://scrollscan.com/address/0x97a9f293d7eD13f3fbD499cE684Ed4F103295a28)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x9823364056BcA85Dc3c4a3b96801314D082C8Eb9)
 * - [__View Contract on Op Sepolia Blockscout__](https://optimism-sepolia.blockscout.com/address/0xd453d38A001B47271488886532f1CCeAbf0c7eF3)
 * - [__View Contract on Degen Degen Chain Explorer__](https://explorer.degen.tips/address/0x210a01ad187003603B2287F78579ec103Eb70D9B)
 */
export const usePrepareGeneralDistributionAgreementV1Castrate =
  /*#__PURE__*/ createUseSimulateContract({
    abi: generalDistributionAgreementV1Abi,
    address: generalDistributionAgreementV1Address,
    functionName: 'castrate',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link generalDistributionAgreementV1Abi}__ and `functionName` set to `"updateCode"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0xAAdBB3Eee3Bd080f5353d86DdF1916aCA3fAC842)
 * - [__View Contract on Op Mainnet Optimism Explorer__](https://optimistic.etherscan.io/address/0x68Ae17fa7a31b86F306c383277552fd4813b0d35)
 * - [__View Contract on Bnb Smart Chain Bsc Scan__](https://bscscan.com/address/0x3bbFA4C406719424C7f66CD97A8Fe27Af383d3e2)
 * - [__View Contract on Gnosis Gnosisscan__](https://gnosisscan.io/address/0xd7992D358A20478c82dDEd98B3D8A9da46e99b82)
 * - [__View Contract on Polygon Polygon Scan__](https://polygonscan.com/address/0x961dd5A052741B49B6CBf6759591f9D8576fCFb0)
 * - [__View Contract on Base Basescan__](https://basescan.org/address/0xfE6c87BE05feDB2059d2EC41bA0A09826C9FD7aa)
 * - [__View Contract on Arbitrum One Arbiscan__](https://arbiscan.io/address/0x1e299701792a2aF01408B122419d65Fd2dF0Ba02)
 * - [__View Contract on Celo Celo Explorer__](https://celoscan.io/address/0x308b7405272d11494716e30C6E972DbF6fb89555)
 * - [__View Contract on Avalanche Fuji Snow Trace__](https://testnet.snowtrace.io/address/0x51f571D934C59185f13d17301a36c07A2268B814)
 * - [__View Contract on Avalanche Snow Trace__](https://snowtrace.io/address/0xA7b197cD5b0cEF6d62c4A0a851E3581f5E62e4D2)
 * - [__View Contract on Base Sepolia Basescan__](https://sepolia.basescan.org/address/0x53F4f44C813Dc380182d0b2b67fe5832A12B97f8)
 * - [__View Contract on Scroll Sepolia Scrollscan__](https://sepolia.scrollscan.com/address/0x93fA9B627eE016990Fe5e654F923aaE8a480a75b)
 * - [__View Contract on Scroll Scrollscan__](https://scrollscan.com/address/0x97a9f293d7eD13f3fbD499cE684Ed4F103295a28)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x9823364056BcA85Dc3c4a3b96801314D082C8Eb9)
 * - [__View Contract on Op Sepolia Blockscout__](https://optimism-sepolia.blockscout.com/address/0xd453d38A001B47271488886532f1CCeAbf0c7eF3)
 * - [__View Contract on Degen Degen Chain Explorer__](https://explorer.degen.tips/address/0x210a01ad187003603B2287F78579ec103Eb70D9B)
 */
export const usePrepareGeneralDistributionAgreementV1UpdateCode =
  /*#__PURE__*/ createUseSimulateContract({
    abi: generalDistributionAgreementV1Abi,
    address: generalDistributionAgreementV1Address,
    functionName: 'updateCode',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link generalDistributionAgreementV1Abi}__ and `functionName` set to `"createPool"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0xAAdBB3Eee3Bd080f5353d86DdF1916aCA3fAC842)
 * - [__View Contract on Op Mainnet Optimism Explorer__](https://optimistic.etherscan.io/address/0x68Ae17fa7a31b86F306c383277552fd4813b0d35)
 * - [__View Contract on Bnb Smart Chain Bsc Scan__](https://bscscan.com/address/0x3bbFA4C406719424C7f66CD97A8Fe27Af383d3e2)
 * - [__View Contract on Gnosis Gnosisscan__](https://gnosisscan.io/address/0xd7992D358A20478c82dDEd98B3D8A9da46e99b82)
 * - [__View Contract on Polygon Polygon Scan__](https://polygonscan.com/address/0x961dd5A052741B49B6CBf6759591f9D8576fCFb0)
 * - [__View Contract on Base Basescan__](https://basescan.org/address/0xfE6c87BE05feDB2059d2EC41bA0A09826C9FD7aa)
 * - [__View Contract on Arbitrum One Arbiscan__](https://arbiscan.io/address/0x1e299701792a2aF01408B122419d65Fd2dF0Ba02)
 * - [__View Contract on Celo Celo Explorer__](https://celoscan.io/address/0x308b7405272d11494716e30C6E972DbF6fb89555)
 * - [__View Contract on Avalanche Fuji Snow Trace__](https://testnet.snowtrace.io/address/0x51f571D934C59185f13d17301a36c07A2268B814)
 * - [__View Contract on Avalanche Snow Trace__](https://snowtrace.io/address/0xA7b197cD5b0cEF6d62c4A0a851E3581f5E62e4D2)
 * - [__View Contract on Base Sepolia Basescan__](https://sepolia.basescan.org/address/0x53F4f44C813Dc380182d0b2b67fe5832A12B97f8)
 * - [__View Contract on Scroll Sepolia Scrollscan__](https://sepolia.scrollscan.com/address/0x93fA9B627eE016990Fe5e654F923aaE8a480a75b)
 * - [__View Contract on Scroll Scrollscan__](https://scrollscan.com/address/0x97a9f293d7eD13f3fbD499cE684Ed4F103295a28)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x9823364056BcA85Dc3c4a3b96801314D082C8Eb9)
 * - [__View Contract on Op Sepolia Blockscout__](https://optimism-sepolia.blockscout.com/address/0xd453d38A001B47271488886532f1CCeAbf0c7eF3)
 * - [__View Contract on Degen Degen Chain Explorer__](https://explorer.degen.tips/address/0x210a01ad187003603B2287F78579ec103Eb70D9B)
 */
export const usePrepareGeneralDistributionAgreementV1CreatePool =
  /*#__PURE__*/ createUseSimulateContract({
    abi: generalDistributionAgreementV1Abi,
    address: generalDistributionAgreementV1Address,
    functionName: 'createPool',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link generalDistributionAgreementV1Abi}__ and `functionName` set to `"updateMemberUnits"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0xAAdBB3Eee3Bd080f5353d86DdF1916aCA3fAC842)
 * - [__View Contract on Op Mainnet Optimism Explorer__](https://optimistic.etherscan.io/address/0x68Ae17fa7a31b86F306c383277552fd4813b0d35)
 * - [__View Contract on Bnb Smart Chain Bsc Scan__](https://bscscan.com/address/0x3bbFA4C406719424C7f66CD97A8Fe27Af383d3e2)
 * - [__View Contract on Gnosis Gnosisscan__](https://gnosisscan.io/address/0xd7992D358A20478c82dDEd98B3D8A9da46e99b82)
 * - [__View Contract on Polygon Polygon Scan__](https://polygonscan.com/address/0x961dd5A052741B49B6CBf6759591f9D8576fCFb0)
 * - [__View Contract on Base Basescan__](https://basescan.org/address/0xfE6c87BE05feDB2059d2EC41bA0A09826C9FD7aa)
 * - [__View Contract on Arbitrum One Arbiscan__](https://arbiscan.io/address/0x1e299701792a2aF01408B122419d65Fd2dF0Ba02)
 * - [__View Contract on Celo Celo Explorer__](https://celoscan.io/address/0x308b7405272d11494716e30C6E972DbF6fb89555)
 * - [__View Contract on Avalanche Fuji Snow Trace__](https://testnet.snowtrace.io/address/0x51f571D934C59185f13d17301a36c07A2268B814)
 * - [__View Contract on Avalanche Snow Trace__](https://snowtrace.io/address/0xA7b197cD5b0cEF6d62c4A0a851E3581f5E62e4D2)
 * - [__View Contract on Base Sepolia Basescan__](https://sepolia.basescan.org/address/0x53F4f44C813Dc380182d0b2b67fe5832A12B97f8)
 * - [__View Contract on Scroll Sepolia Scrollscan__](https://sepolia.scrollscan.com/address/0x93fA9B627eE016990Fe5e654F923aaE8a480a75b)
 * - [__View Contract on Scroll Scrollscan__](https://scrollscan.com/address/0x97a9f293d7eD13f3fbD499cE684Ed4F103295a28)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x9823364056BcA85Dc3c4a3b96801314D082C8Eb9)
 * - [__View Contract on Op Sepolia Blockscout__](https://optimism-sepolia.blockscout.com/address/0xd453d38A001B47271488886532f1CCeAbf0c7eF3)
 * - [__View Contract on Degen Degen Chain Explorer__](https://explorer.degen.tips/address/0x210a01ad187003603B2287F78579ec103Eb70D9B)
 */
export const usePrepareGeneralDistributionAgreementV1UpdateMemberUnits =
  /*#__PURE__*/ createUseSimulateContract({
    abi: generalDistributionAgreementV1Abi,
    address: generalDistributionAgreementV1Address,
    functionName: 'updateMemberUnits',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link generalDistributionAgreementV1Abi}__ and `functionName` set to `"claimAll"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0xAAdBB3Eee3Bd080f5353d86DdF1916aCA3fAC842)
 * - [__View Contract on Op Mainnet Optimism Explorer__](https://optimistic.etherscan.io/address/0x68Ae17fa7a31b86F306c383277552fd4813b0d35)
 * - [__View Contract on Bnb Smart Chain Bsc Scan__](https://bscscan.com/address/0x3bbFA4C406719424C7f66CD97A8Fe27Af383d3e2)
 * - [__View Contract on Gnosis Gnosisscan__](https://gnosisscan.io/address/0xd7992D358A20478c82dDEd98B3D8A9da46e99b82)
 * - [__View Contract on Polygon Polygon Scan__](https://polygonscan.com/address/0x961dd5A052741B49B6CBf6759591f9D8576fCFb0)
 * - [__View Contract on Base Basescan__](https://basescan.org/address/0xfE6c87BE05feDB2059d2EC41bA0A09826C9FD7aa)
 * - [__View Contract on Arbitrum One Arbiscan__](https://arbiscan.io/address/0x1e299701792a2aF01408B122419d65Fd2dF0Ba02)
 * - [__View Contract on Celo Celo Explorer__](https://celoscan.io/address/0x308b7405272d11494716e30C6E972DbF6fb89555)
 * - [__View Contract on Avalanche Fuji Snow Trace__](https://testnet.snowtrace.io/address/0x51f571D934C59185f13d17301a36c07A2268B814)
 * - [__View Contract on Avalanche Snow Trace__](https://snowtrace.io/address/0xA7b197cD5b0cEF6d62c4A0a851E3581f5E62e4D2)
 * - [__View Contract on Base Sepolia Basescan__](https://sepolia.basescan.org/address/0x53F4f44C813Dc380182d0b2b67fe5832A12B97f8)
 * - [__View Contract on Scroll Sepolia Scrollscan__](https://sepolia.scrollscan.com/address/0x93fA9B627eE016990Fe5e654F923aaE8a480a75b)
 * - [__View Contract on Scroll Scrollscan__](https://scrollscan.com/address/0x97a9f293d7eD13f3fbD499cE684Ed4F103295a28)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x9823364056BcA85Dc3c4a3b96801314D082C8Eb9)
 * - [__View Contract on Op Sepolia Blockscout__](https://optimism-sepolia.blockscout.com/address/0xd453d38A001B47271488886532f1CCeAbf0c7eF3)
 * - [__View Contract on Degen Degen Chain Explorer__](https://explorer.degen.tips/address/0x210a01ad187003603B2287F78579ec103Eb70D9B)
 */
export const usePrepareGeneralDistributionAgreementV1ClaimAll =
  /*#__PURE__*/ createUseSimulateContract({
    abi: generalDistributionAgreementV1Abi,
    address: generalDistributionAgreementV1Address,
    functionName: 'claimAll',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link generalDistributionAgreementV1Abi}__ and `functionName` set to `"disconnectPool"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0xAAdBB3Eee3Bd080f5353d86DdF1916aCA3fAC842)
 * - [__View Contract on Op Mainnet Optimism Explorer__](https://optimistic.etherscan.io/address/0x68Ae17fa7a31b86F306c383277552fd4813b0d35)
 * - [__View Contract on Bnb Smart Chain Bsc Scan__](https://bscscan.com/address/0x3bbFA4C406719424C7f66CD97A8Fe27Af383d3e2)
 * - [__View Contract on Gnosis Gnosisscan__](https://gnosisscan.io/address/0xd7992D358A20478c82dDEd98B3D8A9da46e99b82)
 * - [__View Contract on Polygon Polygon Scan__](https://polygonscan.com/address/0x961dd5A052741B49B6CBf6759591f9D8576fCFb0)
 * - [__View Contract on Base Basescan__](https://basescan.org/address/0xfE6c87BE05feDB2059d2EC41bA0A09826C9FD7aa)
 * - [__View Contract on Arbitrum One Arbiscan__](https://arbiscan.io/address/0x1e299701792a2aF01408B122419d65Fd2dF0Ba02)
 * - [__View Contract on Celo Celo Explorer__](https://celoscan.io/address/0x308b7405272d11494716e30C6E972DbF6fb89555)
 * - [__View Contract on Avalanche Fuji Snow Trace__](https://testnet.snowtrace.io/address/0x51f571D934C59185f13d17301a36c07A2268B814)
 * - [__View Contract on Avalanche Snow Trace__](https://snowtrace.io/address/0xA7b197cD5b0cEF6d62c4A0a851E3581f5E62e4D2)
 * - [__View Contract on Base Sepolia Basescan__](https://sepolia.basescan.org/address/0x53F4f44C813Dc380182d0b2b67fe5832A12B97f8)
 * - [__View Contract on Scroll Sepolia Scrollscan__](https://sepolia.scrollscan.com/address/0x93fA9B627eE016990Fe5e654F923aaE8a480a75b)
 * - [__View Contract on Scroll Scrollscan__](https://scrollscan.com/address/0x97a9f293d7eD13f3fbD499cE684Ed4F103295a28)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x9823364056BcA85Dc3c4a3b96801314D082C8Eb9)
 * - [__View Contract on Op Sepolia Blockscout__](https://optimism-sepolia.blockscout.com/address/0xd453d38A001B47271488886532f1CCeAbf0c7eF3)
 * - [__View Contract on Degen Degen Chain Explorer__](https://explorer.degen.tips/address/0x210a01ad187003603B2287F78579ec103Eb70D9B)
 */
export const usePrepareGeneralDistributionAgreementV1DisconnectPool =
  /*#__PURE__*/ createUseSimulateContract({
    abi: generalDistributionAgreementV1Abi,
    address: generalDistributionAgreementV1Address,
    functionName: 'disconnectPool',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link generalDistributionAgreementV1Abi}__ and `functionName` set to `"connectPool"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0xAAdBB3Eee3Bd080f5353d86DdF1916aCA3fAC842)
 * - [__View Contract on Op Mainnet Optimism Explorer__](https://optimistic.etherscan.io/address/0x68Ae17fa7a31b86F306c383277552fd4813b0d35)
 * - [__View Contract on Bnb Smart Chain Bsc Scan__](https://bscscan.com/address/0x3bbFA4C406719424C7f66CD97A8Fe27Af383d3e2)
 * - [__View Contract on Gnosis Gnosisscan__](https://gnosisscan.io/address/0xd7992D358A20478c82dDEd98B3D8A9da46e99b82)
 * - [__View Contract on Polygon Polygon Scan__](https://polygonscan.com/address/0x961dd5A052741B49B6CBf6759591f9D8576fCFb0)
 * - [__View Contract on Base Basescan__](https://basescan.org/address/0xfE6c87BE05feDB2059d2EC41bA0A09826C9FD7aa)
 * - [__View Contract on Arbitrum One Arbiscan__](https://arbiscan.io/address/0x1e299701792a2aF01408B122419d65Fd2dF0Ba02)
 * - [__View Contract on Celo Celo Explorer__](https://celoscan.io/address/0x308b7405272d11494716e30C6E972DbF6fb89555)
 * - [__View Contract on Avalanche Fuji Snow Trace__](https://testnet.snowtrace.io/address/0x51f571D934C59185f13d17301a36c07A2268B814)
 * - [__View Contract on Avalanche Snow Trace__](https://snowtrace.io/address/0xA7b197cD5b0cEF6d62c4A0a851E3581f5E62e4D2)
 * - [__View Contract on Base Sepolia Basescan__](https://sepolia.basescan.org/address/0x53F4f44C813Dc380182d0b2b67fe5832A12B97f8)
 * - [__View Contract on Scroll Sepolia Scrollscan__](https://sepolia.scrollscan.com/address/0x93fA9B627eE016990Fe5e654F923aaE8a480a75b)
 * - [__View Contract on Scroll Scrollscan__](https://scrollscan.com/address/0x97a9f293d7eD13f3fbD499cE684Ed4F103295a28)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x9823364056BcA85Dc3c4a3b96801314D082C8Eb9)
 * - [__View Contract on Op Sepolia Blockscout__](https://optimism-sepolia.blockscout.com/address/0xd453d38A001B47271488886532f1CCeAbf0c7eF3)
 * - [__View Contract on Degen Degen Chain Explorer__](https://explorer.degen.tips/address/0x210a01ad187003603B2287F78579ec103Eb70D9B)
 */
export const usePrepareGeneralDistributionAgreementV1ConnectPool =
  /*#__PURE__*/ createUseSimulateContract({
    abi: generalDistributionAgreementV1Abi,
    address: generalDistributionAgreementV1Address,
    functionName: 'connectPool',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link generalDistributionAgreementV1Abi}__ and `functionName` set to `"appendIndexUpdateByPool"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0xAAdBB3Eee3Bd080f5353d86DdF1916aCA3fAC842)
 * - [__View Contract on Op Mainnet Optimism Explorer__](https://optimistic.etherscan.io/address/0x68Ae17fa7a31b86F306c383277552fd4813b0d35)
 * - [__View Contract on Bnb Smart Chain Bsc Scan__](https://bscscan.com/address/0x3bbFA4C406719424C7f66CD97A8Fe27Af383d3e2)
 * - [__View Contract on Gnosis Gnosisscan__](https://gnosisscan.io/address/0xd7992D358A20478c82dDEd98B3D8A9da46e99b82)
 * - [__View Contract on Polygon Polygon Scan__](https://polygonscan.com/address/0x961dd5A052741B49B6CBf6759591f9D8576fCFb0)
 * - [__View Contract on Base Basescan__](https://basescan.org/address/0xfE6c87BE05feDB2059d2EC41bA0A09826C9FD7aa)
 * - [__View Contract on Arbitrum One Arbiscan__](https://arbiscan.io/address/0x1e299701792a2aF01408B122419d65Fd2dF0Ba02)
 * - [__View Contract on Celo Celo Explorer__](https://celoscan.io/address/0x308b7405272d11494716e30C6E972DbF6fb89555)
 * - [__View Contract on Avalanche Fuji Snow Trace__](https://testnet.snowtrace.io/address/0x51f571D934C59185f13d17301a36c07A2268B814)
 * - [__View Contract on Avalanche Snow Trace__](https://snowtrace.io/address/0xA7b197cD5b0cEF6d62c4A0a851E3581f5E62e4D2)
 * - [__View Contract on Base Sepolia Basescan__](https://sepolia.basescan.org/address/0x53F4f44C813Dc380182d0b2b67fe5832A12B97f8)
 * - [__View Contract on Scroll Sepolia Scrollscan__](https://sepolia.scrollscan.com/address/0x93fA9B627eE016990Fe5e654F923aaE8a480a75b)
 * - [__View Contract on Scroll Scrollscan__](https://scrollscan.com/address/0x97a9f293d7eD13f3fbD499cE684Ed4F103295a28)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x9823364056BcA85Dc3c4a3b96801314D082C8Eb9)
 * - [__View Contract on Op Sepolia Blockscout__](https://optimism-sepolia.blockscout.com/address/0xd453d38A001B47271488886532f1CCeAbf0c7eF3)
 * - [__View Contract on Degen Degen Chain Explorer__](https://explorer.degen.tips/address/0x210a01ad187003603B2287F78579ec103Eb70D9B)
 */
export const usePrepareGeneralDistributionAgreementV1AppendIndexUpdateByPool =
  /*#__PURE__*/ createUseSimulateContract({
    abi: generalDistributionAgreementV1Abi,
    address: generalDistributionAgreementV1Address,
    functionName: 'appendIndexUpdateByPool',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link generalDistributionAgreementV1Abi}__ and `functionName` set to `"poolSettleClaim"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0xAAdBB3Eee3Bd080f5353d86DdF1916aCA3fAC842)
 * - [__View Contract on Op Mainnet Optimism Explorer__](https://optimistic.etherscan.io/address/0x68Ae17fa7a31b86F306c383277552fd4813b0d35)
 * - [__View Contract on Bnb Smart Chain Bsc Scan__](https://bscscan.com/address/0x3bbFA4C406719424C7f66CD97A8Fe27Af383d3e2)
 * - [__View Contract on Gnosis Gnosisscan__](https://gnosisscan.io/address/0xd7992D358A20478c82dDEd98B3D8A9da46e99b82)
 * - [__View Contract on Polygon Polygon Scan__](https://polygonscan.com/address/0x961dd5A052741B49B6CBf6759591f9D8576fCFb0)
 * - [__View Contract on Base Basescan__](https://basescan.org/address/0xfE6c87BE05feDB2059d2EC41bA0A09826C9FD7aa)
 * - [__View Contract on Arbitrum One Arbiscan__](https://arbiscan.io/address/0x1e299701792a2aF01408B122419d65Fd2dF0Ba02)
 * - [__View Contract on Celo Celo Explorer__](https://celoscan.io/address/0x308b7405272d11494716e30C6E972DbF6fb89555)
 * - [__View Contract on Avalanche Fuji Snow Trace__](https://testnet.snowtrace.io/address/0x51f571D934C59185f13d17301a36c07A2268B814)
 * - [__View Contract on Avalanche Snow Trace__](https://snowtrace.io/address/0xA7b197cD5b0cEF6d62c4A0a851E3581f5E62e4D2)
 * - [__View Contract on Base Sepolia Basescan__](https://sepolia.basescan.org/address/0x53F4f44C813Dc380182d0b2b67fe5832A12B97f8)
 * - [__View Contract on Scroll Sepolia Scrollscan__](https://sepolia.scrollscan.com/address/0x93fA9B627eE016990Fe5e654F923aaE8a480a75b)
 * - [__View Contract on Scroll Scrollscan__](https://scrollscan.com/address/0x97a9f293d7eD13f3fbD499cE684Ed4F103295a28)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x9823364056BcA85Dc3c4a3b96801314D082C8Eb9)
 * - [__View Contract on Op Sepolia Blockscout__](https://optimism-sepolia.blockscout.com/address/0xd453d38A001B47271488886532f1CCeAbf0c7eF3)
 * - [__View Contract on Degen Degen Chain Explorer__](https://explorer.degen.tips/address/0x210a01ad187003603B2287F78579ec103Eb70D9B)
 */
export const usePrepareGeneralDistributionAgreementV1PoolSettleClaim =
  /*#__PURE__*/ createUseSimulateContract({
    abi: generalDistributionAgreementV1Abi,
    address: generalDistributionAgreementV1Address,
    functionName: 'poolSettleClaim',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link generalDistributionAgreementV1Abi}__ and `functionName` set to `"distribute"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0xAAdBB3Eee3Bd080f5353d86DdF1916aCA3fAC842)
 * - [__View Contract on Op Mainnet Optimism Explorer__](https://optimistic.etherscan.io/address/0x68Ae17fa7a31b86F306c383277552fd4813b0d35)
 * - [__View Contract on Bnb Smart Chain Bsc Scan__](https://bscscan.com/address/0x3bbFA4C406719424C7f66CD97A8Fe27Af383d3e2)
 * - [__View Contract on Gnosis Gnosisscan__](https://gnosisscan.io/address/0xd7992D358A20478c82dDEd98B3D8A9da46e99b82)
 * - [__View Contract on Polygon Polygon Scan__](https://polygonscan.com/address/0x961dd5A052741B49B6CBf6759591f9D8576fCFb0)
 * - [__View Contract on Base Basescan__](https://basescan.org/address/0xfE6c87BE05feDB2059d2EC41bA0A09826C9FD7aa)
 * - [__View Contract on Arbitrum One Arbiscan__](https://arbiscan.io/address/0x1e299701792a2aF01408B122419d65Fd2dF0Ba02)
 * - [__View Contract on Celo Celo Explorer__](https://celoscan.io/address/0x308b7405272d11494716e30C6E972DbF6fb89555)
 * - [__View Contract on Avalanche Fuji Snow Trace__](https://testnet.snowtrace.io/address/0x51f571D934C59185f13d17301a36c07A2268B814)
 * - [__View Contract on Avalanche Snow Trace__](https://snowtrace.io/address/0xA7b197cD5b0cEF6d62c4A0a851E3581f5E62e4D2)
 * - [__View Contract on Base Sepolia Basescan__](https://sepolia.basescan.org/address/0x53F4f44C813Dc380182d0b2b67fe5832A12B97f8)
 * - [__View Contract on Scroll Sepolia Scrollscan__](https://sepolia.scrollscan.com/address/0x93fA9B627eE016990Fe5e654F923aaE8a480a75b)
 * - [__View Contract on Scroll Scrollscan__](https://scrollscan.com/address/0x97a9f293d7eD13f3fbD499cE684Ed4F103295a28)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x9823364056BcA85Dc3c4a3b96801314D082C8Eb9)
 * - [__View Contract on Op Sepolia Blockscout__](https://optimism-sepolia.blockscout.com/address/0xd453d38A001B47271488886532f1CCeAbf0c7eF3)
 * - [__View Contract on Degen Degen Chain Explorer__](https://explorer.degen.tips/address/0x210a01ad187003603B2287F78579ec103Eb70D9B)
 */
export const usePrepareGeneralDistributionAgreementV1Distribute =
  /*#__PURE__*/ createUseSimulateContract({
    abi: generalDistributionAgreementV1Abi,
    address: generalDistributionAgreementV1Address,
    functionName: 'distribute',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link generalDistributionAgreementV1Abi}__ and `functionName` set to `"distributeFlow"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0xAAdBB3Eee3Bd080f5353d86DdF1916aCA3fAC842)
 * - [__View Contract on Op Mainnet Optimism Explorer__](https://optimistic.etherscan.io/address/0x68Ae17fa7a31b86F306c383277552fd4813b0d35)
 * - [__View Contract on Bnb Smart Chain Bsc Scan__](https://bscscan.com/address/0x3bbFA4C406719424C7f66CD97A8Fe27Af383d3e2)
 * - [__View Contract on Gnosis Gnosisscan__](https://gnosisscan.io/address/0xd7992D358A20478c82dDEd98B3D8A9da46e99b82)
 * - [__View Contract on Polygon Polygon Scan__](https://polygonscan.com/address/0x961dd5A052741B49B6CBf6759591f9D8576fCFb0)
 * - [__View Contract on Base Basescan__](https://basescan.org/address/0xfE6c87BE05feDB2059d2EC41bA0A09826C9FD7aa)
 * - [__View Contract on Arbitrum One Arbiscan__](https://arbiscan.io/address/0x1e299701792a2aF01408B122419d65Fd2dF0Ba02)
 * - [__View Contract on Celo Celo Explorer__](https://celoscan.io/address/0x308b7405272d11494716e30C6E972DbF6fb89555)
 * - [__View Contract on Avalanche Fuji Snow Trace__](https://testnet.snowtrace.io/address/0x51f571D934C59185f13d17301a36c07A2268B814)
 * - [__View Contract on Avalanche Snow Trace__](https://snowtrace.io/address/0xA7b197cD5b0cEF6d62c4A0a851E3581f5E62e4D2)
 * - [__View Contract on Base Sepolia Basescan__](https://sepolia.basescan.org/address/0x53F4f44C813Dc380182d0b2b67fe5832A12B97f8)
 * - [__View Contract on Scroll Sepolia Scrollscan__](https://sepolia.scrollscan.com/address/0x93fA9B627eE016990Fe5e654F923aaE8a480a75b)
 * - [__View Contract on Scroll Scrollscan__](https://scrollscan.com/address/0x97a9f293d7eD13f3fbD499cE684Ed4F103295a28)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x9823364056BcA85Dc3c4a3b96801314D082C8Eb9)
 * - [__View Contract on Op Sepolia Blockscout__](https://optimism-sepolia.blockscout.com/address/0xd453d38A001B47271488886532f1CCeAbf0c7eF3)
 * - [__View Contract on Degen Degen Chain Explorer__](https://explorer.degen.tips/address/0x210a01ad187003603B2287F78579ec103Eb70D9B)
 */
export const usePrepareGeneralDistributionAgreementV1DistributeFlow =
  /*#__PURE__*/ createUseSimulateContract({
    abi: generalDistributionAgreementV1Abi,
    address: generalDistributionAgreementV1Address,
    functionName: 'distributeFlow',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link generalDistributionAgreementV1Abi}__
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0xAAdBB3Eee3Bd080f5353d86DdF1916aCA3fAC842)
 * - [__View Contract on Op Mainnet Optimism Explorer__](https://optimistic.etherscan.io/address/0x68Ae17fa7a31b86F306c383277552fd4813b0d35)
 * - [__View Contract on Bnb Smart Chain Bsc Scan__](https://bscscan.com/address/0x3bbFA4C406719424C7f66CD97A8Fe27Af383d3e2)
 * - [__View Contract on Gnosis Gnosisscan__](https://gnosisscan.io/address/0xd7992D358A20478c82dDEd98B3D8A9da46e99b82)
 * - [__View Contract on Polygon Polygon Scan__](https://polygonscan.com/address/0x961dd5A052741B49B6CBf6759591f9D8576fCFb0)
 * - [__View Contract on Base Basescan__](https://basescan.org/address/0xfE6c87BE05feDB2059d2EC41bA0A09826C9FD7aa)
 * - [__View Contract on Arbitrum One Arbiscan__](https://arbiscan.io/address/0x1e299701792a2aF01408B122419d65Fd2dF0Ba02)
 * - [__View Contract on Celo Celo Explorer__](https://celoscan.io/address/0x308b7405272d11494716e30C6E972DbF6fb89555)
 * - [__View Contract on Avalanche Fuji Snow Trace__](https://testnet.snowtrace.io/address/0x51f571D934C59185f13d17301a36c07A2268B814)
 * - [__View Contract on Avalanche Snow Trace__](https://snowtrace.io/address/0xA7b197cD5b0cEF6d62c4A0a851E3581f5E62e4D2)
 * - [__View Contract on Base Sepolia Basescan__](https://sepolia.basescan.org/address/0x53F4f44C813Dc380182d0b2b67fe5832A12B97f8)
 * - [__View Contract on Scroll Sepolia Scrollscan__](https://sepolia.scrollscan.com/address/0x93fA9B627eE016990Fe5e654F923aaE8a480a75b)
 * - [__View Contract on Scroll Scrollscan__](https://scrollscan.com/address/0x97a9f293d7eD13f3fbD499cE684Ed4F103295a28)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x9823364056BcA85Dc3c4a3b96801314D082C8Eb9)
 * - [__View Contract on Op Sepolia Blockscout__](https://optimism-sepolia.blockscout.com/address/0xd453d38A001B47271488886532f1CCeAbf0c7eF3)
 * - [__View Contract on Degen Degen Chain Explorer__](https://explorer.degen.tips/address/0x210a01ad187003603B2287F78579ec103Eb70D9B)
 */
export const useGeneralDistributionAgreementV1Event =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: generalDistributionAgreementV1Abi,
    address: generalDistributionAgreementV1Address,
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link generalDistributionAgreementV1Abi}__ and `eventName` set to `"BufferAdjusted"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0xAAdBB3Eee3Bd080f5353d86DdF1916aCA3fAC842)
 * - [__View Contract on Op Mainnet Optimism Explorer__](https://optimistic.etherscan.io/address/0x68Ae17fa7a31b86F306c383277552fd4813b0d35)
 * - [__View Contract on Bnb Smart Chain Bsc Scan__](https://bscscan.com/address/0x3bbFA4C406719424C7f66CD97A8Fe27Af383d3e2)
 * - [__View Contract on Gnosis Gnosisscan__](https://gnosisscan.io/address/0xd7992D358A20478c82dDEd98B3D8A9da46e99b82)
 * - [__View Contract on Polygon Polygon Scan__](https://polygonscan.com/address/0x961dd5A052741B49B6CBf6759591f9D8576fCFb0)
 * - [__View Contract on Base Basescan__](https://basescan.org/address/0xfE6c87BE05feDB2059d2EC41bA0A09826C9FD7aa)
 * - [__View Contract on Arbitrum One Arbiscan__](https://arbiscan.io/address/0x1e299701792a2aF01408B122419d65Fd2dF0Ba02)
 * - [__View Contract on Celo Celo Explorer__](https://celoscan.io/address/0x308b7405272d11494716e30C6E972DbF6fb89555)
 * - [__View Contract on Avalanche Fuji Snow Trace__](https://testnet.snowtrace.io/address/0x51f571D934C59185f13d17301a36c07A2268B814)
 * - [__View Contract on Avalanche Snow Trace__](https://snowtrace.io/address/0xA7b197cD5b0cEF6d62c4A0a851E3581f5E62e4D2)
 * - [__View Contract on Base Sepolia Basescan__](https://sepolia.basescan.org/address/0x53F4f44C813Dc380182d0b2b67fe5832A12B97f8)
 * - [__View Contract on Scroll Sepolia Scrollscan__](https://sepolia.scrollscan.com/address/0x93fA9B627eE016990Fe5e654F923aaE8a480a75b)
 * - [__View Contract on Scroll Scrollscan__](https://scrollscan.com/address/0x97a9f293d7eD13f3fbD499cE684Ed4F103295a28)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x9823364056BcA85Dc3c4a3b96801314D082C8Eb9)
 * - [__View Contract on Op Sepolia Blockscout__](https://optimism-sepolia.blockscout.com/address/0xd453d38A001B47271488886532f1CCeAbf0c7eF3)
 * - [__View Contract on Degen Degen Chain Explorer__](https://explorer.degen.tips/address/0x210a01ad187003603B2287F78579ec103Eb70D9B)
 */
export const useGeneralDistributionAgreementV1BufferAdjustedEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: generalDistributionAgreementV1Abi,
    address: generalDistributionAgreementV1Address,
    eventName: 'BufferAdjusted',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link generalDistributionAgreementV1Abi}__ and `eventName` set to `"CodeUpdated"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0xAAdBB3Eee3Bd080f5353d86DdF1916aCA3fAC842)
 * - [__View Contract on Op Mainnet Optimism Explorer__](https://optimistic.etherscan.io/address/0x68Ae17fa7a31b86F306c383277552fd4813b0d35)
 * - [__View Contract on Bnb Smart Chain Bsc Scan__](https://bscscan.com/address/0x3bbFA4C406719424C7f66CD97A8Fe27Af383d3e2)
 * - [__View Contract on Gnosis Gnosisscan__](https://gnosisscan.io/address/0xd7992D358A20478c82dDEd98B3D8A9da46e99b82)
 * - [__View Contract on Polygon Polygon Scan__](https://polygonscan.com/address/0x961dd5A052741B49B6CBf6759591f9D8576fCFb0)
 * - [__View Contract on Base Basescan__](https://basescan.org/address/0xfE6c87BE05feDB2059d2EC41bA0A09826C9FD7aa)
 * - [__View Contract on Arbitrum One Arbiscan__](https://arbiscan.io/address/0x1e299701792a2aF01408B122419d65Fd2dF0Ba02)
 * - [__View Contract on Celo Celo Explorer__](https://celoscan.io/address/0x308b7405272d11494716e30C6E972DbF6fb89555)
 * - [__View Contract on Avalanche Fuji Snow Trace__](https://testnet.snowtrace.io/address/0x51f571D934C59185f13d17301a36c07A2268B814)
 * - [__View Contract on Avalanche Snow Trace__](https://snowtrace.io/address/0xA7b197cD5b0cEF6d62c4A0a851E3581f5E62e4D2)
 * - [__View Contract on Base Sepolia Basescan__](https://sepolia.basescan.org/address/0x53F4f44C813Dc380182d0b2b67fe5832A12B97f8)
 * - [__View Contract on Scroll Sepolia Scrollscan__](https://sepolia.scrollscan.com/address/0x93fA9B627eE016990Fe5e654F923aaE8a480a75b)
 * - [__View Contract on Scroll Scrollscan__](https://scrollscan.com/address/0x97a9f293d7eD13f3fbD499cE684Ed4F103295a28)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x9823364056BcA85Dc3c4a3b96801314D082C8Eb9)
 * - [__View Contract on Op Sepolia Blockscout__](https://optimism-sepolia.blockscout.com/address/0xd453d38A001B47271488886532f1CCeAbf0c7eF3)
 * - [__View Contract on Degen Degen Chain Explorer__](https://explorer.degen.tips/address/0x210a01ad187003603B2287F78579ec103Eb70D9B)
 */
export const useGeneralDistributionAgreementV1CodeUpdatedEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: generalDistributionAgreementV1Abi,
    address: generalDistributionAgreementV1Address,
    eventName: 'CodeUpdated',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link generalDistributionAgreementV1Abi}__ and `eventName` set to `"FlowDistributionUpdated"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0xAAdBB3Eee3Bd080f5353d86DdF1916aCA3fAC842)
 * - [__View Contract on Op Mainnet Optimism Explorer__](https://optimistic.etherscan.io/address/0x68Ae17fa7a31b86F306c383277552fd4813b0d35)
 * - [__View Contract on Bnb Smart Chain Bsc Scan__](https://bscscan.com/address/0x3bbFA4C406719424C7f66CD97A8Fe27Af383d3e2)
 * - [__View Contract on Gnosis Gnosisscan__](https://gnosisscan.io/address/0xd7992D358A20478c82dDEd98B3D8A9da46e99b82)
 * - [__View Contract on Polygon Polygon Scan__](https://polygonscan.com/address/0x961dd5A052741B49B6CBf6759591f9D8576fCFb0)
 * - [__View Contract on Base Basescan__](https://basescan.org/address/0xfE6c87BE05feDB2059d2EC41bA0A09826C9FD7aa)
 * - [__View Contract on Arbitrum One Arbiscan__](https://arbiscan.io/address/0x1e299701792a2aF01408B122419d65Fd2dF0Ba02)
 * - [__View Contract on Celo Celo Explorer__](https://celoscan.io/address/0x308b7405272d11494716e30C6E972DbF6fb89555)
 * - [__View Contract on Avalanche Fuji Snow Trace__](https://testnet.snowtrace.io/address/0x51f571D934C59185f13d17301a36c07A2268B814)
 * - [__View Contract on Avalanche Snow Trace__](https://snowtrace.io/address/0xA7b197cD5b0cEF6d62c4A0a851E3581f5E62e4D2)
 * - [__View Contract on Base Sepolia Basescan__](https://sepolia.basescan.org/address/0x53F4f44C813Dc380182d0b2b67fe5832A12B97f8)
 * - [__View Contract on Scroll Sepolia Scrollscan__](https://sepolia.scrollscan.com/address/0x93fA9B627eE016990Fe5e654F923aaE8a480a75b)
 * - [__View Contract on Scroll Scrollscan__](https://scrollscan.com/address/0x97a9f293d7eD13f3fbD499cE684Ed4F103295a28)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x9823364056BcA85Dc3c4a3b96801314D082C8Eb9)
 * - [__View Contract on Op Sepolia Blockscout__](https://optimism-sepolia.blockscout.com/address/0xd453d38A001B47271488886532f1CCeAbf0c7eF3)
 * - [__View Contract on Degen Degen Chain Explorer__](https://explorer.degen.tips/address/0x210a01ad187003603B2287F78579ec103Eb70D9B)
 */
export const useGeneralDistributionAgreementV1FlowDistributionUpdatedEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: generalDistributionAgreementV1Abi,
    address: generalDistributionAgreementV1Address,
    eventName: 'FlowDistributionUpdated',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link generalDistributionAgreementV1Abi}__ and `eventName` set to `"Initialized"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0xAAdBB3Eee3Bd080f5353d86DdF1916aCA3fAC842)
 * - [__View Contract on Op Mainnet Optimism Explorer__](https://optimistic.etherscan.io/address/0x68Ae17fa7a31b86F306c383277552fd4813b0d35)
 * - [__View Contract on Bnb Smart Chain Bsc Scan__](https://bscscan.com/address/0x3bbFA4C406719424C7f66CD97A8Fe27Af383d3e2)
 * - [__View Contract on Gnosis Gnosisscan__](https://gnosisscan.io/address/0xd7992D358A20478c82dDEd98B3D8A9da46e99b82)
 * - [__View Contract on Polygon Polygon Scan__](https://polygonscan.com/address/0x961dd5A052741B49B6CBf6759591f9D8576fCFb0)
 * - [__View Contract on Base Basescan__](https://basescan.org/address/0xfE6c87BE05feDB2059d2EC41bA0A09826C9FD7aa)
 * - [__View Contract on Arbitrum One Arbiscan__](https://arbiscan.io/address/0x1e299701792a2aF01408B122419d65Fd2dF0Ba02)
 * - [__View Contract on Celo Celo Explorer__](https://celoscan.io/address/0x308b7405272d11494716e30C6E972DbF6fb89555)
 * - [__View Contract on Avalanche Fuji Snow Trace__](https://testnet.snowtrace.io/address/0x51f571D934C59185f13d17301a36c07A2268B814)
 * - [__View Contract on Avalanche Snow Trace__](https://snowtrace.io/address/0xA7b197cD5b0cEF6d62c4A0a851E3581f5E62e4D2)
 * - [__View Contract on Base Sepolia Basescan__](https://sepolia.basescan.org/address/0x53F4f44C813Dc380182d0b2b67fe5832A12B97f8)
 * - [__View Contract on Scroll Sepolia Scrollscan__](https://sepolia.scrollscan.com/address/0x93fA9B627eE016990Fe5e654F923aaE8a480a75b)
 * - [__View Contract on Scroll Scrollscan__](https://scrollscan.com/address/0x97a9f293d7eD13f3fbD499cE684Ed4F103295a28)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x9823364056BcA85Dc3c4a3b96801314D082C8Eb9)
 * - [__View Contract on Op Sepolia Blockscout__](https://optimism-sepolia.blockscout.com/address/0xd453d38A001B47271488886532f1CCeAbf0c7eF3)
 * - [__View Contract on Degen Degen Chain Explorer__](https://explorer.degen.tips/address/0x210a01ad187003603B2287F78579ec103Eb70D9B)
 */
export const useGeneralDistributionAgreementV1InitializedEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: generalDistributionAgreementV1Abi,
    address: generalDistributionAgreementV1Address,
    eventName: 'Initialized',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link generalDistributionAgreementV1Abi}__ and `eventName` set to `"InstantDistributionUpdated"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0xAAdBB3Eee3Bd080f5353d86DdF1916aCA3fAC842)
 * - [__View Contract on Op Mainnet Optimism Explorer__](https://optimistic.etherscan.io/address/0x68Ae17fa7a31b86F306c383277552fd4813b0d35)
 * - [__View Contract on Bnb Smart Chain Bsc Scan__](https://bscscan.com/address/0x3bbFA4C406719424C7f66CD97A8Fe27Af383d3e2)
 * - [__View Contract on Gnosis Gnosisscan__](https://gnosisscan.io/address/0xd7992D358A20478c82dDEd98B3D8A9da46e99b82)
 * - [__View Contract on Polygon Polygon Scan__](https://polygonscan.com/address/0x961dd5A052741B49B6CBf6759591f9D8576fCFb0)
 * - [__View Contract on Base Basescan__](https://basescan.org/address/0xfE6c87BE05feDB2059d2EC41bA0A09826C9FD7aa)
 * - [__View Contract on Arbitrum One Arbiscan__](https://arbiscan.io/address/0x1e299701792a2aF01408B122419d65Fd2dF0Ba02)
 * - [__View Contract on Celo Celo Explorer__](https://celoscan.io/address/0x308b7405272d11494716e30C6E972DbF6fb89555)
 * - [__View Contract on Avalanche Fuji Snow Trace__](https://testnet.snowtrace.io/address/0x51f571D934C59185f13d17301a36c07A2268B814)
 * - [__View Contract on Avalanche Snow Trace__](https://snowtrace.io/address/0xA7b197cD5b0cEF6d62c4A0a851E3581f5E62e4D2)
 * - [__View Contract on Base Sepolia Basescan__](https://sepolia.basescan.org/address/0x53F4f44C813Dc380182d0b2b67fe5832A12B97f8)
 * - [__View Contract on Scroll Sepolia Scrollscan__](https://sepolia.scrollscan.com/address/0x93fA9B627eE016990Fe5e654F923aaE8a480a75b)
 * - [__View Contract on Scroll Scrollscan__](https://scrollscan.com/address/0x97a9f293d7eD13f3fbD499cE684Ed4F103295a28)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x9823364056BcA85Dc3c4a3b96801314D082C8Eb9)
 * - [__View Contract on Op Sepolia Blockscout__](https://optimism-sepolia.blockscout.com/address/0xd453d38A001B47271488886532f1CCeAbf0c7eF3)
 * - [__View Contract on Degen Degen Chain Explorer__](https://explorer.degen.tips/address/0x210a01ad187003603B2287F78579ec103Eb70D9B)
 */
export const useGeneralDistributionAgreementV1InstantDistributionUpdatedEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: generalDistributionAgreementV1Abi,
    address: generalDistributionAgreementV1Address,
    eventName: 'InstantDistributionUpdated',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link generalDistributionAgreementV1Abi}__ and `eventName` set to `"PoolConnectionUpdated"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0xAAdBB3Eee3Bd080f5353d86DdF1916aCA3fAC842)
 * - [__View Contract on Op Mainnet Optimism Explorer__](https://optimistic.etherscan.io/address/0x68Ae17fa7a31b86F306c383277552fd4813b0d35)
 * - [__View Contract on Bnb Smart Chain Bsc Scan__](https://bscscan.com/address/0x3bbFA4C406719424C7f66CD97A8Fe27Af383d3e2)
 * - [__View Contract on Gnosis Gnosisscan__](https://gnosisscan.io/address/0xd7992D358A20478c82dDEd98B3D8A9da46e99b82)
 * - [__View Contract on Polygon Polygon Scan__](https://polygonscan.com/address/0x961dd5A052741B49B6CBf6759591f9D8576fCFb0)
 * - [__View Contract on Base Basescan__](https://basescan.org/address/0xfE6c87BE05feDB2059d2EC41bA0A09826C9FD7aa)
 * - [__View Contract on Arbitrum One Arbiscan__](https://arbiscan.io/address/0x1e299701792a2aF01408B122419d65Fd2dF0Ba02)
 * - [__View Contract on Celo Celo Explorer__](https://celoscan.io/address/0x308b7405272d11494716e30C6E972DbF6fb89555)
 * - [__View Contract on Avalanche Fuji Snow Trace__](https://testnet.snowtrace.io/address/0x51f571D934C59185f13d17301a36c07A2268B814)
 * - [__View Contract on Avalanche Snow Trace__](https://snowtrace.io/address/0xA7b197cD5b0cEF6d62c4A0a851E3581f5E62e4D2)
 * - [__View Contract on Base Sepolia Basescan__](https://sepolia.basescan.org/address/0x53F4f44C813Dc380182d0b2b67fe5832A12B97f8)
 * - [__View Contract on Scroll Sepolia Scrollscan__](https://sepolia.scrollscan.com/address/0x93fA9B627eE016990Fe5e654F923aaE8a480a75b)
 * - [__View Contract on Scroll Scrollscan__](https://scrollscan.com/address/0x97a9f293d7eD13f3fbD499cE684Ed4F103295a28)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x9823364056BcA85Dc3c4a3b96801314D082C8Eb9)
 * - [__View Contract on Op Sepolia Blockscout__](https://optimism-sepolia.blockscout.com/address/0xd453d38A001B47271488886532f1CCeAbf0c7eF3)
 * - [__View Contract on Degen Degen Chain Explorer__](https://explorer.degen.tips/address/0x210a01ad187003603B2287F78579ec103Eb70D9B)
 */
export const useGeneralDistributionAgreementV1PoolConnectionUpdatedEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: generalDistributionAgreementV1Abi,
    address: generalDistributionAgreementV1Address,
    eventName: 'PoolConnectionUpdated',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link generalDistributionAgreementV1Abi}__ and `eventName` set to `"PoolCreated"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0xAAdBB3Eee3Bd080f5353d86DdF1916aCA3fAC842)
 * - [__View Contract on Op Mainnet Optimism Explorer__](https://optimistic.etherscan.io/address/0x68Ae17fa7a31b86F306c383277552fd4813b0d35)
 * - [__View Contract on Bnb Smart Chain Bsc Scan__](https://bscscan.com/address/0x3bbFA4C406719424C7f66CD97A8Fe27Af383d3e2)
 * - [__View Contract on Gnosis Gnosisscan__](https://gnosisscan.io/address/0xd7992D358A20478c82dDEd98B3D8A9da46e99b82)
 * - [__View Contract on Polygon Polygon Scan__](https://polygonscan.com/address/0x961dd5A052741B49B6CBf6759591f9D8576fCFb0)
 * - [__View Contract on Base Basescan__](https://basescan.org/address/0xfE6c87BE05feDB2059d2EC41bA0A09826C9FD7aa)
 * - [__View Contract on Arbitrum One Arbiscan__](https://arbiscan.io/address/0x1e299701792a2aF01408B122419d65Fd2dF0Ba02)
 * - [__View Contract on Celo Celo Explorer__](https://celoscan.io/address/0x308b7405272d11494716e30C6E972DbF6fb89555)
 * - [__View Contract on Avalanche Fuji Snow Trace__](https://testnet.snowtrace.io/address/0x51f571D934C59185f13d17301a36c07A2268B814)
 * - [__View Contract on Avalanche Snow Trace__](https://snowtrace.io/address/0xA7b197cD5b0cEF6d62c4A0a851E3581f5E62e4D2)
 * - [__View Contract on Base Sepolia Basescan__](https://sepolia.basescan.org/address/0x53F4f44C813Dc380182d0b2b67fe5832A12B97f8)
 * - [__View Contract on Scroll Sepolia Scrollscan__](https://sepolia.scrollscan.com/address/0x93fA9B627eE016990Fe5e654F923aaE8a480a75b)
 * - [__View Contract on Scroll Scrollscan__](https://scrollscan.com/address/0x97a9f293d7eD13f3fbD499cE684Ed4F103295a28)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x9823364056BcA85Dc3c4a3b96801314D082C8Eb9)
 * - [__View Contract on Op Sepolia Blockscout__](https://optimism-sepolia.blockscout.com/address/0xd453d38A001B47271488886532f1CCeAbf0c7eF3)
 * - [__View Contract on Degen Degen Chain Explorer__](https://explorer.degen.tips/address/0x210a01ad187003603B2287F78579ec103Eb70D9B)
 */
export const useGeneralDistributionAgreementV1PoolCreatedEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: generalDistributionAgreementV1Abi,
    address: generalDistributionAgreementV1Address,
    eventName: 'PoolCreated',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link nativeAssetSuperTokenAbi}__
 */
export const useNativeAssetSuperTokenWrite =
  /*#__PURE__*/ createUseWriteContract({ abi: nativeAssetSuperTokenAbi })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link nativeAssetSuperTokenAbi}__ and `functionName` set to `"initializeProxy"`
 */
export const useNativeAssetSuperTokenInitializeProxy =
  /*#__PURE__*/ createUseWriteContract({
    abi: nativeAssetSuperTokenAbi,
    functionName: 'initializeProxy',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link nativeAssetSuperTokenAbi}__ and `functionName` set to `"upgradeByETH"`
 */
export const useNativeAssetSuperTokenUpgradeByEth =
  /*#__PURE__*/ createUseWriteContract({
    abi: nativeAssetSuperTokenAbi,
    functionName: 'upgradeByETH',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link nativeAssetSuperTokenAbi}__ and `functionName` set to `"upgradeByETHTo"`
 */
export const useNativeAssetSuperTokenUpgradeByEthTo =
  /*#__PURE__*/ createUseWriteContract({
    abi: nativeAssetSuperTokenAbi,
    functionName: 'upgradeByETHTo',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link nativeAssetSuperTokenAbi}__ and `functionName` set to `"downgradeToETH"`
 */
export const useNativeAssetSuperTokenDowngradeToEth =
  /*#__PURE__*/ createUseWriteContract({
    abi: nativeAssetSuperTokenAbi,
    functionName: 'downgradeToETH',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link nativeAssetSuperTokenAbi}__
 */
export const usePrepareNativeAssetSuperTokenWrite =
  /*#__PURE__*/ createUseSimulateContract({ abi: nativeAssetSuperTokenAbi })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link nativeAssetSuperTokenAbi}__ and `functionName` set to `"initializeProxy"`
 */
export const usePrepareNativeAssetSuperTokenInitializeProxy =
  /*#__PURE__*/ createUseSimulateContract({
    abi: nativeAssetSuperTokenAbi,
    functionName: 'initializeProxy',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link nativeAssetSuperTokenAbi}__ and `functionName` set to `"upgradeByETH"`
 */
export const usePrepareNativeAssetSuperTokenUpgradeByEth =
  /*#__PURE__*/ createUseSimulateContract({
    abi: nativeAssetSuperTokenAbi,
    functionName: 'upgradeByETH',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link nativeAssetSuperTokenAbi}__ and `functionName` set to `"upgradeByETHTo"`
 */
export const usePrepareNativeAssetSuperTokenUpgradeByEthTo =
  /*#__PURE__*/ createUseSimulateContract({
    abi: nativeAssetSuperTokenAbi,
    functionName: 'upgradeByETHTo',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link nativeAssetSuperTokenAbi}__ and `functionName` set to `"downgradeToETH"`
 */
export const usePrepareNativeAssetSuperTokenDowngradeToEth =
  /*#__PURE__*/ createUseSimulateContract({
    abi: nativeAssetSuperTokenAbi,
    functionName: 'downgradeToETH',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link nativeAssetSuperTokenAbi}__
 */
export const useNativeAssetSuperTokenEvent =
  /*#__PURE__*/ createUseWatchContractEvent({ abi: nativeAssetSuperTokenAbi })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link nativeAssetSuperTokenAbi}__ and `eventName` set to `"TokenDowngraded"`
 */
export const useNativeAssetSuperTokenTokenDowngradedEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: nativeAssetSuperTokenAbi,
    eventName: 'TokenDowngraded',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link nativeAssetSuperTokenAbi}__ and `eventName` set to `"TokenUpgraded"`
 */
export const useNativeAssetSuperTokenTokenUpgradedEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: nativeAssetSuperTokenAbi,
    eventName: 'TokenUpgraded',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link pureSuperTokenAbi}__
 */
export const usePureSuperTokenWrite = /*#__PURE__*/ createUseWriteContract({
  abi: pureSuperTokenAbi,
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link pureSuperTokenAbi}__ and `functionName` set to `"initializeProxy"`
 */
export const usePureSuperTokenInitializeProxy =
  /*#__PURE__*/ createUseWriteContract({
    abi: pureSuperTokenAbi,
    functionName: 'initializeProxy',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link pureSuperTokenAbi}__ and `functionName` set to `"initialize"`
 */
export const usePureSuperTokenInitialize = /*#__PURE__*/ createUseWriteContract(
  { abi: pureSuperTokenAbi, functionName: 'initialize' },
)

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link pureSuperTokenAbi}__
 */
export const usePreparePureSuperTokenWrite =
  /*#__PURE__*/ createUseSimulateContract({ abi: pureSuperTokenAbi })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link pureSuperTokenAbi}__ and `functionName` set to `"initializeProxy"`
 */
export const usePreparePureSuperTokenInitializeProxy =
  /*#__PURE__*/ createUseSimulateContract({
    abi: pureSuperTokenAbi,
    functionName: 'initializeProxy',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link pureSuperTokenAbi}__ and `functionName` set to `"initialize"`
 */
export const usePreparePureSuperTokenInitialize =
  /*#__PURE__*/ createUseSimulateContract({
    abi: pureSuperTokenAbi,
    functionName: 'initialize',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link superTokenAbi}__
 */
export const useSuperTokenRead = /*#__PURE__*/ createUseReadContract({
  abi: superTokenAbi,
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link superTokenAbi}__ and `functionName` set to `"CONSTANT_INFLOW_NFT"`
 */
export const useSuperTokenConstantInflowNft =
  /*#__PURE__*/ createUseReadContract({
    abi: superTokenAbi,
    functionName: 'CONSTANT_INFLOW_NFT',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link superTokenAbi}__ and `functionName` set to `"CONSTANT_OUTFLOW_NFT"`
 */
export const useSuperTokenConstantOutflowNft =
  /*#__PURE__*/ createUseReadContract({
    abi: superTokenAbi,
    functionName: 'CONSTANT_OUTFLOW_NFT',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link superTokenAbi}__ and `functionName` set to `"POOL_ADMIN_NFT"`
 */
export const useSuperTokenPoolAdminNft = /*#__PURE__*/ createUseReadContract({
  abi: superTokenAbi,
  functionName: 'POOL_ADMIN_NFT',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link superTokenAbi}__ and `functionName` set to `"POOL_MEMBER_NFT"`
 */
export const useSuperTokenPoolMemberNft = /*#__PURE__*/ createUseReadContract({
  abi: superTokenAbi,
  functionName: 'POOL_MEMBER_NFT',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link superTokenAbi}__ and `functionName` set to `"getAccountActiveAgreements"`
 */
export const useSuperTokenGetAccountActiveAgreements =
  /*#__PURE__*/ createUseReadContract({
    abi: superTokenAbi,
    functionName: 'getAccountActiveAgreements',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link superTokenAbi}__ and `functionName` set to `"getAgreementData"`
 */
export const useSuperTokenGetAgreementData =
  /*#__PURE__*/ createUseReadContract({
    abi: superTokenAbi,
    functionName: 'getAgreementData',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link superTokenAbi}__ and `functionName` set to `"getAgreementStateSlot"`
 */
export const useSuperTokenGetAgreementStateSlot =
  /*#__PURE__*/ createUseReadContract({
    abi: superTokenAbi,
    functionName: 'getAgreementStateSlot',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link superTokenAbi}__ and `functionName` set to `"getCodeAddress"`
 */
export const useSuperTokenGetCodeAddress = /*#__PURE__*/ createUseReadContract({
  abi: superTokenAbi,
  functionName: 'getCodeAddress',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link superTokenAbi}__ and `functionName` set to `"getHost"`
 */
export const useSuperTokenGetHost = /*#__PURE__*/ createUseReadContract({
  abi: superTokenAbi,
  functionName: 'getHost',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link superTokenAbi}__ and `functionName` set to `"isAccountCritical"`
 */
export const useSuperTokenIsAccountCritical =
  /*#__PURE__*/ createUseReadContract({
    abi: superTokenAbi,
    functionName: 'isAccountCritical',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link superTokenAbi}__ and `functionName` set to `"isAccountCriticalNow"`
 */
export const useSuperTokenIsAccountCriticalNow =
  /*#__PURE__*/ createUseReadContract({
    abi: superTokenAbi,
    functionName: 'isAccountCriticalNow',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link superTokenAbi}__ and `functionName` set to `"isAccountSolvent"`
 */
export const useSuperTokenIsAccountSolvent =
  /*#__PURE__*/ createUseReadContract({
    abi: superTokenAbi,
    functionName: 'isAccountSolvent',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link superTokenAbi}__ and `functionName` set to `"isAccountSolventNow"`
 */
export const useSuperTokenIsAccountSolventNow =
  /*#__PURE__*/ createUseReadContract({
    abi: superTokenAbi,
    functionName: 'isAccountSolventNow',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link superTokenAbi}__ and `functionName` set to `"realtimeBalanceOf"`
 */
export const useSuperTokenRealtimeBalanceOf =
  /*#__PURE__*/ createUseReadContract({
    abi: superTokenAbi,
    functionName: 'realtimeBalanceOf',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link superTokenAbi}__ and `functionName` set to `"realtimeBalanceOfNow"`
 */
export const useSuperTokenRealtimeBalanceOfNow =
  /*#__PURE__*/ createUseReadContract({
    abi: superTokenAbi,
    functionName: 'realtimeBalanceOfNow',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link superTokenAbi}__ and `functionName` set to `"proxiableUUID"`
 */
export const useSuperTokenProxiableUuid = /*#__PURE__*/ createUseReadContract({
  abi: superTokenAbi,
  functionName: 'proxiableUUID',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link superTokenAbi}__ and `functionName` set to `"getAdmin"`
 */
export const useSuperTokenGetAdmin = /*#__PURE__*/ createUseReadContract({
  abi: superTokenAbi,
  functionName: 'getAdmin',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link superTokenAbi}__ and `functionName` set to `"name"`
 */
export const useSuperTokenName = /*#__PURE__*/ createUseReadContract({
  abi: superTokenAbi,
  functionName: 'name',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link superTokenAbi}__ and `functionName` set to `"symbol"`
 */
export const useSuperTokenSymbol = /*#__PURE__*/ createUseReadContract({
  abi: superTokenAbi,
  functionName: 'symbol',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link superTokenAbi}__ and `functionName` set to `"decimals"`
 */
export const useSuperTokenDecimals = /*#__PURE__*/ createUseReadContract({
  abi: superTokenAbi,
  functionName: 'decimals',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link superTokenAbi}__ and `functionName` set to `"totalSupply"`
 */
export const useSuperTokenTotalSupply = /*#__PURE__*/ createUseReadContract({
  abi: superTokenAbi,
  functionName: 'totalSupply',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link superTokenAbi}__ and `functionName` set to `"balanceOf"`
 */
export const useSuperTokenBalanceOf = /*#__PURE__*/ createUseReadContract({
  abi: superTokenAbi,
  functionName: 'balanceOf',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link superTokenAbi}__ and `functionName` set to `"allowance"`
 */
export const useSuperTokenAllowance = /*#__PURE__*/ createUseReadContract({
  abi: superTokenAbi,
  functionName: 'allowance',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link superTokenAbi}__ and `functionName` set to `"granularity"`
 */
export const useSuperTokenGranularity = /*#__PURE__*/ createUseReadContract({
  abi: superTokenAbi,
  functionName: 'granularity',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link superTokenAbi}__ and `functionName` set to `"isOperatorFor"`
 */
export const useSuperTokenIsOperatorFor = /*#__PURE__*/ createUseReadContract({
  abi: superTokenAbi,
  functionName: 'isOperatorFor',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link superTokenAbi}__ and `functionName` set to `"defaultOperators"`
 */
export const useSuperTokenDefaultOperators =
  /*#__PURE__*/ createUseReadContract({
    abi: superTokenAbi,
    functionName: 'defaultOperators',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link superTokenAbi}__ and `functionName` set to `"getUnderlyingToken"`
 */
export const useSuperTokenGetUnderlyingToken =
  /*#__PURE__*/ createUseReadContract({
    abi: superTokenAbi,
    functionName: 'getUnderlyingToken',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link superTokenAbi}__ and `functionName` set to `"getUnderlyingDecimals"`
 */
export const useSuperTokenGetUnderlyingDecimals =
  /*#__PURE__*/ createUseReadContract({
    abi: superTokenAbi,
    functionName: 'getUnderlyingDecimals',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link superTokenAbi}__ and `functionName` set to `"toUnderlyingAmount"`
 */
export const useSuperTokenToUnderlyingAmount =
  /*#__PURE__*/ createUseReadContract({
    abi: superTokenAbi,
    functionName: 'toUnderlyingAmount',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link superTokenAbi}__
 */
export const useSuperTokenWrite = /*#__PURE__*/ createUseWriteContract({
  abi: superTokenAbi,
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link superTokenAbi}__ and `functionName` set to `"castrate"`
 */
export const useSuperTokenCastrate = /*#__PURE__*/ createUseWriteContract({
  abi: superTokenAbi,
  functionName: 'castrate',
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link superTokenAbi}__ and `functionName` set to `"createAgreement"`
 */
export const useSuperTokenCreateAgreement =
  /*#__PURE__*/ createUseWriteContract({
    abi: superTokenAbi,
    functionName: 'createAgreement',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link superTokenAbi}__ and `functionName` set to `"makeLiquidationPayoutsV2"`
 */
export const useSuperTokenMakeLiquidationPayoutsV2 =
  /*#__PURE__*/ createUseWriteContract({
    abi: superTokenAbi,
    functionName: 'makeLiquidationPayoutsV2',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link superTokenAbi}__ and `functionName` set to `"settleBalance"`
 */
export const useSuperTokenSettleBalance = /*#__PURE__*/ createUseWriteContract({
  abi: superTokenAbi,
  functionName: 'settleBalance',
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link superTokenAbi}__ and `functionName` set to `"terminateAgreement"`
 */
export const useSuperTokenTerminateAgreement =
  /*#__PURE__*/ createUseWriteContract({
    abi: superTokenAbi,
    functionName: 'terminateAgreement',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link superTokenAbi}__ and `functionName` set to `"updateAgreementData"`
 */
export const useSuperTokenUpdateAgreementData =
  /*#__PURE__*/ createUseWriteContract({
    abi: superTokenAbi,
    functionName: 'updateAgreementData',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link superTokenAbi}__ and `functionName` set to `"updateAgreementStateSlot"`
 */
export const useSuperTokenUpdateAgreementStateSlot =
  /*#__PURE__*/ createUseWriteContract({
    abi: superTokenAbi,
    functionName: 'updateAgreementStateSlot',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link superTokenAbi}__ and `functionName` set to `"initialize"`
 */
export const useSuperTokenInitialize = /*#__PURE__*/ createUseWriteContract({
  abi: superTokenAbi,
  functionName: 'initialize',
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link superTokenAbi}__ and `functionName` set to `"initializeWithAdmin"`
 */
export const useSuperTokenInitializeWithAdmin =
  /*#__PURE__*/ createUseWriteContract({
    abi: superTokenAbi,
    functionName: 'initializeWithAdmin',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link superTokenAbi}__ and `functionName` set to `"updateCode"`
 */
export const useSuperTokenUpdateCode = /*#__PURE__*/ createUseWriteContract({
  abi: superTokenAbi,
  functionName: 'updateCode',
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link superTokenAbi}__ and `functionName` set to `"changeAdmin"`
 */
export const useSuperTokenChangeAdmin = /*#__PURE__*/ createUseWriteContract({
  abi: superTokenAbi,
  functionName: 'changeAdmin',
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link superTokenAbi}__ and `functionName` set to `"transfer"`
 */
export const useSuperTokenTransfer = /*#__PURE__*/ createUseWriteContract({
  abi: superTokenAbi,
  functionName: 'transfer',
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link superTokenAbi}__ and `functionName` set to `"approve"`
 */
export const useSuperTokenApprove = /*#__PURE__*/ createUseWriteContract({
  abi: superTokenAbi,
  functionName: 'approve',
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link superTokenAbi}__ and `functionName` set to `"transferFrom"`
 */
export const useSuperTokenTransferFrom = /*#__PURE__*/ createUseWriteContract({
  abi: superTokenAbi,
  functionName: 'transferFrom',
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link superTokenAbi}__ and `functionName` set to `"increaseAllowance"`
 */
export const useSuperTokenIncreaseAllowance =
  /*#__PURE__*/ createUseWriteContract({
    abi: superTokenAbi,
    functionName: 'increaseAllowance',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link superTokenAbi}__ and `functionName` set to `"decreaseAllowance"`
 */
export const useSuperTokenDecreaseAllowance =
  /*#__PURE__*/ createUseWriteContract({
    abi: superTokenAbi,
    functionName: 'decreaseAllowance',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link superTokenAbi}__ and `functionName` set to `"send"`
 */
export const useSuperTokenSend = /*#__PURE__*/ createUseWriteContract({
  abi: superTokenAbi,
  functionName: 'send',
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link superTokenAbi}__ and `functionName` set to `"burn"`
 */
export const useSuperTokenBurn = /*#__PURE__*/ createUseWriteContract({
  abi: superTokenAbi,
  functionName: 'burn',
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link superTokenAbi}__ and `functionName` set to `"authorizeOperator"`
 */
export const useSuperTokenAuthorizeOperator =
  /*#__PURE__*/ createUseWriteContract({
    abi: superTokenAbi,
    functionName: 'authorizeOperator',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link superTokenAbi}__ and `functionName` set to `"revokeOperator"`
 */
export const useSuperTokenRevokeOperator = /*#__PURE__*/ createUseWriteContract(
  { abi: superTokenAbi, functionName: 'revokeOperator' },
)

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link superTokenAbi}__ and `functionName` set to `"operatorSend"`
 */
export const useSuperTokenOperatorSend = /*#__PURE__*/ createUseWriteContract({
  abi: superTokenAbi,
  functionName: 'operatorSend',
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link superTokenAbi}__ and `functionName` set to `"operatorBurn"`
 */
export const useSuperTokenOperatorBurn = /*#__PURE__*/ createUseWriteContract({
  abi: superTokenAbi,
  functionName: 'operatorBurn',
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link superTokenAbi}__ and `functionName` set to `"selfMint"`
 */
export const useSuperTokenSelfMint = /*#__PURE__*/ createUseWriteContract({
  abi: superTokenAbi,
  functionName: 'selfMint',
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link superTokenAbi}__ and `functionName` set to `"selfBurn"`
 */
export const useSuperTokenSelfBurn = /*#__PURE__*/ createUseWriteContract({
  abi: superTokenAbi,
  functionName: 'selfBurn',
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link superTokenAbi}__ and `functionName` set to `"selfApproveFor"`
 */
export const useSuperTokenSelfApproveFor = /*#__PURE__*/ createUseWriteContract(
  { abi: superTokenAbi, functionName: 'selfApproveFor' },
)

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link superTokenAbi}__ and `functionName` set to `"selfTransferFrom"`
 */
export const useSuperTokenSelfTransferFrom =
  /*#__PURE__*/ createUseWriteContract({
    abi: superTokenAbi,
    functionName: 'selfTransferFrom',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link superTokenAbi}__ and `functionName` set to `"transferAll"`
 */
export const useSuperTokenTransferAll = /*#__PURE__*/ createUseWriteContract({
  abi: superTokenAbi,
  functionName: 'transferAll',
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link superTokenAbi}__ and `functionName` set to `"upgrade"`
 */
export const useSuperTokenUpgrade = /*#__PURE__*/ createUseWriteContract({
  abi: superTokenAbi,
  functionName: 'upgrade',
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link superTokenAbi}__ and `functionName` set to `"upgradeTo"`
 */
export const useSuperTokenUpgradeTo = /*#__PURE__*/ createUseWriteContract({
  abi: superTokenAbi,
  functionName: 'upgradeTo',
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link superTokenAbi}__ and `functionName` set to `"downgrade"`
 */
export const useSuperTokenDowngrade = /*#__PURE__*/ createUseWriteContract({
  abi: superTokenAbi,
  functionName: 'downgrade',
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link superTokenAbi}__ and `functionName` set to `"downgradeTo"`
 */
export const useSuperTokenDowngradeTo = /*#__PURE__*/ createUseWriteContract({
  abi: superTokenAbi,
  functionName: 'downgradeTo',
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link superTokenAbi}__ and `functionName` set to `"operationApprove"`
 */
export const useSuperTokenOperationApprove =
  /*#__PURE__*/ createUseWriteContract({
    abi: superTokenAbi,
    functionName: 'operationApprove',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link superTokenAbi}__ and `functionName` set to `"operationIncreaseAllowance"`
 */
export const useSuperTokenOperationIncreaseAllowance =
  /*#__PURE__*/ createUseWriteContract({
    abi: superTokenAbi,
    functionName: 'operationIncreaseAllowance',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link superTokenAbi}__ and `functionName` set to `"operationDecreaseAllowance"`
 */
export const useSuperTokenOperationDecreaseAllowance =
  /*#__PURE__*/ createUseWriteContract({
    abi: superTokenAbi,
    functionName: 'operationDecreaseAllowance',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link superTokenAbi}__ and `functionName` set to `"operationTransferFrom"`
 */
export const useSuperTokenOperationTransferFrom =
  /*#__PURE__*/ createUseWriteContract({
    abi: superTokenAbi,
    functionName: 'operationTransferFrom',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link superTokenAbi}__ and `functionName` set to `"operationSend"`
 */
export const useSuperTokenOperationSend = /*#__PURE__*/ createUseWriteContract({
  abi: superTokenAbi,
  functionName: 'operationSend',
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link superTokenAbi}__ and `functionName` set to `"operationUpgrade"`
 */
export const useSuperTokenOperationUpgrade =
  /*#__PURE__*/ createUseWriteContract({
    abi: superTokenAbi,
    functionName: 'operationUpgrade',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link superTokenAbi}__ and `functionName` set to `"operationDowngrade"`
 */
export const useSuperTokenOperationDowngrade =
  /*#__PURE__*/ createUseWriteContract({
    abi: superTokenAbi,
    functionName: 'operationDowngrade',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link superTokenAbi}__ and `functionName` set to `"operationUpgradeTo"`
 */
export const useSuperTokenOperationUpgradeTo =
  /*#__PURE__*/ createUseWriteContract({
    abi: superTokenAbi,
    functionName: 'operationUpgradeTo',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link superTokenAbi}__ and `functionName` set to `"operationDowngradeTo"`
 */
export const useSuperTokenOperationDowngradeTo =
  /*#__PURE__*/ createUseWriteContract({
    abi: superTokenAbi,
    functionName: 'operationDowngradeTo',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link superTokenAbi}__
 */
export const usePrepareSuperTokenWrite =
  /*#__PURE__*/ createUseSimulateContract({ abi: superTokenAbi })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link superTokenAbi}__ and `functionName` set to `"castrate"`
 */
export const usePrepareSuperTokenCastrate =
  /*#__PURE__*/ createUseSimulateContract({
    abi: superTokenAbi,
    functionName: 'castrate',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link superTokenAbi}__ and `functionName` set to `"createAgreement"`
 */
export const usePrepareSuperTokenCreateAgreement =
  /*#__PURE__*/ createUseSimulateContract({
    abi: superTokenAbi,
    functionName: 'createAgreement',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link superTokenAbi}__ and `functionName` set to `"makeLiquidationPayoutsV2"`
 */
export const usePrepareSuperTokenMakeLiquidationPayoutsV2 =
  /*#__PURE__*/ createUseSimulateContract({
    abi: superTokenAbi,
    functionName: 'makeLiquidationPayoutsV2',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link superTokenAbi}__ and `functionName` set to `"settleBalance"`
 */
export const usePrepareSuperTokenSettleBalance =
  /*#__PURE__*/ createUseSimulateContract({
    abi: superTokenAbi,
    functionName: 'settleBalance',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link superTokenAbi}__ and `functionName` set to `"terminateAgreement"`
 */
export const usePrepareSuperTokenTerminateAgreement =
  /*#__PURE__*/ createUseSimulateContract({
    abi: superTokenAbi,
    functionName: 'terminateAgreement',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link superTokenAbi}__ and `functionName` set to `"updateAgreementData"`
 */
export const usePrepareSuperTokenUpdateAgreementData =
  /*#__PURE__*/ createUseSimulateContract({
    abi: superTokenAbi,
    functionName: 'updateAgreementData',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link superTokenAbi}__ and `functionName` set to `"updateAgreementStateSlot"`
 */
export const usePrepareSuperTokenUpdateAgreementStateSlot =
  /*#__PURE__*/ createUseSimulateContract({
    abi: superTokenAbi,
    functionName: 'updateAgreementStateSlot',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link superTokenAbi}__ and `functionName` set to `"initialize"`
 */
export const usePrepareSuperTokenInitialize =
  /*#__PURE__*/ createUseSimulateContract({
    abi: superTokenAbi,
    functionName: 'initialize',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link superTokenAbi}__ and `functionName` set to `"initializeWithAdmin"`
 */
export const usePrepareSuperTokenInitializeWithAdmin =
  /*#__PURE__*/ createUseSimulateContract({
    abi: superTokenAbi,
    functionName: 'initializeWithAdmin',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link superTokenAbi}__ and `functionName` set to `"updateCode"`
 */
export const usePrepareSuperTokenUpdateCode =
  /*#__PURE__*/ createUseSimulateContract({
    abi: superTokenAbi,
    functionName: 'updateCode',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link superTokenAbi}__ and `functionName` set to `"changeAdmin"`
 */
export const usePrepareSuperTokenChangeAdmin =
  /*#__PURE__*/ createUseSimulateContract({
    abi: superTokenAbi,
    functionName: 'changeAdmin',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link superTokenAbi}__ and `functionName` set to `"transfer"`
 */
export const usePrepareSuperTokenTransfer =
  /*#__PURE__*/ createUseSimulateContract({
    abi: superTokenAbi,
    functionName: 'transfer',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link superTokenAbi}__ and `functionName` set to `"approve"`
 */
export const usePrepareSuperTokenApprove =
  /*#__PURE__*/ createUseSimulateContract({
    abi: superTokenAbi,
    functionName: 'approve',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link superTokenAbi}__ and `functionName` set to `"transferFrom"`
 */
export const usePrepareSuperTokenTransferFrom =
  /*#__PURE__*/ createUseSimulateContract({
    abi: superTokenAbi,
    functionName: 'transferFrom',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link superTokenAbi}__ and `functionName` set to `"increaseAllowance"`
 */
export const usePrepareSuperTokenIncreaseAllowance =
  /*#__PURE__*/ createUseSimulateContract({
    abi: superTokenAbi,
    functionName: 'increaseAllowance',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link superTokenAbi}__ and `functionName` set to `"decreaseAllowance"`
 */
export const usePrepareSuperTokenDecreaseAllowance =
  /*#__PURE__*/ createUseSimulateContract({
    abi: superTokenAbi,
    functionName: 'decreaseAllowance',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link superTokenAbi}__ and `functionName` set to `"send"`
 */
export const usePrepareSuperTokenSend = /*#__PURE__*/ createUseSimulateContract(
  { abi: superTokenAbi, functionName: 'send' },
)

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link superTokenAbi}__ and `functionName` set to `"burn"`
 */
export const usePrepareSuperTokenBurn = /*#__PURE__*/ createUseSimulateContract(
  { abi: superTokenAbi, functionName: 'burn' },
)

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link superTokenAbi}__ and `functionName` set to `"authorizeOperator"`
 */
export const usePrepareSuperTokenAuthorizeOperator =
  /*#__PURE__*/ createUseSimulateContract({
    abi: superTokenAbi,
    functionName: 'authorizeOperator',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link superTokenAbi}__ and `functionName` set to `"revokeOperator"`
 */
export const usePrepareSuperTokenRevokeOperator =
  /*#__PURE__*/ createUseSimulateContract({
    abi: superTokenAbi,
    functionName: 'revokeOperator',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link superTokenAbi}__ and `functionName` set to `"operatorSend"`
 */
export const usePrepareSuperTokenOperatorSend =
  /*#__PURE__*/ createUseSimulateContract({
    abi: superTokenAbi,
    functionName: 'operatorSend',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link superTokenAbi}__ and `functionName` set to `"operatorBurn"`
 */
export const usePrepareSuperTokenOperatorBurn =
  /*#__PURE__*/ createUseSimulateContract({
    abi: superTokenAbi,
    functionName: 'operatorBurn',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link superTokenAbi}__ and `functionName` set to `"selfMint"`
 */
export const usePrepareSuperTokenSelfMint =
  /*#__PURE__*/ createUseSimulateContract({
    abi: superTokenAbi,
    functionName: 'selfMint',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link superTokenAbi}__ and `functionName` set to `"selfBurn"`
 */
export const usePrepareSuperTokenSelfBurn =
  /*#__PURE__*/ createUseSimulateContract({
    abi: superTokenAbi,
    functionName: 'selfBurn',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link superTokenAbi}__ and `functionName` set to `"selfApproveFor"`
 */
export const usePrepareSuperTokenSelfApproveFor =
  /*#__PURE__*/ createUseSimulateContract({
    abi: superTokenAbi,
    functionName: 'selfApproveFor',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link superTokenAbi}__ and `functionName` set to `"selfTransferFrom"`
 */
export const usePrepareSuperTokenSelfTransferFrom =
  /*#__PURE__*/ createUseSimulateContract({
    abi: superTokenAbi,
    functionName: 'selfTransferFrom',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link superTokenAbi}__ and `functionName` set to `"transferAll"`
 */
export const usePrepareSuperTokenTransferAll =
  /*#__PURE__*/ createUseSimulateContract({
    abi: superTokenAbi,
    functionName: 'transferAll',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link superTokenAbi}__ and `functionName` set to `"upgrade"`
 */
export const usePrepareSuperTokenUpgrade =
  /*#__PURE__*/ createUseSimulateContract({
    abi: superTokenAbi,
    functionName: 'upgrade',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link superTokenAbi}__ and `functionName` set to `"upgradeTo"`
 */
export const usePrepareSuperTokenUpgradeTo =
  /*#__PURE__*/ createUseSimulateContract({
    abi: superTokenAbi,
    functionName: 'upgradeTo',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link superTokenAbi}__ and `functionName` set to `"downgrade"`
 */
export const usePrepareSuperTokenDowngrade =
  /*#__PURE__*/ createUseSimulateContract({
    abi: superTokenAbi,
    functionName: 'downgrade',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link superTokenAbi}__ and `functionName` set to `"downgradeTo"`
 */
export const usePrepareSuperTokenDowngradeTo =
  /*#__PURE__*/ createUseSimulateContract({
    abi: superTokenAbi,
    functionName: 'downgradeTo',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link superTokenAbi}__ and `functionName` set to `"operationApprove"`
 */
export const usePrepareSuperTokenOperationApprove =
  /*#__PURE__*/ createUseSimulateContract({
    abi: superTokenAbi,
    functionName: 'operationApprove',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link superTokenAbi}__ and `functionName` set to `"operationIncreaseAllowance"`
 */
export const usePrepareSuperTokenOperationIncreaseAllowance =
  /*#__PURE__*/ createUseSimulateContract({
    abi: superTokenAbi,
    functionName: 'operationIncreaseAllowance',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link superTokenAbi}__ and `functionName` set to `"operationDecreaseAllowance"`
 */
export const usePrepareSuperTokenOperationDecreaseAllowance =
  /*#__PURE__*/ createUseSimulateContract({
    abi: superTokenAbi,
    functionName: 'operationDecreaseAllowance',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link superTokenAbi}__ and `functionName` set to `"operationTransferFrom"`
 */
export const usePrepareSuperTokenOperationTransferFrom =
  /*#__PURE__*/ createUseSimulateContract({
    abi: superTokenAbi,
    functionName: 'operationTransferFrom',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link superTokenAbi}__ and `functionName` set to `"operationSend"`
 */
export const usePrepareSuperTokenOperationSend =
  /*#__PURE__*/ createUseSimulateContract({
    abi: superTokenAbi,
    functionName: 'operationSend',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link superTokenAbi}__ and `functionName` set to `"operationUpgrade"`
 */
export const usePrepareSuperTokenOperationUpgrade =
  /*#__PURE__*/ createUseSimulateContract({
    abi: superTokenAbi,
    functionName: 'operationUpgrade',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link superTokenAbi}__ and `functionName` set to `"operationDowngrade"`
 */
export const usePrepareSuperTokenOperationDowngrade =
  /*#__PURE__*/ createUseSimulateContract({
    abi: superTokenAbi,
    functionName: 'operationDowngrade',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link superTokenAbi}__ and `functionName` set to `"operationUpgradeTo"`
 */
export const usePrepareSuperTokenOperationUpgradeTo =
  /*#__PURE__*/ createUseSimulateContract({
    abi: superTokenAbi,
    functionName: 'operationUpgradeTo',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link superTokenAbi}__ and `functionName` set to `"operationDowngradeTo"`
 */
export const usePrepareSuperTokenOperationDowngradeTo =
  /*#__PURE__*/ createUseSimulateContract({
    abi: superTokenAbi,
    functionName: 'operationDowngradeTo',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link superTokenAbi}__
 */
export const useSuperTokenEvent = /*#__PURE__*/ createUseWatchContractEvent({
  abi: superTokenAbi,
})

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link superTokenAbi}__ and `eventName` set to `"AdminChanged"`
 */
export const useSuperTokenAdminChangedEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: superTokenAbi,
    eventName: 'AdminChanged',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link superTokenAbi}__ and `eventName` set to `"AgreementCreated"`
 */
export const useSuperTokenAgreementCreatedEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: superTokenAbi,
    eventName: 'AgreementCreated',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link superTokenAbi}__ and `eventName` set to `"AgreementLiquidated"`
 */
export const useSuperTokenAgreementLiquidatedEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: superTokenAbi,
    eventName: 'AgreementLiquidated',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link superTokenAbi}__ and `eventName` set to `"AgreementLiquidatedBy"`
 */
export const useSuperTokenAgreementLiquidatedByEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: superTokenAbi,
    eventName: 'AgreementLiquidatedBy',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link superTokenAbi}__ and `eventName` set to `"AgreementLiquidatedV2"`
 */
export const useSuperTokenAgreementLiquidatedV2Event =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: superTokenAbi,
    eventName: 'AgreementLiquidatedV2',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link superTokenAbi}__ and `eventName` set to `"AgreementStateUpdated"`
 */
export const useSuperTokenAgreementStateUpdatedEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: superTokenAbi,
    eventName: 'AgreementStateUpdated',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link superTokenAbi}__ and `eventName` set to `"AgreementTerminated"`
 */
export const useSuperTokenAgreementTerminatedEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: superTokenAbi,
    eventName: 'AgreementTerminated',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link superTokenAbi}__ and `eventName` set to `"AgreementUpdated"`
 */
export const useSuperTokenAgreementUpdatedEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: superTokenAbi,
    eventName: 'AgreementUpdated',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link superTokenAbi}__ and `eventName` set to `"Approval"`
 */
export const useSuperTokenApprovalEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: superTokenAbi,
    eventName: 'Approval',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link superTokenAbi}__ and `eventName` set to `"AuthorizedOperator"`
 */
export const useSuperTokenAuthorizedOperatorEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: superTokenAbi,
    eventName: 'AuthorizedOperator',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link superTokenAbi}__ and `eventName` set to `"Bailout"`
 */
export const useSuperTokenBailoutEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: superTokenAbi,
    eventName: 'Bailout',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link superTokenAbi}__ and `eventName` set to `"Burned"`
 */
export const useSuperTokenBurnedEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: superTokenAbi,
    eventName: 'Burned',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link superTokenAbi}__ and `eventName` set to `"CodeUpdated"`
 */
export const useSuperTokenCodeUpdatedEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: superTokenAbi,
    eventName: 'CodeUpdated',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link superTokenAbi}__ and `eventName` set to `"Initialized"`
 */
export const useSuperTokenInitializedEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: superTokenAbi,
    eventName: 'Initialized',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link superTokenAbi}__ and `eventName` set to `"Minted"`
 */
export const useSuperTokenMintedEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: superTokenAbi,
    eventName: 'Minted',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link superTokenAbi}__ and `eventName` set to `"PoolAdminNFTCreated"`
 */
export const useSuperTokenPoolAdminNftCreatedEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: superTokenAbi,
    eventName: 'PoolAdminNFTCreated',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link superTokenAbi}__ and `eventName` set to `"PoolMemberNFTCreated"`
 */
export const useSuperTokenPoolMemberNftCreatedEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: superTokenAbi,
    eventName: 'PoolMemberNFTCreated',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link superTokenAbi}__ and `eventName` set to `"RevokedOperator"`
 */
export const useSuperTokenRevokedOperatorEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: superTokenAbi,
    eventName: 'RevokedOperator',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link superTokenAbi}__ and `eventName` set to `"Sent"`
 */
export const useSuperTokenSentEvent = /*#__PURE__*/ createUseWatchContractEvent(
  { abi: superTokenAbi, eventName: 'Sent' },
)

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link superTokenAbi}__ and `eventName` set to `"TokenDowngraded"`
 */
export const useSuperTokenTokenDowngradedEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: superTokenAbi,
    eventName: 'TokenDowngraded',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link superTokenAbi}__ and `eventName` set to `"TokenUpgraded"`
 */
export const useSuperTokenTokenUpgradedEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: superTokenAbi,
    eventName: 'TokenUpgraded',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link superTokenAbi}__ and `eventName` set to `"Transfer"`
 */
export const useSuperTokenTransferEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: superTokenAbi,
    eventName: 'Transfer',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link superfluidPoolAbi}__
 */
export const useSuperfluidPoolRead = /*#__PURE__*/ createUseReadContract({
  abi: superfluidPoolAbi,
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link superfluidPoolAbi}__ and `functionName` set to `"GDA"`
 */
export const useSuperfluidPoolGda = /*#__PURE__*/ createUseReadContract({
  abi: superfluidPoolAbi,
  functionName: 'GDA',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link superfluidPoolAbi}__ and `functionName` set to `"admin"`
 */
export const useSuperfluidPoolAdmin = /*#__PURE__*/ createUseReadContract({
  abi: superfluidPoolAbi,
  functionName: 'admin',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link superfluidPoolAbi}__ and `functionName` set to `"distributionFromAnyAddress"`
 */
export const useSuperfluidPoolDistributionFromAnyAddress =
  /*#__PURE__*/ createUseReadContract({
    abi: superfluidPoolAbi,
    functionName: 'distributionFromAnyAddress',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link superfluidPoolAbi}__ and `functionName` set to `"superToken"`
 */
export const useSuperfluidPoolSuperToken = /*#__PURE__*/ createUseReadContract({
  abi: superfluidPoolAbi,
  functionName: 'superToken',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link superfluidPoolAbi}__ and `functionName` set to `"transferabilityForUnitsOwner"`
 */
export const useSuperfluidPoolTransferabilityForUnitsOwner =
  /*#__PURE__*/ createUseReadContract({
    abi: superfluidPoolAbi,
    functionName: 'transferabilityForUnitsOwner',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link superfluidPoolAbi}__ and `functionName` set to `"proxiableUUID"`
 */
export const useSuperfluidPoolProxiableUuid =
  /*#__PURE__*/ createUseReadContract({
    abi: superfluidPoolAbi,
    functionName: 'proxiableUUID',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link superfluidPoolAbi}__ and `functionName` set to `"poolOperatorGetIndex"`
 */
export const useSuperfluidPoolPoolOperatorGetIndex =
  /*#__PURE__*/ createUseReadContract({
    abi: superfluidPoolAbi,
    functionName: 'poolOperatorGetIndex',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link superfluidPoolAbi}__ and `functionName` set to `"getTotalUnits"`
 */
export const useSuperfluidPoolGetTotalUnits =
  /*#__PURE__*/ createUseReadContract({
    abi: superfluidPoolAbi,
    functionName: 'getTotalUnits',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link superfluidPoolAbi}__ and `functionName` set to `"allowance"`
 */
export const useSuperfluidPoolAllowance = /*#__PURE__*/ createUseReadContract({
  abi: superfluidPoolAbi,
  functionName: 'allowance',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link superfluidPoolAbi}__ and `functionName` set to `"totalSupply"`
 */
export const useSuperfluidPoolTotalSupply = /*#__PURE__*/ createUseReadContract(
  { abi: superfluidPoolAbi, functionName: 'totalSupply' },
)

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link superfluidPoolAbi}__ and `functionName` set to `"getTotalConnectedUnits"`
 */
export const useSuperfluidPoolGetTotalConnectedUnits =
  /*#__PURE__*/ createUseReadContract({
    abi: superfluidPoolAbi,
    functionName: 'getTotalConnectedUnits',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link superfluidPoolAbi}__ and `functionName` set to `"getTotalDisconnectedUnits"`
 */
export const useSuperfluidPoolGetTotalDisconnectedUnits =
  /*#__PURE__*/ createUseReadContract({
    abi: superfluidPoolAbi,
    functionName: 'getTotalDisconnectedUnits',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link superfluidPoolAbi}__ and `functionName` set to `"getUnits"`
 */
export const useSuperfluidPoolGetUnits = /*#__PURE__*/ createUseReadContract({
  abi: superfluidPoolAbi,
  functionName: 'getUnits',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link superfluidPoolAbi}__ and `functionName` set to `"balanceOf"`
 */
export const useSuperfluidPoolBalanceOf = /*#__PURE__*/ createUseReadContract({
  abi: superfluidPoolAbi,
  functionName: 'balanceOf',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link superfluidPoolAbi}__ and `functionName` set to `"getTotalFlowRate"`
 */
export const useSuperfluidPoolGetTotalFlowRate =
  /*#__PURE__*/ createUseReadContract({
    abi: superfluidPoolAbi,
    functionName: 'getTotalFlowRate',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link superfluidPoolAbi}__ and `functionName` set to `"getTotalConnectedFlowRate"`
 */
export const useSuperfluidPoolGetTotalConnectedFlowRate =
  /*#__PURE__*/ createUseReadContract({
    abi: superfluidPoolAbi,
    functionName: 'getTotalConnectedFlowRate',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link superfluidPoolAbi}__ and `functionName` set to `"getTotalDisconnectedFlowRate"`
 */
export const useSuperfluidPoolGetTotalDisconnectedFlowRate =
  /*#__PURE__*/ createUseReadContract({
    abi: superfluidPoolAbi,
    functionName: 'getTotalDisconnectedFlowRate',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link superfluidPoolAbi}__ and `functionName` set to `"getDisconnectedBalance"`
 */
export const useSuperfluidPoolGetDisconnectedBalance =
  /*#__PURE__*/ createUseReadContract({
    abi: superfluidPoolAbi,
    functionName: 'getDisconnectedBalance',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link superfluidPoolAbi}__ and `functionName` set to `"getTotalAmountReceivedByMember"`
 */
export const useSuperfluidPoolGetTotalAmountReceivedByMember =
  /*#__PURE__*/ createUseReadContract({
    abi: superfluidPoolAbi,
    functionName: 'getTotalAmountReceivedByMember',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link superfluidPoolAbi}__ and `functionName` set to `"getMemberFlowRate"`
 */
export const useSuperfluidPoolGetMemberFlowRate =
  /*#__PURE__*/ createUseReadContract({
    abi: superfluidPoolAbi,
    functionName: 'getMemberFlowRate',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link superfluidPoolAbi}__ and `functionName` set to `"getClaimableNow"`
 */
export const useSuperfluidPoolGetClaimableNow =
  /*#__PURE__*/ createUseReadContract({
    abi: superfluidPoolAbi,
    functionName: 'getClaimableNow',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link superfluidPoolAbi}__ and `functionName` set to `"getClaimable"`
 */
export const useSuperfluidPoolGetClaimable =
  /*#__PURE__*/ createUseReadContract({
    abi: superfluidPoolAbi,
    functionName: 'getClaimable',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link superfluidPoolAbi}__
 */
export const useSuperfluidPoolWrite = /*#__PURE__*/ createUseWriteContract({
  abi: superfluidPoolAbi,
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link superfluidPoolAbi}__ and `functionName` set to `"castrate"`
 */
export const useSuperfluidPoolCastrate = /*#__PURE__*/ createUseWriteContract({
  abi: superfluidPoolAbi,
  functionName: 'castrate',
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link superfluidPoolAbi}__ and `functionName` set to `"initialize"`
 */
export const useSuperfluidPoolInitialize = /*#__PURE__*/ createUseWriteContract(
  { abi: superfluidPoolAbi, functionName: 'initialize' },
)

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link superfluidPoolAbi}__ and `functionName` set to `"approve"`
 */
export const useSuperfluidPoolApprove = /*#__PURE__*/ createUseWriteContract({
  abi: superfluidPoolAbi,
  functionName: 'approve',
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link superfluidPoolAbi}__ and `functionName` set to `"increaseAllowance"`
 */
export const useSuperfluidPoolIncreaseAllowance =
  /*#__PURE__*/ createUseWriteContract({
    abi: superfluidPoolAbi,
    functionName: 'increaseAllowance',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link superfluidPoolAbi}__ and `functionName` set to `"decreaseAllowance"`
 */
export const useSuperfluidPoolDecreaseAllowance =
  /*#__PURE__*/ createUseWriteContract({
    abi: superfluidPoolAbi,
    functionName: 'decreaseAllowance',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link superfluidPoolAbi}__ and `functionName` set to `"transfer"`
 */
export const useSuperfluidPoolTransfer = /*#__PURE__*/ createUseWriteContract({
  abi: superfluidPoolAbi,
  functionName: 'transfer',
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link superfluidPoolAbi}__ and `functionName` set to `"transferFrom"`
 */
export const useSuperfluidPoolTransferFrom =
  /*#__PURE__*/ createUseWriteContract({
    abi: superfluidPoolAbi,
    functionName: 'transferFrom',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link superfluidPoolAbi}__ and `functionName` set to `"updateMemberUnits"`
 */
export const useSuperfluidPoolUpdateMemberUnits =
  /*#__PURE__*/ createUseWriteContract({
    abi: superfluidPoolAbi,
    functionName: 'updateMemberUnits',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link superfluidPoolAbi}__ and `functionName` set to `"claimAll"`
 */
export const useSuperfluidPoolClaimAll = /*#__PURE__*/ createUseWriteContract({
  abi: superfluidPoolAbi,
  functionName: 'claimAll',
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link superfluidPoolAbi}__ and `functionName` set to `"operatorSetIndex"`
 */
export const useSuperfluidPoolOperatorSetIndex =
  /*#__PURE__*/ createUseWriteContract({
    abi: superfluidPoolAbi,
    functionName: 'operatorSetIndex',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link superfluidPoolAbi}__ and `functionName` set to `"operatorConnectMember"`
 */
export const useSuperfluidPoolOperatorConnectMember =
  /*#__PURE__*/ createUseWriteContract({
    abi: superfluidPoolAbi,
    functionName: 'operatorConnectMember',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link superfluidPoolAbi}__
 */
export const usePrepareSuperfluidPoolWrite =
  /*#__PURE__*/ createUseSimulateContract({ abi: superfluidPoolAbi })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link superfluidPoolAbi}__ and `functionName` set to `"castrate"`
 */
export const usePrepareSuperfluidPoolCastrate =
  /*#__PURE__*/ createUseSimulateContract({
    abi: superfluidPoolAbi,
    functionName: 'castrate',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link superfluidPoolAbi}__ and `functionName` set to `"initialize"`
 */
export const usePrepareSuperfluidPoolInitialize =
  /*#__PURE__*/ createUseSimulateContract({
    abi: superfluidPoolAbi,
    functionName: 'initialize',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link superfluidPoolAbi}__ and `functionName` set to `"approve"`
 */
export const usePrepareSuperfluidPoolApprove =
  /*#__PURE__*/ createUseSimulateContract({
    abi: superfluidPoolAbi,
    functionName: 'approve',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link superfluidPoolAbi}__ and `functionName` set to `"increaseAllowance"`
 */
export const usePrepareSuperfluidPoolIncreaseAllowance =
  /*#__PURE__*/ createUseSimulateContract({
    abi: superfluidPoolAbi,
    functionName: 'increaseAllowance',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link superfluidPoolAbi}__ and `functionName` set to `"decreaseAllowance"`
 */
export const usePrepareSuperfluidPoolDecreaseAllowance =
  /*#__PURE__*/ createUseSimulateContract({
    abi: superfluidPoolAbi,
    functionName: 'decreaseAllowance',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link superfluidPoolAbi}__ and `functionName` set to `"transfer"`
 */
export const usePrepareSuperfluidPoolTransfer =
  /*#__PURE__*/ createUseSimulateContract({
    abi: superfluidPoolAbi,
    functionName: 'transfer',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link superfluidPoolAbi}__ and `functionName` set to `"transferFrom"`
 */
export const usePrepareSuperfluidPoolTransferFrom =
  /*#__PURE__*/ createUseSimulateContract({
    abi: superfluidPoolAbi,
    functionName: 'transferFrom',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link superfluidPoolAbi}__ and `functionName` set to `"updateMemberUnits"`
 */
export const usePrepareSuperfluidPoolUpdateMemberUnits =
  /*#__PURE__*/ createUseSimulateContract({
    abi: superfluidPoolAbi,
    functionName: 'updateMemberUnits',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link superfluidPoolAbi}__ and `functionName` set to `"claimAll"`
 */
export const usePrepareSuperfluidPoolClaimAll =
  /*#__PURE__*/ createUseSimulateContract({
    abi: superfluidPoolAbi,
    functionName: 'claimAll',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link superfluidPoolAbi}__ and `functionName` set to `"operatorSetIndex"`
 */
export const usePrepareSuperfluidPoolOperatorSetIndex =
  /*#__PURE__*/ createUseSimulateContract({
    abi: superfluidPoolAbi,
    functionName: 'operatorSetIndex',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link superfluidPoolAbi}__ and `functionName` set to `"operatorConnectMember"`
 */
export const usePrepareSuperfluidPoolOperatorConnectMember =
  /*#__PURE__*/ createUseSimulateContract({
    abi: superfluidPoolAbi,
    functionName: 'operatorConnectMember',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link superfluidPoolAbi}__
 */
export const useSuperfluidPoolEvent = /*#__PURE__*/ createUseWatchContractEvent(
  { abi: superfluidPoolAbi },
)

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link superfluidPoolAbi}__ and `eventName` set to `"Approval"`
 */
export const useSuperfluidPoolApprovalEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: superfluidPoolAbi,
    eventName: 'Approval',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link superfluidPoolAbi}__ and `eventName` set to `"DistributionClaimed"`
 */
export const useSuperfluidPoolDistributionClaimedEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: superfluidPoolAbi,
    eventName: 'DistributionClaimed',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link superfluidPoolAbi}__ and `eventName` set to `"Initialized"`
 */
export const useSuperfluidPoolInitializedEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: superfluidPoolAbi,
    eventName: 'Initialized',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link superfluidPoolAbi}__ and `eventName` set to `"MemberUnitsUpdated"`
 */
export const useSuperfluidPoolMemberUnitsUpdatedEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: superfluidPoolAbi,
    eventName: 'MemberUnitsUpdated',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link superfluidPoolAbi}__ and `eventName` set to `"Transfer"`
 */
export const useSuperfluidPoolTransferEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: superfluidPoolAbi,
    eventName: 'Transfer',
  })
