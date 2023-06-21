import {
  createContext,
  FC,
  PropsWithChildren,
  useContext,
  useMemo,
} from "react";
import { Network, allNetworks } from "./networks";

interface AvailableNetworksContextValue {
  availableNetworks: Network[];
  availableMainNetworks: Network[];
  availableTestNetworks: Network[];
  availableNetworksByChainId: Map<number, Network>;
  availableNetworksBySlug: Map<string, Network>;
}

const AvailableNetworksContext = createContext<AvailableNetworksContextValue>(
  null!
);

export const AvailableNetworksProvider: FC<PropsWithChildren> = ({
  children,
}) => {

  const availableNetworksFiltered = useMemo(
    () => ({
      availableMainNetworks: allNetworks.filter((network) => !network.testnet),
      availableTestNetworks: allNetworks.filter((network) => network.testnet),
      availableNetworksByChainId: new Map(
        allNetworks.map((network) => [network.id, network])
      ),
      availableNetworksBySlug: new Map(
        allNetworks.map((network) => [network.slugName, network])
      ),
    }),
    []
  );

  const contextValue = useMemo<AvailableNetworksContextValue>(
    () => ({
      availableNetworks: allNetworks,
      ...availableNetworksFiltered,
    }),
    []
  );

  return (
    <AvailableNetworksContext.Provider value={contextValue}>
      {children}
    </AvailableNetworksContext.Provider>
  );
};

export const useAvailableNetworks = () => useContext(AvailableNetworksContext);
