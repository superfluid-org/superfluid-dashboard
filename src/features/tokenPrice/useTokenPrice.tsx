import { skipToken } from "@reduxjs/toolkit/dist/query";
import { Address } from "@superfluid-finance/sdk-core";
import tokenPriceApi from "./tokenPriceApi.slice";

const useTokenPrice = (token: Address, chainId: number) => {
  const supportedNetworks = tokenPriceApi.useGetSupportedNetworkIDsQuery();

  const isChainSupported = (supportedNetworks.data || []).includes(chainId);

  return tokenPriceApi.useGetTokenDataQuery(
    isChainSupported
      ? {
          token,
          chainId,
        }
      : skipToken
  );
};

export default useTokenPrice;
