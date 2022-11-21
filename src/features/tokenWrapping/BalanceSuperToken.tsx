import { FC } from "react";
import { rpcApi } from "../redux/store";
import { Typography, TypographyProps } from "@mui/material";
import FlowingBalance from "../token/FlowingBalance";
import Amount from "../token/Amount";
import useTokenPrice from "../tokenPrice/useTokenPrice";
import FlowingFiatBalance from "../tokenPrice/FlowingFiatBalance";

interface BalanceSuperTokenProps {
  chainId: number;
  accountAddress: string;
  tokenAddress: string;
  symbol?: string;
  showFiat?: boolean;
  TypographyProps?: TypographyProps;
  FiatTypographyProps?: TypographyProps;
  SymbolTypographyProps?: TypographyProps;
}

export const BalanceSuperToken: FC<BalanceSuperTokenProps> = ({
  chainId,
  accountAddress,
  tokenAddress,
  symbol,
  showFiat = false,
  TypographyProps = {},
  FiatTypographyProps = {},
  SymbolTypographyProps = {},
}) => {
  const superBalanceQuery = rpcApi.useRealtimeBalanceQuery({
    chainId,
    accountAddress,
    tokenAddress,
  });

  const tokenPrice = useTokenPrice(chainId, tokenAddress);

  return (
    <>
      <Typography variant="body2mono" {...TypographyProps}>
        <span translate="yes">Balance:</span>{" "}
        {superBalanceQuery.error ? (
          <span translate="yes">error</span>
        ) : superBalanceQuery.isUninitialized || superBalanceQuery.isLoading ? (
          ""
        ) : !superBalanceQuery.data ? (
          <Amount wei="0" />
        ) : (
          <FlowingBalance
            balance={superBalanceQuery.data.balance}
            balanceTimestamp={superBalanceQuery.data.balanceTimestamp}
            flowRate={superBalanceQuery.data.flowRate}
          />
        )}
      </Typography>
      {symbol && (
        <Typography variant="body2mono" {...SymbolTypographyProps}>
          {symbol}
        </Typography>
      )}

      {showFiat && superBalanceQuery.data && tokenPrice && (
        <Typography
          variant="body2mono"
          color="text.secondary"
          {...FiatTypographyProps}
        >
          (
          <FlowingFiatBalance
            balance={superBalanceQuery.data.balance}
            balanceTimestamp={superBalanceQuery.data.balanceTimestamp}
            flowRate={superBalanceQuery.data.flowRate}
            price={tokenPrice}
          />
          )
        </Typography>
      )}
    </>
  );
};
