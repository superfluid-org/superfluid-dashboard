import { skipToken } from "@reduxjs/toolkit/dist/query";
import { Network } from "../features/network/networks";
import { subgraphApi } from "../features/redux/store";
import { getSuperTokenType } from "../features/redux/endpoints/adHocSubgraphEndpoints";
import { SuperTokenType, isWrappable } from "../features/redux/endpoints/tokenTypes";

export const useSuperToken = ({ network, tokenAddress }: { network: Network, tokenAddress: string | undefined | null }) => {
    const { token } = subgraphApi.useTokenQuery(
        tokenAddress
            ? {
                chainId: network.id,
                id: tokenAddress,
            }
            : skipToken,
        {
            selectFromResult: (result) => ({
                token: result.currentData
                    ? ({
                        ...result.currentData,
                        address: result.currentData.id,
                        type: getSuperTokenType({
                            network,
                            address: result.currentData.id,
                            underlyingAddress: result.currentData.underlyingAddress,
                        }) as SuperTokenType,
                    })
                    : undefined,
            }),
        }
    );

    const isWrappableSuperToken = token ? isWrappable(token) : false;

    return {
        token,
        isWrappableSuperToken
    };
}