import {
  getSubgraphClient,
  SubgraphEndpointBuilder,
} from "@superfluid-finance/sdk-redux";
import { ethers } from "ethers";
import { gql } from "graphql-request";
import { uniq } from "lodash";
import { dateNowSeconds } from "../../../utils/dateUtils";
import { Network, networks, networksByChainId } from "../../network/networks";
import {
  SuperTokenMinimal,
  SuperTokenPair,
  NATIVE_ASSET_ADDRESS,
  UnderlyingTokenType,
} from "./tokenTypes";
import { TokenType } from "./tokenTypes";

export type TokenBalance = {
  balance: string;
  totalNetFlowRate: string;
  timestamp: number;
};

type WrapperSuperTokenSubgraphResult = {
  id: string;
  name: string;
  symbol: string;
  underlyingToken: {
    id: string;
    name: string;
    symbol: string;
    decimals: number;
  };
};

type NativeAssetSuperTokenSubgraphResult = {
  id: string;
  name: string;
  symbol: string;
};

const nativeAssetSuperTokenSymbols = uniq(
  networks.map((x) => x.nativeCurrency.superToken.symbol)
);

export const adHocSubgraphEndpoints = {
  endpoints: (builder: SubgraphEndpointBuilder) => ({
    accountTokenBalanceHistory: builder.query<
      TokenBalance[],
      {
        chainId: number;
        accountAddress: string;
        tokenAddress: string;
        timestamp_gte?: number;
        timestamp_lte?: number;
      }
    >({
      queryFn: async ({
        chainId,
        accountAddress,
        tokenAddress,
        timestamp_gte = 0,
        timestamp_lte = dateNowSeconds(),
      }) => {
        const client = await getSubgraphClient(chainId);
        const query = gql`
          query tokenBalanceHistoryQuery(
            $accountAddress: String
            $tokenAddress: String
            $timestamp_gte: BigInt
            $timestamp_lte: BigInt
          ) {
            accountTokenSnapshotLogs(
              where: {
                account: $accountAddress
                token: $tokenAddress
                timestamp_gte: $timestamp_gte
                timestamp_lte: $timestamp_lte
              }
              orderBy: order
              orderDirection: desc
              first: 1000
            ) {
              balance
              totalNetFlowRate
              timestamp
            }
          }
        `;
        const variables = {
          accountAddress: accountAddress.toLowerCase(),
          tokenAddress: tokenAddress.toLowerCase(),
          timestamp_gte: timestamp_gte.toString(),
          timestamp_lte: timestamp_lte.toString(),
        };

        const response = await client.request<{
          accountTokenSnapshotLogs: {
            balance: string;
            timestamp: string;
            totalNetFlowRate: string;
          }[];
        }>(query, variables);

        return {
          data: response.accountTokenSnapshotLogs.map((tokenSnapshot) => ({
            ...tokenSnapshot,
            timestamp: Number(tokenSnapshot.timestamp),
          })),
        };
      },
    }),
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
          network.nativeCurrency.superToken.address.toLowerCase();

        return {
          data: response.result.map((x) => {
            if (x.token.address === networkNativeAssetSuperTokenAddress) {
              return { ...network.nativeCurrency.superToken, decimals: 18 };
            }

            return {
              type: TokenType.WrapperSuperToken,
              address: x.token.address,
              name: x.token.name,
              symbol: x.token.symbol,
              decimals: 18,
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
                  decimals
                }
              }
              nativeAssetSuperTokens: tokens(
                first: 1000
                where: {
                  isSuperToken: true
                  isListed: true
                  symbol_in: [${nativeAssetSuperTokenSymbols
                    .map((x) => `"${x}"`)
                    .join(",")}]
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
              decimals: 18,
            },
            underlyingToken: {
              type: TokenType.NativeAssetUnderlyingToken,
              address: NATIVE_ASSET_ADDRESS,
              symbol: network.nativeCurrency.symbol,
              name: `${network.name} Native Asset`,
              decimals: network.nativeCurrency.decimals,
            },
          }));

        const nativeAssetSuperTokenAddress =
          network.nativeCurrency.superToken.address.toLowerCase();

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
                  decimals: 18,
                },
                underlyingToken: {
                  type: TokenType.NativeAssetUnderlyingToken,
                  address: NATIVE_ASSET_ADDRESS,
                  symbol: network.nativeCurrency.symbol,
                  name: `${network.name} Native Asset`,
                  decimals: network.nativeCurrency.decimals,
                },
              };
            }

            return {
              superToken: {
                type: TokenType.WrapperSuperToken,
                address: x.id,
                symbol: x.symbol,
                name: x.name,
                decimals: 18,
              },
              underlyingToken: {
                type: TokenType.ERC20UnderlyingToken,
                address: x.underlyingToken.id,
                symbol: x.underlyingToken.symbol,
                name: x.underlyingToken.name,
                decimals: x.underlyingToken.decimals,
              },
            };
          }
        );

        const result: SuperTokenPair[] = nativeAssetSuperTokenPairs.concat(
          wrapperSuperTokenPairs.filter(
            (x) =>
              x.superToken.address !==
              "0x84b2e92e08008c0081c8c21a35fda4ddc5d21ac6" // Filter out a neglected token.
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
  address: string;
  underlyingAddress: string;
}) => {
  if (
    arg.address.toLowerCase() ===
    arg.network.nativeCurrency.superToken.address.toLowerCase()
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

export const getUnderlyingTokenType = ({
  address,
}: {
  address: string;
}): UnderlyingTokenType => {
  if (
    address === NATIVE_ASSET_ADDRESS ||
    address === "0x0000000000000000000000000000000000000000"
  ) {
    return TokenType.NativeAssetUnderlyingToken;
  } else {
    return TokenType.ERC20UnderlyingToken;
  }
};
