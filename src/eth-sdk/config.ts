import { defineConfig } from '@dethcrypto/eth-sdk'

export default defineConfig({
  contracts: {
    goerli: {
      "StreamScheduler": '0x3eAB3c6207F488E475b7955B631B564F0E6317B9',
    },
  },
  outputPath: "./eth-sdk/client"
})