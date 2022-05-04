import { IconButton, Stack, Tooltip, Typography } from "@mui/material";
import { FC } from "react";
import TokenIcon from "../token/TokenIcon";
import EtherFormatted from "../token/EtherFormatted";
import FlowingBalance from "../token/FlowingBalance";
import { rpcApi } from "../redux/store";
import { skipToken } from "@reduxjs/toolkit/dist/query";
import ArrowCircleUpIcon from "@mui/icons-material/ArrowCircleUp";
import Link from "next/link";
import { useNetworkContext } from "../network/NetworkContext";
import {
  isSuper,
  isUnderlying,
  isWrappable,
  TokenMinimal,
} from "../redux/endpoints/adHocSubgraphEndpoints";

const etherDecimalPlaces = 8;

// TODO(KK): memo?
export const TokenItem: FC<{
  chainId?: number;
  accountAddress?: string;
  balanceWei?: string;
  balanceTimestamp?: number;
  flowRate?: string;
  token: TokenMinimal;
  showUpgrade: boolean;
}> = (arg) => {
  const { chainId, accountAddress, token, showUpgrade } = arg;

  const { network } = useNetworkContext();

  const isSuperToken = isSuper(token);
  const isUnderlyingToken = isUnderlying(token);
  const isWrappableSuperToken = isSuperToken && isWrappable(token);

  const underlyingBalanceQuery = rpcApi.useUnderlyingBalanceQuery(
    chainId && accountAddress && isUnderlyingToken
      ? {
          chainId,
          accountAddress,
          tokenAddress: token.address,
        }
      : skipToken
  );

  const realtimeBalanceQuery = rpcApi.useRealtimeBalanceQuery(
    chainId && accountAddress && isSuperToken
      ? {
          chainId,
          accountAddress,
          tokenAddress: token.address,
        }
      : skipToken
  );

  const balanceWei = isSuper(token)
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
      <TokenIcon tokenSymbol={token.symbol}></TokenIcon>
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        sx={{ width: "100%" }}
      >
        <Stack direction="column">
          <Typography variant="body1">{token.symbol}</Typography>
          <Typography variant="body2">{token.name}</Typography>
        </Stack>
        <Stack direction="row">
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
          {showUpgrade && isWrappableSuperToken && (
            <Link
              href={`/wrap?upgrade&token=${token.address}&network=${network.slugName}`}
              passHref
            >
              <Tooltip title="Wrap">
                <IconButton>
                  <ArrowCircleUpIcon></ArrowCircleUpIcon>
                </IconButton>
              </Tooltip>
            </Link>
          )}
        </Stack>
      </Stack>
    </Stack>
  );
};
