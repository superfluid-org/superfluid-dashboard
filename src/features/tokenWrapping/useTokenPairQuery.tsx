import { skipToken } from "@reduxjs/toolkit/dist/query";
import { Network } from "../network/networks";
import {
  getSuperTokenType,
  getUnderlyingTokenType,
} from "../redux/endpoints/adHocSubgraphEndpoints";
import {
  NATIVE_ASSET_ADDRESS,
  TokenMinimal,
} from "../redux/endpoints/tokenTypes";
import { subgraphApi } from "../redux/store";

export const useTokenPairQuery = (
  network: Network,
  tokenPair?: {
    superTokenAddress: string;
    underlyingTokenAddress: string;
  }
) => {
  const { superToken } = subgraphApi.useTokenQuery(
    tokenPair
      ? {
          chainId: network.id,
          id: tokenPair.superTokenAddress,
        }
      : skipToken,
    {
      selectFromResult: (result) => {
        const isNativeAssetSuperToken =
          result.originalArgs?.id?.toLowerCase() ===
          network.nativeCurrency.superToken.address.toLowerCase();

        return {
          superToken: isNativeAssetSuperToken
            ? network.nativeCurrency.superToken
            : result.currentData
            ? ({
                ...result.currentData,
                type: getSuperTokenType({
                  network,
                  address: result.currentData.id,
                  underlyingAddress: result.currentData.underlyingAddress,
                }),
                address: result.currentData.id,
              } as TokenMinimal)
            : null,
        };
      },
    }
  );

  const { underlyingToken } = subgraphApi.useTokenQuery(
    tokenPair
      ? {
          chainId: network.id,
          id: tokenPair.underlyingTokenAddress,
        }
      : skipToken,
    {
      selectFromResult: (result) => {
        const isNativeAssetUnderlyingToken =
          result.originalArgs?.id === NATIVE_ASSET_ADDRESS;

        return {
          underlyingToken: isNativeAssetUnderlyingToken
            ? network.nativeCurrency
            : result.currentData
            ? ({
                ...result.currentData,
                address: result.currentData.id,
                type: getUnderlyingTokenType({
                  address: result.currentData.id,
                }),
              } as TokenMinimal)
            : null,
        };
      },
    }
  );

  return { superToken, underlyingToken };
};
