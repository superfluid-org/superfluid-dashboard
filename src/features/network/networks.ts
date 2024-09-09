import { isString, orderBy } from "lodash";
import memoize from "lodash/memoize";
import * as chain from "wagmi/chains";
import { Chain } from "wagmi/chains";
import ensureDefined from "../../utils/ensureDefined";
import {
  NATIVE_ASSET_ADDRESS,
  NativeAsset,
  SuperTokenMinimal,
  SuperTokenPair,
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
  superfluidRpcUrls,
  vestingContractAddresses_v1,
  vestingContractAddresses_v2,
  vestingSubgraphUrls,
} from "./networkConstants";
import { BigNumber, BigNumberish } from "ethers";
import { UnitOfTime } from "../send/FlowRateInput";
import { extendedSuperTokenList } from "@superfluid-finance/tokenlist";

const getMetadata = memoize((chainId: number) => {
  const metadata = sfMeta.getNetworkByChainId(chainId);
  if (!metadata) {
    throw new Error(`No metadata for chainId ${chainId}`);
  }
  return metadata;
});

const getSupportsGDA = (chainId: number) => {
  const metadata = getMetadata(chainId);
  return Boolean(metadata.contractsV1.gdaV1);
};

const findNativeAssetSuperTokenFromTokenList = (input: { chainId: number, address: string }) => {
  // Note: there's also a generic function similar to this in the project. The problem with that one is that I got into circular dependency issue.

  const token = extendedSuperTokenList.tokens.find(x => x.chainId === input.chainId && x.address === input.address.toLowerCase());
  if (!token) {
    throw new Error(`No native asset super token found for chainId ${input.chainId} and address ${input.address}`);
  }

  const superTokenInfo = token.extensions?.superTokenInfo;
  if (!superTokenInfo) {
    throw new Error(`No super token info found for token ${token.address}`);
  }

  return {
    address: token.address,
    name: token.name,
    symbol: token.symbol,
    decimals: token.decimals,
    isSuperToken: true,
    type: TokenType.NativeAssetSuperToken,
    underlyingAddress: NATIVE_ASSET_ADDRESS,
    logoURI: token.logoURI
  } as SuperTokenMinimal;
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
  nativeCurrency: Chain["nativeCurrency"] & NativeAsset & {
    superToken: SuperTokenMinimal;
    logoURI: string;
  };
  supportsGDA: boolean;
  flowSchedulerContractAddress?: `0x${string}`;
  flowSchedulerSubgraphUrl?: `https://${string}` | undefined;
  vestingContractAddress_v1: `0x${string}` | undefined;
  vestingContractAddress_v2: `0x${string}` | undefined;
  vestingSubgraphUrl: `https://${string}` | undefined;
  autoWrapSubgraphUrl: `https://${string}` | undefined;
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
  blockExplorers: Chain["blockExplorers"];
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
    ...chain.gnosis,
    supportsGDA: getSupportsGDA(chainIds.gnosis),
    metadata: ensureDefined(
      sfMeta.getNetworkByChainId(chainIds.gnosis),
      chainIds.gnosis
    ),
    blockExplorers: {
      ...chain.gnosis.blockExplorers,
      default: blockExplorers.blockscout.gnosis,
    },
    slugName: "gnosis",
    v1ShortName: "xdai",
    testnet: false,
    bufferTimeInMinutes: 240,
    icon: "/icons/network/gnosis.svg",
    color: "#04795b",
    rpcUrls: {
      ...chain.gnosis.rpcUrls,
      superfluid: { http: [superfluidRpcUrls.gnosis] }
    },
    getLinkForTransaction: (txHash: string): string =>
      `https://blockscout.com/xdai/mainnet/tx/${txHash}`,
    getLinkForAddress: (address: string): string =>
      `https://blockscout.com/xdai/mainnet/address/${address}`,
    nativeCurrency: {
      ...ensureDefined(chain.gnosis.nativeCurrency),
      address: NATIVE_ASSET_ADDRESS,
      type: TokenType.NativeAssetUnderlyingToken,
      superToken: ensureDefined(findNativeAssetSuperTokenFromTokenList({ chainId: chain.gnosis.id, address: "0x59988e47a3503aafaa0368b9def095c818fdca01" })),
      logoURI: "https://raw.githubusercontent.com/superfluid-finance/assets/master/public/tokens/xdai/icon.svg",
      isSuperToken: false,
    },
    flowSchedulerContractAddress: flowSchedulerContractAddresses.gnosis,
    flowSchedulerSubgraphUrl: flowSchedulerSubgraphUrls.gnosis,
    vestingContractAddress_v1: vestingContractAddresses_v1.gnosis,
    vestingContractAddress_v2: undefined,
    vestingSubgraphUrl: vestingSubgraphUrls.gnosis,
    autoWrapSubgraphUrl: autoWrapSubgraphUrls.gnosis,
    autoWrap: {
      managerContractAddress: autoWrapManagerAddresses[chain.gnosis.id],
      strategyContractAddress: autoWrapStrategyAddresses[chain.gnosis.id],
      lowerLimit: BigNumber.from(UnitOfTime.Day * 7),
      upperLimit: BigNumber.from(UnitOfTime.Day * 14),
    },
  },
  polygon: {
    ...chain.polygon,
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
      superToken: ensureDefined(findNativeAssetSuperTokenFromTokenList({ chainId: chain.polygon.id, address: "0x3aD736904E9e65189c3000c7DD2c8AC8bB7cD4e3" })),
      logoURI: "https://raw.githubusercontent.com/superfluid-finance/assets/master/public/tokens/matic/icon.svg",
      isSuperToken: false,
    },
    flowSchedulerContractAddress: flowSchedulerContractAddresses.polygon,
    flowSchedulerSubgraphUrl: flowSchedulerSubgraphUrls.polygon,
    vestingContractAddress_v1: vestingContractAddresses_v1.polygon,
    vestingContractAddress_v2: undefined,
    vestingSubgraphUrl: vestingSubgraphUrls.polygon,
    autoWrapSubgraphUrl: autoWrapSubgraphUrls.polygon,
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
    ...chain.avalancheFuji,
    supportsGDA: getSupportsGDA(chainIds.avalancheFuji),
    metadata: ensureDefined(
      sfMeta.getNetworkByChainId(chainIds.avalancheFuji),
      chainIds.avalancheFuji
    ),
    slugName: "avalanche-fuji",
    v1ShortName: "avalanche-fuji",
    testnet: true,
    bufferTimeInMinutes: 60,
    color: "#e84142",
    rpcUrls: {
      ...chain.avalancheFuji.rpcUrls,
      superfluid: { http: [superfluidRpcUrls.avalancheFuji] }
    },
    getLinkForTransaction: (txHash: string): string =>
      `https://testnet.snowtrace.io/tx/${txHash}`,
    getLinkForAddress: (address: string): string =>
      `https://testnet.snowtrace.io/address/${address}`,
    blockExplorers: {
      ...chain.avalancheFuji.blockExplorers,
      default: blockExplorers.snowtrace.avalancheFuji,
    },
    nativeCurrency: {
      ...ensureDefined(chain.avalancheFuji.nativeCurrency),
      address: NATIVE_ASSET_ADDRESS,
      type: TokenType.NativeAssetUnderlyingToken,
      superToken: ensureDefined(findNativeAssetSuperTokenFromTokenList({ chainId: chain.avalancheFuji.id, address: "0xfFD0f6d73ee52c68BF1b01C8AfA2529C97ca17F3" })),
      logoURI: "https://raw.githubusercontent.com/superfluid-finance/assets/master/public/tokens/avax/icon.svg",
      isSuperToken: false,
    },
    flowSchedulerContractAddress: undefined,
    flowSchedulerSubgraphUrl: undefined,
    vestingContractAddress_v1: undefined,
    vestingContractAddress_v2: undefined,
    vestingSubgraphUrl: undefined,
    autoWrapSubgraphUrl: undefined,
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
      superToken: ensureDefined(findNativeAssetSuperTokenFromTokenList({ chainId: chain.optimism.id, address: "0x4ac8bd1bdae47beef2d1c6aa62229509b962aa0d" })),
      logoURI: "https://raw.githubusercontent.com/superfluid-finance/assets/master/public/tokens/eth/icon.svg",
      isSuperToken: false,
    },
    flowSchedulerContractAddress: flowSchedulerContractAddresses.optimism,
    flowSchedulerSubgraphUrl: flowSchedulerSubgraphUrls.optimism,
    vestingContractAddress_v1: vestingContractAddresses_v1.optimism,
    vestingContractAddress_v2: vestingContractAddresses_v2.optimism,
    vestingSubgraphUrl: vestingSubgraphUrls.optimism,
    autoWrapSubgraphUrl: autoWrapSubgraphUrls.optimism,
    autoWrap: {
      managerContractAddress: autoWrapManagerAddresses[chain.optimism.id],
      strategyContractAddress: autoWrapStrategyAddresses[chain.optimism.id],
      lowerLimit: BigNumber.from(UnitOfTime.Day * 7),
      upperLimit: BigNumber.from(UnitOfTime.Day * 14),
    },
  },
  arbitrum: {
    ...chain.arbitrum,
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
      superToken: ensureDefined(findNativeAssetSuperTokenFromTokenList({ chainId: chain.arbitrum.id, address: "0xe6c8d111337d0052b9d88bf5d7d55b7f8385acd3" })),
      logoURI: "https://raw.githubusercontent.com/superfluid-finance/assets/master/public/tokens/eth/icon.svg",
      isSuperToken: false,
    },
    flowSchedulerContractAddress: flowSchedulerContractAddresses.arbitrum,
    flowSchedulerSubgraphUrl: flowSchedulerSubgraphUrls.arbitrum,
    vestingContractAddress_v1: vestingContractAddresses_v1.arbitrum,
    vestingContractAddress_v2: undefined,
    vestingSubgraphUrl: vestingSubgraphUrls.arbitrum,
    autoWrapSubgraphUrl: autoWrapSubgraphUrls.arbitrum,
    autoWrap: {
      managerContractAddress: autoWrapManagerAddresses[chain.arbitrum.id],
      strategyContractAddress: autoWrapStrategyAddresses[chain.arbitrum.id],
      lowerLimit: BigNumber.from(UnitOfTime.Day * 7),
      upperLimit: BigNumber.from(UnitOfTime.Day * 14),
    },
  },
  avalancheC: {
    ...chain.avalanche,
    supportsGDA: getSupportsGDA(chainIds.avalanche),
    metadata: ensureDefined(
      sfMeta.getNetworkByChainId(chainIds.avalanche),
      chainIds.avalanche
    ),
    slugName: "avalanche",
    v1ShortName: "avalanche-c",
    testnet: false,
    bufferTimeInMinutes: 240,
    icon: "/icons/network/avalanche.svg",
    color: "#e84142",
    rpcUrls: {
      ...chain.avalanche.rpcUrls,
      superfluid: { http: [superfluidRpcUrls.avalancheC] },
    },
    getLinkForTransaction: (txHash: string): string =>
      `https://avascan.info/blockchain/c/tx/${txHash}`,
    getLinkForAddress: (address: string): string =>
      `https://avascan.info/blockchain/c/address/${address}`,
    blockExplorers: {
      ...chain.avalanche.blockExplorers,
      default: blockExplorers.avascan.avalancheC
    },
    nativeCurrency: {
      ...ensureDefined(chain.avalanche.nativeCurrency),
      address: NATIVE_ASSET_ADDRESS,
      type: TokenType.NativeAssetUnderlyingToken,
      superToken: ensureDefined(findNativeAssetSuperTokenFromTokenList({ chainId: chain.avalanche.id, address: "0xBE916845D8678b5d2F7aD79525A62D7c08ABba7e" })),
      logoURI: "https://raw.githubusercontent.com/superfluid-finance/assets/master/public/tokens/avax/icon.svg",
      isSuperToken: false,
    },
    flowSchedulerContractAddress: flowSchedulerContractAddresses.avalancheC,
    flowSchedulerSubgraphUrl: flowSchedulerSubgraphUrls.avalancheC,
    vestingContractAddress_v1: vestingContractAddresses_v1.avalancheC,
    vestingContractAddress_v2: undefined,
    vestingSubgraphUrl: vestingSubgraphUrls.avalancheC,
    autoWrapSubgraphUrl: autoWrapSubgraphUrls.avalancheC,
    autoWrap: {
      managerContractAddress: autoWrapManagerAddresses[chain.avalanche.id],
      strategyContractAddress: autoWrapStrategyAddresses[chain.avalanche.id],
      lowerLimit: BigNumber.from(UnitOfTime.Day * 7),
      upperLimit: BigNumber.from(UnitOfTime.Day * 14),
    },
  },
  bsc: {
    ...chain.bsc,
    supportsGDA: getSupportsGDA(chainIds.bsc),
    metadata: ensureDefined(
      sfMeta.getNetworkByChainId(chainIds.bsc),
      chainIds.bsc
    ),
    name: "BNB Smart Chain",
    slugName: "bsc",
    v1ShortName: "bsc-mainnet",
    bufferTimeInMinutes: 240,
    icon: "/icons/network/bnb.svg",
    color: "#F0B90B",
    rpcUrls: {
      ...chain.bsc.rpcUrls,
      superfluid: { http: [superfluidRpcUrls.bnbSmartChain] },
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
      ...ensureDefined(chain.bsc.nativeCurrency),
      address: NATIVE_ASSET_ADDRESS,
      type: TokenType.NativeAssetUnderlyingToken,
      superToken: ensureDefined(findNativeAssetSuperTokenFromTokenList({ chainId: chain.bsc.id, address: "0x529a4116f160c833c61311569d6b33dff41fd657" })),
      logoURI: "https://raw.githubusercontent.com/superfluid-finance/assets/master/public/tokens/bnb/icon.svg",
      isSuperToken: false,
    },
    flowSchedulerContractAddress: flowSchedulerContractAddresses.bnbSmartChain,
    flowSchedulerSubgraphUrl: flowSchedulerSubgraphUrls.bnbSmartChain,
    vestingContractAddress_v1: vestingContractAddresses_v1.bnbSmartChain,
    vestingContractAddress_v2: undefined,
    vestingSubgraphUrl: vestingSubgraphUrls.bnbSmartChain,
    autoWrapSubgraphUrl: autoWrapSubgraphUrls.bnbSmartChain,
    autoWrap: {
      managerContractAddress: autoWrapManagerAddresses[chain.bsc.id],
      strategyContractAddress: autoWrapStrategyAddresses[chain.bsc.id],
      lowerLimit: BigNumber.from(UnitOfTime.Day * 7),
      upperLimit: BigNumber.from(UnitOfTime.Day * 14),
    },
  },
  ethereum: {
    ...chain.mainnet,
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
      superToken: ensureDefined(findNativeAssetSuperTokenFromTokenList({ chainId: chain.mainnet.id, address: "0xC22BeA0Be9872d8B7B3933CEc70Ece4D53A900da" })),
      logoURI: "https://raw.githubusercontent.com/superfluid-finance/assets/master/public/tokens/eth/icon.svg",
      isSuperToken: false,
    },
    flowSchedulerContractAddress: flowSchedulerContractAddresses.ethereum,
    flowSchedulerSubgraphUrl: flowSchedulerSubgraphUrls.ethereum,
    vestingContractAddress_v1: vestingContractAddresses_v1.ethereum,
    vestingContractAddress_v2: undefined,
    vestingSubgraphUrl: vestingSubgraphUrls.ethereum,
    autoWrapSubgraphUrl: autoWrapSubgraphUrls.ethereum,
    autoWrap: {
      managerContractAddress: autoWrapManagerAddresses[chain.mainnet.id],
      strategyContractAddress: autoWrapStrategyAddresses[chain.mainnet.id],
      lowerLimit: BigNumber.from(UnitOfTime.Day * 7),
      upperLimit: BigNumber.from(UnitOfTime.Day * 28),
    },
  },
  celoMainnet: {
    ...chain.celo,
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
      superToken: ensureDefined(findNativeAssetSuperTokenFromTokenList({ chainId: chain.celo.id, address: "0x671425Ae1f272Bc6F79beC3ed5C4b00e9c628240" })),
      logoURI: "https://raw.githubusercontent.com/superfluid-finance/assets/master/public/tokens/celo/icon.svg",
      isSuperToken: false,
    },
    vestingContractAddress_v1: undefined,
    vestingContractAddress_v2: undefined,
    vestingSubgraphUrl: undefined,
    autoWrapSubgraphUrl: undefined,
  },
  degenChain: {
    ...chain.degen,
    supportsGDA: getSupportsGDA(chainIds.degen),
    metadata: ensureDefined(
      sfMeta.getNetworkByChainId(chainIds.degen),
      chainIds.degen
    ),
    blockExplorers: {
      ...chain.degen.blockExplorers,
      default: blockExplorers.degenscan.mainnet,
    },
    slugName: "degen",
    v1ShortName: "degen",
    bufferTimeInMinutes: 240,
    icon: "/icons/network/degen.svg",
    color: "#A46EFD",
    rpcUrls: {
      ...chain.degen.rpcUrls,
      superfluid: { http: [superfluidRpcUrls["degenChain"]] },
    },
    fallbackSubgraphUrl:
      "https://degenchain.subgraph.superfluid.dev",
    getLinkForTransaction: (txHash: string): string =>
      `https://explorer.degen.tips/tx/${txHash}`,
    getLinkForAddress: (address: string): string =>
      `https://explorer.degen.tips/address/${address}`,
    nativeCurrency: {
      ...ensureDefined(chain.degen.nativeCurrency),
      address: NATIVE_ASSET_ADDRESS,
      type: TokenType.NativeAssetUnderlyingToken,
      superToken: ensureDefined(findNativeAssetSuperTokenFromTokenList({ chainId: chain.degen.id, address: "0xda58FA9bfc3D3960df33ddD8D4d762Cf8Fa6F7ad" })),
      logoURI: "https://raw.githubusercontent.com/superfluid-finance/assets/master/public/tokens/degen/icon.png",
      isSuperToken: false,
    },
    vestingContractAddress_v1: undefined,
    vestingContractAddress_v2: undefined,
    vestingSubgraphUrl: undefined,
    autoWrapSubgraphUrl: undefined,
  },
  sepolia: {
    ...chain.sepolia,
    supportsGDA: getSupportsGDA(chainIds.sepolia),
    metadata: ensureDefined(
      sfMeta.getNetworkByChainId(chainIds.sepolia),
      chainIds.sepolia
    ),
    blockExplorers: ensureDefined(chain.sepolia.blockExplorers),
    slugName: "sepolia",
    v1ShortName: "sepolia",
    bufferTimeInMinutes: 60,
    color: "#627EEA",
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
      superToken: ensureDefined(findNativeAssetSuperTokenFromTokenList({ chainId: chain.sepolia.id, address: "0x30a6933Ca9230361972E413a15dC8114c952414e" })),
      logoURI: "https://raw.githubusercontent.com/superfluid-finance/assets/master/public/tokens/eth/icon.svg",
      isSuperToken: false,
    },
    vestingContractAddress_v1: undefined,
    vestingContractAddress_v2: undefined,
    vestingSubgraphUrl: undefined,
    autoWrapSubgraphUrl: undefined,
  },
  base: {
    ...chain.base,
    supportsGDA: getSupportsGDA(chainIds.base),
    metadata: ensureDefined(
      sfMeta.getNetworkByChainId(chainIds.base),
      chainIds.base
    ),
    blockExplorers: ensureDefined(chain.base.blockExplorers),
    slugName: "base",
    v1ShortName: "base",
    bufferTimeInMinutes: 240,
    color: "#0057F7",
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
      superToken: ensureDefined(findNativeAssetSuperTokenFromTokenList({ chainId: chain.base.id, address: "0x46fd5cfB4c12D87acD3a13e92BAa53240C661D93" })),
      logoURI: "https://raw.githubusercontent.com/superfluid-finance/assets/master/public/tokens/eth/icon.svg",
      isSuperToken: false,
    },
    vestingContractAddress_v1: vestingContractAddresses_v1.base,
    vestingContractAddress_v2: undefined,
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
  },
  baseSepolia: {
    ...chain.baseSepolia,
    supportsGDA: getSupportsGDA(chainIds.baseSepolia),
    metadata: ensureDefined(
      sfMeta.getNetworkByChainId(chainIds.baseSepolia),
      chainIds.baseSepolia
    ),
    blockExplorers: ensureDefined(chain.baseSepolia.blockExplorers),
    slugName: "base-sepolia",
    v1ShortName: "base-sepolia",
    bufferTimeInMinutes: 60,
    color: "#0057F7",
    icon: "/icons/network/base.svg",
    rpcUrls: {
      ...chain.baseSepolia.rpcUrls,
      superfluid: { http: [superfluidRpcUrls["base-sepolia"]] },
    },
    getLinkForTransaction: (txHash: string): string =>
      `https://sepolia.basescan.org/tx/${txHash}`,
    getLinkForAddress: (address: string): string =>
      `https://sepolia.basescan.org/address/${address}`,
    nativeCurrency: {
      ...ensureDefined(chain.baseSepolia.nativeCurrency),
      address: NATIVE_ASSET_ADDRESS,
      type: TokenType.NativeAssetUnderlyingToken,
      superToken: ensureDefined(findNativeAssetSuperTokenFromTokenList({ chainId: chain.baseSepolia.id, address: "0x143ea239159155b408e71cdbe836e8cfd6766732" })),
      logoURI: "https://raw.githubusercontent.com/superfluid-finance/assets/master/public/tokens/eth/icon.svg",
      isSuperToken: false,
    },
    vestingContractAddress_v1: undefined,
    vestingContractAddress_v2: undefined,
    vestingSubgraphUrl: undefined,
    autoWrapSubgraphUrl: undefined,
    autoWrap: undefined,
    flowSchedulerContractAddress: undefined,
    flowSchedulerSubgraphUrl: undefined,
  },
  scroll: {
    ...chain.scroll,
    supportsGDA: getSupportsGDA(chainIds.scroll),
    metadata: ensureDefined(
      sfMeta.getNetworkByChainId(chainIds.scroll),
      chainIds.scroll
    ),
    blockExplorers: ensureDefined(chain.scroll.blockExplorers),
    slugName: "scroll",
    v1ShortName: "scroll",
    bufferTimeInMinutes: 240,
    color: "#EECDA6",
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
      superToken: ensureDefined(findNativeAssetSuperTokenFromTokenList({ chainId: chain.scroll.id, address: "0x483C1716b6133cdA01237ebBF19c5a92898204B7" })),
      logoURI: "https://raw.githubusercontent.com/superfluid-finance/assets/master/public/tokens/eth/icon.svg",
      isSuperToken: false,
    },
    vestingContractAddress_v1: undefined,
    vestingContractAddress_v2: undefined,
    vestingSubgraphUrl: undefined,
    autoWrapSubgraphUrl: undefined,
  },
  scrollSepolia: {
    ...chain.scrollSepolia,
    supportsGDA: getSupportsGDA(chainIds.scrollSepolia),
    metadata: ensureDefined(
      sfMeta.getNetworkByChainId(chainIds.scrollSepolia),
      chainIds.scrollSepolia
    ),
    blockExplorers: ensureDefined(chain.scrollSepolia.blockExplorers),
    slugName: "scrsepolia",
    v1ShortName: "scrsepolia",
    bufferTimeInMinutes: 60,
    color: "#EECDA6",
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
      superToken: ensureDefined(findNativeAssetSuperTokenFromTokenList({ chainId: chain.scrollSepolia.id, address: "0x58f0A7c6c143074f5D824c2f27a85f6dA311A6FB" })),
      logoURI: "https://raw.githubusercontent.com/superfluid-finance/assets/master/public/tokens/eth/icon.svg",
      isSuperToken: false,
    },
    vestingContractAddress_v1: undefined,
    vestingContractAddress_v2: undefined,
    vestingSubgraphUrl: undefined,
    autoWrapSubgraphUrl: undefined,
  },
  optimismSepolia: {
    ...chain.optimismSepolia,
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
      superToken: ensureDefined(findNativeAssetSuperTokenFromTokenList({ chainId: chain.optimismSepolia.id, address: "0x0043d7c85C8b96a49A72A92C0B48CdC4720437d7" })),
      logoURI: "https://raw.githubusercontent.com/superfluid-finance/assets/master/public/tokens/eth/icon.svg",
      isSuperToken: false,
    },
    vestingContractAddress_v1: vestingContractAddresses_v1.optimismSepolia,
    vestingContractAddress_v2: vestingContractAddresses_v2.optimismSepolia,
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
  },
} as const satisfies Record<string, Network>;

export const allNetworks: [Network, ...Network[]] = orderBy(
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
      networkDefinition.baseSepolia,
      networkDefinition.scroll,
      networkDefinition.scrollSepolia,
      networkDefinition.degenChain,
    ],
    (x) => x.id // Put lower ids first (Ethereum mainnet will be first)
  ),
  (x) => !!(x as { testnet?: boolean }).testnet // Put non-testnets first
) as unknown as [Network, ...Network[]]; // The weird cast is because wagmi expects an array type with atleast one element.

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

export const getNetworkDefaultTokenPairs = memoize(
  (network: Network): SuperTokenPair[] => ([{
    superToken: network.nativeCurrency.superToken,
    underlyingToken: network.nativeCurrency,
  }])
);

export const vestingSupportedNetworks = allNetworks
  .filter(
    (network) =>
      network.vestingContractAddress_v1 || network.vestingContractAddress_v2
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