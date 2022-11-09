import * as Types from './schema.generated';

import { api } from './vestingSubgraphApi';
export type GetVestingSchedulesQueryVariables = Types.Exact<{
  where?: Types.InputMaybe<Types.CreateVestingScheduleEvent_Filter>;
}>;


export type GetVestingSchedulesQuery = { __typename?: 'Query', createVestingScheduleEvents: Array<{ __typename?: 'CreateVestingScheduleEvent', id: string, cliffDate: any, cliffTransferAmount: any, endDate: any, flowRate: any, receiver: any, sender: any, startDate: any, superToken: any, timestamp: any, transactionHash: any }> };


export const GetVestingSchedulesDocument = `
    query getVestingSchedules($where: CreateVestingScheduleEvent_filter) {
  createVestingScheduleEvents(where: $where) {
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
    getVestingSchedules: build.query<GetVestingSchedulesQuery, GetVestingSchedulesQueryVariables | void>({
      query: (variables) => ({ document: GetVestingSchedulesDocument, variables })
    }),
  }),
});

export { injectedRtkApi as api };
export const { useGetVestingSchedulesQuery, useLazyGetVestingSchedulesQuery } = injectedRtkApi;

