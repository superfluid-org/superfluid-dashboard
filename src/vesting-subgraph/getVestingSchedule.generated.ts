import * as Types from './schema.generated';

import { api } from './vestingSubgraphApi';
export type GetVestingScheduleQueryVariables = Types.Exact<{
  id: Types.Scalars['ID'];
}>;


export type GetVestingScheduleQuery = { __typename?: 'Query', createVestingScheduleEvent?: { __typename?: 'CreateVestingScheduleEvent', id: string, cliffDate: any, cliffTransferAmount: any, endDate: any, flowRate: any, receiver: any, sender: any, startDate: any, superToken: any, timestamp: any, transactionHash: any } | null };


export const GetVestingScheduleDocument = `
    query getVestingSchedule($id: ID!) {
  createVestingScheduleEvent(id: $id) {
    id
    cliffDate
    cliffTransferAmount
    endDate
    flowRate
    receiver
    sender
    startDate
    superToken
    timestamp
    transactionHash
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

