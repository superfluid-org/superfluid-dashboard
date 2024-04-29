import { fakeBaseQuery } from "@reduxjs/toolkit/dist/query";
import { createApi } from "@reduxjs/toolkit/dist/query/react";
import { ethers } from "ethers";
import {
  LensClient,
  production,
  ProfilePictureSetFragment,
} from "@lens-protocol/client";

const lensClient = new LensClient({
  environment: production,
});

export interface ResolveNameResult {
  address: string;
  name: string;
}

export const lensApi = createApi({
  reducerPath: "lens",
  baseQuery: fakeBaseQuery(),
  keepUnusedDataFor: 600,
  endpoints: (builder) => {
    return {
      resolveName: builder.query<ResolveNameResult | null, string>({
        queryFn: async (name) => {
          const nameLowercased = name.toLowerCase();
          const searchHandle = nameLowercased.endsWith(".lens")
            ? `lens/${nameLowercased.split(".lens")[0]}`
            : nameLowercased.startsWith("@")
            ? `lens/${nameLowercased.substring(1)}`
            : null;

          if (!searchHandle) {
            return { data: null };
          }

          const profile = await lensClient.profile.fetch({
            forHandle: searchHandle,
          });

          return {
            data: profile?.handle
              ? {
                  name: profile.handle.suggestedFormatted.localName,
                  address: profile.ownedBy.address,
                }
              : null,
          };
        },
      }),
      lookupAddress: builder.query<
        { address: string; name: string; avatarUrl?: string } | null,
        string
      >({
        queryFn: async (address) => {
          const profile = await lensClient.profile.fetchDefault({
            for: address,
          });

          if (!profile?.handle) {
            return { data: null };
          }

          const name = profile.handle.suggestedFormatted.localName;
          const avatarUrl = (
            profile.metadata?.picture as ProfilePictureSetFragment | undefined
          )?.optimized?.uri;

          return {
            data: {
              name,
              avatarUrl,
              address: ethers.utils.getAddress(address),
            },
          };
        },
      }),
    };
  },
});
