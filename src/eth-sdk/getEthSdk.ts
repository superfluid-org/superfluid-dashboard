import { providers, Signer } from "ethers";
import { allNetworks, findNetworkOrThrow } from "../features/network/networks";
import { FlowScheduler__factory } from "./client/esm/types/factories/goerli";
import { VestingScheduler__factory } from "./client/esm/types/factories/mainnet";

export const getFlowScheduler = (
  chainId: number,
  providerOrSigner: providers.Provider | Signer
) => {
  const network = findNetworkOrThrow(allNetworks, chainId);

  const networkFlowSchedulerAddress = network?.flowSchedulerContractAddress;
  const doesNetworkSupportFlowScheduler = !!networkFlowSchedulerAddress;
  if (!doesNetworkSupportFlowScheduler) {
    throw new Error(
      `Flow Scheduler not available for network [${chainId}:${network?.name}].`
    );
  }

  return FlowScheduler__factory.connect(
    networkFlowSchedulerAddress,
    providerOrSigner
  );
};

export const getVestingScheduler = (
  chainId: number,
  providerOrSigner: providers.Provider | Signer
) => {
  const network = findNetworkOrThrow(allNetworks, chainId);

  const networkVestingSchedulerAddress = network?.vestingContractAddress;
  const doesNetworkSupportVestingScheduler = networkVestingSchedulerAddress;
  if (!doesNetworkSupportVestingScheduler) {
    throw new Error(
      `Vesting Scheduler not available for network [${chainId}:${network?.name}].`
    );
  }

  return VestingScheduler__factory.connect(
    networkVestingSchedulerAddress,
    providerOrSigner
  );
};
