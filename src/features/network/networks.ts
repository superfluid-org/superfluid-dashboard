import { TokenUpgradeDowngradePair } from "../redux/endpoints/adHocSubgraphEndpoints";

export type Network = {
  displayName: string;
  slugName: string;
  chainId: number;
  rpcUrl: string;
  subgraphUrl: string;
  getLinkForTransaction(txHash: string): string;
  getLinkForAddress(adderss: string): string;
  isTestnet: boolean;
  defaultTokenPair: TokenUpgradeDowngradePair | undefined;
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
    defaultTokenPair: {
      superToken: {
        address: "0xbf6201a6c48b56d8577edd079b84716bb4918e8a",
        name: "Super fDAI Fake Token",
        symbol: "fDAIx",
      },
      underlyingToken: {
        address: "0x15f0ca26781c3852f8166ed2ebce5d18265cceb7",
        name: "fDAI Fake Token",
        symbol: "fDAI",
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
    defaultTokenPair: {
      superToken: {
        address: "0x745861aed1eee363b4aaa5f1994be40b1e05ff90",
        name: "Super fDAI Fake Token",
        symbol: "fDAIx",
      },

      underlyingToken: {
        address: "0x15f0ca26781c3852f8166ed2ebce5d18265cceb7",
        name: "fDAI Fake Token",
        symbol: "fDAI",
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
    defaultTokenPair: {
      superToken: {
        address: "0xf2d68898557ccb2cf4c10c3ef2b034b2a69dad00",
        name: "Super fDAI Fake Token",
        symbol: "fDAIx",
      },
      underlyingToken: {
        address: "0x88271d333c72e51516b67f5567c728e702b3eee8",
        name: "fDAI Fake Token",
        symbol: "fDAI",
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
    defaultTokenPair: {
      superToken: {
        address: "0xe3cb950cb164a31c66e32c320a800d477019dcff",
        name: "Super fDAI Fake Token",
        symbol: "fDAIx",
      },
      underlyingToken: {
        address: "0xb64845d53a373d35160b72492818f0d2f51292c0",
        name: "fDAI Fake Token",
        symbol: "fDAI",
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
    defaultTokenPair: {
      superToken: {
        address: "0x59988e47a3503aafaa0368b9def095c818fdca01",
        name: "Super xDAI",
        symbol: "xDAIx",
      },
      underlyingToken: {
        address: "0xe91d153e0b41518a2ce8dd3d7944fa863463a97d",
        name: "Wrapped XDAI",
        symbol: "WXDAI",
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
    defaultTokenPair: {
      superToken: {
        address: "0x3ad736904e9e65189c3000c7dd2c8ac8bb7cd4e3",
        name: "Super MATIC",
        symbol: "MATICx",
      },
      underlyingToken: {
        address: "0x0d500b1d8e8ef31e21c99d1db9a6444d3adf1270",
        name: "Wrapped Matic",
        symbol: "WMATIC",
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
    defaultTokenPair: {
      superToken: {
        address: "0x5d8b4c2554aeb7e86f387b4d6c00ac33499ed01f",
        name: "Super fDAI Fake Token",
        symbol: "fDAIx",
      },
      underlyingToken: {
        address: "0x15f0ca26781c3852f8166ed2ebce5d18265cceb7",
        name: "fDAI Fake Token",
        symbol: "fDAI",
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
    defaultTokenPair: {
      superToken: {
        address: "0x4b746f88fb25516731d54cefb1c2d00eadeff366",
        name: "Super fDAI Fake Token",
        symbol: "fDAIx",
      },
      underlyingToken: {
        address: "0xf8d8f02b788de5191ecd20f7bdb07d80963410b5",
        name: "fDAI Fake Token",
        symbol: "fDAI",
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
    defaultTokenPair: {
      superToken: {
        address: "0x04d4f73e9de52a8fec544087a66bbba660a35957",
        name: "Super fDAI Fake Token",
        symbol: "fDAIx",
      },
      underlyingToken: {
        address: "0xbe49ac1eadac65dccf204d4df81d650b50122ab2",
        name: "fDAI Fake Token",
        symbol: "fDAI",
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
    defaultTokenPair: {
      superToken: {
        address: "0x296e9c01f80d408741f6e15d62013ddbe1041f1d",
        name: "Super fDAI Fake Token",
        symbol: "fDAIx",
      },
      underlyingToken: {
        address: "0x87e00dced5670e01bee33a9a724b1dac790937ef",
        name: "fDAI Fake Token",
        symbol: "fDAI",
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
    defaultTokenPair: {
      superToken: {
        address: "0x7d342726b69c28d942ad8bfe6ac81b972349d524",
        name: "Super Dai Stablecoin",
        symbol: "DAIx",
      },
      underlyingToken: {
        address: "0xda10009cbd5d07dd0cecc66161fc93d7c9000da1",
        name: "Dai Stablecoin",
        symbol: "DAI",
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
    defaultTokenPair: undefined,
  },
];

export const networksByName = new Map(
  networks.map((x) => [x.slugName.toLowerCase(), x])
);

export const networksByChainId = new Map(networks.map((x) => [x.chainId, x]));
