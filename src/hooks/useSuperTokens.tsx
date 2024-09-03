import { skipToken } from "@reduxjs/toolkit/dist/query";
import { useNetworkCustomTokens } from "../features/customTokens/customTokens.slice";
import { Network } from "../features/network/networks";
import { subgraphApi } from "../features/redux/store";
import { useMemo } from "react";
import { getSuperTokensFromTokenList, mapSubgraphTokenToTokenMinimal } from "./useTokenQuery";

export const useSuperTokens = ({ network, onlyWrappable }: { network: Network, onlyWrappable?: boolean }) => {
    const networkCustomTokens = useNetworkCustomTokens(network.id);

    const listedSuperTokens = getSuperTokensFromTokenList(network.id, onlyWrappable);

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
            const customSuperTokens = (customSuperTokensQuery.data?.items || []).map(token => mapSubgraphTokenToTokenMinimal(network.id, token as typeof token & { isSuperToken: true}));
            return listedSuperTokens.concat(customSuperTokens);
        },
        [network, listedSuperTokens, customSuperTokensQuery.data]
    );

    return {
        listedSuperTokens,
        customSuperTokensQuery,
        superTokens,
        isLoading: customSuperTokensQuery.isLoading,
        isFetching: customSuperTokensQuery.isFetching,
    };
}