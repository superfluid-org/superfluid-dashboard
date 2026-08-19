import { skipToken } from "@reduxjs/toolkit/query";
import { Address } from "@superfluid-finance/sdk-core";
import { BigNumber } from "ethers";
import { useMemo } from "react";
import { getTokensFromTokenList } from "../../hooks/useTokenQuery";
import { Network } from "../network/networks";
import {
  TokenType,
  UnderlyingTokenMinimal,
} from "../redux/endpoints/tokenTypes";
import { rpcApi } from "../redux/store";

export interface ERC20Balance {
  token: UnderlyingTokenMinimal;
  balance: string;
  priceUsd?: number;
}

const useERC20Balances = ({
  address,
  network,
  enabled,
}: {
  address: Address;
  network: Network;
  enabled: boolean;
}) => {
  const tokens = useMemo(
    () =>
      getTokensFromTokenList(network.id).filter(
        (token): token is UnderlyingTokenMinimal =>
          token.type === TokenType.ERC20UnderlyingToken
      ),
    [network.id]
  );
  const tokenAddresses = useMemo(
    () => tokens.map((token) => token.address),
    [tokens]
  );
  const balancesQuery = rpcApi.useUnderlyingBalancesQuery(
    enabled && tokenAddresses.length
      ? {
          chainId: network.id,
          accountAddress: address,
          tokenAddresses,
        }
      : skipToken,
    { refetchOnFocus: true }
  );

  const tokensWithBalances = useMemo<ERC20Balance[]>(() => {
    const balances = balancesQuery.currentData?.balances;
    if (!balances) return [];

    return tokens
      .map((token) => ({ token, balance: balances[token.address] ?? "0" }))
      .filter(({ balance }) => !BigNumber.from(balance).isZero())
      .sort((a, b) => a.token.symbol.localeCompare(b.token.symbol));
  }, [balancesQuery.currentData, tokens]);

  return {
    tokensWithBalances,
    isLoading: enabled && balancesQuery.isLoading,
  };
};

export default useERC20Balances;
