import { providers, Signer } from "ethers";
import { allNetworks, findNetworkOrThrow } from "../features/network/networks";
import { FlowScheduler__factory } from "./client/esm/types/factories/goerli";
import {
  AutoWrapManager__factory,
  AutoWrapStrategy__factory,
  VestingScheduler__factory,
} from "./client/esm/types/factories/mainnet";
import { AutoWrapManager, AutoWrapStrategy } from "./client/esm/types";

export const getFlowScheduler = (
  chainId: number,
  providerOrSigner: providers.Provider | Signer
) => {
  const network = findNetworkOrThrow(allNetworks, chainId);

  const networkContractAddress = network?.flowSchedulerContractAddress;
  const doesNetworkSupportContract = !!networkContractAddress;
  if (!doesNetworkSupportContract) {
    throw new Error(
      `Flow Scheduler not available for network [${chainId}:${network?.name}].`
    );
  }

  return FlowScheduler__factory.connect(
    networkContractAddress,
    providerOrSigner
  );
};

export const getVestingScheduler = (
  chainId: number,
  providerOrSigner: providers.Provider | Signer
) => {
  const network = findNetworkOrThrow(allNetworks, chainId);

  const networkContractAddress = network?.vestingContractAddress;
  const doesNetworkSupportContract = networkContractAddress;
  if (!doesNetworkSupportContract) {
    throw new Error(
      `Vesting Scheduler not available for network [${chainId}:${network?.name}].`
    );
  }

  return VestingScheduler__factory.connect(
    networkContractAddress,
    providerOrSigner
  );
};

export const getAutoWrap = (
  chainId: number,
  providerOrSigner: providers.Provider | Signer
): {
  manager: AutoWrapManager;
  strategy: AutoWrapStrategy;
} => {
  const network = findNetworkOrThrow(allNetworks, chainId);

  const networkContractAddresses = network?.autoWrap;
  const doesNetworkSupportContract = networkContractAddresses;
  if (!doesNetworkSupportContract) {
    throw new Error(
      `Auto-Wrap not available for network [${chainId}:${network?.name}].`
    );
  }

  return {
    manager: AutoWrapManager__factory.connect(
      networkContractAddresses.managerContractAddress,
      providerOrSigner
    ),
    strategy: AutoWrapStrategy__factory.connect(
      networkContractAddresses.strategyContractAddress,
      providerOrSigner
    ),
  };
};
