import { skipToken } from "@reduxjs/toolkit/dist/query";
import { Address } from "@superfluid-finance/sdk-core";
import { useMemo } from "react";
import { Currency } from "../../utils/currencyUtils";
import { useAppCurrency } from "../settings/appSettingsHooks";
import tokenPriceApi from "./tokenPriceApi.slice";

const useTokenPrice = (chainId: number, token?: Address) => {
  const currency = useAppCurrency();

  const exchangeRatesResponse = tokenPriceApi.useGetUSDExchangeRateQuery();
  const supportedNetworksQuery = tokenPriceApi.useGetSupportedChainIdsQuery();

  const isChainSupported = (supportedNetworksQuery.data || []).includes(chainId);
  const tokenPriceResponse = tokenPriceApi.useGetTokenDataQuery(
    isChainSupported && token
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
