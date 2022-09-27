import { defineConfig } from '@dethcrypto/eth-sdk'
import { networkDefinition } from '../features/network/networks';

export default defineConfig({
  contracts: {
    goerli: {
      "StreamScheduler": networkDefinition.goerli.streamSchedulerContractAddress,
    },
    // polygonMumbai: {
    //   "StreamScheduler": networkDefinition.polygonMumbai.streamSchedulerContractAddress,
    // },
  },
  outputPath: "./src/eth-sdk/client"
})