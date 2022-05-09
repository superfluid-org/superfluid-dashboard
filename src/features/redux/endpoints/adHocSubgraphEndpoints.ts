import {
  getSubgraphClient,
  SubgraphEndpointBuilder,
} from "@superfluid-finance/sdk-redux";
import { ethers } from "ethers";
import { gql } from "graphql-request";
import { uniq } from "lodash";
import { Network, networksByChainId } from "../../network/networks";

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

type NativeAssetSuperTokenSubgraphResult = {
  id: string;
  name: string;
  symbol: string;
};

export enum TokenType {
  NativeAssetUnderlyingToken = 1,
  ERC20UnderlyingToken = 2,
  NativeAssetSuperToken = 3,
  WrapperSuperToken = 4,
  PureSuperToken = 5,
}

export type UnderlyingTokenType =
  | TokenType.NativeAssetUnderlyingToken
  | TokenType.ERC20UnderlyingToken;

export type SuperTokenType =
  | TokenType.NativeAssetSuperToken
  | TokenType.WrapperSuperToken
  | TokenType.PureSuperToken;

export type TokenMinimal = {
  type: UnderlyingTokenType | SuperTokenType;
  address: string;
  name: string;
  symbol: string;
};

export const isUnderlying = (
  x: TokenMinimal
): x is ERC20TokenMinimal | NativeAsset =>
  x.type === TokenType.NativeAssetUnderlyingToken ||
  x.type === TokenType.ERC20UnderlyingToken;

export const isWrappable = (x: TokenMinimal): boolean =>
  x.type === TokenType.NativeAssetSuperToken ||
  x.type === TokenType.WrapperSuperToken;

export const isSuper = (x: TokenMinimal): x is SuperTokenMinimal =>
  isWrappable(x) || x.type === TokenType.PureSuperToken;

export type SuperTokenMinimal = {
  type: SuperTokenType;
  address: string;
  name: string;
  symbol: string;
};

export type ERC20TokenMinimal = {
  type: TokenType.ERC20UnderlyingToken;
  address: string;
  name: string;
  symbol: string;
};

/**
 * A dummy address to signal that the token is the blockchain's coin (native asset).
 */
export const NATIVE_ASSET_ADDRESS = "native-asset";

export type NativeAsset = {
  type: TokenType.NativeAssetUnderlyingToken;
  address: typeof NATIVE_ASSET_ADDRESS;
  name: string;
  symbol: string;
};

export type PureSuperToken = {
  address: string;
  name: string;
  symbol: string;
};

export type UnderlyingToken = {
  address: string;
  name: string;
  symbol: string;
};

export type SuperTokenPair = {
  superToken: SuperTokenMinimal;
  underlyingToken: ERC20TokenMinimal | NativeAsset;
};

