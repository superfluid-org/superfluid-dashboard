import { useMemo } from "react";
import { useNetworkCustomTokens } from "../customTokens/customTokens.slice";
import { getNetworkDefaultTokenPairs, Network } from "../network/networks";
import { subgraphApi } from "../redux/store";

export const useTokenPairsQuery = ({ network }: { network: Network }) => {
  const networkCustomTokens = useNetworkCustomTokens(network.id);
  const defaultTokenPairs = getNetworkDefaultTokenPairs(network);

  const unlistedTokenIDs = useMemo(
    () => {
      return networkCustomTokens;
    },
    [networkCustomTokens, network.id]
  );

  return subgraphApi.useTokenUpgradeDowngradePairsQuery(
    {
      chainId: network.id,
      unlistedTokenIDs: unlistedTokenIDs,
    },
    {
      selectFromResult: (result) => ({
        ...result,
        data: (result.data ?? defaultTokenPairs), // Doing it this way the list is never empty and always contains the default token pairs.
        currentData: (result.currentData ?? defaultTokenPairs),
      }),
    }
  );
};
