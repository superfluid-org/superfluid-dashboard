import { useMemo } from "react";
import { useNetworkCustomTokens } from "../customTokens/customTokens.slice";
import { getNetworkDefaultTokenPair, Network, networkDefinition } from "../network/networks";
import { subgraphApi } from "../redux/store";

const Arbitrum_USDC_ex = "0x1dbc1809486460dcd189b8a15990bca3272ee04e";

export const useTokenPairsQuery = ({ network }: { network: Network }) => {
  const networkCustomTokens = useNetworkCustomTokens(network.id);
  const defaultTokenPair = getNetworkDefaultTokenPair(network);

  const unlistedTokenIDs = useMemo(
    // A temporary fix for re-deployment of USDCx on Arbitrum. Issue: https://github.com/superfluid-finance/superfluid-dashboard/issues/687
    () => network.id === networkDefinition.arbitrum.id ? networkCustomTokens.concat(Arbitrum_USDC_ex) : networkCustomTokens,
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
