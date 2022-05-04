import { isString } from "lodash";
import { useRouter } from "next/router";
import {
  createContext,
  FC,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";
import { Network, networksByChainId, networksBySlug } from "./networks";

const NetworkContext = createContext<{
  network: Network;
  setNetwork: (chainId: number) => void;
}>(null!);

export const NetworkContextProvider: FC<{
  children: (network: Network) => ReactNode;
}> = ({ children }) => {
  const [network, setNetwork] = useState<Network>(networksByChainId.get(137)!);
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
    <NetworkContext.Provider
      value={{
        network: network,
        setNetwork: (chainId) => setNetwork(networksByChainId.get(chainId)!),
      }}
    >
      {children(network)}
    </NetworkContext.Provider>
  );
};

export const useNetworkContext = () => useContext(NetworkContext);
