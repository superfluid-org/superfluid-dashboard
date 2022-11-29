import { defineConfig } from "@dethcrypto/eth-sdk";
import { networkDefinition } from "../features/network/networks";

export default defineConfig({
  contracts: {
    goerli: {
      streamScheduler: networkDefinition.goerli.streamSchedulerContractAddress,
      vestingScheduler:
        networkDefinition.goerli.vestingSchedulerContractAddress,
    },
    // polygonMumbai: {
    //   "StreamScheduler": networkDefinition.polygonMumbai.streamSchedulerContractAddress,
    // },
  },
  outputPath: "./src/eth-sdk/client",
});
