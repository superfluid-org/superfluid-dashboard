import { defineConfig } from '@dethcrypto/eth-sdk'
import { networkDefinition } from '../features/network/networks';

export const STREAM_SCHEDULAR_CONTRACT_ADDRESS = "0x6Cd517392e1d4e7ea4B05659B4302Da20c964E2f";

export default defineConfig({
  contracts: {
    goerli: {
      "StreamScheduler": networkDefinition.goerli.streamSchedulerContractAddress,
    },
    polygonMumbai: {
      "StreamScheduler": networkDefinition.polygonMumbai.streamSchedulerContractAddress,
    },
  },
  outputPath: "./src/eth-sdk/client"
})