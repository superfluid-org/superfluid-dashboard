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

    lifi
      .getTokens({ chains: [network.id] })
      .then((tokensResponse) => {
        const tokens = tokensResponse.tokens[network.id] || [];

        tokenQueryTrigger({
          chainId: network.id,
          filter: {
            id_in: tokens.map((token) => token.address.toLowerCase()),
            isSuperToken: true,
            isListed: true,
          },
          pagination: {
            take: Infinity,
            skip: 0,
          },
        })
          .then((tokensResponse) => {
            setTokens(
              (tokensResponse.data?.items || []).map((token) => ({
                type: getSuperTokenType({
                  network,
                  address: token.id,
                  underlyingAddress: token.underlyingAddress,
                }),
                address: token.id,
                name: token.name,
                symbol: token.symbol,
                decimals: token.decimals,
                isListed: token.isListed,
              }))
            );
          })
          .finally(() => {
            setIsLoading(false);
          });

        // Promise.all([
        //   tokenQueryTrigger({
        //     chainId: network.id,
        //     filter: {
        //       id_in: tokens.map((token) => token.address.toLowerCase()),
        //       isSuperToken: true,
        //       isListed: true,
        //     },
        //     pagination: {
        //       take: Infinity,
        //       skip: 0,
        //     },
        //   }),
        //   tokenQueryTrigger({
        //     chainId: network.id,
        //     filter: {
        //       underlyingToken_in: tokens.map((token) =>
        //         token.address.toLowerCase()
        //       ),
        //     },
        //     pagination: {
        //       take: Infinity,
        //       skip: 0,
        //     },
        //   }),
        // ])
        //   .then(([superTokensResponse, underlyingTokensResponse]) => {
        //     const mappedSuperTokens = (
        //       superTokensResponse.data?.items || []
        //     ).map((token) => ({
        //       type: getSuperTokenType({
        //         network,
        //         address: token.id,
        //         underlyingAddress: token.underlyingAddress,
        //       }),
        //       address: token.id,
        //       name: token.name,
        //       symbol: token.symbol,
        //       decimals: token.decimals,
        //       isListed: token.isListed,
        //     }));

        //     const mappedUnderlyingTokens = (
        //       underlyingTokensResponse.data?.items || []
        //     ).map((token) => ({
        //       type: getUnderlyingTokenType({ address: token.id }),
        //       address: token.id,
        //       name: token.name,
        //       symbol: token.symbol,
        //       decimals: token.decimals,
        //       isListed: token.isListed,
        //     }));

        //     setTokens(mappedSuperTokens.concat(mappedUnderlyingTokens));
        //   })
        //   .finally(() => {
        //     setIsLoading(false);
        //   });
      })
      .catch(() => {
        setIsLoading(false);
      });
  }, [lifi, network, tokenQueryTrigger]);

  return [tokens, isLoading];
};

export default useBridgeTokens;
