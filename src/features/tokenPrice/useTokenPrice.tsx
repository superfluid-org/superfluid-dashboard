import { skipToken } from "@reduxjs/toolkit/dist/query";
import { Address } from "@superfluid-finance/sdk-core";
import { useMemo } from "react";
import { Currency } from "../../utils/currencyUtils";
import { useAppSettingsContext } from "../settings/AppSettingsContext";
import tokenPriceApi from "./tokenPriceApi.slice";

const useTokenPrice = (token: Address, chainId: number) => {
  const { currency } = useAppSettingsContext();
  const exchangeRatesResponse = tokenPriceApi.useGetUSDExchangeRateQuery();

  const supportedNetworks = tokenPriceApi.useGetSupportedNetworkIDsQuery();
  const isChainSupported = (supportedNetworks.data || []).includes(chainId);
  const tokenPriceResponse = tokenPriceApi.useGetTokenDataQuery(
    isChainSupported
      ? {
          token,
          chainId,
        }
      : skipToken
  );

  return useMemo(() => {
    const price = tokenPriceResponse.data?.price;

    if (price) {
      if (currency === Currency.USD) return price;

      const exchangeRate =
        exchangeRatesResponse.data &&
        exchangeRatesResponse.data[currency.toString()];
      if (exchangeRate) return price * exchangeRate;
    }

    return undefined;
  }, [currency, tokenPriceResponse.data, exchangeRatesResponse.data]);
};

export default useTokenPrice;
