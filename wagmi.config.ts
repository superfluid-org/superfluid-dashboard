import { defineConfig } from "@wagmi/cli";
import { etherscan, react } from "@wagmi/cli/plugins";
import { erc20ABI } from "wagmi";
import { autoWrapManagerAddresses } from "./src/features/network/networkConstants";
import nativeAssetSuperTokenJSON from "@superfluid-finance/ethereum-contracts/build/truffle/SETHProxy.json" assert { type: "json" };
import pureSuperTokenJSON from "@superfluid-finance/ethereum-contracts/build/truffle/PureSuperToken.json" assert { type: "json" };
import superTokenJSON from "@superfluid-finance/ethereum-contracts/build/truffle/SuperToken.json" assert { type: "json" };
import ConstantFlowAgreementV1JSON from "@superfluid-finance/ethereum-contracts/build/truffle/ConstantFlowAgreementV1.json" assert { type: "json" };
import { Abi, Address } from "viem";
import superfluidMetadata from "@superfluid-finance/metadata";

/** @type {import('@wagmi/cli').Config} */
export default defineConfig({
  out: "src/generated.ts",
  contracts: [
    {
      name: "ERC20",
      abi: erc20ABI,
    },
    {
      name: "SuperToken",
      abi: superTokenJSON.abi as Abi,
    },
    {
      name: "NativeAssetSuperToken",
      abi: nativeAssetSuperTokenJSON.abi as Abi,
    },
    {
      name: "PureSuperToken",
      abi: pureSuperTokenJSON.abi as Abi,
    },
    {
      name: "ConstantFlowAgreementV1",
      abi: ConstantFlowAgreementV1JSON.abi as Abi,
      address: superfluidMetadata.networks.reduce((acc, current) => {
        acc[current.chainId] = current.contractsV1.cfaV1 as Address;
        return acc;
      }, {} as Record<number, Address>),
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
        },
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
      usePrepareContractFunctionWrite: false,
    }),
  ],
});
