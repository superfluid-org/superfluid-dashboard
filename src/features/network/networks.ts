import { memoize } from "lodash";
import { chain, Chain } from "wagmi";
import ensureDefined from "../../utils/ensureDefined";
import {
  NATIVE_ASSET_ADDRESS,
  SuperTokenPair,
  TokenType,
} from "../redux/endpoints/tokenTypes";

// id == chainId
// name == displayName
export type Network = Chain & {
  slugName: string;
  subgraphUrl: string;
  getLinkForTransaction(txHash: string): string;
  getLinkForAddress(adderss: string): string;
  icon?: string;
  color: string;
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
  rpcUrls: Chain["rpcUrls"] & { superfluid: string };
  nativeCurrency: Chain["nativeCurrency"];
};

const superfluidRpcUrls = {
  ropsten: "https://rpc-endpoints.superfluid.dev/eth-ropsten",
  rinkeby: "https://rpc-endpoints.superfluid.dev/eth-rinkeby",
  goerli: "https://rpc-endpoints.superfluid.dev/eth-goerli",
  kovan: "https://rpc-endpoints.superfluid.dev/eth-kovan",
  gnosis: "https://rpc-endpoints.superfluid.dev/xdai-mainnet",
  polygon: "https://rpc-endpoints.superfluid.dev/polygon-mainnet",
  polygonMumbai: "https://rpc-endpoints.superfluid.dev/polygon-mumbai",
  arbitrum: "https://rpc-endpoints.superfluid.dev/arbitrum-one",
  arbitrumRinkeby: "https://rpc-endpoints.superfluid.dev/arbitrum-rinkeby",
  optimism: "https://rpc-endpoints.superfluid.dev/optimism-mainnet",
  optimismKovan: "https://rpc-endpoints.superfluid.dev/optimism-kovan",
  avalancheFuji: "https://rpc-endpoints.superfluid.dev/avalanche-fuji",
  avalancheC: "https://rpc-endpoints.superfluid.dev/avalanche-c",
  bnbSmartChain: "https://bsc-dataseed1.binance.org",
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

export const networks: Network[] = [
  {
    ...chain.ropsten,
    blockExplorers: ensureDefined(chain.ropsten.blockExplorers),
    nativeCurrency: ensureDefined(chain.ropsten.nativeCurrency),
    slugName: "ropsten",
    bufferTimeInMinutes: 60,
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
    blockExplorers: ensureDefined(chain.rinkeby.blockExplorers),
    nativeCurrency: ensureDefined(chain.rinkeby.nativeCurrency),
    slugName: "rinkeby",
    color: "#ff4a8d",
    bufferTimeInMinutes: 60,
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
    blockExplorers: ensureDefined(chain.goerli.blockExplorers),
    nativeCurrency: ensureDefined(chain.goerli.nativeCurrency),
    slugName: "goerli",
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
    blockExplorers: ensureDefined(chain.kovan.blockExplorers),
    nativeCurrency: ensureDefined(chain.kovan.nativeCurrency),
    slugName: "kovan",
    bufferTimeInMinutes: 60,
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
    blockExplorers: {
      etherscan: undefined!,
      default: blockExplorers.blockscout.gnosis,
    },
    slugName: "gnosis",
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
    },
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
    blockExplorers: ensureDefined(chain.polygon.blockExplorers),
    nativeCurrency: ensureDefined(chain.polygon.nativeCurrency),
    slugName: "polygon",
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
    blockExplorers: ensureDefined(chain.polygonMumbai.blockExplorers),
    nativeCurrency: ensureDefined(chain.polygonMumbai.nativeCurrency),
    slugName: "mumbai",
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
    blockExplorers: ensureDefined(chain.arbitrumRinkeby.blockExplorers),
    nativeCurrency: ensureDefined(chain.arbitrumRinkeby.nativeCurrency),
    slugName: "arbitrum-rinkeby",
    bufferTimeInMinutes: 60,
    color: "#29b6af",
    rpcUrls: {
      ...chain.arbitrumRinkeby.rpcUrls,
      superfluid: superfluidRpcUrls.arbitrumRinkeby,
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
    blockExplorers: ensureDefined(chain.optimismKovan.blockExplorers),
    nativeCurrency: ensureDefined(chain.optimismKovan.nativeCurrency),
    slugName: "optimism-kovan",
    bufferTimeInMinutes: 60,
    color: "#8b45b6",
    rpcUrls: {
      ...chain.optimismKovan.rpcUrls,
      superfluid: superfluidRpcUrls.optimismKovan,
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
    name: "Fuji (C-Chain)",
    slugName: "avalanche-fuji",
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
    },
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
    blockExplorers: ensureDefined(chain.optimism.blockExplorers),
    nativeCurrency: ensureDefined(chain.optimism.nativeCurrency),
    slugName: "optimism-mainnet",
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
    blockExplorers: ensureDefined(chain.arbitrum.blockExplorers),
    nativeCurrency: ensureDefined(chain.arbitrum.nativeCurrency),
    slugName: "arbitrum-one",
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
  {
    name: "Avalanche C",
    slugName: "avalanche-c",
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
    },
    nativeAsset: {
      symbol: "AVAX",
      superToken: {
        type: TokenType.NativeAssetSuperToken,
        symbol: "AVAXx",
        address: "0xBE916845D8678b5d2F7aD79525A62D7c08ABba7e",
        name: "Super AVAX",
      },
    },
  },
  {
    name: "BNB Smart Chain",
    slugName: "bnb-smart-chain",
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
    },
    nativeAsset: {
      symbol: "BNB",
      superToken: {
        type: TokenType.NativeAssetSuperToken,
        symbol: "BNBx",
        address: "0x529a4116f160c833c61311569d6b33dff41fd657",
        name: "Super BNB",
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
