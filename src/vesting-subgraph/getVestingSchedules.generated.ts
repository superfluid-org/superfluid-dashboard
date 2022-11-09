import * as Types from './schema.generated';

import { api } from './vestingSubgraphApi';
export type GetVestingSchedulesQueryVariables = Types.Exact<{
  where?: Types.InputMaybe<Types.VestingSchedule_Filter>;
}>;


export type GetVestingSchedulesQuery = { __typename?: 'Query', vestingSchedules: Array<{ __typename?: 'VestingSchedule', id: string, cliffDate: any, cliffAmount: any, endDate: any, flowRate: any, receiver: any, sender: any, startDate: any, superToken: any }> };


export const GetVestingSchedulesDocument = `
    query getVestingSchedules($where: VestingSchedule_filter) {
  vestingSchedules(where: $where) {
    id
    cliffDate
    cliffAmount
    endDate
    flowRate
    receiver
    sender
    startDate
    superToken
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

