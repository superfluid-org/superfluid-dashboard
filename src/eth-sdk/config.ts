import { defineConfig } from '@dethcrypto/eth-sdk'

export const STREAM_SCHEDULAR_CONTRACT_ADDRESS = "0x04851f0be31a98133E2D6bFFDAe56908b05cdBDB";

export default defineConfig({
  contracts: {
    goerli: {
      "StreamScheduler": STREAM_SCHEDULAR_CONTRACT_ADDRESS,
    },
  },
  outputPath: "./src/eth-sdk/client"
})