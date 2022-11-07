import * as Types from './schema.generated';

import { api } from './baseApi';
export type GetSentVestingSchedulesQueryVariables = Types.Exact<{
  sender?: Types.InputMaybe<Types.Scalars['Bytes']>;
}>;


export type GetSentVestingSchedulesQuery = { __typename?: 'Query', createVestingScheduleEvents: Array<{ __typename?: 'CreateVestingScheduleEvent', cliffDate: any, cliffTransferAmount: any, endDate: any, flowRate: any, receiver: any, sender: any, startDate: any, superToken: any, timestamp: any, transactionHash: any }> };


export const GetSentVestingSchedulesDocument = `
    query getSentVestingSchedules($sender: Bytes) {
  createVestingScheduleEvents(where: {sender: $sender}) {
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
    getSentVestingSchedules: build.query<GetSentVestingSchedulesQuery, GetSentVestingSchedulesQueryVariables | void>({
      query: (variables) => ({ document: GetSentVestingSchedulesDocument, variables })
    }),
  }),
});

export { injectedRtkApi as api };
export const { useGetSentVestingSchedulesQuery, useLazyGetSentVestingSchedulesQuery } = injectedRtkApi;

