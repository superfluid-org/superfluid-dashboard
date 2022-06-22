import { createContext, FC, useContext, useMemo, useState } from "react";
import { useAppDispatch, useAppSelector } from "../redux/store";
import { hideNetwork, unhideNetwork } from "./networkPreferences.slice";
import { Network, networks } from "./networks";

interface ActiveNetworksContextValue {
  testnetMode: boolean;
  setTestnetMode: (value: boolean) => void;
  activeNetworks: Network[];
  hideNetwork: (chainId: number) => void;
  unhideNetwork: (chainId: number) => void;
}

const ActiveNetworksContext = createContext<ActiveNetworksContextValue>(null!);

export const ActiveNetworksProvider: FC = ({ children }) => {
  const [testnetMode, setTestnetMode] = useState(false);

  const hiddenNetworkChainIds = useAppSelector(
    (state) => state.networkPreferences.hidden
  );

  const dispatch = useAppDispatch();

  const activeNetworks = useMemo(
    () =>
      networks
        .filter((x) => !!x.testnet === testnetMode)
        .filter((x) => !hiddenNetworkChainIds.includes(x.id)),
    [testnetMode, hiddenNetworkChainIds]
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

  return (
    <ActiveNetworksContext.Provider value={contextValue}>
      {children}
    </ActiveNetworksContext.Provider>
  );
};

export const useActiveNetworks = () => useContext(ActiveNetworksContext);