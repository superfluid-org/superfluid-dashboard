import { fakeBaseQuery } from "@reduxjs/toolkit/dist/query";
import { createApi } from "@reduxjs/toolkit/dist/query/react";
import { ethers } from "ethers";
import { gql, request } from "graphql-request";
import { Address } from "wagmi";

export interface ResolveNameResult {
  address: string;
  name: string;
}

const LENS_API_URL = "https://api.lens.dev/";

// Lens API profile documentation - https://docs.lens.xyz/docs/get-profile
const LensAddressQuery = gql`
  query Profile($handle: Handle) {
    profile(request: { handle: $handle }) {
      ownedBy
    }
  }
`;

const LensHandlesQuery = gql`
  query Profiles($ownedBy: [EthereumAddress!]) {
    profiles(request: { ownedBy: $ownedBy }) {
      items {
        handle
        picture {
          ... on NftImage {
            contractAddress
            tokenId
            uri
            verified
          }
          ... on MediaSet {
            original {
              url
              mimeType
            }
          }
        }
      }
    }
  }
`;

interface LensProfile {
  handle: string;
  picture: {
    contractAddress?: Address;
    tokenId?: number;
    uri?: string;
    verified?: boolean;
    original?: {
      url: string;
      mimeType: string;
    };
  } | null;
}

export const lensApi = createApi({
  reducerPath: "lens",
  baseQuery: fakeBaseQuery(),
  keepUnusedDataFor: 600,
  endpoints: (builder) => {
    return {
      resolveName: builder.query<ResolveNameResult | null, string>({
        queryFn: async (name) => {
          if (!name.toLowerCase().endsWith(".lens")) {
            return { data: null };
          }

          const lensResponse = await request(LENS_API_URL, LensAddressQuery, {
            handle: name,
          });

          const address = lensResponse?.profile?.ownedBy;

          return {
            data: address
              ? {
                  name: name.toLowerCase(),
                  address,
                }
              : null,
          };
        },
      }),
      lookupAddress: builder.query<
        { address: string; name: string; avatarUrl: string } | null,
        string
      >({
        queryFn: async (address) => {
          const lensResponse = await request(LENS_API_URL, LensHandlesQuery, {
            ownedBy: [address],
          });

          if (!lensResponse) {
            return { data: null };
          }

          // One address can own multiple profiles so we take the first one
          const name = lensResponse.profiles.items.map(
            (item: LensProfile) => item.handle
          )[0];

          // Profile might not have picture so we try to find the first one that has
          const avatarUrl = lensResponse.profiles.items
            .map(
              (item: LensProfile) =>
                item.picture?.uri || item.picture?.original?.url
            )
            .filter((pictureUrl: string | undefined) => !!pictureUrl)[0];

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
