import { defineConfig } from "@wagmi/cli";
import { etherscan, react } from "@wagmi/cli/plugins";
import { erc20ABI } from "wagmi";
import {
  autoWrapManagerAddresses,
} from "./src/features/network/networkConstants";

/** @type {import('@wagmi/cli').Config} */
export default defineConfig({
  out: "src/generated.ts",
  contracts: [
    {
      name: "erc20",
      abi: erc20ABI,
    },
  ],
  plugins: [
    etherscan({
      apiKey: "WW2B6KB1FAXNTWP8EJQJYFTK1CMG1W4DWZ", // From eth-sdk: https://github.com/dethcrypto/eth-sdk/blob/0cf7dd50617de710068bde76f774208573a841d3/packages/eth-sdk/src/abi-management/etherscan/explorerEndpoints.ts#LL4C57-L4C57
      chainId: 5,
      contracts: [
        {
          name: "AutoWrapManager",
          address: autoWrapManagerAddresses,
        }
      ],
    }),
    react({
      useContractWrite: false,
      useContractRead: false,
      useContractItemEvent: false,
      useContractFunctionRead: false,
      useContractEvent: false,
      useContractFunctionWrite: false,
      usePrepareContractWrite: false,
      usePrepareContractFunctionWrite: false
    }),
  ],
});
