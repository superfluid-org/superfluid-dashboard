import { useMemo } from "react";
import { useNetworkCustomTokens } from "../customTokens/customTokens.slice";
import { getTokenPairsFromTokenList } from "../../hooks/useTokenQuery";
import { getNetworkDefaultTokenPairs, Network } from "../network/networks";
import { SuperTokenPair } from "../redux/endpoints/tokenTypes";
import { subgraphApi } from "../redux/store";

/**
 * The pairs offered before the subgraph answers: the native asset pair, or, on chains
 * without a Native Asset Super Token (e.g. Arc mainnet), the first listed wrapper pair.
 */
export const getWrapDefaultTokenPairs = (network: Network): SuperTokenPair[] => {
  const nativeAssetPairs = getNetworkDefaultTokenPairs(network);
  if (nativeAssetPairs.length) {
    return nativeAssetPairs;
  }
  return getTokenPairsFromTokenList(network.id).slice(0, 1);
};

export const useTokenPairsQuery = ({ network }: { network: Network }) => {
  const networkCustomTokens = useNetworkCustomTokens(network.id);
  const defaultTokenPairs = getWrapDefaultTokenPairs(network);

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
