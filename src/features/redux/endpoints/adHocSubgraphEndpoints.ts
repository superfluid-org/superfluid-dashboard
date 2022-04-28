import {
  getSubgraphClient,
  SubgraphEndpointBuilder,
} from "@superfluid-finance/sdk-redux";
import { gql } from "graphql-request";
import { networksByChainId } from "../../network/networks";

type WrapperSuperTokenSubgraphResult = {
  id: string;
  name: string;
  symbol: string;
  underlyingToken: {
    id: string;
    name: string;
    symbol: string;
  };
};

type CoinSuperTokenSubgraphResult = {
  id: string;
  name: string;
  symbol: string;
};

export type TokenMinimal = {
  address: string;
  name: string;
  symbol: string;
};

/**
 * A dummy address to signal that the token is the blockchain's coin (native asset).
 */
export const COIN_ADDRESS = "coin";

export type CoinMinimal = {
  address: typeof COIN_ADDRESS;
  name: string;
  symbol: string;
};

export type WrappedSuperTokenPair = {
  superToken: TokenMinimal;
  underlyingToken: TokenMinimal | CoinMinimal;
};

export const adHocSubgraphEndpoints = {
  endpoints: (builder: SubgraphEndpointBuilder) => ({
    tokenUpgradeDowngradePairs: builder.query<
      WrappedSuperTokenPair[],
      { chainId: number }
    >({
      keepUnusedDataFor: 360,
      queryFn: async (arg) => {
        const subgraphClient = await getSubgraphClient(arg.chainId);
        const subgraphResult = await subgraphClient.request<{
          wrapperSuperTokens: WrapperSuperTokenSubgraphResult[];
          coinSuperTokens: CoinSuperTokenSubgraphResult[];
        }>(
          gql`
            query {
              wrapperSuperTokens: tokens(
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
              coinSuperTokens: tokens(
                first: 1000
                where: {
                  isSuperToken: true
                  isListed: true
                  symbol_in: ["ETHx", "AVAXx"]
                  underlyingAddress_in: [
                    "0x0000000000000000000000000000000000000000"
                    "0x"
                  ]
                }
              ) {
                id
                name
                symbol
              }
            }
          `,
          {}
        );

        const { wrapperSuperTokens, coinSuperTokens } = subgraphResult;

        const network = networksByChainId.get(arg.chainId)!;
        const coinSuperTokenPairs: WrappedSuperTokenPair[] =
          coinSuperTokens.map((x) => ({
            superToken: {
              address: x.id,
              symbol: x.symbol,
              name: x.name,
            } as TokenMinimal,
            underlyingToken: {
              address: "coin",
              symbol: network.coin.symbol,
              name: `${network.displayName} Native Asset`,
            } as CoinMinimal,
          }));

        const nativeAssetSuperTokenAddress =
          network.coin.superToken.address.toLowerCase();

        const wrapperSuperTokenPairs: WrappedSuperTokenPair[] =
          wrapperSuperTokens.map((x) => {
            // Handle exceptional legacy native asset coins first:
            if (x.id === nativeAssetSuperTokenAddress) {
              return {
                superToken: {
                  address: x.id,
                  symbol: x.symbol,
                  name: x.name,
                } as TokenMinimal,
                underlyingToken: {
                  address: "coin",
                  symbol: network.coin.symbol,
                  name: `${network.displayName} Native Asset`,
                } as CoinMinimal,
              };
            }

            return {
              superToken: {
                address: x.id,
                symbol: x.symbol,
                name: x.name,
              } as TokenMinimal,
              underlyingToken: {
                address: x.underlyingToken.id,
                symbol: x.underlyingToken.symbol,
                name: x.underlyingToken.name,
              } as TokenMinimal,
            };
          });

        const result: WrappedSuperTokenPair[] = coinSuperTokenPairs.concat(
          wrapperSuperTokenPairs
        );

        return {
          data: result,
        };
      },
    }),
  }),
};
