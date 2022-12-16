import {
  createContext,
  FC,
  PropsWithChildren,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useNetwork } from "wagmi";
import { Flag } from "../flags/flags.slice";
import { useHasFlag } from "../flags/flagsHooks";
import { useAppDispatch, useAppSelector } from "../redux/store";
import { useExpectedNetwork } from "./ExpectedNetworkContext";
import { hideNetwork, unhideNetwork } from "./networkPreferences.slice";
import {
  Network,
  networkDefinition,
  networks,
  networksByChainId,
} from "./networks";

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
  const isMainnetEnabled = useHasFlag({
    type: Flag.MainnetFeature,
  });

  const availableNetworks = useMemo(
    () =>
      networks.filter(
        (network) =>
          !(network.id === networkDefinition.ethereum.id && !isMainnetEnabled)
      ),
    [isMainnetEnabled]
  );

  const contextValue = useMemo<AvailableNetworksContextValue>(
    () => ({
      availableNetworks,
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
    [availableNetworks]
  );

  return (
    <AvailableNetworksContext.Provider value={contextValue}>
      {children}
    </AvailableNetworksContext.Provider>
  );
};

export const useAvailableNetworks = () => useContext(AvailableNetworksContext);
