import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { memoize } from "lodash";
import { findNetworkByChainId } from "../../network/networks";
import {
  ListSubscriptionsApiArg,
  ListSubscriptionsApiResponse,
} from "./platformApiTemplate";

// const getBaseUrl = memoize((chainId: number) => {
//   const network = findNetworkByChainId(chainId);
//   if (network?.platformUrl) {
//     return network?.platformUrl;
//   } else {
//     throw Error("Network doesn't support scheduler.");
//   }
// });

export const platformApi = createApi({
  baseQuery: fetchBaseQuery(),
  endpoints: (build) => ({
    listSubscriptions: build.query<
      ListSubscriptionsApiResponse,
      ListSubscriptionsApiArg & { baseUrl: string }
    >({
      query: (queryArg) => ({
        url: `${queryArg.baseUrl}/api/v2/subscriptions/list/${queryArg.account}`,
        params: {
          limit: queryArg.limit,
          page: queryArg.page,
          filter: queryArg.filter,
        },
      }),
    }),
  }),
});
