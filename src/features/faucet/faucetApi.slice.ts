import { createApi, fakeBaseQuery } from "@reduxjs/toolkit/query/react";
import { Address } from "@superfluid-finance/sdk-core";
import { registerNewTransaction } from "@superfluid-finance/sdk-redux";
import axios from "axios";
import config from "../../utils/config";

const faucetApi = createApi({
  reducerPath: "faucet",
  baseQuery: fakeBaseQuery(),
  endpoints: (builder) => ({
    claimTestTokens: builder.query<null, { chainId: number; account: Address }>(
      {
        queryFn: async ({ chainId, account }, queryApi) => {
          const { status, data } = await axios
            .post(
              `${config.api.faucetApiUrl}/default/fund-me-on-multi-network`,
              {
                receiver: account,
                chainid: chainId,
              }
            )
            .catch((e) => {
              console.warn("Failed to claim test tokens!", e);
              return e.response;
            });

          if (status === 202 && data.tx.hash) {
            await registerNewTransaction({
              dispatch: queryApi.dispatch,
              chainId,
              transactionResponse: data.tx,
              signerAddress: account,
              extraData: {},
              title: "Claim Tokens",
            });

            return { data: null };
          }

          if (data.error) {
            if (data.error.indexOf("execution reverted: no double send") >= 0) {
              return { error: 405 };
            }
          }

          return { error: 400 };
        },
      }
    ),
  }),
});

export default faucetApi;
