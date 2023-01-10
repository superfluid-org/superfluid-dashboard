import * as Types from './schema.generated';

import { api } from './vestingSubgraphApi';
export type GetVestingScheduleQueryVariables = Types.Exact<{
  id: Types.Scalars['ID'];
}>;


export type GetVestingScheduleQuery = { __typename?: 'Query', vestingSchedule?: { __typename?: 'VestingSchedule', id: string, cliffDate: string, cliffAmount: string, endDate: string, flowRate: string, receiver: string, sender: string, startDate: string, superToken: string, endExecutedAt?: string | null, deletedAt?: string | null, cliffAndFlowExecutedAt?: string | null, cliffAndFlowDate: string } | null };


export const GetVestingScheduleDocument = `
    query getVestingSchedule($id: ID!) {
  vestingSchedule(id: $id) {
    id
    cliffDate
    cliffAmount
    endDate
    flowRate
    receiver
    sender
    startDate
    superToken
    endExecutedAt
    deletedAt
    cliffAndFlowExecutedAt
    cliffAndFlowDate
  }
}
    `;

const injectedRtkApi = api.injectEndpoints({
  endpoints: (build) => ({
    getVestingSchedule: build.query<GetVestingScheduleQuery, GetVestingScheduleQueryVariables>({
      query: (variables) => ({ document: GetVestingScheduleDocument, variables })
    }),
  }),
});

export { injectedRtkApi as api };
export const { useGetVestingScheduleQuery, useLazyGetVestingScheduleQuery } = injectedRtkApi;

