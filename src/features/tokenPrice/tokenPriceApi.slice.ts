import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/dist/query/react";
import { Address } from "@superfluid-finance/sdk-core";

const LIFI_API_URL = "https://li.quest/v1";

// Free exchange rate API. More info here:
// https://www.exchangerate-api.com/docs/free
interface ExchangeRateResponse {
  rates: {
    [any: string]: number;
  };
}

// LiFi-s supported chain. This object has more data but we don't need it here yet.
// More info: https://docs.li.fi/more-integration-options/li.fi-api/requesting-supported-chains
interface SupportedChain {
  id: number;
}

interface SupportedChainsResponse {
  chains: SupportedChain[];
}

// More info: https://docs.li.fi/more-integration-options/li.fi-api/getting-token-information
interface TokenPriceResponse {
  token: Address;
  priceUSD: string;
}

const tokenPriceApi = createApi({
  keepUnusedDataFor: 60 * 60 * 12, // 12 hours
  reducerPath: "tokenPrice",
  baseQuery: fetchBaseQuery(),
  endpoints: (builder) => ({
    getUSDExchangeRate: builder.query<ExchangeRateResponse["rates"], void>({
      query: () => "https://open.er-api.com/v6/latest/USD",
      transformResponse: (response: ExchangeRateResponse) => response.rates,
    }),
    getSupportedChainIds: builder.query<number[], void>({
      query: () => ({
        url: `${LIFI_API_URL}/chains`,
      }),
      transformResponse: (response: SupportedChainsResponse) =>
        (response.chains || []).map(
          (supportedChain: SupportedChain) => supportedChain.id
        ),
    }),
    getTokenData: builder.query<
      { token: Address; price: number },
      { chainId: number; token: Address }
    >({
      query: ({ chainId, token }) => ({
        url: `${LIFI_API_URL}/token`,
        params: { chain: chainId, token },
      }),
      transformResponse: (response: TokenPriceResponse) => {
        return { ...response, price: Number(response.priceUSD) };
      },
    }),
  }),
});

export default tokenPriceApi;
