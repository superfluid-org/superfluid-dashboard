import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import {
  FindSubscriptionByIdApiArg,
  FindSubscriptionByIdApiResponse,
  ListSubscriptionsApiArg,
  ListSubscriptionsApiResponse,
} from "./platformApiTemplate";

export const platformApi = createApi({
  baseQuery: fetchBaseQuery(),
  endpoints: (build) => ({
    listSubscriptions: build.query<
      ListSubscriptionsApiResponse,
      ListSubscriptionsApiArg & { baseUrl: string }
    >({
      query: (queryArg) => ({
        url:
          queryArg.baseUrl + `/api/v2/subscriptions/list/${queryArg.account}`,
        params: {
          limit: queryArg.limit,
          page: queryArg.page,
          filter: queryArg.filter,
        },
      }),
    }),
    findSubscriptionById: build.query<
      FindSubscriptionByIdApiResponse,
      FindSubscriptionByIdApiArg & { baseUrl: string }
    >({
      query: (queryArg) => ({
        url: queryArg.baseUrl + `/api/v2/subscriptions/id/${queryArg.id}`,
      }),
    }),
  }),
});
