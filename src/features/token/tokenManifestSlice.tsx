import { createApi, fakeBaseQuery } from "@reduxjs/toolkit/dist/query/react";
import axios from "axios";

export interface TokenManifest {
  version: string;
  type: string;
  svgIconPath: string;
  isSuperToken: boolean;
  superTokenType: string;
  superTokenCustomProperties: string[];
  coingeckoId: string;
  defaultColor: string;
}

export const assetApiSlice = createApi({
  reducerPath: "superfluid_assets",
  baseQuery: fakeBaseQuery(),
  endpoints: (builder) => ({
    tokenManifest: builder.query<TokenManifest | null, { tokenSymbol: string }>(
      {
        keepUnusedDataFor: 360,
        queryFn: async ({ tokenSymbol }) => {
          const assetKey =
            tokenSymbol === "mStable USD (Polygon PoS)"
              ? "mstable-usd-polygon-pos"
              : tokenSymbol.toLowerCase();

          const manifest = await axios
            .get(
              `https://raw.githubusercontent.com/superfluid-finance/assets/master/public/tokens/${assetKey}/manifest.json`,
              {
                validateStatus: (status) => status !== 404, // Don't worry about 404-s because not all tokens have the manifest.
              }
            )
            .then((response) => {
              if (response.status === 200) {
                return response.data as TokenManifest;
              }
            })
            .catch((e) => {
              if (e.response?.status === 404) {
              } else {
                console.error({ e });
              }
            });

          return { data: manifest ?? null };
        },
      }
    ),
  }),
});
