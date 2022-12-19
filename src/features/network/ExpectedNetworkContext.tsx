import { isString } from "lodash";
import { useRouter } from "next/router";
import {
  createContext,
  FC,
  PropsWithChildren,
  ReactNode,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useNetwork } from "wagmi";
import { useAvailableNetworks } from "./AvailableNetworksContext";
import { Network, networksByChainId, networksBySlug } from "./networks";

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
  const { availableNetworksByChainId, availableNetworksBySlug } =
    useAvailableNetworks();

  const [network, setNetwork] = useState<Network>(
    availableNetworksByChainId.get(137)!
  );
  const [autoSwitchStop, setAutoSwitchStop] = useState(false);

  const contextValue: ExpectedNetworkContextValue = useMemo(
    () => ({
      network,
      setExpectedNetwork: (chainId: number) => {
        setNetwork(availableNetworksByChainId.get(chainId)!),
          setAutoSwitchStop(false);
      },
      stopAutoSwitchToWalletNetwork: () => setAutoSwitchStop(true),
      isAutoSwitchStopped: autoSwitchStop,
    }),
    [network, autoSwitchStop, setAutoSwitchStop, availableNetworksByChainId]
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
  }, []);

  const { chain: activeChain } = useNetwork();

  useEffect(() => {
    if (autoSwitchStop) {
      return;
    }

    if (activeChain && activeChain.id !== network.id) {
      const networkFromWallet = availableNetworksByChainId.get(activeChain.id);
      if (networkFromWallet) {
        // setTestnetMode(!!activeChain.testnet);
        setNetwork(networkFromWallet);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeChain, availableNetworksByChainId]);

  // # Set network based on the URL querystring.
  const { network: networkQueryParam, _network: networkPathParam } =
    router.query;

  useEffect(() => {
    if (isString(networkQueryParam)) {
      const networkFromQuery = availableNetworksBySlug.get(networkQueryParam);
      if (networkFromQuery) {
        setNetwork(networkFromQuery);
      }
      const { network, ...networkQueryParamRemoved } = router.query;
      router
        .replace({ query: networkQueryParamRemoved })
        .then(() => void setAutoSwitchStop(true));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [networkQueryParam, availableNetworksBySlug]);

  return (
    <ExpectedNetworkContext.Provider value={contextValue}>
      {children}
    </ExpectedNetworkContext.Provider>
  );
};

export const useExpectedNetwork = () => useContext(ExpectedNetworkContext);
