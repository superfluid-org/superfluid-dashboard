import { fakeBaseQuery } from "@reduxjs/toolkit/query";
import { createApi } from "@reduxjs/toolkit/query/react";
import { isAddress } from "../../utils/memoizedEthersUtils";

export type SocialIdentity = {
  handle: string;
  avatarUrl: string | null;
} | null;

export type SuperfluidProfile = {
  AlfaFrens: SocialIdentity;
  ENS: SocialIdentity;
  Farcaster: SocialIdentity;
  Lens: SocialIdentity;
};

export const whoisApi = createApi({
  reducerPath: "whois",
  baseQuery: fakeBaseQuery(),
  keepUnusedDataFor: 600,
  endpoints: (builder) => ({
    getProfile: builder.query<SuperfluidProfile | null, string>({
      queryFn: async (address) => {
        if (!address || !isAddress(address)) {
          return { data: null };
        }

        try {
          const response = await fetch(
            `https://whois.superfluid.finance/api/resolve/${address.toLowerCase()}`
          );

          if (!response.ok) {
            return { data: null };
          }

          const profile = await response.json();
          return { data: profile as SuperfluidProfile };
        } catch (error) {
          console.error("Whois API error:", error);
          return { data: null };
        }
      },
    }),
  }),
});

export const { useGetProfileQuery, useLazyGetProfileQuery } = whoisApi; 