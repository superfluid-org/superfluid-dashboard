import { FC } from "react";
import { rpcApi } from "../redux/store";
import { Typography } from "@mui/material";
import EtherFormatted from "../token/EtherFormatted";
import { ethers } from "ethers";

export const BalanceUnderlyingToken: FC<{
  chainId: number;
  accountAddress: string;
  tokenAddress: string;
}> = ({ chainId, accountAddress, tokenAddress }) => {
  const underlyingBalanceQuery = rpcApi.useUnderlyingBalanceQuery(
    {
      chainId,
      accountAddress,
      tokenAddress,
    },
    {}
  );

  const { error, isUninitialized, isLoading, data } = underlyingBalanceQuery;

  return (
    <Typography variant="body2" color="text.secondary">
      Balance:{" "}
      {error ? (
        "error"
      ) : isUninitialized || isLoading ? (
        ""
      ) : (
        <EtherFormatted
          wei={ethers.BigNumber.from(data?.balance ?? 0).toString()}
        />
      )}
    </Typography>
  );
};
