import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import {
  ListSubscriptionsApiArg,
  ListSubscriptionsApiResponse,
} from "./platformApiTemplate";

export const platformApi = createApi({
  tagTypes: ["GENERAL"], // TODO(KK): Make SDK be able to invalidate another slice!
  baseQuery: fetchBaseQuery(),
  endpoints: (build) => ({
    listSubscriptions: build.query<
      ListSubscriptionsApiResponse,
      ListSubscriptionsApiArg & { chainId: number, baseUrl: string }
    >({
      query: (queryArg) => ({
        url: `${queryArg.baseUrl}/api/v2/subscriptions/list/${queryArg.account}`,
        params: {
          limit: queryArg.limit,
          page: queryArg.page,
          filter: queryArg.filter,
        },
      }),
      providesTags: (_result, _error, arg) => [
        {
          type: "GENERAL",
          id: arg.chainId, // TODO(KK): Could be made more specific.
        },
      ],
    }),
  }),
});
