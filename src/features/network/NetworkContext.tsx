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
import { Network, networksByChainId, networksBySlug } from "./networks";

interface NetworkContextValue {
  network: Network;
  setNetwork: (chainId: number) => void;
}

const NetworkContext = createContext<NetworkContextValue>(null!);

export const NetworkContextProvider: FC<{
  children: (network: Network) => ReactNode;
}> = ({ children }) => {
  const [network, setNetwork] = useState<Network>(networksByChainId.get(137)!);
  const contextValue: NetworkContextValue = useMemo(
    () => ({
      network,
      setNetwork: (chainId: number) =>
        setNetwork(networksByChainId.get(chainId)!),
    }),
    [network, setNetwork]
  );

  // # Set network based on the wallet.
  const { activeChain } = useNetwork();
  useEffect(() => {
    if (activeChain) {
      const networkFromWallet = networksByChainId.get(activeChain.id);
      if (networkFromWallet) {
        setNetwork(networkFromWallet);
      }
    }
  }, [activeChain]);

  // # Set network based on the URL querystring.
  const router = useRouter();
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
    <NetworkContext.Provider value={contextValue}>
      {children(network)}
    </NetworkContext.Provider>
  );
};

export const useNetworkContext = () => useContext(NetworkContext);
