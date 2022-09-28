import { createApi, fakeBaseQuery } from "@reduxjs/toolkit/dist/query/react";
import { Address } from "@superfluid-finance/sdk-core";
import axios from "axios";
import config from "../../utils/config";

const faucetApi = createApi({
  reducerPath: "faucet",
  baseQuery: fakeBaseQuery(),
  endpoints: (builder) => ({
    claimTestTokens: builder.query<null, { chainId: number; account: Address }>(
      {
        queryFn: async ({ chainId, account }) => {
          await axios.post(
            `${config.api.faucetApiUrl}/default/fund-me-on-multi-network`,
            {
              receiver: account,
              chainid: chainId,
            }
          );

          // Sleep for 5 seconds for subgraph to sync
          await new Promise((r) => setTimeout(r, 5000));

          return { data: null };
        },
      }
    ),
  }),
});

export default faucetApi;
