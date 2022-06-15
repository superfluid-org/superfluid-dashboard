import { fakeBaseQuery } from "@reduxjs/toolkit/dist/query";
import { createApi } from "@reduxjs/toolkit/dist/query/react";
import { ethers, getDefaultProvider } from "ethers";

// TODO(KK): getSerializedArgs implementation
export const ensApi = createApi({
  reducerPath: "ens",
  baseQuery: fakeBaseQuery(),
  endpoints: (builder) => {
    const mainnetProvider = new ethers.providers.JsonRpcBatchProvider("https://cloudflare-eth.com", "mainnet");
    return {
      resolveName: builder.query<
        { address: string; name: string } | null,
        string
      >({
        queryFn: async (name) => {
          if (ethers.utils.isAddress(name)) {
            return { data: null };
          }

          const address = await mainnetProvider.resolveName(name);
          return {
            data: address
              ? {
                  name,
                  address: address,
                }
              : null,
          };
        },
      }),
      lookupAddress: builder.query<
        { address: string; name: string } | null,
        string
      >({
        queryFn: async (address) => {
          const name = await mainnetProvider.lookupAddress(address);
          return {
            data: name
              ? {
                  name,
                  address: ethers.utils.getAddress(address),
                }
              : null,
          };
        },
      }),
    };
  },
});
