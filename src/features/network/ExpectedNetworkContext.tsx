import { useRouter } from "next/router";
import {
  createContext,
  FC,
  PropsWithChildren,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useNetwork } from "wagmi";
import { useAvailableNetworks } from "./AvailableNetworksContext";
import { findNetworkOrThrow, Network, networkDefinition, tryFindNetwork } from "./networks";

/**
 * "Expected" points to expected wallet network.
 */
interface ExpectedNetworkContextValue {
  network: Network;
  setExpectedNetwork: (chainId: number) => void;
  /**
   * So that connected wallet's network wouldn't force the "expected network". The use-case here are pre-filled form links and user filling a form before connecting their wallet.
   */
  stopAutoSwitchToWalletNetwork: () => void;
  /**
   * a.k.a: "Stop automatic switch to wallet's chain on connection"
   */
  isAutoSwitchStopped: boolean;
}

const ExpectedNetworkContext = createContext<ExpectedNetworkContextValue>(
  null!
);

export const ExpectedNetworkProvider: FC<PropsWithChildren> = ({
  children,
}) => {
  const { availableNetworks } = useAvailableNetworks();

  const [network, setNetwork] = useState<Network>(
    findNetworkOrThrow(availableNetworks, networkDefinition.optimism.id)
  );
  const [autoSwitchStop, setAutoSwitchStop] = useState(false);

  const stopAutoSwitchToWalletNetwork = useCallback(
    () => setAutoSwitchStop(true),
    []
  );

  const contextValue: ExpectedNetworkContextValue = useMemo(
    () => ({
      network,
      setExpectedNetwork: (chainId: number) => {
        setNetwork(findNetworkOrThrow(availableNetworks, chainId));
        setAutoSwitchStop(false);
      },
      stopAutoSwitchToWalletNetwork,
      isAutoSwitchStopped: autoSwitchStop,
    }),
    [network, autoSwitchStop, availableNetworks, stopAutoSwitchToWalletNetwork]
  );

  const router = useRouter();

  // When user navigates to a new page then enable automatic switching to user wallet's network again.
  useEffect(() => {
    const onRouteChange = (
      _fullPath: string,
      { shallow }: { shallow: boolean }
    ) => {
      if (!shallow) {
        setAutoSwitchStop(false);
      }
    };
    router.events.on("routeChangeStart", onRouteChange);
    return () => router.events.off("routeChangeStart", onRouteChange);
  }, [router.events]);

  const { network: networkQueryParam, _network: networkPathParam } =
    router.query;

  // # Set network from path on app load.
  useEffect(() => {
    if (router.isReady && networkPathParam) {
      const networkFromRouter = tryFindNetwork(
        availableNetworks,
        networkPathParam
      );

      if (networkFromRouter) {
        setNetwork(networkFromRouter);
        stopAutoSwitchToWalletNetwork();
      }
    }
    // This should only run once or twice on app load.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router.isReady]);

  // # Set network from query string.
  useEffect(() => {
    if (router.isReady) {
      const networkFromRouter = tryFindNetwork(
        availableNetworks,
        networkQueryParam
      );

      if (networkFromRouter) {
        setNetwork(networkFromRouter);

        // Clear away the query param after usage.
        const { network, ...networkQueryParamRemoved } = router.query;
        router
          .replace({ query: networkQueryParamRemoved }, undefined, {
            shallow: true,
          })
          .then(() => void stopAutoSwitchToWalletNetwork());
      }
    }
  }, [router.isReady, networkQueryParam]);

  const { chain: activeChain } = useNetwork();

  useEffect(() => {
    if (autoSwitchStop) {
      return;
    }

    if (activeChain && activeChain.id !== network.id) {
      const networkFromWallet = tryFindNetwork(
        availableNetworks,
        activeChain.id
      );
      if (networkFromWallet) {
        setNetwork(networkFromWallet);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeChain, availableNetworks]);

  return (
    <ExpectedNetworkContext.Provider value={contextValue}>
      {children}
    </ExpectedNetworkContext.Provider>
  );
};

export const useExpectedNetwork = () => useContext(ExpectedNetworkContext);
