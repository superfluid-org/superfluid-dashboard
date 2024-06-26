import { isString, orderBy } from "lodash";
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
import {
  autoWrapManagerAddresses,
  autoWrapStrategyAddresses,
  autoWrapSubgraphUrls,
  chainIds,
  flowSchedulerContractAddresses,
  flowSchedulerSubgraphUrls,
  superfluidPlatformUrls,
  superfluidRpcUrls,
  vestingContractAddresses,
  vestingSubgraphUrls,
} from "./networkConstants";
import { BigNumber, BigNumberish } from "ethers";
import { UnitOfTime } from "../send/FlowRateInput";
import { ChainBlockExplorer } from "viem/_types/types/chain";

const getMetadata = memoize((chainId: number) => {
  const metadata = sfMeta.getNetworkByChainId(chainId)
  if (!metadata) {
    throw new Error(`No metadata for chainId ${chainId}`)
  }
  return metadata
})

const getSupportsGDA = (chainId: number) => {
  const metadata = getMetadata(chainId)
  return Boolean(metadata.contractsV1.gdaV1)
}

type NetworkMetadata = (typeof sfMeta.networks)[number];

// id == chainId
// name == displayName
export type Network = Chain & {
  slugName: string;
  v1ShortName: string | undefined;
  fallbackSubgraphUrl?: string; // We'll normally use the Subgraph URL from the metadata package.
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
  supportsGDA: boolean;
  flowSchedulerContractAddress?: `0x${string}`;
  flowSchedulerSubgraphUrl?: `https://${string}` | undefined;
  vestingContractAddress: `0x${string}` | undefined;
  vestingSubgraphUrl: `https://${string}` | undefined;
  autoWrapSubgraphUrl: `https://${string}` | undefined;
  platformUrl: string | undefined;
  autoWrap?: {
    managerContractAddress: `0x${string}`;
    strategyContractAddress: `0x${string}`;
    lowerLimit: BigNumberish;
    upperLimit: BigNumberish;
  };
  humaFinance?: {
    nftAddress: `0x${string}`;
  };
  metadata: NetworkMetadata;
  blockExplorers: Chain["blockExplorers"] & Record<string, ChainBlockExplorer>;
};

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
  degenscan: {
    mainnet: {
      name: "Degen Scan",
      url: "https://explorer.degen.tips/",
    },
  },
} as const;

