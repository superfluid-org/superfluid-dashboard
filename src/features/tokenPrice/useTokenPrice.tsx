import { skipToken } from "@reduxjs/toolkit/query";
import { Address } from "@superfluid-finance/sdk-core";
import { useMemo } from "react";
import { Currency } from "../../utils/currencyUtils";
import { useAppCurrency } from "../settings/appSettingsHooks";
import tokenPriceApi from "./tokenPriceApi.slice";

const useTokenPrice = (chainId: number, token?: Address) => {
  const currency = useAppCurrency();

  const exchangeRatesResponse = tokenPriceApi.useGetUSDExchangeRateQuery();
  const supportedNetworksQuery = tokenPriceApi.useGetSupportedChainIdsQuery();

  const isChainSupported = (supportedNetworksQuery.data || []).includes(
    chainId
  );

  // TODO: Contact Vijay if you want to remove this.
  const shouldBeDisabledTokenOnOP = useMemo(
    () =>
      chainId === 10 &&
      token?.toLowerCase() === "0x1828bff08bd244f7990eddcd9b19cc654b33cdb4",
    [chainId, token]
  );

  const tokenPriceResponse = tokenPriceApi.useGetTokenDataQuery(
    isChainSupported && !shouldBeDisabledTokenOnOP && token
      ? {
          token,
          chainId,
        }
      : skipToken
  );

  return useMemo(() => {
    const price = tokenPriceResponse.currentData?.price;

    if (price) {
      if (currency === Currency.USD) return price;

      const exchangeRate =
        exchangeRatesResponse.currentData &&
        exchangeRatesResponse.currentData[currency.toString()];
      if (exchangeRate) return price * exchangeRate;
    }

    return undefined;
  }, [currency, tokenPriceResponse.currentData, exchangeRatesResponse.currentData]);
};

export default useTokenPrice;
