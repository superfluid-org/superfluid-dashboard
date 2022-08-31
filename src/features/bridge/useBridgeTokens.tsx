import LIFI from "@lifi/sdk";
import { useEffect, useState } from "react";
import { Network } from "../network/networks";
import {
  getSuperTokenType,
  getUnderlyingTokenType,
} from "../redux/endpoints/adHocSubgraphEndpoints";
import { TokenMinimal } from "../redux/endpoints/tokenTypes";
import { subgraphApi } from "../redux/store";

const useBridgeTokens = (
  lifi: LIFI,
  network?: Network
): [TokenMinimal[], boolean] => {
  const [tokens, setTokens] = useState<TokenMinimal[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const [tokenQueryTrigger] = subgraphApi.useLazyTokensQuery();

  useEffect(() => {
    if (!lifi || !network) return;
    setIsLoading(true);
    setTokens([]);

    lifi
      .getTokens({ chains: [network.id] })
      .then((lifiTokensResponse) => {
        const lifiTokens = lifiTokensResponse.tokens[network.id] || [];

        tokenQueryTrigger(
          {
            chainId: network.id,
            filter: {
              id_in: lifiTokens.map((token) => token.address.toLowerCase()),
              isSuperToken: true,
            },
            pagination: {
              take: Infinity,
              skip: 0,
            },
          },
          true
        )
          .then((superTokensResponse) => {
            const superTokens = (superTokensResponse.data?.items || []).map(
              (superToken) => {
                const lifiToken = lifiTokens.find(
                  (lifiToken) => lifiToken.address === superToken.id
                );

                return {
                  type: getSuperTokenType({
                    network,
                    address: superToken.id,
                    underlyingAddress: superToken.underlyingAddress,
                  }),
                  address: superToken.id,
                  name: superToken.name,
                  symbol: superToken.symbol,
                  decimals: superToken.decimals,
                  isListed: superToken.isListed,
                  iconUrl: lifiToken?.logoURI,
                };
              }
            );

            const underlyingTokens = lifiTokens
              .filter(
                (lifiToken) =>
                  !superTokens.some(
                    (superToken) =>
                      superToken.address === lifiToken.address.toLowerCase()
                  )
              )
              .map((lifiToken) => ({
                type: getUnderlyingTokenType({ address: lifiToken.address }),
                address: lifiToken.address,
                name: lifiToken.name,
                symbol: lifiToken.symbol,
                decimals: lifiToken.decimals,
                isListed: false,
                iconUrl: lifiToken.logoURI,
              }));

            setTokens(superTokens.concat(underlyingTokens));
          })
          .finally(() => {
            setIsLoading(false);
          });
      })
      .catch(() => {
        setIsLoading(false);
      });
  }, [lifi, network, tokenQueryTrigger]);

  return [tokens, isLoading];
};

export default useBridgeTokens;
