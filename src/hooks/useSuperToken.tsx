import { skipToken } from "@reduxjs/toolkit/dist/query";
import { allNetworks, findNetworkOrThrow, Network } from "../features/network/networks";
import { subgraphApi } from "../features/redux/store";
import { getSuperTokenType, getUnderlyingTokenType } from "../features/redux/endpoints/adHocSubgraphEndpoints";
import { SuperTokenMinimal, TokenMinimal, isWrappable } from "../features/redux/endpoints/tokenTypes";
import { extendedSuperTokenList } from "@superfluid-finance/tokenlist"
import { useMemo } from "react";

export const useToken = (input: {
    chainId: number;
    tokenAddress: string;
} | typeof skipToken) => {
    const data = input === skipToken ? { isSkip: true, chainId: undefined, tokenAddress: undefined } as const : { isSkip: false, ...input } as const;

    const tokenListToken = useMemo(() => {
        if (data.isSkip) {
            return undefined;
        }

        const tokenAddressLowerCased = data.tokenAddress.toLocaleLowerCase();
        const token = extendedSuperTokenList.tokens.find(x => x.address === tokenAddressLowerCased);

        if (token) {
            const superTokenInfo = token.extensions?.superTokenInfo;
            if (superTokenInfo) {
                return {
                    ...token,
                    id: token.address,
                    isSuperToken: true,
                    underlyingAddress: superTokenInfo.type === "Wrapper" ? superTokenInfo.underlyingTokenAddress : "0x0000000000000000000000000000000000000000",
                };
            } else {
                return {
                    ...token,
                    id: token.address,
                    isSuperToken: false,
                    underlyingAddress: "0x0000000000000000000000000000000000000000",
                };
            }
        }
    }, [data.isSkip, data.chainId, data.tokenAddress]);

    const skipSubgraphQuery = (data.isSkip || !tokenListToken);
    const { data: subgraphToken } = subgraphApi.useTokenQuery(skipSubgraphQuery ? skipToken : {
        chainId: data.chainId,
        id: data.tokenAddress
    });

    const token = tokenListToken ?? subgraphToken;

    return useMemo(() => {
        if (token) {
            const network = findNetworkOrThrow(allNetworks, data.chainId);

            return {
                ...token,
                address: token.id,
                type: token.isSuperToken ? getSuperTokenType({
                    network,
                    address: token.id,
                    underlyingAddress: token.underlyingAddress
                }) : getUnderlyingTokenType({
                    address: token.id
                })
            } satisfies TokenMinimal;
        }
    }, [token]);
}

export const useSuperToken = ({ network, tokenAddress }: { network: Network, tokenAddress: string | undefined | null }) => {
    const token = useToken(tokenAddress ? {
        chainId: network.id,
        tokenAddress: tokenAddress
    } : skipToken);

    // TODO: Enforce that the token is a super token

    const isWrappableSuperToken = token ? isWrappable(token) : false;

    return {
        token: token as SuperTokenMinimal | undefined,
        isWrappableSuperToken
    };
}