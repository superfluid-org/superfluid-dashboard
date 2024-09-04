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
import { findTokenFromTokenList, getTokenPairsFromTokenList, mapSubgraphTokenToTokenMinimal } from "../../../hooks/useTokenQuery";

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

        const getUnlistedWrapperSuperTokens = async (unlistedTokenIDs: Address[]) => {
          if (unlistedTokenIDs.length === 0) {
            return [];
          }

          const subgraphResult = await subgraphClient.request<{
            unlistedWrapperSuperTokens: WrapperSuperTokenSubgraphResult[];
          }>(
            gql`
              query UpgradeDowngradePairs($unlistedTokenIDs:[ID!]) {
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
              }
            `,
            {
              unlistedTokenIDs: (arg.unlistedTokenIDs || []).map((address) =>
                address.toLowerCase()
              ),
            }
          );

          return subgraphResult.unlistedWrapperSuperTokens;
        }

        const unlistedWrapperSuperTokens = await getUnlistedWrapperSuperTokens(arg.unlistedTokenIDs || []);

        const wrapperSuperTokenPairs: SuperTokenPair[] =
          unlistedWrapperSuperTokens
            .map((wrappableToken) => {
              const superToken = mapSubgraphTokenToTokenMinimal(arg.chainId, {
                ...wrappableToken,
                isSuperToken: true,
                decimals: 18
              });

              const underlyingToken = mapSubgraphTokenToTokenMinimal(arg.chainId, {
                ...wrappableToken.underlyingToken,
                isSuperToken: false
              });

              return {
                superToken,
                underlyingToken
              };
            });

        const result: SuperTokenPair[] =
          getTokenPairsFromTokenList(arg.chainId)
            .concat(
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
