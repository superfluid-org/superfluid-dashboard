import { isString } from "lodash";
import memoize from "lodash/memoize";
import * as chain from "wagmi/chains";
import { Chain } from "wagmi/chains";
import ensureDefined from "../../utils/ensureDefined";
import {
  NATIVE_ASSET_ADDRESS,
  SuperTokenPair,
  TokenMinimal,
  TokenType,
} from "../redux/endpoints/tokenTypes";
import sfMeta from "@superfluid-finance/metadata";

// id == chainId
// name == displayName
export type Network = Chain & {
  slugName: string;
  v1ShortName: string | undefined;
  subgraphUrl: string;
  getLinkForTransaction(txHash: string): string;
  getLinkForAddress(adderss: string): string;
  icon?: string;
  color: string;
  bufferTimeInMinutes: number; // Hard-code'ing this per network is actually incorrect approach. It's token-based and can be governed.
  rpcUrls: Chain["rpcUrls"] & { superfluid: { http: readonly string[] } };
  nativeCurrency: Chain["nativeCurrency"] & {
    type: TokenType.NativeAssetUnderlyingToken;
    address: typeof NATIVE_ASSET_ADDRESS;
    superToken: {
      type: TokenType.NativeAssetSuperToken;
    } & TokenMinimal;
  };
  flowSchedulerContractAddress?: `0x${string}`;
  flowSchedulerSubgraphUrl?: `https://${string}` | undefined;
  vestingContractAddress: `0x${string}` | undefined;
  vestingSubgraphUrl: `https://${string}` | undefined;
  platformUrl: string | undefined;
};

export const superfluidRpcUrls = {
  goerli: "https://rpc-endpoints.superfluid.dev/eth-goerli",
  gnosis: "https://rpc-endpoints.superfluid.dev/xdai-mainnet",
  polygon: "https://rpc-endpoints.superfluid.dev/polygon-mainnet",
  polygonMumbai: "https://rpc-endpoints.superfluid.dev/polygon-mumbai",
  arbitrum: "https://rpc-endpoints.superfluid.dev/arbitrum-one",
  optimism: "https://rpc-endpoints.superfluid.dev/optimism-mainnet",
  avalancheFuji: "https://rpc-endpoints.superfluid.dev/avalanche-fuji",
  avalancheC: "https://rpc-endpoints.superfluid.dev/avalanche-c",
  bnbSmartChain: "https://rpc-endpoints.superfluid.dev/bsc-mainnet",
  ethereum: "https://rpc-endpoints.superfluid.dev/eth-mainnet",
  "celo-mainnet": "https://rpc-endpoints.superfluid.dev/celo-mainnet",
  "optimism-goerli": "https://rpc-endpoints.superfluid.dev/optimism-goerli",
  "arbitrum-goerli": "https://rpc-endpoints.superfluid.dev/arbitrum-goerli",
} as const;

export const superfluidPlatformUrls = {
  goerli: "https://prod-goerli-platform-service.dev.superfluid.dev",
  gnosis: "https://prod-xdai-mainnet-platform-service.prod.superfluid.dev",
  polygon: "https://prod-polygon-mainnet-platform-service.prod.superfluid.dev",
  mumbai: "https://prod-polygon-mumbai-platform-service.dev.superfluid.dev",
  arbitrum: "https://prod-arbitrum-one-platform-service.prod.superfluid.dev",
  optimism:
    "https://prod-optimism-mainnet-platform-service.prod.superfluid.dev",
  avalancheC: "https://prod-avalanche-c-platform-service.prod.superfluid.dev",
  bnbSmartChain:
    "https://prod-bsc-mainnet-platform-service.prod.superfluid.dev",
  ethereum: "https://prod-eth-mainnet-platform-service.prod.superfluid.dev",
} as const;

