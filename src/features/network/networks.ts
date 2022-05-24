import { memoize } from "lodash";
import { chain, Chain } from "wagmi";
import {
  NATIVE_ASSET_ADDRESS,
  SuperTokenPair
} from "../redux/endpoints/tokenTypes";
import {TokenType} from "../redux/endpoints/tokenTypes";

// id == chainId
// name == displayName
export type Network = Chain & {
  slugName: string
  subgraphUrl: string;
  getLinkForTransaction(txHash: string): string;
  getLinkForAddress(adderss: string): string;
  icon?: string;
  color?: string;
  bufferTimeInMinutes: number; // Hard-code'ing this per network is actually incorrect approach. It's token-based and can be governed.
  nativeAsset: {
    symbol: string;
    superToken: {
      type: TokenType.NativeAssetSuperToken;
      symbol: string;
      name: string;
      address: string;
    };
  };
  rpcUrls: Chain["rpcUrls"] & { superfluid: string }
};

const superfluidRpcUrls = {
  ropsten: "https://rpc-endpoints.superfluid.dev/ropsten",
  rinkeby: "https://rpc-endpoints.superfluid.dev/rinkeby",
  goerli: "https://rpc-endpoints.superfluid.dev/goerli",
  kovan: "https://rpc-endpoints.superfluid.dev/kovan",
  gnosis: "https://rpc-endpoints.superfluid.dev/xdai",
  polygon: "https://rpc-endpoints.superfluid.dev/matic",
  polygonMumbai: "https://rpc-endpoints.superfluid.dev/mumbai",
  arbitrum: "https://rpc-endpoints.superfluid.dev/arbitrum-one",
  arbitrumRinkeby: "https://rpc-endpoints.superfluid.dev/arbitrum-rinkeby",
  optimism: "https://rpc-endpoints.superfluid.dev/optimism-mainnet",
  optimismKovan: "https://rpc-endpoints.superfluid.dev/optimism-kovan",
  avalancheFuji: "https://rpc-endpoints.superfluid.dev/avalanche-fuji"
}

