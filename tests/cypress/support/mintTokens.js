const { ethers } = require('ethers');
const filteredTokensSuperFluid = require('@superfluid-finance/tokenlist');

const underlyingTestTokenABI = [
  {
    inputs: [
      {
        internalType: 'string',
        name: 'name',
        type: 'string',
      },
      { internalType: 'string', name: 'symbol', type: 'string' },
    ],
    stateMutability: 'nonpayable',
    type: 'constructor',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'address',
        name: 'owner',
        type: 'address',
      },
      {
        indexed: true,
        internalType: 'address',
        name: 'spender',
        type: 'address',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'value',
        type: 'uint256',
      },
    ],
    name: 'Approval',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: 'address', name: 'from', type: 'address' },
      {
        indexed: true,
        internalType: 'address',
        name: 'to',
        type: 'address',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'value',
        type: 'uint256',
      },
    ],
    name: 'Transfer',
    type: 'event',
  },
  {
    inputs: [
      { internalType: 'address', name: 'owner', type: 'address' },
      {
        internalType: 'address',
        name: 'spender',
        type: 'address',
      },
    ],
    name: 'allowance',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'address', name: 'spender', type: 'address' },
      {
        internalType: 'uint256',
        name: 'amount',
        type: 'uint256',
      },
    ],
    name: 'approve',
    outputs: [{ internalType: 'bool', name: '', type: 'bool' }],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'address', name: 'account', type: 'address' }],
    name: 'balanceOf',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'decimals',
    outputs: [{ internalType: 'uint8', name: '', type: 'uint8' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'address', name: 'spender', type: 'address' },
      {
        internalType: 'uint256',
        name: 'subtractedValue',
        type: 'uint256',
      },
    ],
    name: 'decreaseAllowance',
    outputs: [{ internalType: 'bool', name: '', type: 'bool' }],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'address', name: 'spender', type: 'address' },
      {
        internalType: 'uint256',
        name: 'addedValue',
        type: 'uint256',
      },
    ],
    name: 'increaseAllowance',
    outputs: [{ internalType: 'bool', name: '', type: 'bool' }],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'address', name: 'account', type: 'address' },
      {
        internalType: 'uint256',
        name: 'amount',
        type: 'uint256',
      },
    ],
    name: 'mint',
    outputs: [{ internalType: 'bool', name: '', type: 'bool' }],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [],
    name: 'name',
    outputs: [{ internalType: 'string', name: '', type: 'string' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'symbol',
    outputs: [{ internalType: 'string', name: '', type: 'string' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'totalSupply',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'address', name: 'recipient', type: 'address' },
      {
        internalType: 'uint256',
        name: 'amount',
        type: 'uint256',
      },
    ],
    name: 'transfer',
    outputs: [{ internalType: 'bool', name: '', type: 'bool' }],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'address', name: 'sender', type: 'address' },
      {
        internalType: 'address',
        name: 'recipient',
        type: 'address',
      },
      { internalType: 'uint256', name: 'amount', type: 'uint256' },
    ],
    name: 'transferFrom',
    outputs: [{ internalType: 'bool', name: '', type: 'bool' }],
    stateMutability: 'nonpayable',
    type: 'function',
  },
];
const superTestTokenABI = [
  {
    inputs: [
      { internalType: 'contract ISuperfluid', name: 'host', type: 'address' },
      {
        internalType: 'contract IConstantOutflowNFT',
        name: 'constantOutflowNFT',
        type: 'address',
      },
      {
        internalType: 'contract IConstantInflowNFT',
        name: 'constantInflowNFT',
        type: 'address',
      },
      {
        internalType: 'contract IPoolAdminNFT',
        name: 'poolAdminNFT',
        type: 'address',
      },
      {
        internalType: 'contract IPoolMemberNFT',
        name: 'poolMemberNFT',
        type: 'address',
      },
    ],
    stateMutability: 'nonpayable',
    type: 'constructor',
  },
  { inputs: [], name: 'SF_TOKEN_AGREEMENT_ALREADY_EXISTS', type: 'error' },
  { inputs: [], name: 'SF_TOKEN_AGREEMENT_DOES_NOT_EXIST', type: 'error' },
  { inputs: [], name: 'SF_TOKEN_BURN_INSUFFICIENT_BALANCE', type: 'error' },
  { inputs: [], name: 'SF_TOKEN_MOVE_INSUFFICIENT_BALANCE', type: 'error' },
  { inputs: [], name: 'SF_TOKEN_ONLY_HOST', type: 'error' },
  { inputs: [], name: 'SF_TOKEN_ONLY_LISTED_AGREEMENT', type: 'error' },
  { inputs: [], name: 'SUPER_TOKEN_APPROVE_FROM_ZERO_ADDRESS', type: 'error' },
  { inputs: [], name: 'SUPER_TOKEN_APPROVE_TO_ZERO_ADDRESS', type: 'error' },
  { inputs: [], name: 'SUPER_TOKEN_BURN_FROM_ZERO_ADDRESS', type: 'error' },
  {
    inputs: [],
    name: 'SUPER_TOKEN_CALLER_IS_NOT_OPERATOR_FOR_HOLDER',
    type: 'error',
  },
  {
    inputs: [],
    name: 'SUPER_TOKEN_INFLATIONARY_DEFLATIONARY_NOT_SUPPORTED',
    type: 'error',
  },
  { inputs: [], name: 'SUPER_TOKEN_MINT_TO_ZERO_ADDRESS', type: 'error' },
  { inputs: [], name: 'SUPER_TOKEN_NFT_PROXY_ADDRESS_CHANGED', type: 'error' },
  {
    inputs: [],
    name: 'SUPER_TOKEN_NOT_ERC777_TOKENS_RECIPIENT',
    type: 'error',
  },
  { inputs: [], name: 'SUPER_TOKEN_NO_UNDERLYING_TOKEN', type: 'error' },
  { inputs: [], name: 'SUPER_TOKEN_ONLY_GOV_OWNER', type: 'error' },
  { inputs: [], name: 'SUPER_TOKEN_ONLY_HOST', type: 'error' },
  { inputs: [], name: 'SUPER_TOKEN_ONLY_SELF', type: 'error' },
  { inputs: [], name: 'SUPER_TOKEN_TRANSFER_FROM_ZERO_ADDRESS', type: 'error' },
  { inputs: [], name: 'SUPER_TOKEN_TRANSFER_TO_ZERO_ADDRESS', type: 'error' },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'address',
        name: 'agreementClass',
        type: 'address',
      },
      { indexed: false, internalType: 'bytes32', name: 'id', type: 'bytes32' },
      {
        indexed: false,
        internalType: 'bytes32[]',
        name: 'data',
        type: 'bytes32[]',
      },
    ],
    name: 'AgreementCreated',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'address',
        name: 'agreementClass',
        type: 'address',
      },
      { indexed: false, internalType: 'bytes32', name: 'id', type: 'bytes32' },
      {
        indexed: true,
        internalType: 'address',
        name: 'penaltyAccount',
        type: 'address',
      },
      {
        indexed: true,
        internalType: 'address',
        name: 'rewardAccount',
        type: 'address',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'rewardAmount',
        type: 'uint256',
      },
    ],
    name: 'AgreementLiquidated',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: 'address',
        name: 'liquidatorAccount',
        type: 'address',
      },
      {
        indexed: true,
        internalType: 'address',
        name: 'agreementClass',
        type: 'address',
      },
      { indexed: false, internalType: 'bytes32', name: 'id', type: 'bytes32' },
      {
        indexed: true,
        internalType: 'address',
        name: 'penaltyAccount',
        type: 'address',
      },
      {
        indexed: true,
        internalType: 'address',
        name: 'bondAccount',
        type: 'address',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'rewardAmount',
        type: 'uint256',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'bailoutAmount',
        type: 'uint256',
      },
    ],
    name: 'AgreementLiquidatedBy',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'address',
        name: 'agreementClass',
        type: 'address',
      },
      { indexed: false, internalType: 'bytes32', name: 'id', type: 'bytes32' },
      {
        indexed: true,
        internalType: 'address',
        name: 'liquidatorAccount',
        type: 'address',
      },
      {
        indexed: true,
        internalType: 'address',
        name: 'targetAccount',
        type: 'address',
      },
      {
        indexed: false,
        internalType: 'address',
        name: 'rewardAmountReceiver',
        type: 'address',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'rewardAmount',
        type: 'uint256',
      },
      {
        indexed: false,
        internalType: 'int256',
        name: 'targetAccountBalanceDelta',
        type: 'int256',
      },
      {
        indexed: false,
        internalType: 'bytes',
        name: 'liquidationTypeData',
        type: 'bytes',
      },
    ],
    name: 'AgreementLiquidatedV2',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'address',
        name: 'agreementClass',
        type: 'address',
      },
      {
        indexed: true,
        internalType: 'address',
        name: 'account',
        type: 'address',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'slotId',
        type: 'uint256',
      },
    ],
    name: 'AgreementStateUpdated',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'address',
        name: 'agreementClass',
        type: 'address',
      },
      { indexed: false, internalType: 'bytes32', name: 'id', type: 'bytes32' },
    ],
    name: 'AgreementTerminated',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'address',
        name: 'agreementClass',
        type: 'address',
      },
      { indexed: false, internalType: 'bytes32', name: 'id', type: 'bytes32' },
      {
        indexed: false,
        internalType: 'bytes32[]',
        name: 'data',
        type: 'bytes32[]',
      },
    ],
    name: 'AgreementUpdated',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'address',
        name: 'owner',
        type: 'address',
      },
      {
        indexed: true,
        internalType: 'address',
        name: 'spender',
        type: 'address',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'value',
        type: 'uint256',
      },
    ],
    name: 'Approval',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'address',
        name: 'operator',
        type: 'address',
      },
      {
        indexed: true,
        internalType: 'address',
        name: 'tokenHolder',
        type: 'address',
      },
    ],
    name: 'AuthorizedOperator',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'address',
        name: 'bailoutAccount',
        type: 'address',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'bailoutAmount',
        type: 'uint256',
      },
    ],
    name: 'Bailout',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'address',
        name: 'operator',
        type: 'address',
      },
      { indexed: true, internalType: 'address', name: 'from', type: 'address' },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'amount',
        type: 'uint256',
      },
      { indexed: false, internalType: 'bytes', name: 'data', type: 'bytes' },
      {
        indexed: false,
        internalType: 'bytes',
        name: 'operatorData',
        type: 'bytes',
      },
    ],
    name: 'Burned',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: 'bytes32',
        name: 'uuid',
        type: 'bytes32',
      },
      {
        indexed: false,
        internalType: 'address',
        name: 'codeAddress',
        type: 'address',
      },
    ],
    name: 'CodeUpdated',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'contract IConstantInflowNFT',
        name: 'constantInflowNFT',
        type: 'address',
      },
    ],
    name: 'ConstantInflowNFTCreated',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'contract IConstantOutflowNFT',
        name: 'constantOutflowNFT',
        type: 'address',
      },
    ],
    name: 'ConstantOutflowNFTCreated',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      { indexed: false, internalType: 'uint8', name: 'version', type: 'uint8' },
    ],
    name: 'Initialized',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'address',
        name: 'operator',
        type: 'address',
      },
      { indexed: true, internalType: 'address', name: 'to', type: 'address' },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'amount',
        type: 'uint256',
      },
      { indexed: false, internalType: 'bytes', name: 'data', type: 'bytes' },
      {
        indexed: false,
        internalType: 'bytes',
        name: 'operatorData',
        type: 'bytes',
      },
    ],
    name: 'Minted',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'contract IPoolAdminNFT',
        name: 'poolAdminNFT',
        type: 'address',
      },
    ],
    name: 'PoolAdminNFTCreated',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'contract IPoolMemberNFT',
        name: 'poolMemberNFT',
        type: 'address',
      },
    ],
    name: 'PoolMemberNFTCreated',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'address',
        name: 'operator',
        type: 'address',
      },
      {
        indexed: true,
        internalType: 'address',
        name: 'tokenHolder',
        type: 'address',
      },
    ],
    name: 'RevokedOperator',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'address',
        name: 'operator',
        type: 'address',
      },
      { indexed: true, internalType: 'address', name: 'from', type: 'address' },
      { indexed: true, internalType: 'address', name: 'to', type: 'address' },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'amount',
        type: 'uint256',
      },
      { indexed: false, internalType: 'bytes', name: 'data', type: 'bytes' },
      {
        indexed: false,
        internalType: 'bytes',
        name: 'operatorData',
        type: 'bytes',
      },
    ],
    name: 'Sent',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'address',
        name: 'account',
        type: 'address',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'amount',
        type: 'uint256',
      },
    ],
    name: 'TokenDowngraded',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'address',
        name: 'account',
        type: 'address',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'amount',
        type: 'uint256',
      },
    ],
    name: 'TokenUpgraded',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: 'address', name: 'from', type: 'address' },
      { indexed: true, internalType: 'address', name: 'to', type: 'address' },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'value',
        type: 'uint256',
      },
    ],
    name: 'Transfer',
    type: 'event',
  },
  {
    inputs: [],
    name: 'CONSTANT_INFLOW_NFT',
    outputs: [
      {
        internalType: 'contract IConstantInflowNFT',
        name: '',
        type: 'address',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'CONSTANT_OUTFLOW_NFT',
    outputs: [
      {
        internalType: 'contract IConstantOutflowNFT',
        name: '',
        type: 'address',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'POOL_ADMIN_NFT',
    outputs: [
      { internalType: 'contract IPoolAdminNFT', name: '', type: 'address' },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'POOL_MEMBER_NFT',
    outputs: [
      { internalType: 'contract IPoolMemberNFT', name: '', type: 'address' },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'address', name: 'account', type: 'address' },
      { internalType: 'address', name: 'spender', type: 'address' },
    ],
    name: 'allowance',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'address', name: 'spender', type: 'address' },
      { internalType: 'uint256', name: 'amount', type: 'uint256' },
    ],
    name: 'approve',
    outputs: [{ internalType: 'bool', name: '', type: 'bool' }],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'address', name: 'operator', type: 'address' }],
    name: 'authorizeOperator',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'address', name: 'account', type: 'address' }],
    name: 'balanceOf',
    outputs: [{ internalType: 'uint256', name: 'balance', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'uint256', name: 'amount', type: 'uint256' },
      { internalType: 'bytes', name: 'data', type: 'bytes' },
    ],
    name: 'burn',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [],
    name: 'castrate',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'bytes32', name: 'id', type: 'bytes32' },
      { internalType: 'bytes32[]', name: 'data', type: 'bytes32[]' },
    ],
    name: 'createAgreement',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [],
    name: 'decimals',
    outputs: [{ internalType: 'uint8', name: '', type: 'uint8' }],
    stateMutability: 'pure',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'address', name: 'spender', type: 'address' },
      { internalType: 'uint256', name: 'subtractedValue', type: 'uint256' },
    ],
    name: 'decreaseAllowance',
    outputs: [{ internalType: 'bool', name: '', type: 'bool' }],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [],
    name: 'defaultOperators',
    outputs: [{ internalType: 'address[]', name: '', type: 'address[]' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'uint256', name: 'amount', type: 'uint256' }],
    name: 'downgrade',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'address', name: 'to', type: 'address' },
      { internalType: 'uint256', name: 'amount', type: 'uint256' },
    ],
    name: 'downgradeTo',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'address', name: 'account', type: 'address' }],
    name: 'getAccountActiveAgreements',
    outputs: [
      {
        internalType: 'contract ISuperAgreement[]',
        name: '',
        type: 'address[]',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'address', name: 'agreementClass', type: 'address' },
      { internalType: 'bytes32', name: 'id', type: 'bytes32' },
      { internalType: 'uint256', name: 'dataLength', type: 'uint256' },
    ],
    name: 'getAgreementData',
    outputs: [{ internalType: 'bytes32[]', name: 'data', type: 'bytes32[]' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'address', name: 'agreementClass', type: 'address' },
      { internalType: 'address', name: 'account', type: 'address' },
      { internalType: 'uint256', name: 'slotId', type: 'uint256' },
      { internalType: 'uint256', name: 'dataLength', type: 'uint256' },
    ],
    name: 'getAgreementStateSlot',
    outputs: [
      { internalType: 'bytes32[]', name: 'slotData', type: 'bytes32[]' },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'getCodeAddress',
    outputs: [
      { internalType: 'address', name: 'codeAddress', type: 'address' },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'getHost',
    outputs: [{ internalType: 'address', name: 'host', type: 'address' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'getUnderlyingToken',
    outputs: [{ internalType: 'address', name: '', type: 'address' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'granularity',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'pure',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'address', name: 'spender', type: 'address' },
      { internalType: 'uint256', name: 'addedValue', type: 'uint256' },
    ],
    name: 'increaseAllowance',
    outputs: [{ internalType: 'bool', name: '', type: 'bool' }],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'contract IERC20',
        name: 'underlyingToken',
        type: 'address',
      },
      { internalType: 'uint8', name: 'underlyingDecimals', type: 'uint8' },
      { internalType: 'string', name: 'n', type: 'string' },
      { internalType: 'string', name: 's', type: 'string' },
    ],
    name: 'initialize',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'address', name: 'account', type: 'address' },
      { internalType: 'uint256', name: 'timestamp', type: 'uint256' },
    ],
    name: 'isAccountCritical',
    outputs: [{ internalType: 'bool', name: 'isCritical', type: 'bool' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'address', name: 'account', type: 'address' }],
    name: 'isAccountCriticalNow',
    outputs: [{ internalType: 'bool', name: 'isCritical', type: 'bool' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'address', name: 'account', type: 'address' },
      { internalType: 'uint256', name: 'timestamp', type: 'uint256' },
    ],
    name: 'isAccountSolvent',
    outputs: [{ internalType: 'bool', name: 'isSolvent', type: 'bool' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'address', name: 'account', type: 'address' }],
    name: 'isAccountSolventNow',
    outputs: [{ internalType: 'bool', name: 'isSolvent', type: 'bool' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'address', name: 'operator', type: 'address' },
      { internalType: 'address', name: 'tokenHolder', type: 'address' },
    ],
    name: 'isOperatorFor',
    outputs: [{ internalType: 'bool', name: '', type: 'bool' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'bytes32', name: 'id', type: 'bytes32' },
      { internalType: 'bytes', name: 'liquidationTypeData', type: 'bytes' },
      { internalType: 'address', name: 'liquidatorAccount', type: 'address' },
      { internalType: 'bool', name: 'useDefaultRewardAccount', type: 'bool' },
      { internalType: 'address', name: 'targetAccount', type: 'address' },
      { internalType: 'uint256', name: 'rewardAmount', type: 'uint256' },
      {
        internalType: 'int256',
        name: 'targetAccountBalanceDelta',
        type: 'int256',
      },
    ],
    name: 'makeLiquidationPayoutsV2',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [],
    name: 'name',
    outputs: [{ internalType: 'string', name: '', type: 'string' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'address', name: 'account', type: 'address' },
      { internalType: 'address', name: 'spender', type: 'address' },
      { internalType: 'uint256', name: 'amount', type: 'uint256' },
    ],
    name: 'operationApprove',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'address', name: 'account', type: 'address' },
      { internalType: 'address', name: 'spender', type: 'address' },
      { internalType: 'uint256', name: 'subtractedValue', type: 'uint256' },
    ],
    name: 'operationDecreaseAllowance',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'address', name: 'account', type: 'address' },
      { internalType: 'uint256', name: 'amount', type: 'uint256' },
    ],
    name: 'operationDowngrade',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'address', name: 'account', type: 'address' },
      { internalType: 'address', name: 'spender', type: 'address' },
      { internalType: 'uint256', name: 'addedValue', type: 'uint256' },
    ],
    name: 'operationIncreaseAllowance',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'address', name: 'spender', type: 'address' },
      { internalType: 'address', name: 'recipient', type: 'address' },
      { internalType: 'uint256', name: 'amount', type: 'uint256' },
      { internalType: 'bytes', name: 'userData', type: 'bytes' },
    ],
    name: 'operationSend',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'address', name: 'account', type: 'address' },
      { internalType: 'address', name: 'spender', type: 'address' },
      { internalType: 'address', name: 'recipient', type: 'address' },
      { internalType: 'uint256', name: 'amount', type: 'uint256' },
    ],
    name: 'operationTransferFrom',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'address', name: 'account', type: 'address' },
      { internalType: 'uint256', name: 'amount', type: 'uint256' },
    ],
    name: 'operationUpgrade',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'address', name: 'account', type: 'address' },
      { internalType: 'uint256', name: 'amount', type: 'uint256' },
      { internalType: 'bytes', name: 'data', type: 'bytes' },
      { internalType: 'bytes', name: 'operatorData', type: 'bytes' },
    ],
    name: 'operatorBurn',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'address', name: 'sender', type: 'address' },
      { internalType: 'address', name: 'recipient', type: 'address' },
      { internalType: 'uint256', name: 'amount', type: 'uint256' },
      { internalType: 'bytes', name: 'data', type: 'bytes' },
      { internalType: 'bytes', name: 'operatorData', type: 'bytes' },
    ],
    name: 'operatorSend',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [],
    name: 'proxiableUUID',
    outputs: [{ internalType: 'bytes32', name: '', type: 'bytes32' }],
    stateMutability: 'pure',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'address', name: 'account', type: 'address' },
      { internalType: 'uint256', name: 'timestamp', type: 'uint256' },
    ],
    name: 'realtimeBalanceOf',
    outputs: [
      { internalType: 'int256', name: 'availableBalance', type: 'int256' },
      { internalType: 'uint256', name: 'deposit', type: 'uint256' },
      { internalType: 'uint256', name: 'owedDeposit', type: 'uint256' },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'address', name: 'account', type: 'address' }],
    name: 'realtimeBalanceOfNow',
    outputs: [
      { internalType: 'int256', name: 'availableBalance', type: 'int256' },
      { internalType: 'uint256', name: 'deposit', type: 'uint256' },
      { internalType: 'uint256', name: 'owedDeposit', type: 'uint256' },
      { internalType: 'uint256', name: 'timestamp', type: 'uint256' },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'address', name: 'operator', type: 'address' }],
    name: 'revokeOperator',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'address', name: 'account', type: 'address' },
      { internalType: 'address', name: 'spender', type: 'address' },
      { internalType: 'uint256', name: 'amount', type: 'uint256' },
    ],
    name: 'selfApproveFor',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'address', name: 'account', type: 'address' },
      { internalType: 'uint256', name: 'amount', type: 'uint256' },
      { internalType: 'bytes', name: 'userData', type: 'bytes' },
    ],
    name: 'selfBurn',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'address', name: 'account', type: 'address' },
      { internalType: 'uint256', name: 'amount', type: 'uint256' },
      { internalType: 'bytes', name: 'userData', type: 'bytes' },
    ],
    name: 'selfMint',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'address', name: 'holder', type: 'address' },
      { internalType: 'address', name: 'spender', type: 'address' },
      { internalType: 'address', name: 'recipient', type: 'address' },
      { internalType: 'uint256', name: 'amount', type: 'uint256' },
    ],
    name: 'selfTransferFrom',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'address', name: 'recipient', type: 'address' },
      { internalType: 'uint256', name: 'amount', type: 'uint256' },
      { internalType: 'bytes', name: 'data', type: 'bytes' },
    ],
    name: 'send',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'address', name: 'account', type: 'address' },
      { internalType: 'int256', name: 'delta', type: 'int256' },
    ],
    name: 'settleBalance',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [],
    name: 'symbol',
    outputs: [{ internalType: 'string', name: '', type: 'string' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'bytes32', name: 'id', type: 'bytes32' },
      { internalType: 'uint256', name: 'dataLength', type: 'uint256' },
    ],
    name: 'terminateAgreement',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [],
    name: 'totalSupply',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'address', name: 'recipient', type: 'address' },
      { internalType: 'uint256', name: 'amount', type: 'uint256' },
    ],
    name: 'transfer',
    outputs: [{ internalType: 'bool', name: '', type: 'bool' }],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'address', name: 'recipient', type: 'address' }],
    name: 'transferAll',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'address', name: 'holder', type: 'address' },
      { internalType: 'address', name: 'recipient', type: 'address' },
      { internalType: 'uint256', name: 'amount', type: 'uint256' },
    ],
    name: 'transferFrom',
    outputs: [{ internalType: 'bool', name: '', type: 'bool' }],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'bytes32', name: 'id', type: 'bytes32' },
      { internalType: 'bytes32[]', name: 'data', type: 'bytes32[]' },
    ],
    name: 'updateAgreementData',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'address', name: 'account', type: 'address' },
      { internalType: 'uint256', name: 'slotId', type: 'uint256' },
      { internalType: 'bytes32[]', name: 'slotData', type: 'bytes32[]' },
    ],
    name: 'updateAgreementStateSlot',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'address', name: 'newAddress', type: 'address' }],
    name: 'updateCode',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'uint256', name: 'amount', type: 'uint256' }],
    name: 'upgrade',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'address', name: 'to', type: 'address' },
      { internalType: 'uint256', name: 'amount', type: 'uint256' },
      { internalType: 'bytes', name: 'data', type: 'bytes' },
    ],
    name: 'upgradeTo',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
];

