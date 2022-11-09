import { createApi } from "@reduxjs/toolkit/query/react";
import { graphqlRequestBaseQuery } from "@rtk-query/graphql-request-base-query";
import { GraphQLClient } from "graphql-request";

export const client = new GraphQLClient(
  "https://api.studio.thegraph.com/query/14557/vesting-scheduler/v0.0.3"
);

export const api = createApi({
  reducerPath: "superfluid_vesting",
  baseQuery: graphqlRequestBaseQuery({
    client,
  }),
  endpoints: () => ({}),
});

export const vestingSubgraphApi = api;
