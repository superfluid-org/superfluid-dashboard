import {
  getSubgraphClient,
  SubgraphEndpointBuilder,
} from '@superfluid-finance/sdk-redux';
import { gql } from 'graphql-request';

type SubgraphResult = {
  id: string;
  name: string;
  symbol: string;
  underlyingToken: {
    id: string;
    name: string;
    symbol: string;
  };
};

export type TokenMinimal = {
  address: string;
  name: string;
  symbol: string;
};

export type TokenUpgradeDowngradePair = {
  superToken: TokenMinimal;
  underlyingToken: TokenMinimal;
};

export const adHocSubgraphEndpoints = {
  endpoints: (builder: SubgraphEndpointBuilder) => ({
    tokenUpgradeDowngradePairs: builder.query<
      TokenUpgradeDowngradePair[],
      { chainId: number }
    >({
      queryFn: async (arg) => {
        const subgraphClient = await getSubgraphClient(arg.chainId);
        const subgraphResult = await subgraphClient.request<{
          tokens: SubgraphResult[];
        }>(
          gql`
            query {
              tokens(
                first: 1000
                where: {
                  isSuperToken: true
                  isListed: true
                  underlyingAddress_not_in: [
                    "0x0000000000000000000000000000000000000000"
                    "0x"
                  ]
                }
              ) {
                id
                name
                symbol
                underlyingToken {
                  id
                  name
                  symbol
                }
              }
            }
          `,
          {},
        );

        return {
          data: subgraphResult.tokens.map((x) => ({
            superToken: {
              address: x.id,
              symbol: x.symbol,
              name: x.name,
            },
            underlyingToken: {
              address: x.underlyingToken.id,
              symbol: x.underlyingToken.symbol,
              name: x.underlyingToken.name,
            },
          })),
        };
      },
    }),
  }),
};
