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

interface AppNetworkContextValue {
  network: Network;
  setNetwork: (chainId: number) => void;
}

const AppNetworkContext = createContext<AppNetworkContextValue>(null!);

export const AppNetworkProvider: FC<{
  children: (network: Network) => ReactNode;
}> = ({ children }) => {
  const [network, setNetwork] = useState<Network>(networksByChainId.get(137)!);
  const contextValue: AppNetworkContextValue = useMemo(
    () => ({
      network,
      setNetwork: (chainId: number) =>
        setNetwork(networksByChainId.get(chainId)!),
    }),
    [network, setNetwork]
  );

  const router = useRouter();
  const { activeChain } = useNetwork();
  
  useEffect(() => {
    // TODO(KK): Flaky and hard to maintain logic. Refactor when doing form contexts.
    const inputFormPaths = ["/wrap", "/send"];
    const isCurrentlyOnInputFormPath = inputFormPaths.includes(router.pathname);
    if (isCurrentlyOnInputFormPath) {
      // If user is filling a form, don't change the network because it resets the form.
      return;
    }

    if (activeChain && (activeChain.id !== network.chainId)) {
      const networkFromWallet = networksByChainId.get(activeChain.id);
      if (networkFromWallet) {
        setNetwork(networkFromWallet);
      }
    }
  }, [activeChain]);

  // # Set network based on the wallet on autoconnect.
  useEffect(() => {
    // NOTE: The autoConnet is also invoked higher up in the component hierachy.
    wagmiClient.autoConnect().then((provider) => {
      if (provider?.chain) {
        const networkFromConnect = networksByChainId.get(provider.chain.id);
        if (networkFromConnect) {
          setNetwork(networkFromConnect);
        }
      }
    });
  }, []);

  // # Set network based on the URL querystring.
  const { network: networkQueryParam } = router.query;
  useEffect(() => {
    if (isString(networkQueryParam)) {
      const networkFromQuery = networksBySlug.get(networkQueryParam);
      if (networkFromQuery) {
        setNetwork(networkFromQuery);
      }
      const { network, ...networkQueryParamRemoved } = router.query;
      router.replace({ query: networkQueryParamRemoved });
    }
  }, [networkQueryParam]);

  return (
    <AppNetworkContext.Provider value={contextValue}>
      {children(network)}
    </AppNetworkContext.Provider>
  );
};

export const useAppNetwork = () => useContext(AppNetworkContext);