export const networks: Network[] = [
  {
    ...chain.ropsten,
    slugName: "ropsten",
    bufferTimeInMinutes: 60,
    icon: "/icons/network/ropsten.jpg",
    color: "#29b6af",
    rpcUrls: {
      ...chain.ropsten.rpcUrls,
      superfluid: superfluidRpcUrls.ropsten,
    },
    subgraphUrl:
      "https://api.thegraph.com/subgraphs/name/superfluid-finance/protocol-v1-ropsten",
    getLinkForTransaction: (txHash: string): string =>
      `https://ropsten.etherscan.io/tx/${txHash}`,
    getLinkForAddress: (address: string): string =>
      `https://ropsten.etherscan.io/address/${address}`,
    nativeAsset: {
      symbol: "ETH",
      superToken: {
        type: TokenType.NativeAssetSuperToken,
        symbol: "ETHx",
        name: "Super ETH",
        address: "0x6fc99f5591b51583ba15a8c2572408257a1d2797",
      },
    },
  },
  {
    ...chain.rinkeby,
    slugName: "rinkeby",
    color: "#ff4a8d",
    bufferTimeInMinutes: 60,
    icon: "/icons/network/rinkeby.jpg",
    rpcUrls: {
      ...chain.rinkeby.rpcUrls,
      superfluid: superfluidRpcUrls.rinkeby,
    },
    subgraphUrl:
      "https://api.thegraph.com/subgraphs/name/superfluid-finance/protocol-v1-rinkeby",
    getLinkForTransaction: (txHash: string): string =>
      `https://rinkeby.etherscan.io/tx/${txHash}`,
    getLinkForAddress: (address: string): string =>
      `https://rinkeby.etherscan.io/address/${address}`,
    nativeAsset: {
      symbol: "ETH",
      superToken: {
        type: TokenType.NativeAssetSuperToken,
        symbol: "ETHx",
        address: "0xa623b2dd931c5162b7a0b25852f4024db48bb1a0",
        name: "Super ETH",
      },
    },
  },
  {
    ...chain.goerli,
    slugName: "goerli",
    bufferTimeInMinutes: 60,
    icon: "/icons/network/goerli.jpg",
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
    nativeAsset: {
      symbol: "ETH",
      superToken: {
        type: TokenType.NativeAssetSuperToken,
        symbol: "ETHx",
        address: "0x5943f705abb6834cad767e6e4bb258bc48d9c947",
        name: "Super ETH",
      },
    },
  },
  {
    ...chain.kovan,
    slugName: "kovan",
    bufferTimeInMinutes: 60,
    icon: "/icons/network/kovan.jpg",
    color: "#f6c343",
    rpcUrls: {
      ...chain.kovan.rpcUrls,
      superfluid: superfluidRpcUrls.kovan,
    },
    subgraphUrl:
      "https://api.thegraph.com/subgraphs/name/superfluid-finance/protocol-v1-kovan",
    getLinkForTransaction: (txHash: string): string =>
      `https://kovan.etherscan.io/tx/${txHash}`,
    getLinkForAddress: (address: string): string =>
      `https://kovan.etherscan.io/address/${address}`,
    nativeAsset: {
      symbol: "ETH",
      superToken: {
        type: TokenType.NativeAssetSuperToken,
        symbol: "ETHx",
        address: "0xdd5462a7db7856c9128bc77bd65c2919ee23c6e1",
        name: "Super ETH",
      },
    },
  },
  {
    name: "Gnosis Chain",
    slugName: "gnosis",
    id: 100,
    testnet: false,
    bufferTimeInMinutes: 240,
    icon: "/icons/network/gnosis.svg",
    rpcUrls: { superfluid: superfluidRpcUrls.gnosis, default: "https://rpc.gnosischain.com/" },
    subgraphUrl:
      "https://api.thegraph.com/subgraphs/name/superfluid-finance/protocol-v1-xdai",
    getLinkForTransaction: (txHash: string): string =>
      `https://blockscout.com/xdai/mainnet/tx/${txHash}`,
    getLinkForAddress: (address: string): string =>
      `https://blockscout.com/xdai/mainnet/address/${address}`,
    nativeAsset: {
      symbol: "xDai",
      superToken: {
        type: TokenType.NativeAssetSuperToken,
        symbol: "xDAIx",
        address: "0x59988e47a3503aafaa0368b9def095c818fdca01",
        name: "Super xDAI",
      },
    },
  },
  {
    ...chain.polygon,
    slugName: "polygon",
    bufferTimeInMinutes: 240,
    icon: "/icons/network/polygon.svg",
    rpcUrls: {
      ...chain.polygon.rpcUrls,
      superfluid: superfluidRpcUrls.polygon
    },
    subgraphUrl:
      "https://api.thegraph.com/subgraphs/name/superfluid-finance/protocol-v1-matic",
    getLinkForTransaction: (txHash: string): string =>
      `https://polygonscan.com/tx/${txHash}`,
    getLinkForAddress: (address: string): string =>
      `https://polygonscan.com/address/${address}`,
    nativeAsset: {
      symbol: "MATIC",
      superToken: {
        type: TokenType.NativeAssetSuperToken,
        symbol: "MATICx",
        address: "0x3ad736904e9e65189c3000c7dd2c8ac8bb7cd4e3",
        name: "Super MATIC",
      },
    },
  },
  {
    ...chain.polygonMumbai,
    slugName: "mumbai",
    bufferTimeInMinutes: 60,
    color: "#3099f2",
    rpcUrls: {
      ...chain.polygonMumbai.rpcUrls,
      superfluid: superfluidRpcUrls.polygonMumbai
    },
    subgraphUrl:
      "https://api.thegraph.com/subgraphs/name/superfluid-finance/protocol-v1-mumbai",
    getLinkForTransaction: (txHash: string): string =>
      `https://mumbai.polygonscan.com/tx/${txHash}`,
    getLinkForAddress: (address: string): string =>
      `https://mumbai.polygonscan.com/address/${address}`,
    nativeAsset: {
      symbol: "MATIC",
      superToken: {
        type: TokenType.NativeAssetSuperToken,
        symbol: "MATICx",
        address: "0x96b82b65acf7072efeb00502f45757f254c2a0d4",
        name: "Super MATIC",
      },
    },
  },
  {
    ...chain.arbitrumRinkeby,
    slugName: "arbitrum-rinkeby",
    bufferTimeInMinutes: 60,
    icon: "/icons/network/arbitrum.svg",
    color: "#29b6af",
    rpcUrls: {
      ...chain.arbitrumRinkeby.rpcUrls,
      superfluid: superfluidRpcUrls.arbitrumRinkeby
    },
    subgraphUrl:
      "https://api.thegraph.com/subgraphs/name/superfluid-finance/protocol-v1-arbitrum-rinkeby",
    getLinkForTransaction: (txHash: string): string =>
      `https://rinkeby-explorer.arbitrum.io/tx/${txHash}`,
    getLinkForAddress: (address: string): string =>
      `https://rinkeby-explorer.arbitrum.io/address/${address}`,
    nativeAsset: {
      symbol: "ETH",
      superToken: {
        type: TokenType.NativeAssetSuperToken,
        symbol: "ETHx",
        address: "0xbf7bcce8d60a9c3f6bfaec9346aa85b9f781a4e9",
        name: "Super ETH",
      },
    },
  },
  {
    ...chain.optimismKovan,
    slugName: "optimism-kovan",
    bufferTimeInMinutes: 60,
    icon: "/icons/network/optimism.svg",
    color: "#8b45b6",
    rpcUrls: {
      ...chain.optimismKovan.rpcUrls,
      superfluid: superfluidRpcUrls.optimismKovan
    },
    subgraphUrl:
      "https://api.thegraph.com/subgraphs/name/superfluid-finance/protocol-v1-optimism-kovan",
    getLinkForTransaction: (txHash: string): string =>
      `https://kovan-optimistic.etherscan.io/tx/${txHash}`,
    getLinkForAddress: (address: string): string =>
      `https://kovan-optimistic.etherscan.io/address/${address}`,
    nativeAsset: {
      symbol: "ETH",
      superToken: {
        type: TokenType.NativeAssetSuperToken,
        symbol: "ETHx",
        address: "0xe72f289584eda2be69cfe487f4638f09bac920db",
        name: "Super ETH",
      },
    },
  },
  {
    name: "Avalanche-Fuji",
    slugName: "avalanche-fuji",
    id: 43113,
    testnet: true,
    bufferTimeInMinutes: 60,
    icon: "/icons/network/avalanche.jpg",
    rpcUrls: {
      superfluid: superfluidRpcUrls.avalancheFuji,
      default: "https://api.avax-test.network/ext/C/rpc"
    },
    subgraphUrl:
      "https://api.thegraph.com/subgraphs/name/superfluid-finance/protocol-v1-avalanche-fuji",
    getLinkForTransaction: (txHash: string): string =>
      `https://testnet.snowtrace.io/tx/${txHash}`,
    getLinkForAddress: (address: string): string =>
      `https://testnet.snowtrace.io/address/${address}`,
    nativeAsset: {
      symbol: "AVAX",
      superToken: {
        type: TokenType.NativeAssetSuperToken,
        symbol: "AVAXx",
        address: "0x5735c32c38f5af0fb04a7c77c832ba4d7abffec8",
        name: "Super AVAX",
      },
    },
  },
  {
    ...chain.optimism,
    slugName: "optimism-mainnet",
    bufferTimeInMinutes: 240,
    icon: "/icons/network/optimism.svg",
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
    nativeAsset: {
      symbol: "ETH",
      superToken: {
        type: TokenType.NativeAssetSuperToken,
        symbol: "ETHx",
        address: "0x4ac8bd1bdae47beef2d1c6aa62229509b962aa0d",
        name: "Super ETH",
      },
    },
  },
  {
    ...chain.arbitrum,
    slugName: "arbitrum-one",
    bufferTimeInMinutes: 240,
    icon: "/icons/network/arbitrum.svg",
    rpcUrls: {
      ...chain.arbitrum.rpcUrls,
      superfluid: superfluidRpcUrls.arbitrum
    },
    subgraphUrl:
      "https://api.thegraph.com/subgraphs/name/superfluid-finance/protocol-v1-arbitrum-one",
    getLinkForTransaction: (txHash: string): string =>
      `https://arbiscan.io/tx/${txHash}`,
    getLinkForAddress: (address: string): string =>
      `https://arbiscan.io/address/${address}`,
    nativeAsset: {
      symbol: "ETH",
      superToken: {
        type: TokenType.NativeAssetSuperToken,
        symbol: "ETHx",
        address: "0xe6c8d111337d0052b9d88bf5d7d55b7f8385acd3",
        name: "Super ETH",
      },
    },
  },
];

export const getNetworkDefaultTokenPair = memoize(
  (network: Network): SuperTokenPair => ({
    superToken: network.nativeAsset.superToken,
    underlyingToken: {
      type: TokenType.NativeAssetUnderlyingToken,
      address: NATIVE_ASSET_ADDRESS,
      name: `${network.name} Native Asset`,
      symbol: network.nativeAsset.symbol,
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