export const networkDefinition = {
  gnosis: {
    name: "Gnosis Chain",
    id: chainIds.gnosis,
    supportsGDA: getSupportsGDA(chainIds.gnosis),
    metadata: ensureDefined(
      sfMeta.getNetworkByChainId(chainIds.gnosis),
      chainIds.gnosis
    ),
    blockExplorers: {
      etherscan: undefined!,
      default: blockExplorers.blockscout.gnosis,
    },
    slugName: "gnosis",
    v1ShortName: "xdai",
    network: "xdai",
    testnet: false,
    bufferTimeInMinutes: 240,
    icon: "/icons/network/gnosis.svg",
    color: "#04795b",
    rpcUrls: {
      superfluid: { http: [superfluidRpcUrls.gnosis] },
      default: { http: ["https://rpc.gnosischain.com/"] },
      public: { http: ["https://rpc.gnosischain.com/"] },
    },
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
    autoWrapSubgraphUrl: autoWrapSubgraphUrls.gnosis,
    platformUrl: superfluidPlatformUrls.gnosis,
    autoWrap: {
      managerContractAddress: autoWrapManagerAddresses[chain.gnosis.id],
      strategyContractAddress: autoWrapStrategyAddresses[chain.gnosis.id],
      lowerLimit: BigNumber.from(UnitOfTime.Day * 7),
      upperLimit: BigNumber.from(UnitOfTime.Day * 14),
    },
  },
  polygon: {
    ...chain.polygon,
    id: chainIds.polygon,
    supportsGDA: getSupportsGDA(chainIds.polygon),
    metadata: ensureDefined(
      sfMeta.getNetworkByChainId(chainIds.polygon),
      chainIds.polygon
    ),
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
    autoWrapSubgraphUrl: autoWrapSubgraphUrls.polygon,
    platformUrl: superfluidPlatformUrls.polygon,
    autoWrap: {
      managerContractAddress: autoWrapManagerAddresses[chain.polygon.id],
      strategyContractAddress: autoWrapStrategyAddresses[chain.polygon.id],
      lowerLimit: BigNumber.from(UnitOfTime.Day * 7),
      upperLimit: BigNumber.from(UnitOfTime.Day * 14),
    },
    humaFinance: {
      nftAddress: "0xa8B0362cfE0c8e4fd1D74c3512348d6f48d71080",
    },
  },
  avalancheFuji: {
    name: "Fuji (C-Chain)",
    id: chainIds.avalancheFuji,
    supportsGDA: getSupportsGDA(chainIds.avalancheFuji),
    metadata: ensureDefined(
      sfMeta.getNetworkByChainId(chainIds.avalancheFuji),
      chainIds.avalancheFuji
    ),
    slugName: "avalanche-fuji",
    v1ShortName: "avalanche-fuji",
    network: "avalanche-fuji",
    testnet: true,
    bufferTimeInMinutes: 60,
    color: "#2b374b",
    rpcUrls: {
      superfluid: { http: [superfluidRpcUrls.avalancheFuji] },
      default: { http: ["https://api.avax-test.network/ext/C/rpc"] },
      public: { http: ["https://api.avax-test.network/ext/C/rpc"] },
    },
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
        address: "0xffd0f6d73ee52c68bf1b01c8afa2529c97ca17f3",
        name: "Super AVAX",
        decimals: 18,
      },
    },
    flowSchedulerContractAddress: undefined,
    flowSchedulerSubgraphUrl: undefined,
    vestingContractAddress: undefined,
    vestingSubgraphUrl: undefined,
    autoWrapSubgraphUrl: undefined,
    platformUrl: undefined,
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
    id: chainIds.optimism,
    supportsGDA: getSupportsGDA(chainIds.optimism),
    metadata: ensureDefined(
      sfMeta.getNetworkByChainId(chainIds.optimism),
      chainIds.optimism
    ),
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
    autoWrapSubgraphUrl: autoWrapSubgraphUrls.optimism,
    platformUrl: superfluidPlatformUrls.optimism,
    autoWrap: {
      managerContractAddress: autoWrapManagerAddresses[chain.optimism.id],
      strategyContractAddress: autoWrapStrategyAddresses[chain.optimism.id],
      lowerLimit: BigNumber.from(UnitOfTime.Day * 7),
      upperLimit: BigNumber.from(UnitOfTime.Day * 14),
    },
  },
  arbitrum: {
    ...chain.arbitrum,
    id: chainIds.arbitrum,
    supportsGDA: getSupportsGDA(chainIds.arbitrum),
    metadata: ensureDefined(
      sfMeta.getNetworkByChainId(chainIds.arbitrum),
      chainIds.arbitrum
    ),
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
    autoWrapSubgraphUrl: autoWrapSubgraphUrls.arbitrum,
    platformUrl: superfluidPlatformUrls.arbitrum,
    autoWrap: {
      managerContractAddress: autoWrapManagerAddresses[chain.arbitrum.id],
      strategyContractAddress: autoWrapStrategyAddresses[chain.arbitrum.id],
      lowerLimit: BigNumber.from(UnitOfTime.Day * 7),
      upperLimit: BigNumber.from(UnitOfTime.Day * 14),
    },
  },
  avalancheC: {
    name: "Avalanche C",
    id: chainIds.avalanche,
    supportsGDA: getSupportsGDA(chainIds.avalanche),
    metadata: ensureDefined(
      sfMeta.getNetworkByChainId(chainIds.avalanche),
      chainIds.avalanche
    ),
    slugName: "avalanche",
    v1ShortName: "avalanche-c",
    network: "avalanche-c",
    testnet: false,
    bufferTimeInMinutes: 240,
    icon: "/icons/network/avalanche.svg",
    color: "#e84142",
    rpcUrls: {
      superfluid: { http: [superfluidRpcUrls.avalancheC] },
      default: { http: ["https://api.avax.network/ext/bc/C/rpc"] },
      public: { http: ["https://api.avax.network/ext/bc/C/rpc"] },
    },
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
    autoWrapSubgraphUrl: autoWrapSubgraphUrls.avalancheC,
    platformUrl: superfluidPlatformUrls.avalancheC,
    autoWrap: {
      managerContractAddress: autoWrapManagerAddresses[chain.avalanche.id],
      strategyContractAddress: autoWrapStrategyAddresses[chain.avalanche.id],
      lowerLimit: BigNumber.from(UnitOfTime.Day * 7),
      upperLimit: BigNumber.from(UnitOfTime.Day * 14),
    },
  },
  bsc: {
    ...chain.bsc,
    id: chainIds.bsc,
    supportsGDA: getSupportsGDA(chainIds.bsc),
    metadata: ensureDefined(
      sfMeta.getNetworkByChainId(chainIds.bsc),
      chainIds.bsc
    ),
    name: "BNB Smart Chain",
    slugName: "bsc",
    v1ShortName: "bsc-mainnet",
    network: "bnb-smart-chain",
    bufferTimeInMinutes: 240,
    icon: "/icons/network/bnb.svg",
    color: "#F0B90B",
    rpcUrls: {
      superfluid: { http: [superfluidRpcUrls.bnbSmartChain] },
      default: { http: ["https://bsc-dataseed1.binance.org"] },
      public: { http: ["https://bsc-dataseed1.binance.org"] },
    },
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
    autoWrapSubgraphUrl: autoWrapSubgraphUrls.bnbSmartChain,
    platformUrl: superfluidPlatformUrls.bnbSmartChain,
    autoWrap: {
      managerContractAddress: autoWrapManagerAddresses[chain.bsc.id],
      strategyContractAddress: autoWrapStrategyAddresses[chain.bsc.id],
      lowerLimit: BigNumber.from(UnitOfTime.Day * 7),
      upperLimit: BigNumber.from(UnitOfTime.Day * 14),
    },
  },
  ethereum: {
    ...chain.mainnet,
    id: chainIds.mainnet,
    supportsGDA: getSupportsGDA(chainIds.mainnet),
    metadata: ensureDefined(
      sfMeta.getNetworkByChainId(chainIds.mainnet),
      chainIds.mainnet
    ),
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
    autoWrapSubgraphUrl: autoWrapSubgraphUrls.ethereum,
    platformUrl: superfluidPlatformUrls.ethereum,
    autoWrap: {
      managerContractAddress: autoWrapManagerAddresses[chain.mainnet.id],
      strategyContractAddress: autoWrapStrategyAddresses[chain.mainnet.id],
      lowerLimit: BigNumber.from(UnitOfTime.Day * 7),
      upperLimit: BigNumber.from(UnitOfTime.Day * 28),
    },
  },
  celoMainnet: {
    ...chain.celo,
    id: chainIds.celo,
    supportsGDA: getSupportsGDA(chainIds.celo),
    metadata: ensureDefined(
      sfMeta.getNetworkByChainId(chainIds.celo),
      chainIds.celo
    ),
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
    autoWrapSubgraphUrl: undefined,
    platformUrl: undefined,
  },
  degenChain: {
    name: 'Degen Chain',
    network: 'degen-chain',
    id: 666666666,
    supportsGDA: getSupportsGDA(chainIds.degen),
    metadata: ensureDefined(
      sfMeta.getNetworkByChainId(chainIds.degen),
      chainIds.degen
    ),
    blockExplorers: {
      degenscan: blockExplorers.degenscan.mainnet,
      default: blockExplorers.degenscan.mainnet,
    },
    slugName: "degen",
    v1ShortName: "degen",
    bufferTimeInMinutes: 240,
    icon: "/icons/network/degen.svg",
    color: "#A46EFD",
    rpcUrls: {
        default: { http: ['https://rpc.degen.tips'] },
        public: {
          http: ['https://rpc.degen.tips'],
      },
      superfluid: { http: [superfluidRpcUrls["degenChain"]] },
    },
    fallbackSubgraphUrl:
      "https://degenchain.subgraph.superfluid.dev",
    getLinkForTransaction: (txHash: string): string =>
      `https://explorer.degen.tips/tx/${txHash}`,
    getLinkForAddress: (address: string): string =>
      `https://explorer.degen.tips/address/${address}`,
    nativeCurrency: {
      name: 'Degen',
      symbol: 'DEGEN', 
      decimals: 18 ,
      address: NATIVE_ASSET_ADDRESS,
      type: TokenType.NativeAssetUnderlyingToken,
      superToken: {
        type: TokenType.NativeAssetSuperToken,
        symbol: "DEGENx",
        address: "0xda58FA9bfc3D3960df33ddD8D4d762Cf8Fa6F7ad",
        name: "Super DEGEN",
        decimals: 18,
      },
    },
    vestingContractAddress: undefined,
    vestingSubgraphUrl: undefined,
    autoWrapSubgraphUrl: undefined,
    platformUrl: undefined,
  },
  sepolia: {
    ...chain.sepolia,
    id: chainIds.sepolia,
    supportsGDA: getSupportsGDA(chainIds.sepolia),
    metadata: ensureDefined(
      sfMeta.getNetworkByChainId(chainIds.sepolia),
      chainIds.sepolia
    ),
    blockExplorers: ensureDefined(chain.sepolia.blockExplorers),
    slugName: "sepolia",
    v1ShortName: "sepolia",
    bufferTimeInMinutes: 60,
    color: "#68B1D5",
    rpcUrls: {
      ...chain.sepolia.rpcUrls,
      superfluid: { http: [superfluidRpcUrls.sepolia] },
    },
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
    vestingContractAddress: undefined,
    vestingSubgraphUrl: undefined,
    autoWrapSubgraphUrl: undefined,
    platformUrl: undefined,
  },
  base: {
    ...chain.base,
    id: chainIds.base,
    supportsGDA: getSupportsGDA(chainIds.base),
    metadata: ensureDefined(
      sfMeta.getNetworkByChainId(chainIds.base),
      chainIds.base
    ),
    blockExplorers: ensureDefined(chain.base.blockExplorers),
    slugName: "base",
    v1ShortName: "base",
    bufferTimeInMinutes: 240,
    color: "#68B1D5",
    icon: "/icons/network/base.svg",
    rpcUrls: {
      ...chain.base.rpcUrls,
      superfluid: { http: [superfluidRpcUrls["base"]] },
    },
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
    vestingContractAddress: vestingContractAddresses.base,
    vestingSubgraphUrl: vestingSubgraphUrls.base,
    autoWrapSubgraphUrl: autoWrapSubgraphUrls.base,
    autoWrap: {
      managerContractAddress: autoWrapManagerAddresses[chain.base.id],
      strategyContractAddress: autoWrapStrategyAddresses[chain.base.id],
      lowerLimit: BigNumber.from(UnitOfTime.Day * 7),
      upperLimit: BigNumber.from(UnitOfTime.Day * 14),
    },
    flowSchedulerContractAddress: flowSchedulerContractAddresses.base,
    flowSchedulerSubgraphUrl: flowSchedulerSubgraphUrls.base,
    platformUrl: superfluidPlatformUrls.base,
  },
  scroll: {
    ...chain.scroll,
    id: chainIds.scroll,
    supportsGDA: getSupportsGDA(chainIds.scroll),
    metadata: ensureDefined(
      sfMeta.getNetworkByChainId(chainIds.scroll),
      chainIds.scroll
    ),
    blockExplorers: ensureDefined(chain.scroll.blockExplorers),
    slugName: "scroll",
    v1ShortName: "scroll",
    bufferTimeInMinutes: 240,
    color: "#fdf1e6",
    icon: "/icons/network/scroll.svg",
    rpcUrls: {
      ...chain.scroll.rpcUrls,
      superfluid: { http: [superfluidRpcUrls["scroll"]] },
    },
    getLinkForTransaction: (txHash: string): string =>
      `https://scrollscan.com/tx/${txHash}`,
    getLinkForAddress: (address: string): string =>
      `https://scrollscan.com/address/${address}`,
    nativeCurrency: {
      ...ensureDefined(chain.scroll.nativeCurrency),
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
    vestingContractAddress: undefined,
    vestingSubgraphUrl: undefined,
    autoWrapSubgraphUrl: undefined,
    platformUrl: undefined,
  },
  scrollSepolia: {
    ...chain.scrollSepolia,
    id: chainIds.scrollSepolia,
    supportsGDA: getSupportsGDA(chainIds.scrollSepolia),
    metadata: ensureDefined(
      sfMeta.getNetworkByChainId(chainIds.scrollSepolia),
      chainIds.scrollSepolia
    ),
    blockExplorers: ensureDefined(chain.scrollSepolia.blockExplorers),
    slugName: "scrsepolia",
    v1ShortName: "scrsepolia",
    bufferTimeInMinutes: 60,
    color: "#fdf1e6",
    rpcUrls: {
      ...chain.scrollSepolia.rpcUrls,
      superfluid: { http: [superfluidRpcUrls["scroll-sepolia"]] },
    },
    getLinkForTransaction: (txHash: string): string =>
      `https://sepolia.scrollscan.com/tx/${txHash}`,
    getLinkForAddress: (address: string): string =>
      `https://sepolia.scrollscan.com/address/${address}`,
    nativeCurrency: {
      ...ensureDefined(chain.scrollSepolia.nativeCurrency),
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
    vestingContractAddress: undefined,
    vestingSubgraphUrl: undefined,
    autoWrapSubgraphUrl: undefined,
    platformUrl: undefined,
  },
  optimismSepolia: {
    ...chain.optimismSepolia,
    id: chainIds.optimismSepolia,
    supportsGDA: getSupportsGDA(chainIds.optimismSepolia),
    metadata: ensureDefined(
      sfMeta.getNetworkByChainId(chainIds.optimismSepolia),
      chainIds.optimismSepolia
    ),
    testnet: true,
    blockExplorers: ensureDefined(chain.optimismSepolia.blockExplorers),
    slugName: "opsepolia",
    v1ShortName: "opsepolia",
    bufferTimeInMinutes: 60,
    color: "#FF0320",
    rpcUrls: {
      ...chain.optimismSepolia.rpcUrls,
      superfluid: { http: [superfluidRpcUrls["optimism-sepolia"]] },
    },
    getLinkForTransaction: (txHash: string): string =>
      `https://sepolia-optimism.etherscan.io/tx/${txHash}`,
    getLinkForAddress: (address: string): string =>
      `https://sepolia-optimism.etherscan.io/address/${address}`,
    nativeCurrency: {
      ...ensureDefined(chain.optimismSepolia.nativeCurrency),
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
    vestingContractAddress: vestingContractAddresses.optimismSepolia,
    vestingSubgraphUrl: vestingSubgraphUrls.optimismSepolia,
    autoWrapSubgraphUrl: autoWrapSubgraphUrls.optimismSepolia,
    autoWrap: {
      managerContractAddress: autoWrapManagerAddresses[chain.optimismSepolia.id],
      strategyContractAddress: autoWrapStrategyAddresses[chain.optimismSepolia.id],
      lowerLimit: BigNumber.from(UnitOfTime.Day * 7),
      upperLimit: BigNumber.from(UnitOfTime.Day * 14),
    },
    flowSchedulerContractAddress: flowSchedulerContractAddresses.optimismSepolia,
    flowSchedulerSubgraphUrl: flowSchedulerSubgraphUrls.optimismSepolia,
    platformUrl: undefined,
  },
} as const satisfies Record<string, Network>;

export const allNetworks: Network[] = orderBy(
  orderBy(
    [
      networkDefinition.ethereum,
      networkDefinition.gnosis,
      networkDefinition.polygon,
      networkDefinition.avalancheFuji,
      networkDefinition.optimism,
      networkDefinition.optimismSepolia,
      networkDefinition.arbitrum,
      networkDefinition.avalancheC,
      networkDefinition.bsc,
      networkDefinition.celoMainnet,
      networkDefinition.sepolia,
      networkDefinition.base,
      networkDefinition.scroll,
      networkDefinition.scrollSepolia,
      networkDefinition.degenChain,
    ],
    (x) => x.id // Put lower ids first (Ethereum mainnet will be first)
  ),
  (x) => !!(x as { testnet?: boolean }).testnet // Put non-testnets first
);

export const mainNetworks = allNetworks.filter((x) => !x.testnet);
export const testNetworks = allNetworks.filter((x) => x.testnet);

export const tryFindNetwork = (
  networks: ReadonlyArray<Network>,
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
  networks: ReadonlyArray<Network>,
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
  .filter(
    (network) => network.vestingContractAddress
  )
  .sort((n1, n2) => (!n1.testnet && n2.testnet ? -1 : 1));

export const deprecatedNetworkChainIds = [
  80001, // Polygon Mumbai
  5, // Goerli
  420, // Optimism Goerli
  421613, // Arbitrum Goerli
  1442, // Polygon zkEVM Testnet
  84531, // Base Goerli
];