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
import { Network, networksByChainId, networksBySlug } from "./networks";

interface ExpectedNetworkContextValue {
  network: Network;
  setExpectedNetwork: (chainId: number) => void;
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
  useEffect(() => {
    const onBeforeHistoryChange = () => {
      setStopAutoSwitch(false);
    };
    router.events.on("beforeHistoryChange", onBeforeHistoryChange);
    return () =>
      router.events.off("beforeHistoryChange", onBeforeHistoryChange);
  }, []);

  const { activeChain } = useNetwork();

  useEffect(() => {
    if (stopAutoSwitch) {
      return;
    }

    if (activeChain && activeChain.id !== network.id) {
      const networkFromWallet = networksByChainId.get(activeChain.id);
      if (networkFromWallet) {
        setNetwork(networkFromWallet);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeChain]);

  // # Set network based on the wallet on autoconnect.
  useEffect(() => {
    // NOTE: The autoConnect is also invoked higher up in the component hierachy.
    wagmiClient.autoConnect().then((provider) => {
      if (provider?.chain) {
        if (stopAutoSwitch) {
          return;
        }

        const networkFromConnect = networksByChainId.get(provider.chain.id);
        if (networkFromConnect) {
          setNetwork(networkFromConnect);
        }
      }
    });
  }, []);

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
      router.replace({ query: networkQueryParamRemoved });
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
