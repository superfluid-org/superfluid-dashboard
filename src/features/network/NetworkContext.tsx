import { createContext, FC, ReactNode, useContext, useState } from "react";
import { Network, networksByChainId } from "./networks";

const NetworkContext = createContext<{
  network: Network;
  setNetwork: (chainId: number) => void;
}>(null!);

export const NetworkContextProvider: FC<{
  children: (network: Network) => ReactNode;
}> = ({ children }) => {
  const [network, setNetwork] = useState<Network>(networksByChainId.get(137)!);

  return (
    <NetworkContext.Provider
      value={{
        network: network,
        setNetwork: (chainId) => setNetwork(networksByChainId.get(chainId)!),
      }}
    >
      {children(network)}
    </NetworkContext.Provider>
  );
};

export const useNetworkContext = () => useContext(NetworkContext);
