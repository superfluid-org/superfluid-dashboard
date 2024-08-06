import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/dist/query/react";
import { allNetworks } from "../network/networks";
import { isAddress } from "../../utils/memoizedEthersUtils";
import { publicClientToProvider } from "../../utils/wagmiEthersAdapters";
import { resolvedWagmiClients } from "../wallet/WagmiManager";
import { PublicClient } from "viem";

const addressBookRpcApi = createApi({
  reducerPath: "addressBookRpcApi",
  baseQuery: fetchBaseQuery(),
  endpoints: (builder) => ({
    isContract: builder.query<
      { isContract: boolean; associatedNetworks: number[] },
      string
    >({
      queryFn: async (address) => {
        const trimmedAddress = address.trim();
        if (!trimmedAddress || !isAddress(trimmedAddress)) {
          return {
            data: {
              isContract: false,
              associatedNetworks: [],
            },
          };
        }

        const result = (
          await Promise.all(
            allNetworks.map(async (network) => {
              const publicClient = resolvedWagmiClients[network.id]();
              const provider = publicClientToProvider(publicClient);
              const code = await provider.getCode(address);

              return { network, code };
            })
          )
        ).reduce(
          (acc, curr) => {
            if (curr.code !== "0x")
              return {
                data: {
                  isContract: true,
                  associatedNetworks: [
                    ...acc.data.associatedNetworks,
                    curr.network.id,
                  ],
                },
              };

            return acc;
          },
          {
            data: {
              isContract: false,
              associatedNetworks: [] as number[],
            },
          }
        );

        return result;
      },
    }),
  }),
});

export default addressBookRpcApi;
