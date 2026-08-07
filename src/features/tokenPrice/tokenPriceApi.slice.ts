import { createApi, fakeBaseQuery } from "@reduxjs/toolkit/query/react";
import { Address } from "@superfluid-finance/sdk-core";
import { fetchTokenPriceBatched } from "./tokenPriceBatcher";

const LIFI_API_URL = "https://li.quest/v1";

// Free exchange rate API. More info here:
// https://www.exchangerate-api.com/docs/free
interface ExchangeRateResponse {
  rates: {
    [any: string]: number;
  };
}

interface LifiTokenPriceResponse {
  token: Address;
  priceUSD: string;
}

const tokenPriceApi = createApi({
  keepUnusedDataFor: 60 * 60, // 1 hour
  reducerPath: "tokenPrice",
  baseQuery: fakeBaseQuery(),
  endpoints: (builder) => ({
    getUSDExchangeRate: builder.query<ExchangeRateResponse["rates"], void>({
      queryFn: async () => {
        const response = await fetch(
          "https://open.er-api.com/v6/latest/USD"
        );
        if (!response.ok) {
          return { error: { status: response.status, data: response.statusText } };
        }
        const data: ExchangeRateResponse = await response.json();
        return { data: data.rates };
      },
    }),
    getTokenPrice: builder.query<
      { token: Address; price: number },
      { chainId: number; token: Address }
    >({
      queryFn: async ({ chainId, token }) => {
        try {
          const result = await fetchTokenPriceBatched(chainId, token);
          return { data: { token, price: Number(result.priceUsd) } };
        } catch (error) {
          return {
            error: { status: "CUSTOM_ERROR", error: String(error) },
          };
        }
      },
    }),
    getTokenPriceFallback: builder.query<
      { token: Address; price: number },
      { chainId: number; token: Address }
    >({
      queryFn: async ({ chainId, token }) => {
        const url = new URL(`${LIFI_API_URL}/token`);
        url.searchParams.set("chain", String(chainId));
        url.searchParams.set("token", token);
        const response = await fetch(url.toString());
        if (!response.ok) {
          return { error: { status: response.status, data: response.statusText } };
        }
        const data: LifiTokenPriceResponse = await response.json();
        return { data: { token: data.token, price: Number(data.priceUSD) } };
      },
    }),
  }),
});

export default tokenPriceApi;
