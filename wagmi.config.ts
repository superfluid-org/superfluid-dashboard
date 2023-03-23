import { defineConfig } from '@wagmi/cli'
import { etherscan } from '@wagmi/cli/plugins'
import { erc20ABI } from 'wagmi'

/** @type {import('@wagmi/cli').Config} */
export default defineConfig({
  out: 'src/generated.ts',
  contracts: [
    {
      name: 'erc20',
      abi: erc20ABI,
    },
  ],
  plugins: [
    etherscan({
      chainId: 5,
      apiKey: "WW2B6KB1FAXNTWP8EJQJYFTK1CMG1W4DWZ", // From eth-sdk: https://github.com/dethcrypto/eth-sdk/blob/0cf7dd50617de710068bde76f774208573a841d3/packages/eth-sdk/src/abi-management/etherscan/explorerEndpoints.ts#LL4C57-L4C57
      contracts: [
        {
          name: 'AutoWrapManager',
          address: "0x0B82D14E9616ca4d260E77454834AdCf5887595F",
        },
        {
          name: 'AutoWrapStrategy',
          address: "0xea49af829d3e28d3ec49e0e0a0ba1e7860a56f60",
        },
      ],
    }),
  ],
})
