import { useNetworkCustomTokens } from "../customTokens/customTokens.slice";
import { getNetworkDefaultTokenPair, Network } from "../network/networks";
import { subgraphApi } from "../redux/store";

export const useTokenPairsQuery = ({ network }: { network: Network }) => {
  const networkCustomTokens = useNetworkCustomTokens(network.id);
  const defaultTokenPair = getNetworkDefaultTokenPair(network);

  return subgraphApi.useTokenUpgradeDowngradePairsQuery(
    {
      chainId: network.id,
      unlistedTokenIDs: networkCustomTokens,
    },
    {
      selectFromResult: (result) => ({
        ...result,
        data: result.data ?? [defaultTokenPair], // Doing it this way the list is never empty and always contains the default token pairs.
        currentData: result.currentData ?? [defaultTokenPair],
      }),
    }
  );
};
