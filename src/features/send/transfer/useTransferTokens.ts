import { skipToken } from "@reduxjs/toolkit/query";
import { useMemo } from "react";
import { getTokensFromTokenList } from "../../../hooks/useTokenQuery";
import { useSuperTokens } from "../../../hooks/useSuperTokens";
import { Network } from "../../network/networks";
import {
  TokenMinimal,
  TokenType,
  UnderlyingTokenMinimal,
} from "../../redux/endpoints/tokenTypes";
import { platformApi } from "../../redux/platformApi/platformApi";

const normalizeAddress = (address: string) => address.toLowerCase();

export const useTransferTokens = ({
  network,
  address,
}: {
  network: Network;
  address: string | undefined;
}) => {
  const { superTokens, isFetching: areSuperTokensFetching } = useSuperTokens({
    network,
  });
  const portfolioTokensQuery = platformApi.usePortfolioTokensQuery(
    address
      ? {
          address,
          chainIds: [network.id],
        }
      : skipToken
  );

  const listedERC20Tokens = useMemo(
    () =>
      getTokensFromTokenList(network.id).filter(
        (token): token is UnderlyingTokenMinimal =>
          token.type === TokenType.ERC20UnderlyingToken
      ),
    [network.id]
  );

  const { tokens, balances } = useMemo(() => {
    const tokensByAddress = new Map<string, TokenMinimal>();
    const balancesByAddress: Record<string, string> = {};

    // Prefer Super Token metadata when Alchemy also returns the same ERC-20
    // contract, so a token never appears twice in the picker.
    superTokens.forEach((token) => {
      tokensByAddress.set(normalizeAddress(token.address), token);
    });

    portfolioTokensQuery.currentData?.tokens.forEach((portfolioToken) => {
      if (portfolioToken.chainId !== network.id) return;

      const normalizedAddress = normalizeAddress(portfolioToken.tokenAddress);
      if (tokensByAddress.has(normalizedAddress)) return;

      tokensByAddress.set(normalizedAddress, {
        address: portfolioToken.tokenAddress,
        decimals: portfolioToken.decimals,
        isSuperToken: false,
        logoURI: portfolioToken.logoURI,
        name: portfolioToken.name,
        symbol: portfolioToken.symbol,
        type: TokenType.ERC20UnderlyingToken,
      });
      balancesByAddress[normalizedAddress] = portfolioToken.balance;
    });

    // Keep the maintained Superfluid token list available as a fallback for
    // networks Alchemy does not support and for transferable zero balances.
    listedERC20Tokens.forEach((token) => {
      const normalizedAddress = normalizeAddress(token.address);
      if (!tokensByAddress.has(normalizedAddress)) {
        tokensByAddress.set(normalizedAddress, token);
      }
    });

    return {
      tokens: [...tokensByAddress.values()],
      balances: balancesByAddress,
    };
  }, [
    listedERC20Tokens,
    network.id,
    portfolioTokensQuery.currentData,
    superTokens,
  ]);

  return {
    tokens,
    balances,
    isFetching:
      areSuperTokensFetching ||
      Boolean(address && portfolioTokensQuery.isFetching),
  };
};
