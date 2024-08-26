import { skipToken } from "@reduxjs/toolkit/dist/query";
import { allNetworks, findNetworkOrThrow } from "../features/network/networks";
import { subgraphApi } from "../features/redux/store";
import { getSuperTokenType, getUnderlyingTokenType } from "../features/redux/endpoints/adHocSubgraphEndpoints";
import { SuperTokenMinimal, TokenMinimal } from "../features/redux/endpoints/tokenTypes";
import { extendedSuperTokenList } from "@superfluid-finance/tokenlist"
import { useMemo } from "react";

export const useTokenQuery = <T extends boolean = false>(input: {
    chainId: number;
    id: string;
    onlySuperToken?: T;
} | typeof skipToken): {
    data: T extends true ? SuperTokenMinimal | null | undefined : TokenMinimal | null | undefined,
    isLoading: boolean
} => {
    const inputParsed = input === skipToken 
        ? { isSkip: true, chainId: undefined, id: undefined, onlySuperToken: undefined as T | undefined } as const 
        : { isSkip: false, ...input, onlySuperToken: input.onlySuperToken as T | undefined } as const;

    const tokenListToken = useMemo(() => {
        if (inputParsed.isSkip) {
            return undefined;
        }

        const tokenAddressLowerCased = inputParsed.id.toLocaleLowerCase();
        const token = extendedSuperTokenList.tokens.find(x => x.address === tokenAddressLowerCased);

        if (token) {
            const superTokenInfo = token.extensions?.superTokenInfo;
            if (superTokenInfo) {
                return {
                    ...token,
                    id: token.address,
                    isSuperToken: true,
                    isListed: true,
                    underlyingAddress: superTokenInfo.type === "Wrapper" ? superTokenInfo.underlyingTokenAddress : null,
                    isLoading: false
                };
            } else {
                return {
                    ...token,
                    id: token.address,
                    isSuperToken: false,
                    isListed: true,
                    underlyingAddress: null,
                };
            }
        }
    }, [inputParsed.isSkip, inputParsed.chainId, inputParsed.id]);

    const skipSubgraphQuery = (inputParsed.isSkip || !tokenListToken);
    const { data: subgraphToken, isLoading: isSubgraphTokenLoading } = subgraphApi.useTokenQuery(skipSubgraphQuery ? skipToken : {
        chainId: inputParsed.chainId,
        id: inputParsed.id
    });

    const token = tokenListToken ?? subgraphToken;

    return useMemo(() => {
        if (!token) {
            return {
                data: null,
                isLoading: isSubgraphTokenLoading
            }
        }

        const network = findNetworkOrThrow(allNetworks, inputParsed.chainId);

        const processedToken = {
            ...token,
            address: token.id,
            type: token.isSuperToken ? getSuperTokenType({
                network,
                address: token.id,
                underlyingAddress: token.underlyingAddress
            }) : getUnderlyingTokenType({
                address: token.id
            })
        };

        return {
            data: (inputParsed.onlySuperToken && !token.isSuperToken) ? null : processedToken,
            isLoading: false
        } as {
            data: T extends true ? SuperTokenMinimal | null | undefined : TokenMinimal | null | undefined,
            isLoading: boolean
        };
    }, [token, isSubgraphTokenLoading, inputParsed.chainId, inputParsed.onlySuperToken]);
}