export const chainIds = {
  mainnet: 1,
  goerli: 5,
  gnosis: 100,
  polygon: 137,
  polygonMumbai: 80001,
  avalancheFuji: 43113,
  avalanche: 43114,
  bsc: 56,
  celo: 42220,
  optimism: 10,
  arbitrum: 42161,
  sepolia: 11155111,
  optimismGoerli: 420,
  arbitrumGoerli: 421613,
  polygonZkevmTestnet: 1442,
  baseGoerli: 84531,
  base: 8453,
} as const;

export const autoWrapManagerAddresses = {
  [chainIds.polygon]: "0x2581c27E7f6D6AF452E63fCe884EDE3EDd716b32",
  [chainIds.bsc]: "0x2AcdD61ac1EFFe1535109449c31889bdE8d7f325",
  [chainIds.goerli]: "0x0B82D14E9616ca4d260E77454834AdCf5887595F",
  [chainIds.polygonMumbai]: "0x3eAB3c6207F488E475b7955B631B564F0E6317B9",
  [chainIds.avalancheFuji]: "0x30aE282CF477E2eF28B14d0125aCEAd57Fe1d7a1",
  [chainIds.avalanche]: "0x8082e58681350876aFe8f52d3Bf8672034A03Db0",
  [chainIds.optimism]: "0x1fA76f2Cd0C3fe6c399A80111408d9C42C0CAC23",
  [chainIds.arbitrum]: "0xf01825eAFAe5CD1Dab5593EFAF218efC8968D272",
  [chainIds.mainnet]: "0x30aE282CF477E2eF28B14d0125aCEAd57Fe1d7a1",
  [chainIds.gnosis]: "0x8082e58681350876aFe8f52d3Bf8672034A03Db0",
} as const;

export const autoWrapStrategyAddresses = {
  [chainIds.polygon]: "0xb4afa36BAd8c76976Dc77a21c9Ad711EF720eE4b",
  [chainIds.bsc]: "0x9e308cb079ae130790F604b1030cDf386670f199",
  [chainIds.goerli]: "0xea49af829d3e28d3ec49e0e0a0ba1e7860a56f60",
  [chainIds.polygonMumbai]: "0x544728AFDBeEafBeC9e1329031788edb53017bC4",
  [chainIds.avalancheFuji]: "0x1D65c6d3AD39d454Ea8F682c49aE7744706eA96d",
  [chainIds.avalanche]: "0x51FBAbD31A615E14b1bC12E9d887f60997264a4E",
  [chainIds.optimism]: "0x0Cf060a501c0040e9CCC708eFE94079F501c6Bb4",
  [chainIds.arbitrum]: "0x342076aA957B0ec8bC1d3893af719b288eA31e61",
  [chainIds.mainnet]: "0x1D65c6d3AD39d454Ea8F682c49aE7744706eA96d",
  [chainIds.gnosis]: "0x51FBAbD31A615E14b1bC12E9d887f60997264a4E",
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

export const autoWrapSubgraphUrls = {
  mumbai:
    "https://api.thegraph.com/subgraphs/name/superfluid-finance/auto-wrap-v1-polygon-mumbai",
  goerli:
    "https://api.thegraph.com/subgraphs/name/superfluid-finance/auto-wrap-v1-eth-goerli",
  arbitrum:
    "https://api.thegraph.com/subgraphs/name/superfluid-finance/auto-wrap-v1-arbitrum-one",
  avalancheC:
    "https://api.thegraph.com/subgraphs/name/superfluid-finance/auto-wrap-v1-avalanche-c",
  bnbSmartChain:
    "https://api.thegraph.com/subgraphs/name/superfluid-finance/auto-wrap-v1-bsc-mainnet",
  ethereum:
    "https://api.thegraph.com/subgraphs/name/superfluid-finance/auto-wrap-v1-eth-mainnet",
  optimism:
    "https://api.thegraph.com/subgraphs/name/superfluid-finance/auto-wrap-v1-optimism-mainnet",
  polygon:
    "https://api.thegraph.com/subgraphs/name/superfluid-finance/auto-wrap-v1-polygon-mainnet",
  gnosis:
    "https://api.thegraph.com/subgraphs/name/superfluid-finance/auto-wrap-v1-xdai-mainnet",
} as const;

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
  sepolia: "https://rpc-endpoints.superfluid.dev/eth-sepolia",
  "polygon-zkevm-testnet":
    "https://rpc-endpoints.superfluid.dev/polygon-zkevm-testnet",
  "base-goerli": "https://rpc-endpoints.superfluid.dev/base-goerli",
  base: "https://rpc-endpoints.superfluid.dev/base-mainnet",
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
