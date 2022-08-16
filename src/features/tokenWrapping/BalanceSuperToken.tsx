import { FC } from "react";
import { rpcApi } from "../redux/store";
import { Typography, TypographyProps } from "@mui/material";
import FlowingBalance from "../token/FlowingBalance";
import Amount from "../token/Amount";

export const BalanceSuperToken: FC<{
  chainId: number;
  accountAddress: string;
  tokenAddress: string;
  TypographyProps?: TypographyProps;
}> = ({ chainId, accountAddress, tokenAddress, TypographyProps = {} }) => {
  const superBalanceQuery = rpcApi.useRealtimeBalanceQuery({
    chainId,
    accountAddress,
    tokenAddress,
  });

  return (
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
  );
};
