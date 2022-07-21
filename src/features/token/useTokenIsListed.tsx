import { skipToken } from "@reduxjs/toolkit/dist/query";
import { Address } from "@superfluid-finance/sdk-core";
import { useEffect, useState } from "react";
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

  if (tokenQuery.isLoading) return undefined;
  return tokenQuery.data?.isListed || false;
};
