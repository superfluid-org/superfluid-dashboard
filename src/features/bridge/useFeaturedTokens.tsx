import { LiFi, Token } from "@lifi/sdk";
import { useEffect, useState } from "react";
import { useAvailableNetworks } from "../network/AvailableNetworksContext";
import { subgraphApi } from "../redux/store";

const useFeaturedTokens = (lifi: LiFi): Token[] => {
  const { availableMainNetworks } = useAvailableNetworks();
  const [featuredTokens, setFeaturedTokens] = useState<Token[]>([]);

  const [tokenQueryTrigger] = subgraphApi.useLazyTokensQuery();

  useEffect(() => {
    if (!lifi) return;
    setFeaturedTokens([]);
    const availableChainIds = availableMainNetworks.map((x) => x.id); // Note that if the chain ID is not supported by Li.Fi then the request will return 400 (Bad Request).

    lifi.getTokens({ chains: availableChainIds }).then((lifiTokensResponse) => {
      Promise.all(
        Object.entries(lifiTokensResponse.tokens || {}).map(
          ([networkID, lifiNetworkTokens]) => {
            return tokenQueryTrigger(
              {
                chainId: Number(networkID),
                filter: {
                  id_in: lifiNetworkTokens.map((token) =>
                    token.address.toLowerCase()
                  ),
                  isSuperToken: true,
                },
                pagination: {
                  take: Infinity
                },
              },
              true
            ).then((superTokensResponse) =>
              (superTokensResponse.data?.items || []).reduce(
                (matchedLiFiTokens, superToken) => {
                  const lifiToken = lifiNetworkTokens.find(
                    (lifiToken) => lifiToken.address === superToken.id
                  );

                  return matchedLiFiTokens.concat(lifiToken ? [lifiToken] : []);
                },
                [] as Token[]
              )
            );
          }
        )
      ).then((networksFeaturedTokens) => {
        setFeaturedTokens(
          networksFeaturedTokens.reduce(
            (allFeaturedTokens, networkFeaturedTokens) =>
              allFeaturedTokens.concat(networkFeaturedTokens),
            []
          )
        );
      });
    });
  }, [lifi, tokenQueryTrigger, availableMainNetworks]);

  return featuredTokens;
};

export default useFeaturedTokens;
