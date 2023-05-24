import { skipToken } from "@reduxjs/toolkit/dist/query";
import { Network } from "../network/networks";
import { getSuperTokenType } from "../redux/endpoints/adHocSubgraphEndpoints";
import { subgraphApi } from "../redux/store";
import { VestingToken } from "./CreateVestingSection";
import { Token } from "@superfluid-finance/sdk-core";


export const toVestingToken = (token: Token, network: Network)=> {
  return {
    ...token,
    address: token.id,
    type: getSuperTokenType({
      network,
      address: token.id,
      underlyingAddress: token.underlyingAddress,
    }),
  } as VestingToken
}

export const useVestingToken = (
  network: Network,
  superTokenAddress: string | null | undefined
) =>
  subgraphApi.useTokenQuery(
    superTokenAddress
      ? {
          chainId: network.id,
          id: superTokenAddress.toLowerCase(),
        }
      : skipToken,
    {
      selectFromResult: (result) => ({
        ...result,
        token: result.data
          ? (toVestingToken(result.data, network))
          : undefined,
      }),
    }
  );
