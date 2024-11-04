import { providers, Signer } from "ethers";
import { allNetworks, findNetworkOrThrow } from "../features/network/networks";
import { VestingScheduler__factory } from "./client/esm/types/factories/optimismSepolia";
import { VestingScheduler_v2__factory } from "./client/esm/types/factories/optimismSepolia";
import {
  AutoWrapManager__factory,
  AutoWrapStrategy__factory,
  FlowScheduler__factory
} from "./client/esm/types/factories/mainnet";
import { AutoWrapManager, AutoWrapStrategy, VestingScheduler, VestingScheduler_v2 } from "./client/esm/types";

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

// Define a generic type for versions
type Version = 'v1' | 'v2';
type VestingSchedulerType<T extends Version> = T extends 'v1' ? VestingScheduler : VestingScheduler_v2;

export const getVestingScheduler = <T extends Version>(
  chainId: number,
  providerOrSigner: providers.Provider | Signer,
  version: T
): VestingSchedulerType<T> => {
  const network = findNetworkOrThrow(allNetworks, chainId);

  const contractInfo = version === 'v2' ? network.vestingContractAddress_v2 : network.vestingContractAddress_v1;
  const doesNetworkSupportContract = !!contractInfo;
  if (!doesNetworkSupportContract) {
    throw new Error(
      `Vesting Scheduler not available for network [${chainId}:${network?.name}].`
    );
  }

  if (version === 'v2') {
    return VestingScheduler_v2__factory.connect(
      contractInfo.address,
      providerOrSigner
    ) as VestingSchedulerType<T>;
  }

  return VestingScheduler__factory.connect(
    contractInfo.address,
    providerOrSigner
  ) as VestingSchedulerType<T>;
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
