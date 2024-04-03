import memoize from "lodash/memoize";
import * as chain from "wagmi/chains";
import { Chain } from "wagmi/chains";
import {
  NATIVE_ASSET_ADDRESS,
  SuperTokenPair,
  TokenMinimal,
  TokenType,
} from "./tokenTypes";
import { BigNumber, BigNumberish } from "ethers";
import { BasePage, UnitOfTime } from "../pageObjects/BasePage";
import ensureDefined from "../../../src/utils/ensureDefined";

export const autoWrapManagerAddresses = {
  [chain.polygon.id]: "0x2581c27E7f6D6AF452E63fCe884EDE3EDd716b32",
  [chain.bsc.id]: "0x2AcdD61ac1EFFe1535109449c31889bdE8d7f325",
  [chain.avalancheFuji.id]: "0x30aE282CF477E2eF28B14d0125aCEAd57Fe1d7a1",
  [chain.avalanche.id]: "0x8082e58681350876aFe8f52d3Bf8672034A03Db0",
  [chain.optimism.id]: "0x1fA76f2Cd0C3fe6c399A80111408d9C42C0CAC23",
  [chain.arbitrum.id]: "0xf01825eAFAe5CD1Dab5593EFAF218efC8968D272",
  [chain.mainnet.id]: "0x30aE282CF477E2eF28B14d0125aCEAd57Fe1d7a1",
  [chain.gnosis.id]: "0x8082e58681350876aFe8f52d3Bf8672034A03Db0",
} as const;

export const autoWrapStrategyAddresses = {
  [chain.polygon.id]: "0xb4afa36BAd8c76976Dc77a21c9Ad711EF720eE4b",
  [chain.bsc.id]: "0x9e308cb079ae130790F604b1030cDf386670f199",
  [chain.avalancheFuji.id]: "0x1D65c6d3AD39d454Ea8F682c49aE7744706eA96d",
  [chain.avalanche.id]: "0x51FBAbD31A615E14b1bC12E9d887f60997264a4E",
  [chain.optimism.id]: "0x0Cf060a501c0040e9CCC708eFE94079F501c6Bb4",
  [chain.arbitrum.id]: "0x342076aA957B0ec8bC1d3893af719b288eA31e61",
  [chain.mainnet.id]: "0x1D65c6d3AD39d454Ea8F682c49aE7744706eA96d",
  [chain.gnosis.id]: "0x51FBAbD31A615E14b1bC12E9d887f60997264a4E",
} as const;

export const flowSchedulerContractAddresses = {
  arbitrum: "0x3fA8B653F9abf91428800C0ba0F8D145a71F97A1",
  avalancheC: "0xF7AfF590E9DE493D7ACb421Fca7f1E35C1ad4Ce5",
  bnbSmartChain: "0x2f9e2A2A59405682d4F86779275CF5525AD7eC2B",
  ethereum: "0xAA0cD305eD020137E302CeCede7b18c0A05aCCDA",
  optimism: "0x55c8fc400833eEa791087cF343Ff2409A39DeBcC",
  polygon: "0x55F7758dd99d5e185f4CC08d4Ad95B71f598264D",
  gnosis: "0x9cC7fc484fF588926149577e9330fA5b2cA74336",
} as const;

export const vestingContractAddresses = {
  gnosis: "0x0170FFCC75d178d426EBad5b1a31451d00Ddbd0D",
  polygon: "0xcFE6382B33F2AdaFbE46e6A26A88E0182ae32b0c",
  arbitrum: "0x55c8fc400833eEa791087cF343Ff2409A39DeBcC",
  optimism: "0x65377d4dfE9c01639A41952B5083D58964782892",
  avalancheC: "0x3fA8B653F9abf91428800C0ba0F8D145a71F97A1",
  bnbSmartChain: "0x9B91c27f78376383003C6A12Ad12B341d016C5b9",
  ethereum: "0x39D5cBBa9adEBc25085a3918d36D5325546C001B",
} as const;

