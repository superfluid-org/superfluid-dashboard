import { getNetworkDefaultTokenPair, Network } from "../network/networks";
import { SuperTokenPair } from "../redux/endpoints/tokenTypes";
import { subgraphApi } from "../redux/store";

export const useTokenPairQuery = ({
  network,
  tokenPair,
}: {
  network: Network;
  tokenPair?: {
    superTokenAddress: string;
    underlyingTokenAddress: string;
  };
}) => {
  const { tokenPairs } = subgraphApi.useTokenUpgradeDowngradePairsQuery(
    {
      chainId: network.id,
    },
    {
      selectFromResult: (result) => ({
        tokenPairs: result.data ?? [getNetworkDefaultTokenPair(network)],
      }),
    }
  );

  const tokenPairObjects: SuperTokenPair | undefined = tokenPair
    ? tokenPairs.find(
        (x) =>
          x.superToken.address.toLowerCase() ===
            tokenPair.superTokenAddress.toLowerCase() &&
          x.underlyingToken.address.toLowerCase() ===
            tokenPair.underlyingTokenAddress.toLowerCase()
      )
    : undefined;

  const { superToken, underlyingToken } = tokenPairObjects ?? {};
  return { superToken, underlyingToken };
};