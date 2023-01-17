import { defineConfig } from "@dethcrypto/eth-sdk";
import {
  NetworkID,
  networkIDtoSymbol,
} from "@dethcrypto/eth-sdk/dist/abi-management/networks";
import { isUndefined } from "lodash";
import { networkDefinition } from "../features/network/networks";

const ethSdkConfig = defineConfig({
  contracts: Object.entries(networkDefinition).reduce(
    (previousValue, [networkName, network]) => {
      const networkContracts = {
        ...(!isUndefined(network.flowSchedulerContractAddress)
          ? { flowScheduler: network.flowSchedulerContractAddress }
          : {}),
        ...(!isUndefined(network.vestingContractAddress)
          ? { vestingScheduler: network.vestingContractAddress }
          : {}),
      };

      if (Object.keys(networkContracts).length) {
        const networkSymbol = networkIDtoSymbol[network.id as NetworkID];
        if (!networkSymbol)
          throw new Error(
            "Eth-Sdk does not have pre-defined support for this network. You have to handle it somehow... https://github.com/dethcrypto/eth-sdk"
          );
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