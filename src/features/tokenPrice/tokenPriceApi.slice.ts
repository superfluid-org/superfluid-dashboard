import { createApi, fakeBaseQuery } from "@reduxjs/toolkit/dist/query/react";
import { Address } from "@superfluid-finance/sdk-core";
import axios from "axios";

const LIFI_API_URL = "https://li.quest/v1";

// LiFi-s supported chain. This object has more data but we don't need it here yet.
// More info: https://docs.li.fi/more-integration-options/li.fi-api/requesting-supported-chains
interface SupportedChain {
  id: number;
}

// https://docs.li.fi/more-integration-options/li.fi-api/getting-token-information
interface TokenPrice {
  token: Address;
  price: number;
}

const tokenPriceApi = createApi({
  reducerPath: "tokenPrice",
  baseQuery: fakeBaseQuery(),
  endpoints: (builder) => ({
    getUSDExchangeRate: builder.query<{ [any: string]: number }, void>({
      queryFn: () =>
        axios
          .get("https://open.er-api.com/v6/latest/USD")
          .then((response) => ({ data: response.data.rates }))
          .catch((e) => {
            console.warn(
              "Failed to fetch supported networks for token price data.",
              e
            );
            return { error: e.response };
          }),
    }),
    getSupportedNetworkIDs: builder.query<number[], void>({
      queryFn: () =>
        axios
          .get(`${LIFI_API_URL}/chains`)
          .then((response) => ({
            data: (response.data.chains || []).map(
              (supportedChain: SupportedChain) => supportedChain.id
            ),
          }))
          .catch((e) => {
            console.warn(
              "Failed to fetch supported networks for token price data.",
              e
            );
            return { error: e.response };
          }),
    }),
    getTokenData: builder.query<
      TokenPrice,
      { chainId: number; token: Address }
    >({
      queryFn: async ({ chainId, token }) =>
        axios
          .get(`${LIFI_API_URL}/token`, {
            params: { chain: chainId, token },
          })
          .then((response) => {
            return {
              data: {
                ...response.data,
                price: Number(response.data.priceUSD),
              },
            };
          })
          .catch((e) => {
            console.warn("Failed to fetch token price data!", e);
            return { error: e.response };
          }),
    }),
  }),
});

export default tokenPriceApi;
