import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import {
  IsAccountWhitelistedApiArg,
  IsAccountWhitelistedApiResponse,
} from "./platformApiTemplate";
import config from "../../../utils/config";

// NOTE: This is the actual platform API slice, manually edited. A "template" is also generated for types and ideas.
export const platformApi = createApi({
  tagTypes: ["GENERAL", "SPECIFIC"], // TODO(KK): Make SDK be able to invalidate another slice!
  baseQuery: fetchBaseQuery(),
  keepUnusedDataFor: 240,
  refetchOnMountOrArgChange: 120,
  refetchOnReconnect: true,
  endpoints: (build) => ({
    isAccountWhitelisted: build.query<
      IsAccountWhitelistedApiResponse,
      IsAccountWhitelistedApiArg & { chainId: number; }
    >({
      query: (queryArg) => ({
        url: `${config.allowlistApiUrl}/api/allowlist/${queryArg.account}/${queryArg.chainId}`,
      }),
    }),
  }),
});
