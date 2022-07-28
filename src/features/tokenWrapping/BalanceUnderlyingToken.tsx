import { FC } from "react";
import { rpcApi } from "../redux/store";
import { Typography } from "@mui/material";
import Amount from "../token/Amount";
import { BigNumber } from "ethers";

export const BalanceUnderlyingToken: FC<{
  chainId: number;
  accountAddress: string;
  tokenAddress: string;
  decimals: number;
}> = ({ chainId, accountAddress, tokenAddress, decimals }) => {
  const underlyingBalanceQuery = rpcApi.useUnderlyingBalanceQuery({
    chainId,
    accountAddress,
    tokenAddress,
  });

  const { error, isUninitialized, isLoading, data } = underlyingBalanceQuery;

  return (
    <Typography
      data-cy={"underlying-balance"}
      variant="body2mono"
      color="text.secondary"
    >
      Balance:{" "}
      {error ? (
        "error"
      ) : isUninitialized || isLoading ? (
        ""
      ) : (
        <Amount wei={BigNumber.from(data?.balance ?? 0)} decimals={decimals} />
      )}
    </Typography>
  );
};
