import { defineConfig } from "@dethcrypto/eth-sdk";
import { networkDefinition } from "../features/network/networks";

export default defineConfig({
  contracts: {
    goerli: {
      flowScheduler: networkDefinition.goerli.flowSchedulerContractAddress,
      vestingScheduler:
        networkDefinition.goerli.vestingSchedulerContractAddress,
    }
  },
  outputPath: "./src/eth-sdk/client",
});
