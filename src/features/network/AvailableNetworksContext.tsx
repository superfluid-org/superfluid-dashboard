import { isString } from "lodash";
import {
  createContext,
  FC,
  PropsWithChildren,
  useCallback,
  useContext,
  useMemo,
} from "react";
import { useFeatureFlags } from "../featureFlags/FeatureFlagContext";
import { Network, networkDefinition, networks } from "./networks";

interface AvailableNetworksContextValue {
  availableNetworks: Network[];
  availableMainNetworks: Network[];
  availableTestNetworks: Network[];
  availableNetworksByChainId: Map<number, Network>;
  availableNetworksBySlug: Map<string, Network>;
  tryFindNetwork: (value: unknown) => Network | undefined;
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
      networks.filter(
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
        networks.map((network) => [network.slugName, network])
      ),
    }),
    availableNetworks
  );

  const tryFindNetwork = useCallback(
    (value: unknown): Network | undefined => {
      const asNumber = Number(value);
      if (isFinite(asNumber)) {
        return availableNetworksFiltered.availableNetworksByChainId.get(
          asNumber
        );
      }

      if (isString(value)) {
        const bySlug =
          availableNetworksFiltered.availableNetworksBySlug.get(value);
        if (bySlug) {
          return bySlug;
        }

        const byV1ShortName = networks.find((x) => x.v1ShortName === value);
        if (byV1ShortName) {
          return byV1ShortName;
        }
      }
      return undefined;
    },
    [availableNetworksFiltered]
  );

  const contextValue = useMemo<AvailableNetworksContextValue>(
    () => ({
      availableNetworks,
      ...availableNetworksFiltered,
      tryFindNetwork: tryFindNetwork,
    }),
    [availableNetworks, availableNetworksFiltered, tryFindNetwork]
  );

  return (
    <AvailableNetworksContext.Provider value={contextValue}>
      {children}
    </AvailableNetworksContext.Provider>
  );
};

export const useAvailableNetworks = () => useContext(AvailableNetworksContext);