export const vestingSubgraphUrls = {
  gnosis:
    "https://api.thegraph.com/subgraphs/name/superfluid-finance/vesting-v1-xdai-mainnet",
  goerli:
    "https://api.thegraph.com/subgraphs/name/superfluid-finance/vesting-v1-eth-goerli",
  polygon:
    "https://api.thegraph.com/subgraphs/name/superfluid-finance/vesting-v1-polygon-mainnet",
  mumbai:
    "https://api.thegraph.com/subgraphs/name/superfluid-finance/vesting-v1-polygon-mumbai",
  arbitrum:
    "https://api.thegraph.com/subgraphs/name/superfluid-finance/vesting-v1-arbitrum-one",
  optimism:
    "https://api.thegraph.com/subgraphs/name/superfluid-finance/vesting-v1-optimism-mainnet",
  avalancheC:
    "https://api.thegraph.com/subgraphs/name/superfluid-finance/vesting-v1-avalanche-c",
  bnbSmartChain:
    "https://api.thegraph.com/subgraphs/name/superfluid-finance/vesting-v1-bsc-mainnet",
  ethereum:
    "https://api.thegraph.com/subgraphs/name/superfluid-finance/vesting-v1-eth-mainnet",
} as const;

export const vestingContractAddresses = {
  gnosis: "0x0170FFCC75d178d426EBad5b1a31451d00Ddbd0D",
  goerli: "0xF9240F930d847F70ad900aBEE8949F25649Bf24a",
  polygon: "0xcFE6382B33F2AdaFbE46e6A26A88E0182ae32b0c",
  mumbai: "0x3962EE56c9f7176215D149938BA685F91aBB633B",
  arbitrum: "0x55c8fc400833eEa791087cF343Ff2409A39DeBcC",
  optimism: "0x65377d4dfE9c01639A41952B5083D58964782892",
  avalancheC: "0x3fA8B653F9abf91428800C0ba0F8D145a71F97A1",
  bnbSmartChain: "0x9B91c27f78376383003C6A12Ad12B341d016C5b9",
  ethereum: "0x39D5cBBa9adEBc25085a3918d36D5325546C001B",
} as const;

export const flowSchedulerSubgraphUrls = {
  goerli:
    "https://api.thegraph.com/subgraphs/name/superfluid-finance/scheduling-v1-eth-goerli",
  arbitrum:
    "https://api.thegraph.com/subgraphs/name/superfluid-finance/scheduling-v1-arbitrum-one",
  avalancheC:
    "https://api.thegraph.com/subgraphs/name/superfluid-finance/scheduling-v1-avalanche-c",
  bnbSmartChain:
    "https://api.thegraph.com/subgraphs/name/superfluid-finance/scheduling-v1-bsc-mainnet",
  ethereum:
    "https://api.thegraph.com/subgraphs/name/superfluid-finance/scheduling-v1-eth-mainnet",
  optimism:
    "https://api.thegraph.com/subgraphs/name/superfluid-finance/scheduling-v1-optimism-mainnet",
  polygon:
    "https://api.thegraph.com/subgraphs/name/superfluid-finance/scheduling-v1-polygon-mainnet",
  mumbai:
    "https://api.thegraph.com/subgraphs/name/superfluid-finance/scheduling-v1-polygon-mumbai",
  gnosis:
    "https://api.thegraph.com/subgraphs/name/superfluid-finance/scheduling-v1-xdai-mainnet",
} as const;

export const flowSchedulerContractAddresses = {
  goerli: "0xf428308b426D7cD7Ad8eBE549d750f31C8E060Ca",
  arbitrum: "0x3fA8B653F9abf91428800C0ba0F8D145a71F97A1",
  avalancheC: "0xF7AfF590E9DE493D7ACb421Fca7f1E35C1ad4Ce5",
  bnbSmartChain: "0x2f9e2A2A59405682d4F86779275CF5525AD7eC2B",
  ethereum: "0xAA0cD305eD020137E302CeCede7b18c0A05aCCDA",
  optimism: "0x55c8fc400833eEa791087cF343Ff2409A39DeBcC",
  polygon: "0x55F7758dd99d5e185f4CC08d4Ad95B71f598264D",
  mumbai: "0x59A3Ba9d34c387FB70b4f4e4Fbc9eD7519194139",
  gnosis: "0x9cC7fc484fF588926149577e9330fA5b2cA74336",
} as const;

const blockExplorers = {
  blockscout: {
    gnosis: {
      name: "Blockscout",
      url: "https://blockscout.com/xdai/mainnet/",
    },
  },
  snowtrace: {
    avalancheC: {
      name: "SnowTrace",
      url: "https://snowtrace.io/",
    },
    avalancheFuji: {
      name: "SnowTrace",
      url: "https://testnet.snowtrace.io/",
    },
  },
  avascan: {
    avalancheC: {
      name: "Avascan",
      url: "https://avascan.info/",
    },
  },
  bscscan: {
    bnbSmartChain: {
      name: "BSC Scan",
      url: "https://bscscan.com/",
    },
  },
  celoscan: {
    mainnet: {
      name: "Celo Scan",
      url: "https://celoscan.io/",
    },
  },
};

