import { useMemo } from "react";
import { useNetworkCustomTokens } from "../customTokens/customTokens.slice";
import { getNetworkDefaultTokenPair, Network, networkDefinition } from "../network/networks";
import { subgraphApi } from "../redux/store";

export const useTokenPairsQuery = ({ network }: { network: Network }) => {
  const networkCustomTokens = useNetworkCustomTokens(network.id);
  const defaultTokenPair = getNetworkDefaultTokenPair(network);

  const unlistedTokenIDs = useMemo(
    // A temporary fix for re-deployment of USDCx on Arbitrum & Polygon.
    // Issue applies to both chains: https://github.com/superfluid-finance/superfluid-dashboard/issues/687
    () => {
      const Arbitrum_USDC_ex = "0x1dbc1809486460dcd189b8a15990bca3272ee04e";
      const Polygon_USDC_ex = "0xCAa7349CEA390F89641fe306D93591f87595dc1F";

      if (network.id === networkDefinition.arbitrum.id) {
        return networkCustomTokens.concat(Arbitrum_USDC_ex);
      }
      
      if (network.id === networkDefinition.polygon.id) {
        return networkCustomTokens.concat(Polygon_USDC_ex);
      }

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
        data: result.data ?? [defaultTokenPair], // Doing it this way the list is never empty and always contains the default token pairs.
        currentData: result.currentData ?? [defaultTokenPair],
      }),
    }
  );
};
