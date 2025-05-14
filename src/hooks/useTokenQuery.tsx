import { skipToken } from "@reduxjs/toolkit/query";
import { allNetworks, findNetworkOrThrow } from "../features/network/networks";
import { subgraphApi } from "../features/redux/store";
import { getSuperTokenType, getUnderlyingTokenType } from "../features/redux/endpoints/adHocSubgraphEndpoints";
import { NATIVE_ASSET_ADDRESS, SuperTokenMinimal, SuperTokenPair, TokenMinimal, TokenType, UnderlyingTokenMinimal } from "../features/redux/endpoints/tokenTypes";
import { SuperTokenExtensions, TokenInfo } from "@superfluid-finance/tokenlist"
import { useMemo } from "react";
import { memoize } from 'lodash';
import { extendedSuperTokenList } from "../tokenlist";

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

        if (!inputParsed.id) {
            // Show never be the case
            return undefined;
        }

        return findTokenFromTokenList({ chainId: inputParsed.chainId, address: inputParsed.id });
    }, [inputParsed.isSkip, inputParsed.chainId, inputParsed.id]);

    const skipSubgraphQuery = inputParsed.isSkip || !!tokenListToken || !inputParsed.id;
    const { currentData: subgraphToken, isLoading: isSubgraphTokenLoading } = subgraphApi.useTokenQuery(skipSubgraphQuery ? skipToken : {
        chainId: inputParsed.chainId,
        id: inputParsed.id.toLowerCase()
    });

    const returnCandidate = useMemo(() => {
        if (tokenListToken) {
            return {
                data: tokenListToken,
                isLoading: false
            }
        }

        if (!subgraphToken) {
            return {
                data: null,
                isLoading: isSubgraphTokenLoading
            }
        }

        const network = findNetworkOrThrow(allNetworks, inputParsed.chainId);
        const subgraphTokenMapped = mapSubgraphTokenToTokenMinimal(network.id, subgraphToken);

        return {
            data: subgraphTokenMapped,
            isLoading: isSubgraphTokenLoading
        }
    }, [tokenListToken, subgraphToken, isSubgraphTokenLoading, inputParsed.chainId]);

    return useMemo(() => {
        if (inputParsed.onlySuperToken && returnCandidate.data && !returnCandidate.data.isSuperToken) {
            return {
                data: null,
                isLoading: returnCandidate.isLoading
            } as const;
        }

        return returnCandidate as {
            data: T extends true ? SuperTokenMinimal | null | undefined : TokenMinimal | null | undefined,
            isLoading: boolean
        };
    }, [returnCandidate, inputParsed.onlySuperToken]);
}

export const findTokenFromTokenList = memoize((input: { chainId: number, address: string }): TokenMinimal | undefined => {
    const tokenAddressLowerCased = input.address.toLowerCase();

    if (input.address === NATIVE_ASSET_ADDRESS) {
        const network = findNetworkOrThrow(allNetworks, input.chainId);
        return network.nativeCurrency;
    }

    const tokenListToken = extendedSuperTokenList().tokens.find(x => x.chainId === input.chainId && x.address === tokenAddressLowerCased);
    if (tokenListToken) {
        return mapTokenListTokenToTokenMinimal(tokenListToken);
    }
}, ({ chainId, address }) => `${chainId}-${address?.toLowerCase()}-${extendedSuperTokenList().version}`);

export const getTokensFromTokenList = memoize((chainId: number) => {
    return extendedSuperTokenList().tokens.filter(x => x.chainId === chainId).map(mapTokenListTokenToTokenMinimal);
}, (chainId) => `${chainId}-${extendedSuperTokenList().version}`);

export const getSuperTokensFromTokenList = memoize((chainId: number, onlyWrappable?: boolean) => {
    return getTokensFromTokenList(chainId).filter(x => x.isSuperToken).filter(x => onlyWrappable ? x.type === TokenType.WrapperSuperToken || x.type === TokenType.NativeAssetSuperToken : true);
}, (chainId) => `${chainId}-${extendedSuperTokenList().version}`);

