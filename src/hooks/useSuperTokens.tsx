import { skipToken } from "@reduxjs/toolkit/dist/query";
import { useNetworkCustomTokens } from "../features/customTokens/customTokens.slice";
import { Network } from "../features/network/networks";
import { subgraphApi } from "../features/redux/store";
import { useMemo } from "react";
import { getSuperTokenType } from "../features/redux/endpoints/adHocSubgraphEndpoints";

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
        () =>
            (listedSuperTokensQuery.data?.items || [])
                .concat(customSuperTokensQuery.data?.items || [])
                .map((x) => ({
                    type: getSuperTokenType({ ...x, network, address: x.id }),
                    address: x.id,
                    name: x.name,
                    symbol: x.symbol,
                    decimals: 18,
                    isListed: x.isListed,
                })),
        [network, listedSuperTokensQuery.data, customSuperTokensQuery.data]
    );

    return {
        listedSuperTokensQuery,
        customSuperTokensQuery,
        superTokens
    };
}