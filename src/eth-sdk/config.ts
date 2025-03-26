import { defineConfig } from "@dethcrypto/eth-sdk";
import {
  autoWrapManagerAddresses,
  autoWrapStrategyAddresses,
  flowSchedulerContractAddresses,
  vestingContractAddresses_v1,
  vestingContractAddresses_v2,
  vestingContractAddresses_v3
} from "../features/network/networkConstants";
import { chainIds } from "../features/network/networkConstants";
import dotenv from 'dotenv';

dotenv.config();

const ethSdkConfig = defineConfig({
  contracts: {
    optimismSepolia: {
      vestingScheduler_v3: vestingContractAddresses_v3[chainIds.optimismSepolia], // OP Sepolia used as source of truth for the ABI of Vesting Scheduler.
      vestingScheduler_v2: vestingContractAddresses_v2.optimismSepolia, // OP Sepolia used as source of truth for the ABI of Vesting Scheduler.
      vestingScheduler: vestingContractAddresses_v1.optimismSepolia // OP Sepolia used as source of truth for the ABI of Vesting Scheduler.
    },
    mainnet: {
      flowScheduler: flowSchedulerContractAddresses.ethereum, // Mainnet used as source of truth for the ABI of Flow Scheduler.
      autoWrapManager: autoWrapManagerAddresses[1],
      autoWrapStrategy: autoWrapStrategyAddresses[1],
    },
  },
  outputPath: "./src/eth-sdk/client",
  rpc: {
    optimismSepolia: "https://rpc-endpoints.superfluid.dev/optimism-sepolia",
  },
  etherscanURLs: {
    optimismSepolia: "https://api-sepolia-optimistic.etherscan.io/api",
  },
  "etherscanKeys": {
    "mainnet": process.env.ETHERSCAN_MAINNET_API_KEY,
    // @ts-ignore
    "optimismSepolia": process.env.ETHERSCAN_OPTIMISM_API_KEY
  }
});

export default ethSdkConfig;

// For historical purposes: a solutions for `contracts` which generates the SDK for every network.
// Object.entries(networkDefinition).reduce(
//   (previousValue, [networkName, network]) => {
//     const networkContracts = {
//       ...(!isUndefined(network.flowSchedulerContractAddress)
//         ? { flowScheduler: network.flowSchedulerContractAddress }
//         : {}),
//       ...(!isUndefined(network.vestingContractAddress)
//         ? { vestingScheduler: network.vestingContractAddress }
//         : {}),
//     };

//     if (Object.keys(networkContracts).length) {
//       const networkSymbol = networkIDtoSymbol[network.id as NetworkID];
//       if (!networkSymbol)
//         throw new Error(
//           "Eth-Sdk does not have pre-defined support for this network. You have to handle it somehow... https://github.com/dethcrypto/eth-sdk"
//         );
//       previousValue[networkSymbol] = networkContracts;
//     }

//     return previousValue;
//   },
//   {} as Record<
//     string,
//     { flowScheduler?: `0x${string}`; vestingScheduler?: `0x${string}` }
//   >
// )
