export const chainIds = {
  mainnet: 1,
  gnosis: 100,
  polygon: 137,
  avalancheFuji: 43113,
  avalanche: 43114,
  bsc: 56,
  celo: 42220,
  optimism: 10,
  arbitrum: 42161,
  sepolia: 11155111,
  base: 8453,
  scroll: 534352,
  scrollSepolia: 534351,
  optimismSepolia: 11155420,
  degen: 666666666,
} as const;

export const autoWrapManagerAddresses = {
  [chainIds.polygon]: "0x2581c27E7f6D6AF452E63fCe884EDE3EDd716b32",
  [chainIds.bsc]: "0x2AcdD61ac1EFFe1535109449c31889bdE8d7f325",
  [chainIds.avalancheFuji]: "0x30aE282CF477E2eF28B14d0125aCEAd57Fe1d7a1",
  [chainIds.avalanche]: "0x8082e58681350876aFe8f52d3Bf8672034A03Db0",
  [chainIds.optimism]: "0x1fA76f2Cd0C3fe6c399A80111408d9C42C0CAC23",
  [chainIds.arbitrum]: "0xf01825eAFAe5CD1Dab5593EFAF218efC8968D272",
  [chainIds.mainnet]: "0x30aE282CF477E2eF28B14d0125aCEAd57Fe1d7a1",
  [chainIds.gnosis]: "0x8082e58681350876aFe8f52d3Bf8672034A03Db0",
  [chainIds.optimismSepolia]: "0xe567b32C10B0dB72d9490eB1B9A409C5ADed192C",
  [chainIds.base]: "0x5D0acD0864Ad07ba4E1E0474AE69Da87482e14A9",
} as const;

export const autoWrapStrategyAddresses = {
  [chainIds.polygon]: "0xb4afa36BAd8c76976Dc77a21c9Ad711EF720eE4b",
  [chainIds.bsc]: "0x9e308cb079ae130790F604b1030cDf386670f199",
  [chainIds.avalancheFuji]: "0x1D65c6d3AD39d454Ea8F682c49aE7744706eA96d",
  [chainIds.avalanche]: "0x51FBAbD31A615E14b1bC12E9d887f60997264a4E",
  [chainIds.optimism]: "0x0Cf060a501c0040e9CCC708eFE94079F501c6Bb4",
  [chainIds.arbitrum]: "0x342076aA957B0ec8bC1d3893af719b288eA31e61",
  [chainIds.mainnet]: "0x1D65c6d3AD39d454Ea8F682c49aE7744706eA96d",
  [chainIds.gnosis]: "0x51FBAbD31A615E14b1bC12E9d887f60997264a4E",
  [chainIds.optimismSepolia]: "0xf232f1fd34CE12e24F4391865c2D6E374D2C34d9",
  [chainIds.base]: "0xB29005319B0caB24cF6D4d24e8420E54BB29Cb0d",
} as const;

export const flowSchedulerContractAddresses = {
  arbitrum: "0x3fA8B653F9abf91428800C0ba0F8D145a71F97A1",
  avalancheC: "0xF7AfF590E9DE493D7ACb421Fca7f1E35C1ad4Ce5",
  bnbSmartChain: "0x2f9e2A2A59405682d4F86779275CF5525AD7eC2B",
  ethereum: "0xAA0cD305eD020137E302CeCede7b18c0A05aCCDA",
  optimism: "0x55c8fc400833eEa791087cF343Ff2409A39DeBcC",
  polygon: "0x55F7758dd99d5e185f4CC08d4Ad95B71f598264D",
  gnosis: "0x9cC7fc484fF588926149577e9330fA5b2cA74336",
  optimismSepolia: "0x73B1Ce21d03ad389C2A291B1d1dc4DAFE7B5Dc68",
  base: "0xC72CEd15204d02183c83fEbb918b183E400811Ee",
} as const;

export const vestingContractAddresses = {
  gnosis: "0x0170FFCC75d178d426EBad5b1a31451d00Ddbd0D",
  polygon: "0xcFE6382B33F2AdaFbE46e6A26A88E0182ae32b0c",
  arbitrum: "0x55c8fc400833eEa791087cF343Ff2409A39DeBcC",
  optimism: "0x65377d4dfE9c01639A41952B5083D58964782892",
  avalancheC: "0x3fA8B653F9abf91428800C0ba0F8D145a71F97A1",
  bnbSmartChain: "0x9B91c27f78376383003C6A12Ad12B341d016C5b9",
  ethereum: "0x39D5cBBa9adEBc25085a3918d36D5325546C001B",
  optimismSepolia: "0x27444c0235a4D921F3106475faeba0B5e7ABDD7a",
  base: "0xDF92D0E6Bcb9385FDe99aD21Ff5e47Fb47E3c6b2",
} as const;

