import { Address } from "@superfluid-finance/sdk-core";
import {
  getSubgraphClient,
  SubgraphEndpointBuilder,
} from "@superfluid-finance/sdk-redux";
import { ethers } from "ethers";
import { gql } from "graphql-request";
import { uniq } from "lodash";
import { dateNowSeconds } from "../../../utils/dateUtils";
import {
  Network,
  allNetworks,
  findNetworkOrThrow,
} from "../../network/networks";
import {
  NATIVE_ASSET_ADDRESS,
  SuperTokenMinimal,
  SuperTokenPair,
  SuperTokenType,
  TokenType,
  UnderlyingTokenType,
} from "./tokenTypes";
import { findTokenFromTokenList, mapSubgraphTokenToTokenMinimal } from "../../../hooks/useTokenQuery";

export type TokenBalance = {
  balance: string;
  totalNetFlowRate: string;
  timestamp: number;
};

type WrapperSuperTokenSubgraphResult = {
  id: string;
  name: string;
  symbol: string;
  isListed: boolean;
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
  isListed: boolean;
};

const nativeAssetSuperTokenSymbols = uniq(
  allNetworks.map((x) => x.nativeCurrency.superToken.symbol)
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
    isHumaFinanceOperatorStream: builder.query<
      boolean,
      { chainId: number; flowOperatorAddress: string; streamId: string }
    >({
      queryFn: async (arg) => {
        const { chainId, flowOperatorAddress, streamId } = arg;
        const client = await getSubgraphClient(chainId);
        const query = gql`
          query findStreamIdWhereHumaIsOperator(
            $flowOperatorAddress: String
            $streamId: String
          ) {
            streams(
              where: {
                flowUpdatedEvents_: { flowOperator: $flowOperatorAddress }
                id: $streamId
              }
            ) {
              id
            }
          }
        `;
        const variables = {
          flowOperatorAddress: flowOperatorAddress.toLowerCase(),
          streamId: streamId,
        };
        const response = await client.request<{
          streams: { id: string }[];
        }>(query, variables);
        return {
          data: response.streams.length > 0,
        };
      },
    }),
    findStreamIdsWhereHumaIsOperator: builder.query<
      string[],
      { chainId: number; flowOperatorAddress: string; receiverAddress: string }
    >({
      queryFn: async (arg) => {
        const { chainId, flowOperatorAddress, receiverAddress } = arg;
        const client = await getSubgraphClient(chainId);
        const query = gql`
          query findStreamIdsWhereHumaIsOperator(
            $flowOperatorAddress: String
            $receiverAddress: String
          ) {
            streams(
              where: {
                flowUpdatedEvents_: { flowOperator: $flowOperatorAddress }
                receiver: $receiverAddress
              }
            ) {
              id
            }
          }
        `;
        const variables = {
          flowOperatorAddress: flowOperatorAddress.toLowerCase(),
          receiverAddress: receiverAddress.toLowerCase(),
        };
        const response = await client.request<{
          streams: { id: string }[];
        }>(query, variables);
        return {
          data: response.streams.map((x) => x.id),
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
              underlyingAddress: string;
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
                  underlyingAddress
                }
              }
            }
          `,
          {
            account: arg.accountAddress.toLowerCase(),
          }
        );

        const network = findNetworkOrThrow(allNetworks, arg.chainId);
        const networkNativeAssetSuperTokenAddress =
          network.nativeCurrency.superToken.address.toLowerCase();

        return {
          data: response.result.map((x) => {
            if (x.token.address === networkNativeAssetSuperTokenAddress) {
              return { ...network.nativeCurrency.superToken, decimals: 18 };
            }

            const tokenFromTokenList = findTokenFromTokenList({ chainId: arg.chainId, address: x.token.address });
            if (tokenFromTokenList) {
              return tokenFromTokenList as SuperTokenMinimal;
            }

            // TODO: Move this into a re-used function with the intent of "map subgraph token to TokenMinimal"
            const tokenMapped: SuperTokenMinimal = {
              type: getSuperTokenType({ network: network, address: x.token.address, underlyingAddress: x.token.underlyingAddress }),
              address: x.token.address,
              symbol: x.token.symbol,
              name: x.token.name,
              isListed: false,
              decimals: 18,
              isSuperToken: true,
              underlyingAddress: x.token.address,
            }

            return tokenMapped;
          }),
        };
      },
    }),
    tokenUpgradeDowngradePairs: builder.query<
      SuperTokenPair[],
      { chainId: number; unlistedTokenIDs?: Address[] }
    >({
      keepUnusedDataFor: 360,
      queryFn: async (arg) => {
        const subgraphClient = await getSubgraphClient(arg.chainId);

        const subgraphResult = await subgraphClient.request<{
          listedWrapperSuperTokens: WrapperSuperTokenSubgraphResult[];
          unlistedWrapperSuperTokens: WrapperSuperTokenSubgraphResult[];
          nativeAssetSuperTokens: NativeAssetSuperTokenSubgraphResult[];
        }>(
          gql`
            query UpgradeDowngradePairs($unlistedTokenIDs:[ID!]) {
              listedWrapperSuperTokens: tokens(
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
                isListed
                underlyingToken {
                  id
                  name
                  symbol
                  decimals
                }
              }
              unlistedWrapperSuperTokens: tokens(
                first: 1000
                where: {
                  isSuperToken: true
                  isListed: false
                  id_in: $unlistedTokenIDs
                  underlyingAddress_not: "0x0000000000000000000000000000000000000000"
                }
              ) {
                id
                name
                symbol
                isListed
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
                  isNativeAssetSuperToken: true
                }
              ) {
                id
                name
                symbol
                underlyingAddress
                isListed
              }
            }
          `,
          {
            unlistedTokenIDs: (arg.unlistedTokenIDs || []).map((address) =>
              address.toLowerCase()
            ),
          }
        );

        const {
          listedWrapperSuperTokens,
          unlistedWrapperSuperTokens,
          nativeAssetSuperTokens,
        } = subgraphResult;

        const network = findNetworkOrThrow(allNetworks, arg.chainId);

        const nativeAssetSuperTokenPairs: SuperTokenPair[] =
          nativeAssetSuperTokens.map((x) => ({
            superToken: mapSubgraphTokenToTokenMinimal(arg.chainId, {
              ...x,
              isSuperToken: true,
              isListed: true,
              decimals: 18,
              underlyingAddress: network.nativeCurrency.address,
            }),
            underlyingToken: network.nativeCurrency,
          }));

        const nativeAssetSuperTokenAddress =
          network.nativeCurrency.superToken.address.toLowerCase();

        const wrapperSuperTokenPairs: SuperTokenPair[] =
          listedWrapperSuperTokens
            .concat(unlistedWrapperSuperTokens)
            .map((x) => {
              // Handle exceptional legacy native asset coins first:
              if (x.id === nativeAssetSuperTokenAddress) {
                return {
                  superToken: network.nativeCurrency.superToken,
                  underlyingToken: network.nativeCurrency,
                };
              }

              return {
                superToken: mapSubgraphTokenToTokenMinimal(arg.chainId, {
                  ...x,
                  isSuperToken: true,
                  isListed: true,
                  decimals: 18,
                  underlyingAddress: x.underlyingToken.id,
                }),
                underlyingToken: mapSubgraphTokenToTokenMinimal(arg.chainId, {
                  id: x.underlyingToken.id,
                  symbol: x.underlyingToken.symbol,
                  name: x.underlyingToken.name,
                  decimals: x.underlyingToken.decimals,
                  isSuperToken: false,
                  isListed: x.isListed,
                  underlyingAddress: null
                }),
              };
            });

        const result: SuperTokenPair[] = nativeAssetSuperTokenPairs.concat(
          wrapperSuperTokenPairs.filter(
            (x) =>
              x.superToken.address !==
              "0x84b2e92e08008c0081c8c21a35fda4ddc5d21ac6" // Filter out a neglected token.
          )
        ).map(x => {
          const underlyingTokenFromTokenList = findTokenFromTokenList({ chainId: arg.chainId, address: x.underlyingToken.address });
          const superTokenFromTokenList = findTokenFromTokenList({ chainId: arg.chainId, address: x.superToken.address });

          return {
            superToken: {
              ...x.superToken,
              symbol: superTokenFromTokenList?.symbol ?? x.superToken.symbol,
              name: superTokenFromTokenList?.name ?? x.superToken.name,
            },
            underlyingToken: {
              ...x.underlyingToken,
              symbol: underlyingTokenFromTokenList?.symbol ?? x.underlyingToken.symbol,
              name: underlyingTokenFromTokenList?.name ?? x.underlyingToken.name,
            }
          }
        });

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
  underlyingAddress: string | null | undefined;
}): SuperTokenType => {
  if (
    arg.address.toLowerCase() ===
    arg.network.nativeCurrency.superToken.address.toLowerCase()
  ) {
    return TokenType.NativeAssetSuperToken;
  } else if (
    arg.underlyingAddress === "0x0000000000000000000000000000000000000000" || !arg.underlyingAddress
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
