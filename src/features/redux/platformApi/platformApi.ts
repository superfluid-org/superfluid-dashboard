import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import {
  IsAccountWhitelistedApiArg,
  IsAccountWhitelistedApiResponse,
} from "./platformApiTemplate";

// NOTE: This is the actual platform API slice, manually edited. A "template" is also generated for types and ideas.
export const platformApi = createApi({
  tagTypes: ["GENERAL", "SPECIFIC"], // TODO(KK): Make SDK be able to invalidate another slice!
  baseQuery: fetchBaseQuery(),
  keepUnusedDataFor: 300,
  refetchOnFocus: true,
  refetchOnReconnect: true,
  endpoints: (build) => ({
    isAccountWhitelisted: build.query<
      IsAccountWhitelistedApiResponse,
      IsAccountWhitelistedApiArg & { chainId: number; baseUrl: string }
    >({
      query: (queryArg) => ({
        url: `${queryArg.baseUrl}/api/v2/users/is_whitelist/${queryArg.account}`,
      }),
    }),
  }),
});
