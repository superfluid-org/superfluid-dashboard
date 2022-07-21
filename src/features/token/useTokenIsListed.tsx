import { Address } from "@superfluid-finance/sdk-core";
import { useEffect, useState } from "react";
import { subgraphApi } from "../redux/store";

let IS_LISTED_MAP: Map<string, boolean> = new Map();

export const useTokenIsListed = (chainId: number, address?: Address) => {
  const [isListed, setIsListed] = useState<boolean | undefined>(
    !!address
      ? IS_LISTED_MAP.get(`${chainId}-${address.toLowerCase()}`)
      : undefined
  );

  const [tokenQueryTrigger] = subgraphApi.useLazyTokenQuery();

  useEffect(() => {
    if (isListed === undefined && !!address) {
      tokenQueryTrigger({ chainId, id: address }, true).then((tokenQuery) => {
        const tokenIsListed = tokenQuery.data?.isListed || false;
        IS_LISTED_MAP.set(`${chainId}-${address.toLowerCase()}`, tokenIsListed);
        setIsListed(tokenIsListed);
      });
    }
  }, [isListed, address, chainId, tokenQueryTrigger]);

  return isListed;
};
