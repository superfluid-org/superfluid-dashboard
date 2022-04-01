import { createContext, FC, useContext, useState } from "react";
import { Network, networksByChainId } from "../networks";

const NetworkContext = createContext<{
  network: Network;
  setNetwork: (provider: Network) => void;
}>({
  network: null!,
  setNetwork: () => {
    throw new Error("`setNetwork` has not been initialized.");
  },
});

export default NetworkContext;

export const NetworkContextProvider: FC = ({ children }) => {
  const [network, setNetwork] = useState<Network>(networksByChainId.get(137)!);

  return (
    <NetworkContext.Provider
      value={{
        network: network,
        setNetwork: (network) => setNetwork(network),
      }}
    >
      {children}
    </NetworkContext.Provider>
  );
};

export const useNetworkContext = () => useContext(NetworkContext);
