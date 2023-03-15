import memoize from "lodash/memoize";
import * as chain from "@wagmi/chains";
import { Chain } from "@wagmi/chains";
import {
  NATIVE_ASSET_ADDRESS,
  SuperTokenPair,
  TokenMinimal,
  TokenType,
} from "./tokenTypes";
import { BasePage } from "../pageObjects/BasePage";
import ensureDefined from "../../../src/utils/ensureDefined";

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
  flowSchedulerContractAddress?: `0x${string}`;
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
  ethereum: "https://rpc-endpoints.superfluid.dev/eth-mainnet",
  bsc: "https://rpc-endpoints.superfluid.dev/bsc-mainnet",
  "celo-mainnet": "https://rpc-endpoints.superfluid.dev/celo-mainnet",
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
  ethereum: Network;
  celoMainnet: Network,
} = {
  goerli: {
    ...chain.goerli,
    slugName: "goerli",
    v1ShortName: "goerli",
    bufferTimeInMinutes: 60,
    color: "#9064ff",
    superfluidRpcUrl: superfluidRpcUrls.goerli,
    subgraphUrl:
      "https://api.thegraph.com/subgraphs/name/superfluid-finance/protocol-v1-goerli",
    getLinkForTransaction: (txHash: string): string =>
      `https://goerli.etherscan.io/tx/${txHash}`,
    getLinkForAddress: (address: string): string =>
      `https://goerli.etherscan.io/address/${address}`,
    nativeCurrency: {
      ...BasePage.ensureDefined(chain.goerli.nativeCurrency),
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
    flowSchedulerContractAddress: "0x5b2D8d18FE90D840cbc012a8a06C3EeAA5cBe1a6",
    platformUrl: "https://prod-goerli-platform-service.dev.superfluid.dev",
  },
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
  },
  polygonMumbai: {
    ...chain.polygonMumbai,
    slugName: "polygon-mumbai",
    v1ShortName: "mumbai",
    bufferTimeInMinutes: 60,
    color: "#3099f2",
    superfluidRpcUrl: superfluidRpcUrls.polygonMumbai,
    subgraphUrl:
      "https://api.thegraph.com/subgraphs/name/superfluid-finance/protocol-v1-mumbai",
    getLinkForTransaction: (txHash: string): string =>
      `https://mumbai.polygonscan.com/tx/${txHash}`,
    getLinkForAddress: (address: string): string =>
      `https://mumbai.polygonscan.com/address/${address}`,
    nativeCurrency: {
      ...BasePage.ensureDefined(chain.polygonMumbai.nativeCurrency),
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
  networkDefinition.ethereum,
  networkDefinition.celoMainnet,
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
