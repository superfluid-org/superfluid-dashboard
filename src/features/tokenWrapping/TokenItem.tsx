import { Stack, Typography } from "@mui/material";
import { FC } from "react";
import TokenIcon from "../token/TokenIcon";
import EtherFormatted from "../token/EtherFormatted";
import FlowingBalance from "../token/FlowingBalance";
import { rpcApi } from "../redux/store";
import { skipToken } from "@reduxjs/toolkit/dist/query";

const etherDecimalPlaces = 8;

// TODO(KK): memo?
export const TokenItem: FC<{
  chainId?: number;
  accountAddress?: string;
  tokenAddress: string;
  tokenSymbol: string;
  tokenName: string;
  balanceWei?: string;
  balanceTimestamp?: number;
  flowRate?: string;
  isSuperToken: boolean;
}> = (arg) => {
  const {
    chainId,
    accountAddress,
    tokenAddress,
    tokenSymbol,
    tokenName,
    isSuperToken,
  } = arg;

  const underlyingBalanceQuery = rpcApi.useUnderlyingBalanceQuery(
    chainId && accountAddress && !isSuperToken
      ? {
          chainId,
          accountAddress,
          tokenAddress,
        }
      : skipToken
  );

  const realtimeBalanceQuery = rpcApi.useRealtimeBalanceQuery(
    chainId && accountAddress && isSuperToken
      ? {
          chainId,
          accountAddress,
          tokenAddress,
        }
      : skipToken
  );

  const balanceWei = isSuperToken
    ? realtimeBalanceQuery?.data?.balance || arg.balanceWei
    : underlyingBalanceQuery?.data?.balance || arg.balanceWei;

  const balanceTimestamp =
    realtimeBalanceQuery?.data?.balanceTimestamp || arg.balanceTimestamp;

  const flowRate = realtimeBalanceQuery?.data?.flowRate || arg.flowRate;

  return (
    <Stack
      direction="row"
      alignItems="center"
      sx={{ pl: 1, width: "100%" }}
      spacing={2}
    >
      <TokenIcon tokenSymbol={tokenSymbol}></TokenIcon>
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        sx={{ width: "100%" }}
      >
        <Stack direction="column">
          <Typography variant="body1">{tokenSymbol}</Typography>
          <Typography variant="body2">{tokenName}</Typography>
        </Stack>
        {!!accountAddress && (
          <Typography variant="body1">
            {balanceWei ? (
              balanceTimestamp && flowRate ? (
                <FlowingBalance
                  balance={balanceWei}
                  balanceTimestamp={balanceTimestamp}
                  flowRate={flowRate}
                  etherDecimalPlaces={etherDecimalPlaces}
                />
              ) : (
                <EtherFormatted
                  wei={balanceWei}
                  etherDecimalPlaces={etherDecimalPlaces}
                />
              )
            ) : null}
          </Typography>
        )}
      </Stack>
    </Stack>
  );
};