export const getTokenPairsFromTokenList = memoize((chainId: number) => {
    return getSuperTokensFromTokenList(chainId, true /* onlyWrappable */)
        .map(superToken => {
            if (superToken.type === TokenType.NativeAssetSuperToken) {
                const network = findNetworkOrThrow(allNetworks, chainId);
                return ({
                    superToken,
                    underlyingToken: network.nativeCurrency
                }) as SuperTokenPair;
            }

            return ({
                superToken,
                underlyingToken: findTokenFromTokenList({ chainId, address: superToken.underlyingAddress! })!
            }) as SuperTokenPair;
        });
}, (chainId) => `${chainId}-${extendedSuperTokenList().version}`);

export const mapTokenListTokenToTokenMinimal = (tokenListToken: TokenInfo & SuperTokenExtensions) => {
    const superTokenInfo = tokenListToken.extensions?.superTokenInfo;
    if (superTokenInfo) {
        const superTokenType = superTokenInfo.type === "Native Asset" ? TokenType.NativeAssetSuperToken : superTokenInfo.type === "Wrapper" ? TokenType.WrapperSuperToken : TokenType.PureSuperToken;
        const underlyingAddress = superTokenInfo.type === "Native Asset" ? NATIVE_ASSET_ADDRESS : superTokenInfo.type === "Wrapper" ? superTokenInfo.underlyingTokenAddress : null;

        return {
            address: tokenListToken.address,
            name: tokenListToken.name,
            symbol: tokenListToken.symbol,
            decimals: 18,
            isSuperToken: true,
            isListed: true,
            underlyingAddress: underlyingAddress,
            type: superTokenType,
            logoURI: tokenListToken.logoURI
        } as SuperTokenMinimal;
    } else {
        return {
            address: tokenListToken.address,
            name: tokenListToken.name,
            symbol: tokenListToken.symbol,
            decimals: tokenListToken.decimals,
            isSuperToken: false,
            type: getUnderlyingTokenType({
                address: tokenListToken.address
            }),
            logoURI: tokenListToken.logoURI
        } as UnderlyingTokenMinimal;
    }
}

export const mapSubgraphTokenToTokenMinimal = <T extends boolean = false>(chainId: number, subgraphToken: {
    id: string
    name: string
    symbol: string
    decimals: number
    isSuperToken: T
    isListed?: boolean
    underlyingAddress?: string | null
}): T extends true ? SuperTokenMinimal : UnderlyingTokenMinimal => {
    type TReturn = T extends true ? SuperTokenMinimal : UnderlyingTokenMinimal;

    const tokenFromTokenList = findTokenFromTokenList({ chainId, address: subgraphToken.id });
    if (tokenFromTokenList) {
        return tokenFromTokenList as TReturn;
    }

    if (subgraphToken.isSuperToken) {
        const network = findNetworkOrThrow(allNetworks, chainId);
        if (subgraphToken.id.toLowerCase() === network.nativeCurrency.superToken.address.toLowerCase()) {
            return network.nativeCurrency.superToken as TReturn;
        }

        return {
            address: subgraphToken.id,
            name: subgraphToken.name,
            symbol: subgraphToken.symbol,
            decimals: 18,
            isSuperToken: true,
            isListed: Boolean(subgraphToken.isListed),
            underlyingAddress: subgraphToken.underlyingAddress,
            type: getSuperTokenType({
                network,
                address: subgraphToken.id,
                underlyingAddress: subgraphToken.underlyingAddress
            })
        } as TReturn;
    } else {
        return {
            address: subgraphToken.id,
            name: subgraphToken.name,
            symbol: subgraphToken.symbol,
            decimals: subgraphToken.decimals,
            isSuperToken: false,
            type: getUnderlyingTokenType({
                address: subgraphToken.id
            })
        } as TReturn;
    }
}