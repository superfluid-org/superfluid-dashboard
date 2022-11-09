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
          id: superTokenAddress,
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
              }),
            } as VestingToken)
          : undefined,
      }),
    }
  );
