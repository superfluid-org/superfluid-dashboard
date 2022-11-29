import {providers, Signer} from "ethers";
import {networkDefinition} from "../features/network/networks";
import {getGoerliSdk} from "./client";

export const getEthSdk = (
    chainId: number,
    providerOrSigner: providers.Provider | Signer
) => {
    if (chainId === networkDefinition.goerli.id) {
        return getGoerliSdk(providerOrSigner);
    }

    throw new Error();
};