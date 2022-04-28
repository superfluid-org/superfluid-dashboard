import { memoize } from "lodash";
import { WrappedSuperTokenPair } from "../redux/endpoints/adHocSubgraphEndpoints";

export type Network = {
  displayName: string;
  slugName: string;
  chainId: number;
  rpcUrl: string;
  subgraphUrl: string;
  getLinkForTransaction(txHash: string): string;
  getLinkForAddress(adderss: string): string;
  isTestnet: boolean;
  coin: {
    symbol: string;
    superToken: {
      symbol: string;
      name: string;
      address: string;
    };
  };
};

export const networks: Network[] = [
  {
    displayName: "Ropsten",
    slugName: "ropsten",
    chainId: 3,
    isTestnet: true,
    rpcUrl: `https://rpc-endpoints.superfluid.dev/ropsten`,
    subgraphUrl:
      "https://api.thegraph.com/subgraphs/name/superfluid-finance/protocol-v1-ropsten",
    getLinkForTransaction: (txHash: string): string =>
      `https://ropsten.etherscan.io/tx/${txHash}`,
    getLinkForAddress: (address: string): string =>
      `https://ropsten.etherscan.io/address/${address}`,
    coin: {
      symbol: "ETH",
      superToken: {
        symbol: "ETHx",
        name: "Super ETH",
        address: "0x6fc99f5591b51583ba15a8c2572408257a1d2797",
      },
    },
  },
  {
    displayName: "Rinkeby",
    slugName: "rinkeby",
    chainId: 4,
    isTestnet: true,
    rpcUrl: `https://rpc-endpoints.superfluid.dev/rinkeby`,
    subgraphUrl:
      "https://api.thegraph.com/subgraphs/name/superfluid-finance/protocol-v1-rinkeby",
    getLinkForTransaction: (txHash: string): string =>
      `https://rinkeby.etherscan.io/tx/${txHash}`,
    getLinkForAddress: (address: string): string =>
      `https://rinkeby.etherscan.io/address/${address}`,
    coin: {
      symbol: "ETH",
      superToken: {
        symbol: "ETHx",
        address: "0xa623b2dd931c5162b7a0b25852f4024db48bb1a0",
        name: "Super ETH",
      },
    },
  },
  {
    displayName: "Goerli",
    slugName: "goerli",
    chainId: 5,
    isTestnet: true,
    rpcUrl: `https://rpc-endpoints.superfluid.dev/goerli`,
    subgraphUrl:
      "https://api.thegraph.com/subgraphs/name/superfluid-finance/protocol-v1-goerli",
    getLinkForTransaction: (txHash: string): string =>
      `https://goerli.etherscan.io/tx/${txHash}`,
    getLinkForAddress: (address: string): string =>
      `https://goerli.etherscan.io/address/${address}`,
    coin: {
      symbol: "ETH",
      superToken: {
        symbol: "ETHx",
        address: "0x5943f705abb6834cad767e6e4bb258bc48d9c947",
        name: "Super ETH",
      },
    },
  },
  {
    displayName: "Kovan",
    slugName: "kovan",
    chainId: 42,
    isTestnet: true,
    rpcUrl: `https://rpc-endpoints.superfluid.dev/kovan`,
    subgraphUrl:
      "https://api.thegraph.com/subgraphs/name/superfluid-finance/protocol-v1-kovan",
    getLinkForTransaction: (txHash: string): string =>
      `https://kovan.etherscan.io/tx/${txHash}`,
    getLinkForAddress: (address: string): string =>
      `https://kovan.etherscan.io/address/${address}`,
    coin: {
      symbol: "ETH",
      superToken: {
        symbol: "ETHx",
        address: "0xdd5462a7db7856c9128bc77bd65c2919ee23c6e1",
        name: "Super ETH",
      },
    },
  },
  {
    displayName: "Gnosis Chain",
    slugName: "xdai",
    chainId: 100,
    isTestnet: false,
    rpcUrl: "https://rpc-endpoints.superfluid.dev/xdai",
    subgraphUrl:
      "https://api.thegraph.com/subgraphs/name/superfluid-finance/protocol-v1-xdai",
    getLinkForTransaction: (txHash: string): string =>
      `https://blockscout.com/xdai/mainnet/tx/${txHash}`,
    getLinkForAddress: (address: string): string =>
      `https://blockscout.com/xdai/mainnet/address/${address}`,
    coin: {
      symbol: "xDai",
      superToken: {
        symbol: "xDAIx",
        address: "0x59988e47a3503aafaa0368b9def095c818fdca01",
        name: "Super xDAI",
      },
    },
  },
  {
    displayName: "Polygon",
    slugName: "matic",
    chainId: 137,
    isTestnet: false,
    rpcUrl: `https://rpc-endpoints.superfluid.dev/matic`,
    subgraphUrl:
      "https://api.thegraph.com/subgraphs/name/superfluid-finance/protocol-v1-matic",
    getLinkForTransaction: (txHash: string): string =>
      `https://polygonscan.com/tx/${txHash}`,
    getLinkForAddress: (address: string): string =>
      `https://polygonscan.com/address/${address}`,
    coin: {
      symbol: "MATIC",
      superToken: {
        symbol: "MATICx",
        address: "0x3ad736904e9e65189c3000c7dd2c8ac8bb7cd4e3",
        name: "Super MATIC",
      },
    },
  },
  {
    displayName: "Mumbai",
    slugName: "mumbai",
    chainId: 80001,
    isTestnet: true,
    rpcUrl: `https://rpc-endpoints.superfluid.dev/mumbai`,
    subgraphUrl:
      "https://api.thegraph.com/subgraphs/name/superfluid-finance/protocol-v1-mumbai",
    getLinkForTransaction: (txHash: string): string =>
      `https://mumbai.polygonscan.com/tx/${txHash}`,
    getLinkForAddress: (address: string): string =>
      `https://mumbai.polygonscan.com/address/${address}`,
    coin: {
      symbol: "MATIC",
      superToken: {
        symbol: "MATICx",
        address: "0x96b82b65acf7072efeb00502f45757f254c2a0d4",
        name: "Super MATIC",
      },
    },
  },
  {
    displayName: "Arbitrum-Rinkeby",
    slugName: "arbitrum-rinkeby",
    chainId: 421611,
    isTestnet: true,
    rpcUrl: `https://rpc-endpoints.superfluid.dev/arbitrum-rinkeby`,
    subgraphUrl:
      "https://api.thegraph.com/subgraphs/name/superfluid-finance/protocol-v1-arbitrum-rinkeby",
    getLinkForTransaction: (txHash: string): string =>
      `https://rinkeby-explorer.arbitrum.io/tx/${txHash}`,
    getLinkForAddress: (address: string): string =>
      `https://rinkeby-explorer.arbitrum.io/address/${address}`,
    coin: {
      symbol: "ETH",
      superToken: {
        symbol: "ETHx",
        address: "0xbf7bcce8d60a9c3f6bfaec9346aa85b9f781a4e9",
        name: "Super ETH",
      },
    },
  },
  {
    displayName: "Optimism-Kovan",
    slugName: "optimism-kovan",
    chainId: 69,
    isTestnet: true,
    rpcUrl: `https://rpc-endpoints.superfluid.dev/optimism-kovan`,
    subgraphUrl:
      "https://api.thegraph.com/subgraphs/name/superfluid-finance/protocol-v1-optimism-kovan",
    getLinkForTransaction: (txHash: string): string =>
      `https://kovan-optimistic.etherscan.io/tx/${txHash}`,
    getLinkForAddress: (address: string): string =>
      `https://kovan-optimistic.etherscan.io/address/${address}`,
    coin: {
      symbol: "ETH",
      superToken: {
        symbol: "ETHx",
        address: "0xe72f289584eda2be69cfe487f4638f09bac920db",
        name: "Super ETH",
      },
    },
  },
  {
    displayName: "Avalanche-Fuji",
    slugName: "avalanche-fuji",
    chainId: 43113,
    isTestnet: true,
    rpcUrl: "https://rpc-endpoints.superfluid.dev/avalanche-fuji",
    subgraphUrl:
      "https://api.thegraph.com/subgraphs/name/superfluid-finance/protocol-v1-avalanche-fuji",
    getLinkForTransaction: (txHash: string): string =>
      `https://testnet.snowtrace.io/tx/${txHash}`,
    getLinkForAddress: (address: string): string =>
      `https://testnet.snowtrace.io/address/${address}`,
    coin: {
      symbol: "AVAX",
      superToken: {
        symbol: "AVAXx",
        address: "0x5735c32c38f5af0fb04a7c77c832ba4d7abffec8",
        name: "Super AVAX",
      },
    },
  },
  {
    displayName: "Optimism",
    slugName: "optimism-mainnet",
    chainId: 10,
    isTestnet: false,
    rpcUrl: `https://rpc-endpoints.superfluid.dev/optimism-mainnet`,
    subgraphUrl:
      "https://api.thegraph.com/subgraphs/name/superfluid-finance/protocol-v1-optimism-mainnet",
    getLinkForTransaction: (txHash: string): string =>
      `https://optimistic.etherscan.io/tx/${txHash}`,
    getLinkForAddress: (address: string): string =>
      `https://optimistic.etherscan.io/address/${address}`,
    coin: {
      symbol: "ETH",
      superToken: {
        symbol: "ETHx",
        address: "0x4ac8bd1bdae47beef2d1c6aa62229509b962aa0d",
        name: "Super ETH",
      },
    },
  },
  {
    displayName: "Arbitrum One",
    slugName: "arbitrum-one",
    chainId: 42161,
    isTestnet: false,
    rpcUrl: "https://rpc-endpoints.superfluid.dev/arbitrum-one",
    subgraphUrl:
      "https://api.thegraph.com/subgraphs/name/superfluid-finance/protocol-v1-arbitrum-one",
    getLinkForTransaction: (txHash: string): string =>
      `https://arbiscan.io/tx/${txHash}`,
    getLinkForAddress: (address: string): string =>
      `https://arbiscan.io/address/${address}`,
    coin: {
      symbol: "ETH",
      superToken: {
        symbol: "ETHx",
        address: "0xe6c8d111337d0052b9d88bf5d7d55b7f8385acd3",
        name: "Super ETH",
      },
    },
  },
];

export const getNetworkDefaultTokenPair = memoize((network: Network): WrappedSuperTokenPair => ({
  superToken: network.coin.superToken,
  underlyingToken: {
    address: "coin",
    name: `${network.displayName} Native Asset`,
    symbol: network.coin.symbol
  }
}));

export const networksByName = new Map(
  networks.map((x) => [x.slugName.toLowerCase(), x])
);

export const networksByChainId = new Map(networks.map((x) => [x.chainId, x]));
