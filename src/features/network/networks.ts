import { memoize } from "lodash";
import { chain, Chain } from "wagmi";
import config from "../../utils/config";
import ensureDefined from "../../utils/ensureDefined";
import {
  NATIVE_ASSET_ADDRESS,
  SuperTokenPair,
  TokenMinimal,
  TokenType,
} from "../redux/endpoints/tokenTypes";

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
  rpcUrls: Chain["rpcUrls"] & { superfluid: string };
  nativeCurrency: Chain["nativeCurrency"] & {
    type: TokenType.NativeAssetUnderlyingToken;
    address: typeof NATIVE_ASSET_ADDRESS;
    superToken: {
      type: TokenType.NativeAssetSuperToken;
    } & TokenMinimal;
  };
  streamSchedulerContractAddress?: `0x${string}`;
  platformUrl?: string;
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
};

export const networkDefinition: {
  goerli: Network & {
    streamSchedulerContractAddress: `0x${string}`;
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
      superfluid: superfluidRpcUrls.goerli,
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
    streamSchedulerContractAddress:
      "0x7D37D9494a09E47e58B1F535386Ca4D9D175f23e",
    platformUrl: config.platformApi.goerli,
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
      superfluid: superfluidRpcUrls.gnosis,
      default: "https://rpc.gnosischain.com/",
    },
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
      superfluid: superfluidRpcUrls.polygon,
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
      superfluid: superfluidRpcUrls.polygonMumbai,
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
      superfluid: superfluidRpcUrls.avalancheFuji,
      default: "https://api.avax-test.network/ext/C/rpc",
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
      superfluid: superfluidRpcUrls.optimism,
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
      superfluid: superfluidRpcUrls.arbitrum,
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
      superfluid: superfluidRpcUrls.avalancheC,
      default: "https://api.avax.network/ext/bc/C/rpc",
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
      superfluid: superfluidRpcUrls.bnbSmartChain,
      default: "https://bsc-dataseed1.binance.org",
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
  },
};

export const networks: Network[] = [
  networkDefinition.goerli,
  networkDefinition.gnosis,
  networkDefinition.polygon,
  networkDefinition.polygonMumbai,
  networkDefinition.avalancheFuji,
  networkDefinition.optimism,
  networkDefinition.arbitrum,
  networkDefinition.avalancheC,
  networkDefinition.bsc,
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
export const networkIDs = networks.map((network) => network.id);

export const findNetworkByChainId = memoize((chainId: number) =>
  networks.find((network) => network.id === chainId)
);
