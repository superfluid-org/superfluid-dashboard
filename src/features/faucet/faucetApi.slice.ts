import { createApi, fakeBaseQuery } from "@reduxjs/toolkit/dist/query/react";
import { Address } from "@superfluid-finance/sdk-core";
import { registerNewTransaction } from "@superfluid-finance/sdk-redux";
import { waitForTransaction } from "@wagmi/core";
import axios from "axios";
import { ethers } from "ethers";
import config from "../../utils/config";

const faucetApi = createApi({
  reducerPath: "faucet",
  baseQuery: fakeBaseQuery(),
  endpoints: (builder) => ({
    claimTestTokens: builder.query<null, { chainId: number; account: Address }>(
      {
        queryFn: async ({ chainId, account }, queryApi) => {
          const { status, data } = await axios.post(
            `${config.api.faucetApiUrl}/default/fund-me-on-multi-network`,
            {
              receiver: account,
              chainid: chainId,
            }
          );

          if (status === 202 && data.tx.hash) {
            await registerNewTransaction({
              dispatch: queryApi.dispatch,
              chainId,
              transactionResponse: data.tx,
              waitForConfirmation: false,
              signer: account,
              extraData: {},
              title: "Claim Tokens",
            });
          }

          return { data: null };
        },
      }
    ),
  }),
});

export default faucetApi;
