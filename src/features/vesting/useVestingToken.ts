import { skipToken } from "@reduxjs/toolkit/dist/query";
import { Network } from "../network/networks";
import { getSuperTokenType } from "../redux/endpoints/adHocSubgraphEndpoints";
import { subgraphApi } from "../redux/store";
import { VestingToken } from "./CreateVestingSection";

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
          ? ({
              ...result.data,
              address: result.data.id,
              type: getSuperTokenType({
                network,
                address: result.data.id,
                underlyingAddress: result.data.underlyingAddress,
              }),
            } as VestingToken)
          : undefined,
      }),
    }
  );