// id == chainId
// name == displayName
export type Network = {
  id: number;
  name: string;
  network: string;
  testnet?: boolean;
  slugName: string;
  v1ShortName: string | undefined;
  subgraphUrl: string;
  superfluidRpcUrl: string;
  getLinkForTransaction(txHash: string): string;
  getLinkForAddress(adderss: string): string;
  icon?: string;
  color: string;
  bufferTimeInMinutes: number; // Hard-code'ing this per network is actually incorrect approach. It's token-based and can be governed.
  nativeCurrency: Chain["nativeCurrency"] & {
    type: TokenType.NativeAssetUnderlyingToken;
    address: typeof NATIVE_ASSET_ADDRESS;
    superToken: {
      type: TokenType.NativeAssetSuperToken;
    } & TokenMinimal;
  };
  autoWrap?: {
    managerContractAddress: `0x${string}`;
    strategyContractAddress: `0x${string}`;
    lowerLimit: BigNumberish;
    upperLimit: BigNumberish;
  };
  flowSchedulerContractAddress?: `0x${string}`;
  platformUrl?: string;
};

export const superfluidRpcUrls = {
  gnosis: "https://rpc-endpoints.superfluid.dev/xdai-mainnet",
  polygon: "https://rpc-endpoints.superfluid.dev/polygon-mainnet",
  arbitrum: "https://rpc-endpoints.superfluid.dev/arbitrum-one",
  optimism: "https://rpc-endpoints.superfluid.dev/optimism-mainnet",
  avalancheFuji: "https://rpc-endpoints.superfluid.dev/avalanche-fuji",
  avalancheC: "https://rpc-endpoints.superfluid.dev/avalanche-c",
  ethereum: "https://rpc-endpoints.superfluid.dev/eth-mainnet",
  bsc: "https://rpc-endpoints.superfluid.dev/bsc-mainnet",
  "celo-mainnet": "https://rpc-endpoints.superfluid.dev/celo-mainnet",
  sepolia: "https://rpc-endpoints.superfluid.dev/eth-sepolia",
  base: "https://rpc-endpoints.superfluid.dev/base-mainnet",
  scroll: "https://rpc-endpoints.superfluid.dev/scroll-mainnet",
  "scroll-sepolia": "https://rpc-endpoints.superfluid.dev/scroll-sepolia",
  "optimism-sepolia": "https://rpc-endpoints.superfluid.dev/optimism-sepolia",
};

