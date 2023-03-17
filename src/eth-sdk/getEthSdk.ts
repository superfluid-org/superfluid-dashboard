import { providers, Signer } from "ethers";
import { allNetworks, findNetworkOrThrow } from "../features/network/networks";
import { AutoWrapManager__factory, FlowScheduler__factory } from "./client/esm/types/factories/goerli";
import { VestingScheduler__factory } from "./client/esm/types/factories/mainnet";

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

export const getAutoWrapManager = (
  chainId: number,
  providerOrSigner: providers.Provider | Signer
) => {
  const network = findNetworkOrThrow(allNetworks, chainId);

  const networkContractAddress = network?.autoWrapManagerContractAddress;
  const doesNetworkSupportContract = networkContractAddress;
  if (!doesNetworkSupportContract) {
    throw new Error(
      `Auto Wrap not available for network [${chainId}:${network?.name}].`
    );
  }

  return AutoWrapManager__factory.connect(
    networkContractAddress,
    providerOrSigner
  );
};