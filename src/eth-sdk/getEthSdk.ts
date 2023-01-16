import { providers, Signer } from "ethers";
import { networkDefinition } from "../features/network/networks";
import { getGoerliSdk, getPolygonSdk } from "./client";
import { configuredNetworks } from "./config";

export const getEthSdk = (
  chainId: number,
  providerOrSigner: providers.Provider | Signer
) => {
  if (chainId === networkDefinition.polygon.id) {
    return getPolygonSdk(providerOrSigner);
  }

  if (chainId === networkDefinition.goerli.id) {
    return getGoerliSdk(providerOrSigner);
  }

  if (configuredNetworks.some((x) => x.chainId === chainId)) {
    throw new Error(
      "Network has Eth-SDK but it's not handled. Please add it to the function ASAP!"
    );
  }

  throw new Error("Eth-SDK not available for network.");
};
