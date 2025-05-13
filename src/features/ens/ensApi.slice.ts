import { fakeBaseQuery } from "@reduxjs/toolkit/query";
import { createApi } from "@reduxjs/toolkit/query/react";
import { ethers } from "ethers";
import { AvatarResolver } from "@ensdomains/ens-avatar";

export interface ResolveNameResult {
  address: string;
  name: string;
}

// TODO(KK): getSerializedArgs implementation
export const ensApi = createApi({
  reducerPath: "ens",
  baseQuery: fakeBaseQuery(),
  keepUnusedDataFor: 600, // Agressively cache the ENS queries
  endpoints: (builder) => {
    const mainnetProvider = new ethers.providers.JsonRpcBatchProvider(
      "https://rpc-endpoints.superfluid.dev/eth-mainnet",
      "mainnet"
    );

    const avatarResolver = new AvatarResolver(mainnetProvider, {
      apiKey: {
        opensea: process.env.NEXT_PUBLIC_OPENSEA_API_KEY ?? "",
      },
    });

    return {
      resolveName: builder.query<ResolveNameResult | null, string>({
        queryFn: async (name) => {
          if (!name.includes(".")) {
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
      getAvatar: builder.query<any, string>({
        queryFn: async (address) => {
          const name = await mainnetProvider.lookupAddress(address);

          if (name === null) {
            return {
              data: null,
            };
          }

          const avatarUrl = await avatarResolver.getAvatar(name, {});

          return {
            data: avatarUrl,
          };
        },
      }),
    };
  },
});
