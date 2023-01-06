import * as Types from './schema.generated';

import { api } from './vestingSubgraphApi';
export type PollQueryVariables = Types.Exact<{
  block?: Types.InputMaybe<Types.Block_Height>;
}>;


export type PollQuery = { __typename?: 'Query', events: Array<{ __typename?: 'VestingCliffAndFlowExecutedEvent', order: string } | { __typename?: 'VestingEndExecutedEvent', order: string } | { __typename?: 'VestingEndFailedEvent', order: string } | { __typename?: 'VestingScheduleCreatedEvent', order: string } | { __typename?: 'VestingScheduleDeletedEvent', order: string } | { __typename?: 'VestingScheduleUpdatedEvent', order: string }> };


export const PollDocument = `
    query poll($block: Block_height) {
  events(block: $block, first: 1) {
    order
  }
}
    `;

const injectedRtkApi = api.injectEndpoints({
  endpoints: (build) => ({
    poll: build.query<PollQuery, PollQueryVariables | void>({
      query: (variables) => ({ document: PollDocument, variables })
    }),
  }),
});

export { injectedRtkApi as api };
export const { usePollQuery, useLazyPollQuery } = injectedRtkApi;

