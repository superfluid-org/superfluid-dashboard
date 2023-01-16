import { defineConfig } from "@dethcrypto/eth-sdk";
import {
  NetworkID,
  networkIDtoSymbol,
} from "@dethcrypto/eth-sdk/dist/abi-management/networks";
import { isUndefined } from "lodash";
import { networkDefinition } from "../features/network/networks";

export const configuredNetworks: { chainId: number; symbol: string }[] = [];

const ethSdkConfig = defineConfig({
  contracts: Object.entries(networkDefinition).reduce(
    (previousValue, [networkName, network]) => {
      const networkContracts = {
        ...(!isUndefined(network.flowSchedulerContractAddress)
          ? { flowScheduler: network.flowSchedulerContractAddress }
          : {}),
        ...(!isUndefined(network.vestingSchedulerContractAddress)
          ? { vestingScheduler: network.vestingSchedulerContractAddress }
          : {}),
      };

      if (Object.keys(networkContracts).length) {
        const networkSymbol = networkIDtoSymbol[network.id as NetworkID];
        if (!networkSymbol)
          throw new Error(
            "Eth-Sdk does not have pre-defined support for this network. You have to handle it somehow... https://github.com/dethcrypto/eth-sdk"
          );
        configuredNetworks.push({ chainId: network.id, symbol: networkSymbol });
        previousValue[networkSymbol] = networkContracts;
      }

      return previousValue;
    },
    {} as Record<
      string,
      { flowScheduler?: `0x${string}`; vestingScheduler?: `0x${string}` }
    >
  ),
  outputPath: "./src/eth-sdk/client",
});

export default ethSdkConfig;