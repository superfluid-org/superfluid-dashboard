import { skipToken } from "@reduxjs/toolkit/dist/query";
import { useNetworkCustomTokens } from "../features/customTokens/customTokens.slice";
import { Network } from "../features/network/networks";
import { subgraphApi } from "../features/redux/store";
import { useMemo } from "react";
import { getSuperTokenType } from "../features/redux/endpoints/adHocSubgraphEndpoints";
import { findTokenFromTokenList } from "./useTokenQuery";

export const useSuperTokens = ({ network, onlyWrappable }: { network: Network, onlyWrappable?: boolean }) => {
    const networkCustomTokens = useNetworkCustomTokens(network.id);

    const listedSuperTokensQuery = subgraphApi.useTokensQuery({
        chainId: network.id,
        filter: {
            isSuperToken: true,
            isListed: true,
            ...(onlyWrappable ? { underlyingAddress_not: "0x0000000000000000000000000000000000000000" } : {})
        },
    });

    const customSuperTokensQuery = subgraphApi.useTokensQuery(
        networkCustomTokens.length > 0
            ? {
                chainId: network.id,
                filter: {
                    isSuperToken: true,
                    isListed: false,
                    id_in: networkCustomTokens,
                    ...(onlyWrappable ? { underlyingAddress_not: "0x0000000000000000000000000000000000000000" } : {})
                },
            }
            : skipToken
    );

    const superTokens = useMemo(
        () => {
            const subgraphTokens = (listedSuperTokensQuery.data?.items || []).concat(customSuperTokensQuery.data?.items || []);
            return subgraphTokens.map((x) => {
                const tokenListToken = findTokenFromTokenList({ chainId: network.id, address: x.id });
                if (tokenListToken) {
                    return ({
                        ...x,
                        address: x.id,
                        symbol: tokenListToken.symbol,
                        name: tokenListToken.name,
                        type: getSuperTokenType({ ...x, network, address: x.id }),
                        decimals: 18
                    });
                } else {
                    return ({
                        ...x,
                        address: x.id,
                        type: getSuperTokenType({ ...x, network, address: x.id }),
                        decimals: 18,
                    });
                }
            });
        },
        [network, listedSuperTokensQuery.data, customSuperTokensQuery.data]
    );

    return {
        listedSuperTokensQuery,
        customSuperTokensQuery,
        superTokens,
        isLoading: listedSuperTokensQuery.isLoading || customSuperTokensQuery.isLoading,
        isFetching: listedSuperTokensQuery.isFetching || customSuperTokensQuery.isFetching,
    };
}