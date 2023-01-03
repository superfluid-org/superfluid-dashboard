import { createApi } from "@reduxjs/toolkit/query/react";
import { graphqlRequestBaseQuery } from "@rtk-query/graphql-request-base-query";
import { GraphQLClient } from "graphql-request";

export const client = new GraphQLClient(
  "https://api.studio.thegraph.com/query/14557/vesting-scheduler/0.0.9"
);

export const localClient = new GraphQLClient(
  "http://127.0.0.1:8000/subgraphs/name/vesting-scheduler"
);

export const api = createApi({
  reducerPath: "superfluid_vesting",
  baseQuery: graphqlRequestBaseQuery({
    client: process.env.NODE_ENV === "development" ? localClient : client,
  }),
  tagTypes: ["GENERAL", "SPECIFIC"], // TODO(KK): Make SDK be able to invalidate another slice!
  refetchOnFocus: true,
  refetchOnReconnect: true,
  endpoints: () => ({}),
});
