export const autoWrapAddresses = {
  goerli: {
    manager: "0x0B82D14E9616ca4d260E77454834AdCf5887595F",
    strategy: "0xea49af829d3e28d3ec49e0e0a0ba1e7860a56f60",
  },
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
