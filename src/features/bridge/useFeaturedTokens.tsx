import { ChainType, Token, getChains, getTokens,  } from '@lifi/sdk';
import { useEffect, useState } from "react";
import { useAvailableNetworks } from "../network/AvailableNetworksContext";
import { subgraphApi } from "../redux/store";

const useFeaturedTokens = (): Token[] | undefined => {
    const { availableMainNetworks } = useAvailableNetworks();
    const [featuredTokens, setFeaturedTokens] = useState<Token[] | undefined>(undefined);

    const [tokenQueryTrigger] = subgraphApi.useLazyTokensQuery();

    useEffect(() => {
        setFeaturedTokens([]);
        const availableChainIds = availableMainNetworks.map((x) => x.id); // Note that if the chain ID is not supported by Li.Fi then the request will return 400 (Bad Request).

        const runAsync = async () => {
            const chains = await getChains({ chainTypes: [ChainType.EVM] });

            const lifiChainIds = chains.map(x => x.id);
            const bothLifiAndSuperfluidChainIds = availableChainIds.filter(chainId => lifiChainIds.includes(chainId));

            const { tokens } = await getTokens({
                chainTypes: [ChainType.EVM],
                chains: bothLifiAndSuperfluidChainIds
            });

            const networksFeaturedTokens = await Promise.all(
                Object.entries(tokens || {}).map(
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
                                        (lifiToken) => lifiToken.address.toLowerCase() === superToken.id.toLowerCase()
                                    );

                                    return matchedLiFiTokens.concat(lifiToken ? [lifiToken] : []);
                                },
                                [] as Token[]
                            )
                        );
                    }
                )
            );

            setFeaturedTokens(
                networksFeaturedTokens.reduce(
                    (allFeaturedTokens, networkFeaturedTokens) =>
                        allFeaturedTokens.concat(networkFeaturedTokens),
                    []
                )
            );
        }

        runAsync();
    }, [tokenQueryTrigger, availableMainNetworks]);

    return featuredTokens;
};

export default useFeaturedTokens;
