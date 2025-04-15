import { defineConfig } from "@wagmi/cli";
import { etherscan, react } from "@wagmi/cli/plugins";
import { autoWrapManagerAddresses, vestingContractAddresses_v3 } from "./src/features/network/networkConstants";
import nativeAssetSuperTokenJSON from "@superfluid-finance/ethereum-contracts/build/truffle/SETHProxy.json" assert { type: "json" };
import pureSuperTokenJSON from "@superfluid-finance/ethereum-contracts/build/truffle/PureSuperToken.json" assert { type: "json" };
import superTokenJSON from "@superfluid-finance/ethereum-contracts/build/truffle/SuperToken.json" assert { type: "json" };
import ConstantFlowAgreementV1JSON from "@superfluid-finance/ethereum-contracts/build/truffle/ConstantFlowAgreementV1.json" assert { type: "json" };
import GeneralDistributionAgreementV1JSON from "@superfluid-finance/ethereum-contracts/build/truffle/GeneralDistributionAgreementV1.json" assert { type: "json" };
import SuperfluidPoolJSON from "@superfluid-finance/ethereum-contracts/build/truffle/SuperfluidPool.json" assert { type: "json" };
import SuperfluidJSON from "@superfluid-finance/ethereum-contracts/build/truffle/Superfluid.json" assert { type: "json" };
import cfaV1ForwarderJSON from "@superfluid-finance/ethereum-contracts/build/truffle/CFAv1Forwarder.json" assert { type: "json" };
import { Abi, Address, erc20Abi } from "viem";
import superfluidMetadata from "@superfluid-finance/metadata";
import vestingSchedulerV1Abi from "./src/eth-sdk/abis/optimismSepolia/vestingScheduler.json" assert { type: "json" };
import vestingSchedulerV2Abi from "./src/eth-sdk/abis/optimismSepolia/vestingScheduler_v2.json" assert { type: "json" };
import vestingSchedulerV3Abi from "./src/eth-sdk/abis/optimismSepolia/vestingScheduler_v3.json" assert { type: "json" };

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
      name: "CfaV1Forwarder",
      abi: cfaV1ForwarderJSON.abi as Abi,
      address: superfluidMetadata.networks.reduce((acc, current) => {
        acc[current.chainId] = current.contractsV1.cfaV1Forwarder as Address;
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
    {
      name: "Superfluid",
      abi: SuperfluidJSON.abi as Abi,
      address: superfluidMetadata.networks.reduce((acc, current) => {
        const address = current.contractsV1.host as Address;
        if (address) {
          acc[current.chainId] = address;
        }
        return acc;
      }, {} as Record<number, Address>),
    },
    {
      name: "VestingScheduler",
      abi: vestingSchedulerV1Abi as Abi,
      address: superfluidMetadata.networks.reduce((acc, current) => {
        const address = current.contractsV1.vestingScheduler as Address;
        if (address) {
          acc[current.chainId] = address;
        }
        return acc;
      }, {} as Record<number, Address>),
    },
    {
      name: "VestingSchedulerV2",
      abi: vestingSchedulerV2Abi as Abi,
      address: superfluidMetadata.networks.reduce((acc, current) => {
        const address = current.contractsV1.vestingSchedulerV2 as Address;
        if (address) {
          acc[current.chainId] = address;
        }
        return acc;
      }, {} as Record<number, Address>),
    },
    {
      name: "VestingSchedulerV3",
      abi: vestingSchedulerV3Abi as Abi,
      address: Object.entries(vestingContractAddresses_v3).reduce((acc, [chainId, address]) => {
        acc[Number(chainId)] = address;
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
      getHookName: 'legacy'
    })
  ],
});
