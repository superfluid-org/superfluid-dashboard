import {
  createContext,
  FC,
  PropsWithChildren,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useAppDispatch, useAppSelector } from "../redux/store";
import { useAvailableNetworks } from "./AvailableNetworksContext";
import { useExpectedNetwork } from "./ExpectedNetworkContext";
import { hideNetwork, unhideNetwork } from "./networkPreferences.slice";
import { Network } from "./networks";

interface ActiveNetworksContextValue {
  testnetMode: boolean;
  setTestnetMode: (value: boolean) => void;
  activeNetworks: Network[];
  hideNetwork: (chainId: number) => void;
  unhideNetwork: (chainId: number) => void;
}

const ActiveNetworksContext = createContext<ActiveNetworksContextValue>(null!);

export const ActiveNetworksProvider: FC<PropsWithChildren> = ({ children }) => {
  const { availableNetworks } = useAvailableNetworks();
  const { network } = useExpectedNetwork();
  const [testnetMode, setTestnetMode] = useState(false);

  const hiddenNetworkChainIds = useAppSelector(
    (state) => state.networkPreferences.hidden
  );

  const dispatch = useAppDispatch();

  const activeNetworks = useMemo(
    () =>
      [
        ...availableNetworks.filter((x) => x === network),
        ...availableNetworks.filter((x) => x !== network),
      ] // Sort active chain to be the first in the list. Solution inspired by: https://stackoverflow.com/a/62071369/6099842
        .filter((x) => !!x.testnet === testnetMode)
        .filter((x) => !hiddenNetworkChainIds.includes(x.id)),
    [network, availableNetworks, testnetMode, hiddenNetworkChainIds]
  );

  const contextValue = useMemo<ActiveNetworksContextValue>(
    () => ({
      testnetMode,
      setTestnetMode,
      activeNetworks,
      hideNetwork: (chainId) => void dispatch(hideNetwork(chainId)),
      unhideNetwork: (chainId) => void dispatch(unhideNetwork(chainId)),
    }),
    [testnetMode, setTestnetMode, activeNetworks, dispatch]
  );

  useEffect(() => {
    if (network) {
      setTestnetMode(!!network.testnet);
    }
  }, [network]);

  return (
    <ActiveNetworksContext.Provider value={contextValue}>
      {children}
    </ActiveNetworksContext.Provider>
  );
};

export const useActiveNetworks = () => useContext(ActiveNetworksContext);
