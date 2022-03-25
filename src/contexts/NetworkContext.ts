import { createContext, useContext } from "react";
import { Network, networksByChainId } from "../networks";

const NetworkContext = createContext<{
    network: Network,
    setNetwork: (provider: Network) => void 
}>({
    network: null!,
    setNetwork: () => { throw new Error("`setNetwork` has not been initialized.") }
});

export default NetworkContext;

export const useNetworkContext = () => useContext(NetworkContext);