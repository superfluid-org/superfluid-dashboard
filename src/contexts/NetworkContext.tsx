import { createContext, FC, ReactNode, useContext, useState } from "react";
import { Network, networksByChainId } from "../networks";

const NetworkContext = createContext<{
  network: Network;
  setNetwork: (provider: Network) => void;
}>(null!);

export default NetworkContext;

export const NetworkContextProvider: FC<{
  children: (network: Network) => ReactNode;
}> = ({ children }) => {
  const [network, setNetwork] = useState<Network>(networksByChainId.get(137)!);

  return (
    <NetworkContext.Provider
      value={{
        network: network,
        setNetwork: (network) => setNetwork(network),
      }}
    >
      {children(network)}
    </NetworkContext.Provider>
  );
};

export const useNetworkContext = () => useContext(NetworkContext);
