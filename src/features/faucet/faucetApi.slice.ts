import { createApi, fakeBaseQuery } from "@reduxjs/toolkit/dist/query/react";
import { Address } from "@superfluid-finance/sdk-core";
import { waitForTransaction } from "@wagmi/core";
import axios from "axios";
import config from "../../utils/config";

const faucetApi = createApi({
  reducerPath: "faucet",
  baseQuery: fakeBaseQuery(),
  endpoints: (builder) => ({
    claimTestTokens: builder.query<null, { chainId: number; account: Address }>(
      {
        queryFn: async ({ chainId, account }) => {
          const { status, data } = await axios.post(
            `${config.api.faucetApiUrl}/default/fund-me-on-multi-network`,
            {
              receiver: account,
              chainid: chainId,
            }
          );

          if (status === 202 && data.tx.hash) {
            await waitForTransaction({
              chainId,
              confirmations: 1,
              hash: data.tx.hash,
              timeout: 20000,
            });

            // Sleep for 2 seconds for subgraph to sync
            await new Promise((r) => setTimeout(r, 2000));
          }

          return { data: null };
        },
      }
    ),
  }),
});

export default faucetApi;
