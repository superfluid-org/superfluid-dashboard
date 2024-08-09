import { defineConfig } from "@wagmi/cli";
import { etherscan, react } from "@wagmi/cli/plugins";
import { autoWrapManagerAddresses } from "./src/features/network/networkConstants";
import nativeAssetSuperTokenJSON from "@superfluid-finance/ethereum-contracts/build/truffle/SETHProxy.json" assert { type: "json" };
import pureSuperTokenJSON from "@superfluid-finance/ethereum-contracts/build/truffle/PureSuperToken.json" assert { type: "json" };
import superTokenJSON from "@superfluid-finance/ethereum-contracts/build/truffle/SuperToken.json" assert { type: "json" };
import ConstantFlowAgreementV1JSON from "@superfluid-finance/ethereum-contracts/build/truffle/ConstantFlowAgreementV1.json" assert { type: "json" };
import GeneralDistributionAgreementV1JSON from "@superfluid-finance/ethereum-contracts/build/truffle/GeneralDistributionAgreementV1.json" assert { type: "json" };
import SuperfluidPoolJSON from "@superfluid-finance/ethereum-contracts/build/truffle/SuperfluidPool.json" assert { type: "json" };
import { Abi, Address, erc20Abi } from "viem";
import superfluidMetadata from "@superfluid-finance/metadata";

/** @type {import('@wagmi/cli').Config} */
export default defineConfig({
  out: "src/generated.ts",
  contracts: [
    {
      name: "ERC20",
      abi: erc20Abi,
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
      name: "SuperfluidPool",
      abi: SuperfluidPoolJSON.abi as Abi,
    },
    {
      name: "ConstantFlowAgreementV1",
      abi: ConstantFlowAgreementV1JSON.abi as Abi,
      address: superfluidMetadata.networks.reduce((acc, current) => {
        acc[current.chainId] = current.contractsV1.cfaV1 as Address;
        return acc;
      }, {} as Record<number, Address>),
    },
    {
      name: "GeneralDistributionAgreementV1",
      abi: GeneralDistributionAgreementV1JSON.abi as Abi,
      address: superfluidMetadata.networks.reduce((acc, current) => {
        const address = current.contractsV1.gdaV1 as Address;
        if (address) {
          acc[current.chainId] = address;
        }
        return acc;
      }, {} as Record<number, Address>),
    },
  ],
  plugins: [
    etherscan({
      apiKey: "EF6BHPSNND79YCJ52Q31GHUZDHP5RQWTAD", // Kaspar's personal key
      chainId: 1,
      contracts: [
        {
          name: "AutoWrapManager",
          address: autoWrapManagerAddresses,
        },
      ],
    }),
    react({
      getHookName: 'legacy', 
      
    }),
  ],
});
