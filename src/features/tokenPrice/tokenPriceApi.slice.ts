import { createApi, fakeBaseQuery } from "@reduxjs/toolkit/dist/query/react";
import { Address } from "@superfluid-finance/sdk-core";
import axios from "axios";

// LiFi-s supported chain. This object has more data but we don't need it here yet.
// More info: https://docs.li.fi/more-integration-options/li.fi-api/requesting-supported-chains
interface SupportedChain {
  id: number;
}

// https://docs.li.fi/more-integration-options/li.fi-api/getting-token-information
interface TokenPrice {
  token: Address;
  price: string;
}

const tokenPriceApi = createApi({
  reducerPath: "tokenPrice",
  baseQuery: fakeBaseQuery(),
  endpoints: (builder) => ({
    getSupportedNetworkIDs: builder.query<number[], void>({
      queryFn: () =>
        axios
          .get("https://li.quest/v1/chains")
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
          .get("https://li.quest/v1/token", {
            params: { chain: chainId, token },
          })
          .then((response) => {
            return {
              data: {
                ...response.data,
                price: response.data.priceUSD,
                // precision: getPrecision(response.data.priceUSD),
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

const getPrecision = (price: string) => {
  const regex = /^0.([0]*)/g;
  const asd = price.match(regex);
  console.log(asd);
};
