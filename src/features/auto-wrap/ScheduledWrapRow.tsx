import {
  Skeleton,
  Stack,
  TableCell,
  TableRow,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { FC, memo, useCallback, useMemo, useState } from "react";
import { Network } from "../network/networks";
import { WrapSchedule } from "./types";
import { rpcApi, subgraphApi } from "../redux/store";
import TokenIcon from "../token/TokenIcon";
import DisableAutoWrapTransactionButton from "../vesting/transactionButtons/DisableAutoWrapTransactionButton";
import ConnectionBoundary from "../transactionBoundary/ConnectionBoundary";
import { getSuperTokenType } from "../redux/endpoints/adHocSubgraphEndpoints";
import { TokenType } from "../redux/endpoints/tokenTypes";
import useActiveAutoWrap from "../vesting/useActiveAutoWrap";
import EnableAutoWrapButton from "../vesting/transactionButtons/EnableAutoWrapTransactionButton";
import AutoWrapEnableDialogSection from "../vesting/dialogs/AutoWrapEnableDialogSection";
import { differenceInWeeks } from "date-fns";
import { isCloseToUnlimitedTokenAllowance } from "../../utils/isCloseToUnlimitedAllowance";
import Amount from "../token/Amount";
import { BigNumber } from "ethers";
import { parseEtherOrZero } from "../../utils/tokenUtils";
import { formatEther } from "ethers/lib/utils.js";
import { skipToken } from "@reduxjs/toolkit/dist/query";

interface ScheduledWrapRowProps {
  network: Network;
  schedule: WrapSchedule;
}

const secondsToWeeks = (seconds: number): number => {
  return differenceInWeeks(new Date(seconds * 1000), new Date(0), {
    roundingMethod: "floor",
  });
};

const calculateRequiredTokenAmount = (
  limit: number,
  netFlowRate: string
): number => {
  return Number(formatEther(netFlowRate || 0)) * limit;
};

const TokenLimitComponent: FC<{
  limit: number;
  netFlowRate: string | undefined;
  tokenSymbol: string | undefined;
}> = ({ limit, netFlowRate, tokenSymbol = "" }) => {
  if (!netFlowRate || BigNumber.from(netFlowRate).gte(0)) {
    return (
      <>
        {secondsToWeeks(limit)} Weeks (0 {tokenSymbol})
      </>
    );
  }

  return (
    <>
      {secondsToWeeks(limit)} Weeks (
      {calculateRequiredTokenAmount(limit, netFlowRate)} {tokenSymbol})
    </>
  );
};

const ScheduledWrapRow: FC<ScheduledWrapRowProps> = ({ network, schedule }) => {
  const theme = useTheme();
  const isBelowMd = useMediaQuery(theme.breakpoints.down("md"));

  const [isEnableAutoWrapDialogOpen, setEnableAutoWrapDialogOpen] =
    useState(false);

  const openEnableAutoWrapDialog = useCallback(
    () => setEnableAutoWrapDialogOpen(true),
    [setEnableAutoWrapDialogOpen]
  );
  const closeEnableAutoWrapDialog = useCallback(
    () => setEnableAutoWrapDialogOpen(false),
    [setEnableAutoWrapDialogOpen]
  );

  const { superToken, account } = schedule;

  const { data: superTokenQueryData, isLoading: isTokenLoading } =
    subgraphApi.useTokenQuery({
      id: superToken,
      chainId: network.id,
    });

  const {
    isLoading: isAccountTokenSnapshotLoading,
    data: accountTokenSnapshot,
  } = subgraphApi.useAccountTokenSnapshotQuery(
    {
      chainId: network.id,
      id: `${account.toLowerCase()}-${superToken.toLowerCase()}`,
    },
    {
      refetchOnFocus: true, // Re-fetch list view more often where there might be something incoming.
    }
  );

  const isNativeAssetSuperToken =
    network.nativeCurrency.superToken.address.toLowerCase() ===
    schedule.superToken?.toLowerCase();

  const underlyingTokenQuery = subgraphApi.useTokenQuery(
    !isNativeAssetSuperToken && superTokenQueryData
      ? {
          chainId: network.id,
          id: superTokenQueryData.underlyingAddress,
        }
      : skipToken
  );

  const underlyingToken = useMemo(
    () =>
      isNativeAssetSuperToken
        ? network.nativeCurrency
        : underlyingTokenQuery.data,
    [isNativeAssetSuperToken, underlyingTokenQuery.data]
  );

  const {
    isLoading: isUnderlyingTokenAllowanceLoading,
    data: underlyingTokenAllowance,
  } = rpcApi.useGetUnderlyingTokenAllowanceQuery({
    chainId: network.id,
    accountAddress: account,
    underlyingTokenAddress: schedule.liquidityToken,
  });

  const isAutoWrappable =
    superTokenQueryData &&
    getSuperTokenType({
      network,
      address: superTokenQueryData.id,
      underlyingAddress: superTokenQueryData.underlyingAddress,
    }) === TokenType.WrapperSuperToken;

  const {
    isAutoWrapLoading,
    activeAutoWrapSchedule,
    isAutoWrapAllowanceSufficient,
  } = useActiveAutoWrap(
    isAutoWrappable
      ? {
          chainId: network.id,
          accountAddress: account,
          superTokenAddress: superTokenQueryData.id,
          underlyingTokenAddress: superTokenQueryData.underlyingAddress,
        }
      : "skip"
  );

  const isAutoWrapOK = Boolean(
    activeAutoWrapSchedule && isAutoWrapAllowanceSufficient && isAutoWrappable
  );

  return (
    <>
      {isBelowMd ? (
        <>Mobile view</>
      ) : (
        <TableRow>
          <TableCell align="left">
            <Stack
              data-cy={"token-header"}
              direction="row"
              alignItems="center"
              gap={2}
            >
              <TokenIcon
                isSuper
                tokenSymbol={superTokenQueryData?.symbol}
                isLoading={isTokenLoading}
              />
              <Typography variant="h6" data-cy={"token-symbol"}>
                {superTokenQueryData?.symbol}
              </Typography>
            </Stack>
          </TableCell>
          <TableCell>
            <Typography variant="h6">
              {isUnderlyingTokenAllowanceLoading ? (
                <Skeleton variant="rectangular" width={24} height={24} />
              ) : isCloseToUnlimitedTokenAllowance(
                  underlyingTokenAllowance || 0
                ) ? (
                <span>Unlimited</span>
              ) : (
                <>
                  <Amount wei={underlyingTokenAllowance || 0} />{" "}
                  {underlyingToken?.symbol}
                </>
              )}
            </Typography>
          </TableCell>
          <TableCell>
            <Typography variant="h6">
              <TokenLimitComponent
                limit={schedule.lowerLimit}
                netFlowRate={accountTokenSnapshot?.totalNetFlowRate}
                tokenSymbol={superTokenQueryData?.symbol}
              />
            </Typography>
          </TableCell>
          <TableCell>
            <Typography variant="h6">
              <TokenLimitComponent
                limit={schedule.upperLimit}
                netFlowRate={accountTokenSnapshot?.totalNetFlowRate}
                tokenSymbol={superTokenQueryData?.symbol}
              />
            </Typography>
          </TableCell>
          <TableCell align="center">
            <ConnectionBoundary>
              {superTokenQueryData && network.autoWrap ? (
                isAutoWrapLoading ? (
                  <Skeleton variant="rectangular" width={24} height={24} />
                ) : isAutoWrapOK ? (
                  <DisableAutoWrapTransactionButton
                    key={`auto-wrap-revoke-${superTokenQueryData?.symbol}`}
                    isDisabled={false}
                    isVisible={true}
                    token={superTokenQueryData}
                    ButtonProps={{
                      size: "small",
                      variant: "outlined",
                    }}
                  />
                ) : isAutoWrappable ? (
                  <EnableAutoWrapButton
                    openEnableAutoWrapDialog={openEnableAutoWrapDialog}
                    ButtonProps={{
                      size: "small",
                      variant: "contained",
                    }}
                  />
                ) : null
              ) : null}
              {superTokenQueryData && (
                <AutoWrapEnableDialogSection
                  key={"auto-wrap-enable-dialog-section"}
                  closeEnableAutoWrapDialog={closeEnableAutoWrapDialog}
                  isEnableAutoWrapDialogOpen={isEnableAutoWrapDialogOpen}
                  token={superTokenQueryData}
                  network={network}
                />
              )}
            </ConnectionBoundary>
          </TableCell>
        </TableRow>
      )}
    </>
  );
};

export default memo(ScheduledWrapRow);
