import { fakeBaseQuery } from "@reduxjs/toolkit/query";
import { createApi } from "@reduxjs/toolkit/query/react";
import { isAddress } from "../../utils/memoizedEthersUtils";

export type SocialIdentity = {
  handle: string;
  avatarUrl: string | null;
} | null;

export type SuperfluidProfile = {
  TOREX: SocialIdentity;
  AlfaFrens: SocialIdentity;
  ENS: SocialIdentity;
  Farcaster: SocialIdentity;
  Lens: SocialIdentity;
  recommendedName: string | null;
  recommendedAvatar: string | null;
  recommendedService: string | null;
};

export type ReverseResolveProfile = {
  address: string;
  handle: string;
  avatarUrl: string | null;
} | null;

export type ReverseResolveResult = {
  TOREX: ReverseResolveProfile;
  ENS: ReverseResolveProfile;
  Farcaster: ReverseResolveProfile;
  AlfaFrens: ReverseResolveProfile;
  recommendedName: string | null;
  recommendedAvatar: string | null;
  recommendedService: string | null;
};

export type IndividualReverseResolveResult = {
  address: string;
  name: string;
  service: 'ENS' | 'Farcaster' | 'AlfaFrens';
  avatarUrl: string | null;
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
    reverseResolve: builder.query<{ address: string; name: string; avatarUrl: string | null } | null, string>({
      queryFn: async (username) => {
        if (!username || username.trim().length === 0) {
          return { data: null };
        }

        try {
          const response = await fetch(
            `https://whois.superfluid.finance/api/reverse-resolve/${encodeURIComponent(username.trim())}`
          );

          if (!response.ok) {
            return { data: null };
          }

          const result = await response.json() as ReverseResolveResult;
          
          if (result.recommendedName && result.recommendedService) {
            const recommendedServiceData = result[result.recommendedService as keyof ReverseResolveResult] as ReverseResolveProfile;
            // Just having the handle could be abit misleading so adding a subfix to it
            // Note: The AF API does not have an endpoint to lookup address from a handle , so we can't reverse resolve them
            if (recommendedServiceData?.address) {
              const displayName = result.recommendedService === 'AlfaFrens' 
                ? `${result.recommendedName}'s channel`
                : result.recommendedName;

              return {
                data: {
                  address: recommendedServiceData.address,
                  name: displayName,
                  avatarUrl: result.recommendedAvatar,
                }
              };
            }
          }

          return { data: null };
        } catch (error) {
          console.error("Whois reverse resolve API error:", error);
          return { data: null };
        }
      },
    }),
  }),
});

export const { useGetProfileQuery, useLazyGetProfileQuery, useReverseResolveQuery } = whoisApi; 