export const networkDefinition: {
  goerli: Network & {
    flowSchedulerContractAddress: `0x${string}`;
    platformUrl: string;
  };
  gnosis: Network;
  polygon: Network;
  polygonMumbai: Network;
  avalancheFuji: Network;
  optimism: Network;
  arbitrum: Network;
  avalancheC: Network;
  bsc: Network;
  ethereum: Network & {
    vestingContractAddress: `0x${string}`;
  };
  celoMainnet: Network;
  optimismGoerli: Network;
  arbitrumGoerli: Network;
} = {
  goerli: {
    ...chain.goerli,
    blockExplorers: ensureDefined(chain.goerli.blockExplorers),
    slugName: "goerli",
    v1ShortName: "goerli",
    bufferTimeInMinutes: 60,
    color: "#9064ff",
    rpcUrls: {
      ...chain.goerli.rpcUrls,
      superfluid: { http: [superfluidRpcUrls.goerli] },
    },
    subgraphUrl:
      "https://api.thegraph.com/subgraphs/name/superfluid-finance/protocol-v1-goerli",
    getLinkForTransaction: (txHash: string): string =>
      `https://goerli.etherscan.io/tx/${txHash}`,
    getLinkForAddress: (address: string): string =>
      `https://goerli.etherscan.io/address/${address}`,
    nativeCurrency: {
      ...ensureDefined(chain.goerli.nativeCurrency),
      address: NATIVE_ASSET_ADDRESS,
      type: TokenType.NativeAssetUnderlyingToken,
      superToken: {
        type: TokenType.NativeAssetSuperToken,
        symbol: "ETHx",
        address: "0x5943f705abb6834cad767e6e4bb258bc48d9c947",
        name: "Super ETH",
        decimals: 18,
      },
    },
    flowSchedulerContractAddress: flowSchedulerContractAddresses.goerli,
    flowSchedulerSubgraphUrl: flowSchedulerSubgraphUrls.goerli,
    vestingContractAddress: vestingContractAddresses.goerli,
    vestingSubgraphUrl: vestingSubgraphUrls.goerli,
    platformUrl: superfluidPlatformUrls.goerli,
  },
  gnosis: {
    name: "Gnosis Chain",
    blockExplorers: {
      etherscan: undefined!,
      default: blockExplorers.blockscout.gnosis,
    },
    slugName: "gnosis",
    v1ShortName: "xdai",
    network: "xdai",
    id: 100,
    testnet: false,
    bufferTimeInMinutes: 240,
    icon: "/icons/network/gnosis.svg",
    color: "#04795b",
    rpcUrls: {
      superfluid: { http: [superfluidRpcUrls.gnosis] },
      default: { http: ["https://rpc.gnosischain.com/"] },
      public: { http: ["https://rpc.gnosischain.com/"] },
    },
    subgraphUrl:
      "https://subgraph.satsuma-prod.com/c5br3jaVlJI6/superfluid/xdai/api",
    getLinkForTransaction: (txHash: string): string =>
      `https://blockscout.com/xdai/mainnet/tx/${txHash}`,
    getLinkForAddress: (address: string): string =>
      `https://blockscout.com/xdai/mainnet/address/${address}`,
    nativeCurrency: {
      name: "xDai",
      symbol: "XDAI",
      decimals: 18,
      address: NATIVE_ASSET_ADDRESS,
      type: TokenType.NativeAssetUnderlyingToken,
      superToken: {
        type: TokenType.NativeAssetSuperToken,
        symbol: "xDAIx",
        address: "0x59988e47a3503aafaa0368b9def095c818fdca01",
        name: "Super xDAI",
        decimals: 18,
      },
    },
    flowSchedulerContractAddress: flowSchedulerContractAddresses.gnosis,
    flowSchedulerSubgraphUrl: flowSchedulerSubgraphUrls.gnosis,
    vestingContractAddress: vestingContractAddresses.gnosis,
    vestingSubgraphUrl: vestingSubgraphUrls.gnosis,
    platformUrl: superfluidPlatformUrls.gnosis,
  },
  polygon: {
    ...chain.polygon,
    blockExplorers: ensureDefined(chain.polygon.blockExplorers),
    slugName: "polygon",
    v1ShortName: "matic",
    bufferTimeInMinutes: 240,
    icon: "/icons/network/polygon.svg",
    color: "#7c3fe4",
    rpcUrls: {
      ...chain.polygon.rpcUrls,
      superfluid: { http: [superfluidRpcUrls.polygon] },
    },
    subgraphUrl:
      "https://api.thegraph.com/subgraphs/name/superfluid-finance/protocol-v1-matic",
    getLinkForTransaction: (txHash: string): string =>
      `https://polygonscan.com/tx/${txHash}`,
    getLinkForAddress: (address: string): string =>
      `https://polygonscan.com/address/${address}`,
    nativeCurrency: {
      ...ensureDefined(chain.polygon.nativeCurrency),
      address: NATIVE_ASSET_ADDRESS,
      type: TokenType.NativeAssetUnderlyingToken,
      superToken: {
        type: TokenType.NativeAssetSuperToken,
        symbol: "MATICx",
        address: "0x3ad736904e9e65189c3000c7dd2c8ac8bb7cd4e3",
        name: "Super MATIC",
        decimals: 18,
      },
    },
    flowSchedulerContractAddress: flowSchedulerContractAddresses.polygon,
    flowSchedulerSubgraphUrl: flowSchedulerSubgraphUrls.polygon,
    vestingContractAddress: vestingContractAddresses.polygon,
    vestingSubgraphUrl: vestingSubgraphUrls.polygon,
    platformUrl: superfluidPlatformUrls.polygon,
  },
  polygonMumbai: {
    ...chain.polygonMumbai,
    blockExplorers: ensureDefined(chain.polygonMumbai.blockExplorers),
    slugName: "polygon-mumbai",
    v1ShortName: "mumbai",
    bufferTimeInMinutes: 60,
    color: "#3099f2",
    rpcUrls: {
      ...chain.polygonMumbai.rpcUrls,
      superfluid: { http: [superfluidRpcUrls.polygonMumbai] },
    },
    subgraphUrl:
      "https://api.thegraph.com/subgraphs/name/superfluid-finance/protocol-v1-mumbai",
    getLinkForTransaction: (txHash: string): string =>
      `https://mumbai.polygonscan.com/tx/${txHash}`,
    getLinkForAddress: (address: string): string =>
      `https://mumbai.polygonscan.com/address/${address}`,
    nativeCurrency: {
      ...ensureDefined(chain.polygonMumbai.nativeCurrency),
      address: NATIVE_ASSET_ADDRESS,
      type: TokenType.NativeAssetUnderlyingToken,
      superToken: {
        type: TokenType.NativeAssetSuperToken,
        symbol: "MATICx",
        address: "0x96b82b65acf7072efeb00502f45757f254c2a0d4",
        name: "Super MATIC",
        decimals: 18,
      },
    },
    flowSchedulerContractAddress: flowSchedulerContractAddresses.mumbai,
    flowSchedulerSubgraphUrl: flowSchedulerSubgraphUrls.mumbai,
    vestingContractAddress: vestingContractAddresses.mumbai,
    vestingSubgraphUrl: vestingSubgraphUrls.mumbai,
    platformUrl: superfluidPlatformUrls.mumbai,
  },
  avalancheFuji: {
    name: "Fuji (C-Chain)",
    slugName: "avalanche-fuji",
    v1ShortName: "avalanche-fuji",
    network: "avalanche-fuji",
    id: 43113,
    testnet: true,
    bufferTimeInMinutes: 60,
    color: "#2b374b",
    rpcUrls: {
      superfluid: { http: [superfluidRpcUrls.avalancheFuji] },
      default: { http: ["https://api.avax-test.network/ext/C/rpc"] },
      public: { http: ["https://api.avax-test.network/ext/C/rpc"] },
    },
    subgraphUrl:
      "https://api.thegraph.com/subgraphs/name/superfluid-finance/protocol-v1-avalanche-fuji",
    getLinkForTransaction: (txHash: string): string =>
      `https://testnet.snowtrace.io/tx/${txHash}`,
    getLinkForAddress: (address: string): string =>
      `https://testnet.snowtrace.io/address/${address}`,
    blockExplorers: {
      etherscan: undefined!,
      snowtrace: blockExplorers.snowtrace.avalancheFuji,
      default: blockExplorers.snowtrace.avalancheFuji,
    },
    nativeCurrency: {
      name: "AVAX",
      symbol: "AVAX",
      decimals: 18,
      address: NATIVE_ASSET_ADDRESS,
      type: TokenType.NativeAssetUnderlyingToken,
      superToken: {
        type: TokenType.NativeAssetSuperToken,
        symbol: "AVAXx",
        address: "0x5735c32c38f5af0fb04a7c77c832ba4d7abffec8",
        name: "Super AVAX",
        decimals: 18,
      },
    },
    flowSchedulerContractAddress: undefined,
    flowSchedulerSubgraphUrl: undefined,
    vestingContractAddress: undefined,
    vestingSubgraphUrl: undefined,
    platformUrl: undefined,
  },
  optimism: {
    ...chain.optimism,
    blockExplorers: ensureDefined(chain.optimism.blockExplorers),
    slugName: "optimism",
    v1ShortName: "optimism-mainnet",
    bufferTimeInMinutes: 240,
    icon: "/icons/network/optimism.svg",
    color: "#ff0320",
    rpcUrls: {
      ...chain.optimism.rpcUrls,
      superfluid: { http: [superfluidRpcUrls.optimism] },
    },
    subgraphUrl:
      "https://api.thegraph.com/subgraphs/name/superfluid-finance/protocol-v1-optimism-mainnet",
    getLinkForTransaction: (txHash: string): string =>
      `https://optimistic.etherscan.io/tx/${txHash}`,
    getLinkForAddress: (address: string): string =>
      `https://optimistic.etherscan.io/address/${address}`,
    nativeCurrency: {
      ...ensureDefined(chain.optimism.nativeCurrency),
      address: NATIVE_ASSET_ADDRESS,
      type: TokenType.NativeAssetUnderlyingToken,
      superToken: {
        type: TokenType.NativeAssetSuperToken,
        symbol: "ETHx",
        address: "0x4ac8bd1bdae47beef2d1c6aa62229509b962aa0d",
        name: "Super ETH",
        decimals: 18,
      },
    },
    flowSchedulerContractAddress: flowSchedulerContractAddresses.optimism,
    flowSchedulerSubgraphUrl: flowSchedulerSubgraphUrls.optimism,
    vestingContractAddress: vestingContractAddresses.optimism,
    vestingSubgraphUrl: vestingSubgraphUrls.optimism,
    platformUrl: superfluidPlatformUrls.optimism,
  },
  arbitrum: {
    ...chain.arbitrum,
    blockExplorers: ensureDefined(chain.arbitrum.blockExplorers),
    slugName: "arbitrum-one",
    v1ShortName: "arbitrum-one",
    bufferTimeInMinutes: 240,
    icon: "/icons/network/arbitrum.svg",
    color: "#2b374b",
    rpcUrls: {
      ...chain.arbitrum.rpcUrls,
      superfluid: { http: [superfluidRpcUrls.arbitrum] },
    },
    subgraphUrl:
      "https://api.thegraph.com/subgraphs/name/superfluid-finance/protocol-v1-arbitrum-one",
    getLinkForTransaction: (txHash: string): string =>
      `https://arbiscan.io/tx/${txHash}`,
    getLinkForAddress: (address: string): string =>
      `https://arbiscan.io/address/${address}`,
    nativeCurrency: {
      ...ensureDefined(chain.arbitrum.nativeCurrency),
      address: NATIVE_ASSET_ADDRESS,
      type: TokenType.NativeAssetUnderlyingToken,
      superToken: {
        type: TokenType.NativeAssetSuperToken,
        symbol: "ETHx",
        address: "0xe6c8d111337d0052b9d88bf5d7d55b7f8385acd3",
        name: "Super ETH",
        decimals: 18,
      },
    },
    flowSchedulerContractAddress: flowSchedulerContractAddresses.arbitrum,
    flowSchedulerSubgraphUrl: flowSchedulerSubgraphUrls.arbitrum,
    vestingContractAddress: vestingContractAddresses.arbitrum,
    vestingSubgraphUrl: vestingSubgraphUrls.arbitrum,
    platformUrl: superfluidPlatformUrls.arbitrum,
  },
  avalancheC: {
    name: "Avalanche C",
    slugName: "avalanche",
    v1ShortName: "avalanche-c",
    network: "avalanche-c",
    id: 43114,
    testnet: false,
    bufferTimeInMinutes: 240,
    icon: "/icons/network/avalanche.svg",
    color: "#e84142",
    rpcUrls: {
      superfluid: { http: [superfluidRpcUrls.avalancheC] },
      default: { http: ["https://api.avax.network/ext/bc/C/rpc"] },
      public: { http: ["https://api.avax.network/ext/bc/C/rpc"] },
    },
    subgraphUrl:
      "https://api.thegraph.com/subgraphs/name/superfluid-finance/protocol-v1-avalanche-c",
    getLinkForTransaction: (txHash: string): string =>
      `https://avascan.info/blockchain/c/tx/${txHash}`,
    getLinkForAddress: (address: string): string =>
      `https://avascan.info/blockchain/c/address/${address}`,
    blockExplorers: {
      etherscan: undefined!,
      snowtrace: blockExplorers.snowtrace.avalancheC,
      avascan: blockExplorers.avascan.avalancheC,
      default: blockExplorers.avascan.avalancheC,
    },
    nativeCurrency: {
      name: "AVAX",
      symbol: "AVAX",
      decimals: 18,
      address: NATIVE_ASSET_ADDRESS,
      type: TokenType.NativeAssetUnderlyingToken,
      superToken: {
        type: TokenType.NativeAssetSuperToken,
        symbol: "AVAXx",
        address: "0xBE916845D8678b5d2F7aD79525A62D7c08ABba7e",
        name: "Super AVAX",
        decimals: 18,
      },
    },
    flowSchedulerContractAddress: flowSchedulerContractAddresses.avalancheC,
    flowSchedulerSubgraphUrl: flowSchedulerSubgraphUrls.avalancheC,
    vestingContractAddress: vestingContractAddresses.avalancheC,
    vestingSubgraphUrl: vestingSubgraphUrls.avalancheC,
    platformUrl: superfluidPlatformUrls.avalancheC,
  },
  bsc: {
    name: "BNB Smart Chain",
    slugName: "bsc",
    v1ShortName: "bsc-mainnet",
    network: "bnb-smart-chain",
    id: 56,
    testnet: false,
    bufferTimeInMinutes: 240,
    icon: "/icons/network/bnb.svg",
    color: "#F0B90B",
    rpcUrls: {
      superfluid: { http: [superfluidRpcUrls.bnbSmartChain] },
      default: { http: ["https://bsc-dataseed1.binance.org"] },
      public: { http: ["https://bsc-dataseed1.binance.org"] },
    },
    subgraphUrl:
      "https://api.thegraph.com/subgraphs/name/superfluid-finance/protocol-v1-bsc-mainnet",
    getLinkForTransaction: (txHash: string): string =>
      `https://bscscan.com/tx/${txHash}`,
    getLinkForAddress: (address: string): string =>
      `https://bscscan.com/address/${address}`,
    blockExplorers: {
      bscscan: blockExplorers.bscscan.bnbSmartChain,
      default: blockExplorers.bscscan.bnbSmartChain,
    },
    nativeCurrency: {
      name: "Binance Chain Native Token",
      symbol: "BNB",
      decimals: 18,
      address: NATIVE_ASSET_ADDRESS,
      type: TokenType.NativeAssetUnderlyingToken,
      superToken: {
        type: TokenType.NativeAssetSuperToken,
        symbol: "BNBx",
        address: "0x529a4116f160c833c61311569d6b33dff41fd657",
        name: "Super BNB",
        decimals: 18,
      },
    },
    flowSchedulerContractAddress: flowSchedulerContractAddresses.bnbSmartChain,
    flowSchedulerSubgraphUrl: flowSchedulerSubgraphUrls.bnbSmartChain,
    vestingContractAddress: vestingContractAddresses.bnbSmartChain,
    vestingSubgraphUrl: vestingSubgraphUrls.bnbSmartChain,
    platformUrl: superfluidPlatformUrls.bnbSmartChain,
  },
  ethereum: {
    ...chain.mainnet,
    blockExplorers: ensureDefined(chain.mainnet.blockExplorers),
    slugName: "ethereum",
    v1ShortName: "eth",
    bufferTimeInMinutes: 240,
    icon: "/icons/network/ethereum.svg",
    color: "#627EEA",
    rpcUrls: {
      ...chain.mainnet.rpcUrls,
      superfluid: { http: [superfluidRpcUrls.ethereum] },
    },
    subgraphUrl:
      "https://subgraph.satsuma-prod.com/c5br3jaVlJI6/superfluid/eth-mainnet/api",
    getLinkForTransaction: (txHash: string): string =>
      `https://etherscan.io/tx/${txHash}`,
    getLinkForAddress: (address: string): string =>
      `https://etherscan.io/address/${address}`,
    nativeCurrency: {
      ...ensureDefined(chain.mainnet.nativeCurrency),
      address: NATIVE_ASSET_ADDRESS,
      type: TokenType.NativeAssetUnderlyingToken,
      superToken: {
        type: TokenType.NativeAssetSuperToken,
        symbol: "ETHx",
        address: "0xC22BeA0Be9872d8B7B3933CEc70Ece4D53A900da",
        name: "Super ETH",
        decimals: 18,
      },
    },
    flowSchedulerContractAddress: flowSchedulerContractAddresses.ethereum,
    flowSchedulerSubgraphUrl: flowSchedulerSubgraphUrls.ethereum,
    vestingContractAddress: vestingContractAddresses.ethereum,
    vestingSubgraphUrl: vestingSubgraphUrls.ethereum,
    platformUrl: superfluidPlatformUrls.ethereum,
  },
  celoMainnet: {
    ...chain.celo,
    blockExplorers: {
      celoscan: blockExplorers.celoscan.mainnet,
      default: blockExplorers.celoscan.mainnet,
    },
    slugName: "celo",
    v1ShortName: "celo",
    bufferTimeInMinutes: 240,
    icon: "/icons/network/celo-mainnet.svg",
    color: "#FCFF52",
    rpcUrls: {
      ...chain.celo.rpcUrls,
      superfluid: { http: [superfluidRpcUrls["celo-mainnet"]] },
    },
    subgraphUrl:
      "https://api.thegraph.com/subgraphs/name/superfluid-finance/protocol-v1-celo-mainnet",
    getLinkForTransaction: (txHash: string): string =>
      `https://celoscan.io/tx/${txHash}`,
    getLinkForAddress: (address: string): string =>
      `https://celoscan.io/address/${address}`,
    nativeCurrency: {
      ...ensureDefined(chain.celo.nativeCurrency),
      address: NATIVE_ASSET_ADDRESS,
      type: TokenType.NativeAssetUnderlyingToken,
      superToken: {
        type: TokenType.NativeAssetSuperToken,
        symbol: "CELOx",
        address: "0x671425ae1f272bc6f79bec3ed5c4b00e9c628240",
        name: "Super Celo",
        decimals: 18,
      },
    },
    vestingContractAddress: undefined,
    vestingSubgraphUrl: undefined,
    platformUrl: undefined,
  },
  optimismGoerli: {
    ...chain.optimismGoerli,
    blockExplorers: ensureDefined(chain.optimismGoerli.blockExplorers),
    slugName: "optimism-goerli",
    v1ShortName: "optimism goerli",
    bufferTimeInMinutes: 240,
    icon: "/icons/network/optimism.svg",
    color: "#ff0320",
    rpcUrls: {
      ...chain.optimismGoerli.rpcUrls,
      superfluid: { http: [superfluidRpcUrls["optimism-goerli"]] },
    },
    subgraphUrl:
        "https://api.thegraph.com/subgraphs/name/superfluid-finance/protocol-v1-optimism-goerli",
    getLinkForTransaction: (txHash: string): string =>
        `https://goerli-optimism.etherscan.io/tx/${txHash}`,
    getLinkForAddress: (address: string): string =>
        `https://goerli-optimism.etherscan.io/address/${address}`,
    nativeCurrency: {
      ...ensureDefined(chain.optimismGoerli.nativeCurrency),
      address: NATIVE_ASSET_ADDRESS,
      type: TokenType.NativeAssetUnderlyingToken,
      superToken: {
        type: TokenType.NativeAssetSuperToken,
        symbol: "ETHx",
        address: "0xE01F8743677Da897F4e7De9073b57Bf034FC2433",
        name: "Super ETH",
        decimals: 18,
      },
    },
    vestingContractAddress: undefined,
    vestingSubgraphUrl: undefined,
    platformUrl: undefined,
  },
  arbitrumGoerli: {
    ...chain.arbitrumGoerli,
    blockExplorers: ensureDefined(chain.arbitrumGoerli.blockExplorers),
    slugName: "arbitrum-goerli",
    v1ShortName: "arbitrum goerli",
    bufferTimeInMinutes: 240,
    icon: "/icons/network/arbitrum.svg",
    color: "#2b374b",
    rpcUrls: {
      ...chain.arbitrumGoerli.rpcUrls,
      superfluid: { http: [superfluidRpcUrls["arbitrum-goerli"]] },
    },
    subgraphUrl:
        "https://api.thegraph.com/subgraphs/name/superfluid-finance/protocol-v1-arbitrum-goerli",
    getLinkForTransaction: (txHash: string): string =>
        `https://goerli.arbiscan.io/tx/${txHash}`,
    getLinkForAddress: (address: string): string =>
        `https://goerli.arbiscan.io/address/${address}`,
    nativeCurrency: {
      ...ensureDefined(chain.arbitrumGoerli.nativeCurrency),
      address: NATIVE_ASSET_ADDRESS,
      type: TokenType.NativeAssetUnderlyingToken,
      superToken: {
        type: TokenType.NativeAssetSuperToken,
        symbol: "ETHx",
        address: "0xE01F8743677Da897F4e7De9073b57Bf034FC2433",
        name: "Super ETH",
        decimals: 18,
      },
    },
    vestingContractAddress: undefined,
    vestingSubgraphUrl: undefined,
    platformUrl: undefined,
  },
};

