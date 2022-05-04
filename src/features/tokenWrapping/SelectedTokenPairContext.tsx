import { createContext, FC, useContext, useEffect, useState } from "react";
import { getNetworkDefaultTokenPair } from "../network/networks";
import { SuperTokenPair } from "../redux/endpoints/adHocSubgraphEndpoints";
import { useNetworkContext } from "../network/NetworkContext";
import { useRouter } from "next/router";
import { isString } from "lodash";
import { subgraphApi } from "../redux/store";

const SelectedTokenContext = createContext<{
  selectedTokenPair: SuperTokenPair | undefined;
  setSelectedTokenPair: (tokenPair: SuperTokenPair | undefined) => void;
}>(null!);

export const SelectedTokenContextProvider: FC = ({ children }) => {
  const { network } = useNetworkContext();
  const router = useRouter();
  const { token: tokenQueryParam } = router.query;

  const [selectedTokenPair, setSelectedTokenPair] = useState<
    SuperTokenPair | undefined
  >(getNetworkDefaultTokenPair(network));

  useEffect(() => {
    if (!selectedTokenPair) {
      setSelectedTokenPair(getNetworkDefaultTokenPair(network));
    }
  }, [selectedTokenPair]);

  const tokenPairsQuery = subgraphApi.useTokenUpgradeDowngradePairsQuery({
    chainId: network.chainId,
  });

  useEffect(() => {
    if (isString(tokenQueryParam) && tokenPairsQuery.data) {
      const tokenPair = tokenPairsQuery.data.find(
        (x) =>
          x.superToken.address.toLowerCase() === tokenQueryParam.toLowerCase()
      );
      if (tokenPair) {
        setSelectedTokenPair(tokenPair);
      }

      const { token, ...tokenQueryParamRemoved } = router.query;
      router.replace({ query: tokenQueryParamRemoved });
    }
  }, [tokenQueryParam, tokenPairsQuery.data]);

  return (
    <SelectedTokenContext.Provider
      value={{ selectedTokenPair, setSelectedTokenPair }}
    >
      {children}
    </SelectedTokenContext.Provider>
  );
};

export const useSelectedTokenContext = () => useContext(SelectedTokenContext);