export const vestingSubgraphUrls = {
  gnosis:
    "https://api.thegraph.com/subgraphs/name/superfluid-finance/vesting-v1-xdai-mainnet",
  polygon:
    "https://api.thegraph.com/subgraphs/name/superfluid-finance/vesting-v1-polygon-mainnet",
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
  optimismSepolia: "https://api.goldsky.com/api/public/project_clsnd6xsoma5j012qepvucfpp/subgraphs/vesting-v1-optimism-sepolia/prod/gn",
  base: "https://api.goldsky.com/api/public/project_clsnd6xsoma5j012qepvucfpp/subgraphs/vesting-v1-base-mainnet/prod/gn",
} as const;

export const flowSchedulerSubgraphUrls = {
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
  gnosis:
    "https://api.thegraph.com/subgraphs/name/superfluid-finance/scheduling-v1-xdai-mainnet",
  optimismSepolia: "https://api.goldsky.com/api/public/project_clsnd6xsoma5j012qepvucfpp/subgraphs/scheduling-v1-optimism-sepolia/prod/gn",
  base: "https://api.goldsky.com/api/public/project_clsnd6xsoma5j012qepvucfpp/subgraphs/scheduling-v1-base-mainnet/prod/gn",
} as const;

export const autoWrapSubgraphUrls = {
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
  optimismSepolia: "https://api.goldsky.com/api/public/project_clsnd6xsoma5j012qepvucfpp/subgraphs/auto-wrap-v1-optimism-sepolia/prod/gn",
  base: "https://api.goldsky.com/api/public/project_clsnd6xsoma5j012qepvucfpp/subgraphs/auto-wrap-v1-base-mainnet/prod/gn",
} as const;

export const superfluidRpcUrls = {
  gnosis: "https://rpc-endpoints.superfluid.dev/xdai-mainnet",
  polygon: "https://rpc-endpoints.superfluid.dev/polygon-mainnet",
  arbitrum: "https://rpc-endpoints.superfluid.dev/arbitrum-one",
  optimism: "https://rpc-endpoints.superfluid.dev/optimism-mainnet",
  avalancheFuji: "https://rpc-endpoints.superfluid.dev/avalanche-fuji",
  avalancheC: "https://rpc-endpoints.superfluid.dev/avalanche-c",
  bnbSmartChain: "https://rpc-endpoints.superfluid.dev/bsc-mainnet",
  ethereum: "https://rpc-endpoints.superfluid.dev/eth-mainnet",
  "celo-mainnet": "https://rpc-endpoints.superfluid.dev/celo-mainnet",
  "degenChain": "https://rpc-endpoints.superfluid.dev/degenchain",
  sepolia: "https://rpc-endpoints.superfluid.dev/eth-sepolia",
  base: "https://rpc-endpoints.superfluid.dev/base-mainnet",
  scroll: "https://rpc-endpoints.superfluid.dev/scroll-mainnet",
  "scroll-sepolia": "https://rpc-endpoints.superfluid.dev/scroll-sepolia",
  "optimism-sepolia": "https://rpc-endpoints.superfluid.dev/optimism-sepolia",
} as const;

export const superfluidPlatformUrls = {
  gnosis: "https://prod-xdai-mainnet-platform-service.prod.superfluid.dev",
  polygon: "https://prod-polygon-mainnet-platform-service.prod.superfluid.dev",
  arbitrum: "https://prod-arbitrum-one-platform-service.prod.superfluid.dev",
  optimism:
    "https://prod-optimism-mainnet-platform-service.prod.superfluid.dev",
  avalancheC: "https://prod-avalanche-c-platform-service.prod.superfluid.dev",
  bnbSmartChain:
    "https://prod-bsc-mainnet-platform-service.prod.superfluid.dev",
  ethereum: "https://prod-eth-mainnet-platform-service.prod.superfluid.dev",
} as const;
