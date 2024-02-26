import { defineConfig } from "@dethcrypto/eth-sdk";
import {
  autoWrapManagerAddresses,
  autoWrapStrategyAddresses,
  flowSchedulerContractAddresses,
  vestingContractAddresses,
} from "../features/network/networkConstants";

const ethSdkConfig = defineConfig({
  contracts: {
    polygonMumbai: {
      flowScheduler: flowSchedulerContractAddresses.mumbai, // Polygon Mumbai used as source of truth for the ABI of Flow Scheduler.
    },
    mainnet: {
      vestingScheduler: vestingContractAddresses.ethereum, // Mainnet used as source of truth for the ABI of Vesting Scheduler.
      autoWrapManager: autoWrapManagerAddresses[1],
      autoWrapStrategy: autoWrapStrategyAddresses[1]
    }
  },
  outputPath: "./src/eth-sdk/client",
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