export const networkDefinition: {
  gnosis: Network;
  polygon: Network;
  avalancheFuji: Network;
  optimism: Network;
  arbitrum: Network;
  avalancheC: Network;
  bsc: Network;
  ethereum: Network;
  celoMainnet: Network;
  sepolia: Network;
  base: Network;
  scroll: Network;
  scrollSepolia: Network;
  optimismSepolia: Network;
} = {
  gnosis: {
    name: "Gnosis Chain",
    slugName: "gnosis",
    v1ShortName: "xdai",
    network: "xdai",
    id: 100,
    testnet: false,
    bufferTimeInMinutes: 240,
    icon: "/icons/network/gnosis.svg",
    color: "#04795b",
    superfluidRpcUrl: superfluidRpcUrls.gnosis,
    subgraphUrl:
      "https://api.thegraph.com/subgraphs/name/superfluid-finance/protocol-v1-xdai",
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
    autoWrap: {
      managerContractAddress: autoWrapManagerAddresses[chain.gnosis.id],
      strategyContractAddress: autoWrapStrategyAddresses[chain.gnosis.id],
      lowerLimit: BigNumber.from(UnitOfTime.Day * 7),
      upperLimit: BigNumber.from(UnitOfTime.Day * 14),
    },
  },
  polygon: {
    ...chain.polygon,
    slugName: "polygon",
    v1ShortName: "matic",
    bufferTimeInMinutes: 240,
    icon: "/icons/network/polygon.svg",
    color: "#7c3fe4",
    superfluidRpcUrl: superfluidRpcUrls.polygon,
    subgraphUrl:
      "https://api.thegraph.com/subgraphs/name/superfluid-finance/protocol-v1-matic",
    getLinkForTransaction: (txHash: string): string =>
      `https://polygonscan.com/tx/${txHash}`,
    getLinkForAddress: (address: string): string =>
      `https://polygonscan.com/address/${address}`,
    nativeCurrency: {
      ...BasePage.ensureDefined(chain.polygon.nativeCurrency),
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
    autoWrap: {
      managerContractAddress: autoWrapManagerAddresses[chain.polygon.id],
      strategyContractAddress: autoWrapStrategyAddresses[chain.polygon.id],
      lowerLimit: BigNumber.from(UnitOfTime.Day * 7),
      upperLimit: BigNumber.from(UnitOfTime.Day * 14),
    },
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
    superfluidRpcUrl: superfluidRpcUrls.avalancheFuji,
    subgraphUrl:
      "https://api.thegraph.com/subgraphs/name/superfluid-finance/protocol-v1-avalanche-fuji",
    getLinkForTransaction: (txHash: string): string =>
      `https://testnet.snowtrace.io/tx/${txHash}`,
    getLinkForAddress: (address: string): string =>
      `https://testnet.snowtrace.io/address/${address}`,
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
    autoWrap: {
      managerContractAddress: autoWrapManagerAddresses[chain.avalancheFuji.id],
      strategyContractAddress:
        autoWrapStrategyAddresses[chain.avalancheFuji.id],
      lowerLimit: BigNumber.from(UnitOfTime.Day * 7),
      upperLimit: BigNumber.from(UnitOfTime.Day * 14),
    },
  },
  optimism: {
    ...chain.optimism,
    slugName: "optimism",
    v1ShortName: "optimism-mainnet",
    bufferTimeInMinutes: 240,
    icon: "/icons/network/optimism.svg",
    color: "#ff0320",
    superfluidRpcUrl: superfluidRpcUrls.optimism,
    subgraphUrl:
      "https://api.thegraph.com/subgraphs/name/superfluid-finance/protocol-v1-optimism-mainnet",
    getLinkForTransaction: (txHash: string): string =>
      `https://optimistic.etherscan.io/tx/${txHash}`,
    getLinkForAddress: (address: string): string =>
      `https://optimistic.etherscan.io/address/${address}`,
    nativeCurrency: {
      ...BasePage.ensureDefined(chain.optimism.nativeCurrency),
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
    autoWrap: {
      managerContractAddress: autoWrapManagerAddresses[chain.optimism.id],
      strategyContractAddress: autoWrapStrategyAddresses[chain.optimism.id],
      lowerLimit: BigNumber.from(UnitOfTime.Day * 7),
      upperLimit: BigNumber.from(UnitOfTime.Day * 14),
    },
  },
  arbitrum: {
    ...chain.arbitrum,
    slugName: "arbitrum-one",
    v1ShortName: "arbitrum-one",
    bufferTimeInMinutes: 240,
    icon: "/icons/network/arbitrum.svg",
    color: "#2b374b",
    superfluidRpcUrl: superfluidRpcUrls.arbitrum,
    subgraphUrl:
      "https://api.thegraph.com/subgraphs/name/superfluid-finance/protocol-v1-arbitrum-one",
    getLinkForTransaction: (txHash: string): string =>
      `https://arbiscan.io/tx/${txHash}`,
    getLinkForAddress: (address: string): string =>
      `https://arbiscan.io/address/${address}`,
    nativeCurrency: {
      ...BasePage.ensureDefined(chain.arbitrum.nativeCurrency),
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
    autoWrap: {
      managerContractAddress: autoWrapManagerAddresses[chain.arbitrum.id],
      strategyContractAddress: autoWrapStrategyAddresses[chain.arbitrum.id],
      lowerLimit: BigNumber.from(UnitOfTime.Day * 7),
      upperLimit: BigNumber.from(UnitOfTime.Day * 14),
    },
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
    superfluidRpcUrl: superfluidRpcUrls.avalancheC,
    subgraphUrl:
      "https://api.thegraph.com/subgraphs/name/superfluid-finance/protocol-v1-avalanche-c",
    getLinkForTransaction: (txHash: string): string =>
      `https://avascan.info/blockchain/c/tx/${txHash}`,
    getLinkForAddress: (address: string): string =>
      `https://avascan.info/blockchain/c/address/${address}`,
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
    autoWrap: {
      managerContractAddress: autoWrapManagerAddresses[chain.avalanche.id],
      strategyContractAddress: autoWrapStrategyAddresses[chain.avalanche.id],
      lowerLimit: BigNumber.from(UnitOfTime.Day * 7),
      upperLimit: BigNumber.from(UnitOfTime.Day * 14),
    },
  },
  ethereum: {
    ...chain.mainnet,
    slugName: "ethereum",
    v1ShortName: "eth",
    bufferTimeInMinutes: 240,
    icon: "/icons/network/ethereum.svg",
    color: "#627EEA",
    superfluidRpcUrl: superfluidRpcUrls.ethereum,
    subgraphUrl: "https://subgraph.satsuma-prod.com/superfluid/eth-mainnet/api",
    getLinkForTransaction: (txHash: string): string =>
      `https://etherscan.io/tx/${txHash}`,
    getLinkForAddress: (address: string): string =>
      `https://etherscan.io/address/${address}`,
    nativeCurrency: {
      ...BasePage.ensureDefined(chain.mainnet.nativeCurrency),
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
    autoWrap: {
      managerContractAddress: autoWrapManagerAddresses[chain.mainnet.id],
      strategyContractAddress: autoWrapStrategyAddresses[chain.mainnet.id],
      lowerLimit: BigNumber.from(UnitOfTime.Day * 7),
      upperLimit: BigNumber.from(UnitOfTime.Day * 28),
    },
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
    superfluidRpcUrl: superfluidRpcUrls.bsc,
    subgraphUrl:
      "https://api.thegraph.com/subgraphs/name/superfluid-finance/protocol-v1-bsc-mainnet",
    getLinkForTransaction: (txHash: string): string =>
      `https://bscscan.com/tx/${txHash}`,
    getLinkForAddress: (address: string): string =>
      `https://bscscan.com/address/${address}`,
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
    autoWrap: {
      managerContractAddress: autoWrapManagerAddresses[chain.bsc.id],
      strategyContractAddress: autoWrapStrategyAddresses[chain.bsc.id],
      lowerLimit: BigNumber.from(UnitOfTime.Day * 7),
      upperLimit: BigNumber.from(UnitOfTime.Day * 14),
    },
  },
  celoMainnet: {
    ...chain.celo,
    slugName: "celo",
    v1ShortName: "celo",
    bufferTimeInMinutes: 240,
    icon: "/icons/network/celo-mainnet.svg",
    color: "#FCFF52",
    superfluidRpcUrl: superfluidRpcUrls["celo-mainnet"],
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
  },
  sepolia: {
    ...chain.sepolia,
    slugName: "sepolia",
    v1ShortName: "sepolia",
    bufferTimeInMinutes: 60,
    color: "#68B1D5",
    superfluidRpcUrl: superfluidRpcUrls["sepolia"],
    subgraphUrl:
      "https://subgraph.satsuma-prod.com/c5br3jaVlJI6/superfluid/eth-sepolia/api",
    getLinkForTransaction: (txHash: string): string =>
      `https://sepolia.etherscan.io/tx/${txHash}`,
    getLinkForAddress: (address: string): string =>
      `https://sepolia.etherscan.io/address/${address}`,
    nativeCurrency: {
      ...ensureDefined(chain.sepolia.nativeCurrency),
      address: NATIVE_ASSET_ADDRESS,
      type: TokenType.NativeAssetUnderlyingToken,
      superToken: {
        type: TokenType.NativeAssetSuperToken,
        symbol: "ETHx",
        address: "0x30a6933Ca9230361972E413a15dC8114c952414e",
        name: "Super ETH",
        decimals: 18,
      },
    },
    platformUrl: undefined,
  },
  base: {
    ...chain.base,
    slugName: "base",
    v1ShortName: "base",
    bufferTimeInMinutes: 60,
    color: "#68B1D5",
    superfluidRpcUrl: superfluidRpcUrls["base"],
    subgraphUrl: "https://base-mainnet.subgraph.x.superfluid.dev/",
    getLinkForTransaction: (txHash: string): string =>
      `https://basescan.org/tx/${txHash}`,
    getLinkForAddress: (address: string): string =>
      `https://basescan.org/address/${address}`,
    nativeCurrency: {
      ...ensureDefined(chain.base.nativeCurrency),
      address: NATIVE_ASSET_ADDRESS,
      type: TokenType.NativeAssetUnderlyingToken,
      superToken: {
        type: TokenType.NativeAssetSuperToken,
        symbol: "ETHx",
        address: "0x46fd5cfB4c12D87acD3a13e92BAa53240C661D93",
        name: "Super ETH",
        decimals: 18,
      },
    },
    platformUrl: undefined,
  },
  scroll: {
    id: 534352,
    name: "Scroll Mainnet",
    network: "scroll-mainnet",
    testnet: false,
    slugName: "scroll",
    v1ShortName: "scroll",
    bufferTimeInMinutes: 240,
    color: "#FFDBB0",
    superfluidRpcUrl: superfluidRpcUrls.scroll,
    subgraphUrl: "https://scroll-mainnet.subgraph.x.superfluid.dev/",
    getLinkForTransaction: (txHash: string): string =>
      `https://scrollscan.com/tx/${txHash}`,
    getLinkForAddress: (address: string): string =>
      `https://scrollscan.com/tx/address/${address}`,
    nativeCurrency: {
      name: "Ether",
      symbol: "ETH",
      decimals: 18,
      address: NATIVE_ASSET_ADDRESS,
      type: TokenType.NativeAssetUnderlyingToken,
      superToken: {
        type: TokenType.NativeAssetSuperToken,
        symbol: "ETHx",
        address: "0x483C1716b6133cdA01237ebBF19c5a92898204B7",
        name: "Super ETH",
        decimals: 18,
      },
    },
  },
  scrollSepolia: {
    id: 534351,
    name: "Scroll Sepolia",
    network: "scroll-sepolia",
    slugName: "scrsepolia",
    v1ShortName: "scrsepolia",
    testnet: true,
    bufferTimeInMinutes: 60,
    color: "#FFDBB0",
    superfluidRpcUrl: superfluidRpcUrls["scroll-sepolia"],
    subgraphUrl: "https://scroll-sepolia.subgraph.x.superfluid.dev/",
    getLinkForTransaction: (txHash: string): string =>
      `https://sepolia.scrollscan.com/tx/${txHash}`,
    getLinkForAddress: (address: string): string =>
      `https://sepolia.scrollscan.com/tx/address/${address}`,
    nativeCurrency: {
      ...ensureDefined(chain.scrollTestnet.nativeCurrency),
      address: NATIVE_ASSET_ADDRESS,
      type: TokenType.NativeAssetUnderlyingToken,
      superToken: {
        type: TokenType.NativeAssetSuperToken,
        symbol: "ETHx",
        address: "0x58f0A7c6c143074f5D824c2f27a85f6dA311A6FB",
        name: "Super ETH",
        decimals: 18,
      },
    },
  },
  optimismSepolia: {
    id: 11155420,
    name: "Optimism Sepolia",
    network: "optimism-sepolia",
    testnet: true,
    slugName: "opsepolia",
    v1ShortName: "opsepolia",
    bufferTimeInMinutes: 60,
    color: "#FF0320",
    superfluidRpcUrl: superfluidRpcUrls["optimism-sepolia"],
    subgraphUrl: "https://optimism-sepolia.subgraph.x.superfluid.dev/",
    getLinkForTransaction: (txHash: string): string =>
      `https://sepolia-optimism.etherscan.io/tx/${txHash}`,
    getLinkForAddress: (address: string): string =>
      `https://sepolia-optimism.etherscan.io/address/${address}`,
    nativeCurrency: {
      name: "Ether",
      symbol: "ETH",
      decimals: 18,
      address: NATIVE_ASSET_ADDRESS,
      type: TokenType.NativeAssetUnderlyingToken,
      superToken: {
        type: TokenType.NativeAssetSuperToken,
        symbol: "ETHx",
        address: "0x0043d7c85C8b96a49A72A92C0B48CdC4720437d7",
        name: "Super ETH",
        decimals: 18,
      },
    },
  },
};

export const networks: Network[] = [
  networkDefinition.gnosis,
  networkDefinition.polygon,
  networkDefinition.avalancheFuji,
  networkDefinition.optimism,
  networkDefinition.arbitrum,
  networkDefinition.avalancheC,
  networkDefinition.bsc,
  networkDefinition.ethereum,
  networkDefinition.celoMainnet,
  networkDefinition.sepolia,
  networkDefinition.base,
  networkDefinition.scroll,
  networkDefinition.scrollSepolia,
  networkDefinition.optimismSepolia,
];

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

export const networksByName = new Map(
  networks.map((x) => [x.slugName.toLowerCase(), x])
);

export const networksByChainId = new Map(networks.map((x) => [x.id, x]));
export const networksBySlug = new Map(networks.map((x) => [x.slugName, x]));

export const mainNetworks = networks.filter((network) => !network.testnet);
export const testNetworks = networks.filter((network) => network.testnet);
export const chainIds = networks.map((network) => network.id);

export const findNetworkByChainId = memoize((chainId: number) =>
  networks.find((network) => network.id === chainId)
);
