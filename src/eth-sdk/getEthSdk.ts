import { providers, Signer } from "ethers";
import { networkDefinition } from "../features/network/networks";
import { getGoerliSdk, getPolygonSdk } from "./client";

export const getFlowScheduler = (
  chainId: number,
  providerOrSigner: providers.Provider | Signer
) => {
  if (chainId === networkDefinition.goerli.id) {
    return getGoerliSdk(providerOrSigner).flowScheduler;
  }

  throw new Error("FlowScheduler not available for network.");
};

export const getVestingScheduler = (
  chainId: number,
  providerOrSigner: providers.Provider | Signer
) => {
  if (chainId === networkDefinition.goerli.id) {
    return getGoerliSdk(providerOrSigner).vestingScheduler;
  }

  if (chainId === networkDefinition.polygon.id) {
    return getPolygonSdk(providerOrSigner).vestingScheduler;
  }

  throw new Error("Eth-SDK not available for network.");
};
