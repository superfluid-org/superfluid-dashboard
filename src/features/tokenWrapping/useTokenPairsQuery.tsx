import { getNetworkDefaultTokenPair, Network } from "../network/networks";
import { subgraphApi } from "../redux/store";

export const useTokenPairsQuery = ({ network }: { network: Network }) => {
  return subgraphApi.useTokenUpgradeDowngradePairsQuery(
    {
      chainId: network.id,
    },
    {
      selectFromResult: (result) => ({
        ...result,
        data: result.data ?? [getNetworkDefaultTokenPair(network)], // Doing it this way the list is never empty and always contains the default token pairs.
        currentData: result.currentData ?? [getNetworkDefaultTokenPair(network)],
      }),
    }
  );
};
