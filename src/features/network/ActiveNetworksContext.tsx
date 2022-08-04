import {
  createContext,
  FC,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useNetwork } from "wagmi";
import { useAppDispatch, useAppSelector } from "../redux/store";
import { hideNetwork, unhideNetwork } from "./networkPreferences.slice";
import { Network, networks, networksByChainId } from "./networks";

interface ActiveNetworksContextValue {
  testnetMode: boolean;
  setTestnetMode: (value: boolean) => void;
  activeNetworks: Network[];
  hideNetwork: (chainId: number) => void;
  unhideNetwork: (chainId: number) => void;
}

const ActiveNetworksContext = createContext<ActiveNetworksContextValue>(null!);

export const ActiveNetworksProvider: FC = ({ children }) => {
  const { chain: activeChain } = useNetwork();
  const [testnetMode, setTestnetMode] = useState(false);

  const hiddenNetworkChainIds = useAppSelector(
    (state) => state.networkPreferences.hidden
  );

  const dispatch = useAppDispatch();

  const activeNetworks = useMemo(
    () =>
      (activeChain
        ? [
            ...networks.filter((x) => x.id === activeChain.id),
            ...networks.filter((x) => x.id !== activeChain.id),
          ] // Sort active chain to be the first in the list. Solution inspired by: https://stackoverflow.com/a/62071369/6099842
        : networks
      )
        .filter((x) => !!x.testnet === testnetMode)
        .filter((x) => !hiddenNetworkChainIds.includes(x.id)),
    [activeChain, testnetMode, hiddenNetworkChainIds]
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
    if (activeChain) {
      setTestnetMode(!!activeChain.testnet);
    }
  }, [activeChain]);

  return (
    <ActiveNetworksContext.Provider value={contextValue}>
      {children}
    </ActiveNetworksContext.Provider>
  );
};

export const useActiveNetworks = () => useContext(ActiveNetworksContext);
