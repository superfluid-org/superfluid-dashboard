import { createApi } from "@reduxjs/toolkit/query/react";
import { graphqlRequestBaseQuery } from "@rtk-query/graphql-request-base-query";
import { GraphQLClient } from "graphql-request";

export const client = new GraphQLClient(
  "https://api.studio.thegraph.com/query/14557/vesting-scheduler-test/v0.0.8"
);

export const api = createApi({
  reducerPath: "superfluid_vesting",
  baseQuery: graphqlRequestBaseQuery({
    client,
  }),
  tagTypes: ["GENERAL", "SPECIFIC"], // TODO(KK): Make SDK be able to invalidate another slice!
  refetchOnFocus: true,
  refetchOnReconnect: true,
  endpoints: () => ({}),
});
