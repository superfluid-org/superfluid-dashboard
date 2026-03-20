import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { Address } from "@superfluid-finance/sdk-core";

const CMS_PRICES_URL = "https://cms.superfluid.pro/prices";
const LIFI_API_URL = "https://li.quest/v1";

// Free exchange rate API. More info here:
// https://www.exchangerate-api.com/docs/free
interface ExchangeRateResponse {
  rates: {
    [any: string]: number;
  };
}

interface CmsPriceResponse {
  priceUsd: string;
}

interface LifiTokenPriceResponse {
  token: Address;
  priceUSD: string;
}

const tokenPriceApi = createApi({
  keepUnusedDataFor: 60 * 30, // 30 minutes
  reducerPath: "tokenPrice",
  baseQuery: fetchBaseQuery(),
  endpoints: (builder) => ({
    getUSDExchangeRate: builder.query<ExchangeRateResponse["rates"], void>({
      query: () => "https://open.er-api.com/v6/latest/USD",
      transformResponse: (response: ExchangeRateResponse) => response.rates,
    }),
    getTokenPrice: builder.query<
      { token: Address; price: number },
      { chainId: number; token: Address }
    >({
      query: ({ chainId, token }) => ({
        url: `${CMS_PRICES_URL}/${chainId}/${token}/current`,
      }),
      transformResponse: (response: CmsPriceResponse, _meta, arg) => {
        return { token: arg.token, price: Number(response.priceUsd) };
      },
    }),
    getTokenPriceFallback: builder.query<
      { token: Address; price: number },
      { chainId: number; token: Address }
    >({
      query: ({ chainId, token }) => ({
        url: `${LIFI_API_URL}/token`,
        params: { chain: chainId, token },
      }),
      transformResponse: (response: LifiTokenPriceResponse) => {
        return { token: response.token, price: Number(response.priceUSD) };
      },
    }),
  }),
});

export default tokenPriceApi;
