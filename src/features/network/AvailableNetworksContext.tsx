import {
  createContext,
  FC,
  PropsWithChildren,
  useContext,
  useMemo,
} from "react";
import { useFeatureFlags } from "../featureFlags/FeatureFlagContext";
import { Network, networkDefinition, allNetworks } from "./networks";

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
  const { isMainnetEnabled } = useFeatureFlags();

  const availableNetworks = useMemo(
    () =>
      allNetworks.filter(
        (network) =>
          !(network.id === networkDefinition.ethereum.id && !isMainnetEnabled)
      ),
    [isMainnetEnabled]
  );

  const availableNetworksFiltered = useMemo(
    () => ({
      availableMainNetworks: availableNetworks.filter(
        (network) => !network.testnet
      ),
      availableTestNetworks: availableNetworks.filter(
        (network) => network.testnet
      ),
      availableNetworksByChainId: new Map(
        availableNetworks.map((network) => [network.id, network])
      ),
      availableNetworksBySlug: new Map(
        allNetworks.map((network) => [network.slugName, network])
      ),
    }),
    [availableNetworks]
  );

  const contextValue = useMemo<AvailableNetworksContextValue>(
    () => ({
      availableNetworks,
      ...availableNetworksFiltered,
    }),
    [availableNetworks, availableNetworksFiltered]
  );

  return (
    <AvailableNetworksContext.Provider value={contextValue}>
      {children}
    </AvailableNetworksContext.Provider>
  );
};

export const useAvailableNetworks = () => useContext(AvailableNetworksContext);
