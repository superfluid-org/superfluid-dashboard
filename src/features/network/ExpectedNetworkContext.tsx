import { isString } from "lodash";
import { useRouter } from "next/router";
import {
  createContext,
  FC,
  ReactNode,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useNetwork } from "wagmi";
import { wagmiClient } from "../wallet/WagmiManager";
import { useActiveNetworks } from "./ActiveNetworksContext";
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
  stopAutoSwitchToAccountNetwork: () => void;
}

const ExpectedNetworkContext = createContext<ExpectedNetworkContextValue>(
  null!
);

export const ExpectedNetworkProvider: FC<{
  children: (network: Network) => ReactNode;
}> = ({ children }) => {
  const [network, setNetwork] = useState<Network>(networksByChainId.get(137)!);
  const [stopAutoSwitch, setStopAutoSwitch] = useState(false);
  const { setTestnetMode } = useActiveNetworks();

  const contextValue: ExpectedNetworkContextValue = useMemo(
    () => ({
      network,
      setExpectedNetwork: (chainId: number) => {
        setNetwork(networksByChainId.get(chainId)!), setStopAutoSwitch(false);
      },
      stopAutoSwitchToAccountNetwork: () => setStopAutoSwitch(true),
    }),
    [network]
  );

  const router = useRouter();

  // When user navigates to a new page then enable automatic switching to user wallet's network again.
  useEffect(() => {
    const onBeforeHistoryChange = () => {
      setStopAutoSwitch(false);
    };
    router.events.on("beforeHistoryChange", onBeforeHistoryChange);
    return () =>
      router.events.off("beforeHistoryChange", onBeforeHistoryChange);
  }, []);

  const { chain: activeChain } = useNetwork();

  useEffect(() => {
    if (stopAutoSwitch) {
      return;
    }

    if (activeChain && activeChain.id !== network.id) {
      const networkFromWallet = networksByChainId.get(activeChain.id);
      if (networkFromWallet) {
        setNetwork(networkFromWallet);
        setTestnetMode(!!networkFromWallet.testnet);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeChain]);

  // # Set network based on the URL querystring.
  const { network: networkQueryParam, _network: networkPathParam } =
    router.query;

  useEffect(() => {
    if (isString(networkQueryParam)) {
      const networkFromQuery = networksBySlug.get(networkQueryParam);
      if (networkFromQuery) {
        setNetwork(networkFromQuery);
      }
      const { network, ...networkQueryParamRemoved } = router.query;
      router
        .replace({ query: networkQueryParamRemoved })
        .then(() => void setStopAutoSwitch(true));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [networkQueryParam]);

  return (
    <ExpectedNetworkContext.Provider value={contextValue}>
      {children(network)}
    </ExpectedNetworkContext.Provider>
  );
};

export const useExpectedNetwork = () => useContext(ExpectedNetworkContext);