async function main() {
  const args = process.argv.slice(2);
  const requiredArgs = ['--pk', '--chainId', '--tokenSymbol', '--network'];
  const argValues = {};

  requiredArgs.forEach((arg) => {
    const index = args.indexOf(arg);
    if (index === -1 || index === args.length - 1) {
      console.error(`Please provide a valid value for ${arg}`);
      process.exit(1);
    }
    argValues[arg] = args[index + 1];
  });

  const privateKey = argValues['--pk'];
  const chainId = Number(argValues['--chainId']);
  const tokenSymbol = argValues['--tokenSymbol'];
  const network = argValues['--network'];

  const extendedSuperTokenList =
    filteredTokensSuperFluid.extendedSuperTokenList().tokens;
  const tokens = [];
  for (const token of extendedSuperTokenList) {
    if (token.chainId === chainId && token.symbol.includes(tokenSymbol)) {
      tokens.push(token);
    }
  }

  const filteredTokens = [];
  for (const token of tokens) {
    if (token.symbol === tokenSymbol) {
      filteredTokens.push(token);
    }
  }

  const amount = 1;

  const provider = new ethers.providers.JsonRpcProvider(
    `https://rpc-endpoints.superfluid.dev/${network}`
  );
  console.log(`RPC provider: ${provider}`);

  const wallet = new ethers.Wallet(privateKey, provider);
  console.log(`Wallet: ${wallet.address}`);

  for (const token of filteredTokens) {
    console.log(
      `Token symbol: ${token.symbol} Token address: ${token.address} Underlying token address: ${token.extensions.superTokenInfo.underlyingTokenAddress}`
    );
    const underlyingTestTokenContract = new ethers.Contract(
      token.extensions.superTokenInfo.underlyingTokenAddress,
      underlyingTestTokenABI,
      provider
    );

    const superTestTokenContract = new ethers.Contract(
      token.address,
      superTestTokenABI,
      provider
    );

    const mintData = underlyingTestTokenContract.interface.encodeFunctionData(
      'mint',
      [wallet.address, (amount * 1e18).toString()]
    );

    const mintTx = await wallet.sendTransaction({
      to: token.extensions.superTokenInfo.underlyingTokenAddress,
      from: wallet.address,
      data: mintData,
    });

    await mintTx.wait().then((receipt) => {
      console.log(
        `${amount} ${token.symbol.slice(0, -1)} minted : ${
          receipt?.transactionHash
        }`
      );
    });

    const allowanceData =
      underlyingTestTokenContract.interface.encodeFunctionData('approve', [
        token.address,
        ((amount * 1e18) / 2).toString(),
      ]);

    const allowanceTx = await wallet.sendTransaction({
      to: token.extensions.superTokenInfo.underlyingTokenAddress,
      from: wallet.address,
      data: allowanceData,
    });

    await allowanceTx.wait().then((receipt) => {
      console.log(
        `Allowance for use of ${amount / 2} ${token.symbol.slice(
          0,
          -1
        )} given to ${token.symbol} contract for wrapping: ${
          receipt?.transactionHash
        }`
      );
    });

    const wrapData = superTestTokenContract.interface.encodeFunctionData(
      'upgrade',
      [((amount * 1e18) / 2).toString()]
    );

    const wrapTx = await wallet.sendTransaction({
      to: token.address,
      from: wallet.address,
      data: wrapData,
    });

    await wrapTx.wait().then((receipt) => {
      console.log(
        `Wrapped ${amount / 2} ${token.symbol.slice(0, -1)} to ${
          token.symbol
        }: ${receipt?.transactionHash}`
      );
    });
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
