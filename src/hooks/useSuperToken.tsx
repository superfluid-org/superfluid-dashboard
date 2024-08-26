import { skipToken } from "@reduxjs/toolkit/dist/query";
import { allNetworks, findNetworkOrThrow } from "../features/network/networks";
import { subgraphApi } from "../features/redux/store";
import { getSuperTokenType, getUnderlyingTokenType } from "../features/redux/endpoints/adHocSubgraphEndpoints";
import { NATIVE_ASSET_ADDRESS, SuperTokenMinimal, TokenMinimal, TokenType } from "../features/redux/endpoints/tokenTypes";
import { extendedSuperTokenList } from "@superfluid-finance/tokenlist"
import { useMemo } from "react";
import { memoize } from 'lodash';

export const findTokenFromTokenList = memoize((input: { chainId: number, address: string }) => {
    const tokenAddressLowerCased = input.address.toLowerCase();

    // TODO: Optimize token list into a map?
    const token = extendedSuperTokenList.tokens.find(x => x.chainId === input.chainId && x.address === tokenAddressLowerCased);

    // TODO: How to handle native asset here?

    // console.log(`${input.chainId}-${tokenAddressLowerCased}`);

    const network = findNetworkOrThrow(allNetworks, input.chainId);
    if (token) {
        const superTokenInfo = token.extensions?.superTokenInfo;
        if (superTokenInfo) {
            return {
                ...token,
                id: token.address,
                isSuperToken: true,
                isListed: true,
                underlyingAddress: superTokenInfo.type === "Wrapper" ? superTokenInfo.underlyingTokenAddress : null,
                isLoading: false,
                type: getSuperTokenType({
                    network,
                    address: token.address,
                    underlyingAddress: superTokenInfo.type === "Wrapper" ? superTokenInfo.underlyingTokenAddress : null
                })
            };
        } else {
            return {
                ...token,
                id: token.address,
                isSuperToken: false,
                isListed: true,
                underlyingAddress: null,
                type: getUnderlyingTokenType({
                    address: token.address
                })
            };
        }
    } else {
        // TODO: Not happy with this.
        if (input.address === "0x0000000000000000000000000000000000000000" || input.address === NATIVE_ASSET_ADDRESS) {
            return {
                ...network.nativeCurrency,
                id: input.address,
                isSuperToken: false,
                isListed: true,
                underlyingAddress: null,
                type: TokenType.NativeAssetUnderlyingToken,
                logoURI: network.nativeCurrency.logoURI
            };
        }
    }
}, ({ chainId, address }) => `${chainId}-${address.toLowerCase()}`);

export const useTokenQuery = <T extends boolean = false>(input: {
    chainId: number;
    id: string;
    onlySuperToken?: T;
} | typeof skipToken): {
    data: T extends true ? SuperTokenMinimal | null | undefined : TokenMinimal | null | undefined,
    isLoading: boolean
} => {
    // TODO: Handle onlySuperToken

    const inputParsed = input === skipToken
        ? { isSkip: true, chainId: undefined, id: undefined, onlySuperToken: undefined as T | undefined } as const
        : { isSkip: false, ...input, onlySuperToken: input.onlySuperToken as T | undefined } as const;

    const tokenListToken = useMemo(() => {
        if (inputParsed.isSkip) {
            return undefined;
        }

        return findTokenFromTokenList({ chainId: inputParsed.chainId, address: inputParsed.id });
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