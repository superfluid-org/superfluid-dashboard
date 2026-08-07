import { skipToken } from "@reduxjs/toolkit/query";
import { Address } from "@superfluid-finance/sdk-core";
import { useMemo } from "react";
import { Currency } from "../../utils/currencyUtils";
import { allNetworks } from "../network/networks";
import { useAppCurrency } from "../settings/appSettingsHooks";
import tokenPriceApi from "./tokenPriceApi.slice";

const useTokenPrice = (chainId: number, token?: Address) => {
  const currency = useAppCurrency();

  const exchangeRatesResponse = tokenPriceApi.useGetUSDExchangeRateQuery();

  // TODO: Contact Vijay if you want to remove this.
  const shouldBeDisabledTokenOnOP = useMemo(
    () =>
      chainId === 10 &&
      token?.toLowerCase() === "0x1828bff08bd244f7990eddcd9b19cc654b33cdb4",
    [chainId, token]
  );

  const isTestnet = allNetworks.some((n) => n.id === chainId && n.testnet);

  const queryArg =
    !shouldBeDisabledTokenOnOP && !isTestnet && token ? { token, chainId } : undefined;

  const cmsPriceResponse = tokenPriceApi.useGetTokenPriceQuery(
    queryArg ?? skipToken
  );

  const needsFallback = queryArg && cmsPriceResponse.isError;

  const fallbackPriceResponse = tokenPriceApi.useGetTokenPriceFallbackQuery(
    needsFallback ? queryArg : skipToken
  );

  return useMemo(() => {
    const price =
      cmsPriceResponse.currentData?.price ??
      fallbackPriceResponse.currentData?.price;

    if (price) {
      if (currency === Currency.USD) return price;

      const exchangeRate =
        exchangeRatesResponse.currentData &&
        exchangeRatesResponse.currentData[currency.toString()];
      if (exchangeRate) return price * exchangeRate;
    }

    return undefined;
  }, [
    currency,
    cmsPriceResponse.currentData,
    fallbackPriceResponse.currentData,
    exchangeRatesResponse.currentData,
  ]);
};

export default useTokenPrice;