export const allNetworks: Network[] = [
  networkDefinition.ethereum,
  networkDefinition.goerli,
  networkDefinition.gnosis,
  networkDefinition.polygon,
  networkDefinition.polygonMumbai,
  networkDefinition.avalancheFuji,
  networkDefinition.optimism,
  networkDefinition.arbitrum,
  networkDefinition.avalancheC,
  networkDefinition.bsc,
  networkDefinition.celoMainnet,
  networkDefinition.optimismGoerli,
  networkDefinition.arbitrumGoerli,
];
export const mainNetworks = allNetworks.filter((x) => !x.testnet);
export const testNetworks = allNetworks.filter((x) => x.testnet);

export const tryFindNetwork = (
  networks: Network[],
  value: unknown
): Network | undefined => {
  const asNumber = Number(value);
  if (isFinite(asNumber)) {
    return networks.find((x) => x.id === asNumber);
  }

  if (isString(value)) {
    const valueAsLowerCase = value.toLowerCase();

    const bySlug = networks.find((x) => x.slugName === valueAsLowerCase);
    if (bySlug) {
      return bySlug;
    }

    const byV1ShortName = networks.find(
      (x) => x.v1ShortName === valueAsLowerCase
    );
    if (byV1ShortName) {
      return byV1ShortName;
    }

    const byMetadata_chainId =
      sfMeta.getNetworkByName(valueAsLowerCase)?.chainId ??
      sfMeta.getNetworkByShortName(valueAsLowerCase)?.chainId;
    if (byMetadata_chainId) {
      return networks.find((x) => x.id === byMetadata_chainId);
    }
  }

  return undefined;
};

export const findNetworkOrThrow = (
  networks: Network[],
  value: unknown
): Network => {
  const network = tryFindNetwork(networks, value);
  if (!network) {
    throw new Error(`Network ${value}  not found. This should never happen.`);
  }
  return network;
};

export const getNetworkDefaultTokenPair = memoize(
  (network: Network): SuperTokenPair => ({
    superToken: { ...network.nativeCurrency.superToken, decimals: 18 },
    underlyingToken: {
      type: network.nativeCurrency.type,
      address: network.nativeCurrency.address,
      name: network.nativeCurrency.name,
      symbol: network.nativeCurrency.symbol,
      decimals: network.nativeCurrency.decimals,
    },
  })
);

// The vesting contract might be deployed to more networks but we check for the existence of the Platform.;
export const vestingSupportedNetworks = allNetworks
  .filter((network) => network.platformUrl)
  .sort((n1, n2) => (!n1.testnet && n2.testnet ? -1 : 1));
