import { skipToken } from "@reduxjs/toolkit/dist/query";
import { Address } from "@superfluid-finance/sdk-core";
import { subgraphApi } from "../redux/store";

export const useTokenIsListed = (chainId: number, address?: Address) => {
  const tokenQuery = subgraphApi.useTokenQuery(
    address
      ? {
          chainId,
          id: address,
        }
      : skipToken
  );

  return [tokenQuery.data?.isListed || false, tokenQuery.isLoading];
};