export const adHocSubgraphEndpoints = {
  endpoints: (builder: SubgraphEndpointBuilder) => ({
    recents: builder.query<
      string[],
      { chainId: number; accountAddress: string }
    >({
      queryFn: async (arg) => {
        const { chainId, accountAddress } = arg;
        const client = await getSubgraphClient(chainId);
        const query = gql`
          query recents($accountAddress: String) {
            streams(
              where: { sender: $accountAddress }
              orderBy: updatedAtBlockNumber
              orderDirection: desc
            ) {
              receiver {
                id
              }
            }
          }
        `;
        const variables = {
          accountAddress: accountAddress.toLowerCase(),
        };
        const response = await client.request<{
          streams: { receiver: { id: string } }[];
        }>(query, variables);
        return {
          data: uniq(response.streams.map((x) => x.receiver.id)).map((x) =>
            ethers.utils.getAddress(x)
          ),
        };
      },
    }),
    walletSendableSuperTokens: builder.query<
      SuperTokenMinimal[],
      { chainId: number; accountAddress: string }
    >({
      queryFn: async (arg) => {
        const subgraphClient = await getSubgraphClient(arg.chainId);

        const response = await subgraphClient.request<{
          result: {
            token: {
              name: string;
              symbol: string;
              address: string;
            };
          }[];
        }>(
          gql`
            query accountInteractedSuperTokens($account: String) {
              result: accountTokenSnapshots(where: { account: $account }) {
                token {
                  name
                  symbol
                  address: id
                }
              }
            }
          `,
          {
            account: arg.accountAddress.toLowerCase(),
          }
        );

        const network = networksByChainId.get(arg.chainId)!;
        const networkNativeAssetSuperTokenAddress =
          network.nativeAsset.superToken.address.toLowerCase();

        return {
          data: response.result.map((x) => {
            if (x.token.address === networkNativeAssetSuperTokenAddress) {
              return network.nativeAsset.superToken;
            }

            return {
              type: TokenType.WrapperSuperToken,
              address: x.token.address,
              name: x.token.name,
              symbol: x.token.symbol,
            };
          }),
        };
      },
    }),
    tokenUpgradeDowngradePairs: builder.query<
      SuperTokenPair[],
      { chainId: number }
    >({
      keepUnusedDataFor: 360,
      queryFn: async (arg) => {
        const subgraphClient = await getSubgraphClient(arg.chainId);

        const subgraphResult = await subgraphClient.request<{
          wrapperSuperTokens: WrapperSuperTokenSubgraphResult[];
          nativeAssetSuperTokens: NativeAssetSuperTokenSubgraphResult[];
        }>(
          gql`
            query {
              wrapperSuperTokens: tokens(
                first: 1000
                where: {
                  isSuperToken: true
                  isListed: true
                  underlyingAddress_not: "0x0000000000000000000000000000000000000000"
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
              nativeAssetSuperTokens: tokens(
                first: 1000
                where: {
                  isSuperToken: true
                  isListed: true
                  symbol_in: ["ETHx", "AVAXx"]
                  underlyingAddress: "0x0000000000000000000000000000000000000000"
                }
              ) {
                id
                name
                symbol
                underlyingAddress
              }
            }
          `,
          {}
        );

        const { wrapperSuperTokens, nativeAssetSuperTokens } = subgraphResult;

        const network = networksByChainId.get(arg.chainId)!;
        const nativeAssetSuperTokenPairs: SuperTokenPair[] =
          nativeAssetSuperTokens.map((x) => ({
            superToken: {
              type: TokenType.NativeAssetSuperToken,
              address: x.id,
              symbol: x.symbol,
              name: x.name,
            },
            underlyingToken: {
              type: TokenType.NativeAssetUnderlyingToken,
              address: NATIVE_ASSET_ADDRESS,
              symbol: network.nativeAsset.symbol,
              name: `${network.displayName} Native Asset`,
            },
          }));

        const nativeAssetSuperTokenAddress =
          network.nativeAsset.superToken.address.toLowerCase();

        const wrapperSuperTokenPairs: SuperTokenPair[] = wrapperSuperTokens.map(
          (x) => {
            // Handle exceptional legacy native asset coins first:
            if (x.id === nativeAssetSuperTokenAddress) {
              return {
                superToken: {
                  type: TokenType.WrapperSuperToken,
                  address: x.id,
                  symbol: x.symbol,
                  name: x.name,
                },
                underlyingToken: {
                  type: TokenType.NativeAssetUnderlyingToken,
                  address: NATIVE_ASSET_ADDRESS,
                  symbol: network.nativeAsset.symbol,
                  name: `${network.displayName} Native Asset`,
                },
              };
            }

            return {
              superToken: {
                type: TokenType.WrapperSuperToken,
                address: x.id,
                symbol: x.symbol,
                name: x.name,
              },
              underlyingToken: {
                type: TokenType.ERC20UnderlyingToken,
                address: x.underlyingToken.id,
                symbol: x.underlyingToken.symbol,
                name: x.underlyingToken.name,
              },
            };
          }
        );

        const result: SuperTokenPair[] = nativeAssetSuperTokenPairs.concat(
          wrapperSuperTokenPairs.filter(
            (x) =>
              x.superToken.address !==
              "0x84b2e92e08008c0081c8c21a35fda4ddc5d21ac6"
          )
        );

        return {
          data: result,
        };
      },
    }),
  }),
};

export const getSuperTokenType = (arg: {
  network: Network;
  isListed: boolean;
  address: string;
  symbol: string;
  name: string;
  underlyingAddress: string;
}) => {
  if (
    arg.address.toLowerCase() ===
    arg.network.nativeAsset.superToken.address.toLowerCase()
  ) {
    return TokenType.NativeAssetSuperToken;
  } else if (
    arg.underlyingAddress === "0x0000000000000000000000000000000000000000"
  ) {
    return TokenType.PureSuperToken;
  } else {
    return TokenType.WrapperSuperToken;
  }
};
