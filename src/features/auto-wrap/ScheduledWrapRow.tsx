import {
  Box,
  Button,
  Skeleton,
  Stack,
  TableCell,
  TableRow,
  Typography,
  colors,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { FC, memo, useCallback, useState } from "react";
import { Network } from "../network/networks";
import { WrapSchedule } from "./types";
import { rpcApi, subgraphApi } from "../redux/store";
import TokenIcon from "../token/TokenIcon";
import DisableAutoWrapTransactionButton from "../vesting/transactionButtons/DisableAutoWrapTransactionButton";
import ConnectionBoundary from "../transactionBoundary/ConnectionBoundary";
import { TokenType } from "../redux/endpoints/tokenTypes";
import useActiveAutoWrap from "../vesting/useActiveAutoWrap";
import AutoWrapEnableDialog from "../vesting/dialogs/AutoWrapEnableDialog";
import { differenceInWeeks, fromUnixTime } from "date-fns";
import { isCloseToUnlimitedTokenAllowance } from "../../utils/isCloseToUnlimitedAllowance";
import Amount from "../token/Amount";
import { BigNumber, BigNumberish } from "ethers";
import TooltipWithIcon from "../common/TooltipWithIcon";
import ConnectionBoundaryButton from "../transactionBoundary/ConnectionBoundaryButton";
import { useTokenQuery } from "../../hooks/useTokenQuery";

interface ScheduledWrapRowProps {
  network: Network;
  schedule: WrapSchedule;
}

const secondsToWeeks = (seconds: number): number => {
  return differenceInWeeks(fromUnixTime(seconds), new Date(0), {
    roundingMethod: "floor",
  });
};

const calculateTokenAmount = (
  limit: number,
  netFlowRate: BigNumberish
): BigNumber => {
  const calculateRequiredTokenAmount = BigNumber.from(netFlowRate).mul(limit);
  if (calculateRequiredTokenAmount.gte("0")) {
    return BigNumber.from("0");
  }
  return calculateRequiredTokenAmount.abs();
};

const TokenLimitComponent: FC<{
  limit: number;
  netFlowRate: string | undefined;
  tokenSymbol: string | undefined;
  dataCy?: string
}> = ({ limit, netFlowRate, tokenSymbol = "", dataCy }) => {
  if (!netFlowRate || BigNumber.from(netFlowRate).gte(0)) {
    return (
      <span data-cy={`${tokenSymbol}-${dataCy}`}>
        {secondsToWeeks(limit)} Weeks (0 {tokenSymbol})
      </span>
    );
  }

  return (
    <span data-cy={`${tokenSymbol}-${dataCy}`}>
      {secondsToWeeks(limit)} Weeks (
      <Amount
        decimalPlaces={2}
        wei={calculateTokenAmount(limit, netFlowRate)}
      />{" "}
      {tokenSymbol})
    </span>
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

  const { superToken: superTokenAddress, account } = schedule;

  const { data: superToken, isLoading: isTokenLoading } =
    useTokenQuery({
      id: superTokenAddress,
      chainId: network.id,
      onlySuperToken: true
    });

  const { data: accountTokenSnapshot } =
    subgraphApi.useAccountTokenSnapshotQuery(
      {
        chainId: network.id,
        id: `${account.toLowerCase()}-${superTokenAddress.toLowerCase()}`,
      },
      {
        refetchOnFocus: true, // Re-fetch list view more often where there might be something incoming.
      }
    );

  const underlyingTokenQuery = useTokenQuery(
    {
      chainId: network.id,
      id: schedule.liquidityToken,
    }
  );
  const underlyingToken = underlyingTokenQuery.data;

  const {
    isLoading: isUnderlyingTokenAllowanceLoading,
    data: underlyingTokenAllowance,
  } = rpcApi.useGetUnderlyingTokenAllowanceQuery({
    chainId: network.id,
    accountAddress: account,
    underlyingTokenAddress: schedule.liquidityToken,
  });

  const isAutoWrappable =
    superToken?.type === TokenType.WrapperSuperToken;

  const {
    isAutoWrapLoading,
    activeAutoWrapSchedule,
    isAutoWrapAllowanceSufficient,
  } = useActiveAutoWrap(
    isAutoWrappable
      ? {
        chainId: network.id,
        accountAddress: account,
        superTokenAddress: superToken.address,
        underlyingTokenAddress: superToken.underlyingAddress!,
      }
      : "skip"
  );

  const isAutoWrapOK = Boolean(
    activeAutoWrapSchedule && isAutoWrapAllowanceSufficient && isAutoWrappable
  );

  return (
    <>
      {isBelowMd ? (
        <Stack gap={2} sx={{ px: 2, py: 2 }}>
          <Box>
            <Stack
              direction="row"
              justifyContent="space-between"
              alignItems="center"
            >
              <Typography variant="h7">Asset</Typography>
              <Stack
                data-cy={"auto-wrap-token"}
                direction="row"
                alignItems="center"
                gap={2}
              >
                <TokenIcon
                  isSuper
                  chainId={network.id}
                  tokenAddress={superTokenAddress}
                  isLoading={isTokenLoading}
                />
                <Typography variant="h6" data-cy={"token-symbol"}>
                  {superToken?.symbol}
                </Typography>
              </Stack>
            </Stack>
          </Box>
          <Box>
            <Stack
              direction="row"
              justifyContent="space-between"
              alignItems="center"
            >
              <Stack direction="row" gap={0.5} alignItems="center">
                Underlying Token Allowance
                <TooltipWithIcon
                  title="The allowance cap you’ve set up for the underlying ERC-20 tokens."
                  IconProps={{
                    sx: {
                      fontSize: "16px",
                      color: colors.grey[700],
                    },
                  }}
                />
              </Stack>
              {(isUnderlyingTokenAllowanceLoading || !underlyingToken) ? (
                <Skeleton width={80} />
              ) : isCloseToUnlimitedTokenAllowance(
                underlyingTokenAllowance || 0
              ) ? (
                <span>Unlimited</span>
              ) : (
                <>
                  <Amount wei={underlyingTokenAllowance || 0} decimals={underlyingToken.decimals} />{" "}
                  {underlyingToken?.symbol}
                </>
              )}
            </Stack>
          </Box>
          <Box>
            <Stack
              direction="row"
              justifyContent="space-between"
              alignItems="center"
            >
              <Stack direction="row" gap={0.5} alignItems="center">
                Lower Limit
                <TooltipWithIcon
                  title="The amount of time left until your stream hits zero at which an automatic top up should be triggered."
                  IconProps={{
                    sx: {
                      fontSize: "16px",
                      color: colors.grey[700],
                    },
                  }}
                />
              </Stack>
              <TokenLimitComponent
                limit={schedule.lowerLimit}
                netFlowRate={accountTokenSnapshot?.totalNetFlowRate}
                tokenSymbol={superToken?.symbol}
                dataCy="lower-limit"
              />
            </Stack>
          </Box>

          <Box>
            <Stack
              direction="row"
              justifyContent="space-between"
              alignItems="center"
            >
              <Stack direction="row" gap={0.5} alignItems="center">
                Upper Limit
                <TooltipWithIcon
                  title="The amount of time worth of streaming that the wrapped tokens will cover."
                  IconProps={{
                    sx: {
                      fontSize: "16px",
                      color: colors.grey[700],
                    },
                  }}
                />
              </Stack>
              <Typography variant="h6">
                <TokenLimitComponent
                  limit={schedule.upperLimit}
                  netFlowRate={accountTokenSnapshot?.totalNetFlowRate}
                  tokenSymbol={superToken?.symbol}
                  dataCy="upper-limit"
                />
              </Typography>
            </Stack>
          </Box>
          <Box alignContent={"center"}>
            <ConnectionBoundary expectedNetwork={network}>
              {superToken && network.autoWrap ? (
                isAutoWrapLoading ? (
                  <Skeleton width={60} height={22} />
                ) : isAutoWrapOK ? (
                  <DisableAutoWrapTransactionButton
                    key={`auto-wrap-revoke-${superToken?.symbol}`}
                    isDisabled={false}
                    isVisible={true}
                    token={superToken}
                    network={network}
                    ButtonProps={{
                      fullWidth: false,
                      size: "small",
                      color: "primary",
                      variant: "textContained",
                      sx: {
                        fontWeight: "500"
                      }
                    }}
                    ConnectionBoundaryButtonProps={{
                      impersonationTitle: "Stop viewing",
                      changeNetworkTitle: "Change Network",
                      ButtonProps: {
                        fullWidth: true,
                        variant: "outlined",
                        size: "small",
                      },
                    }}
                  />
                ) : isAutoWrappable ? (
                  <ConnectionBoundaryButton
                    impersonationTitle={"Stop viewing"}
                    changeNetworkTitle={"Change Network"}
                    ButtonProps={{
                      fullWidth: false,
                      variant: "outlined",
                      size: "small",
                    }}
                  >
                    <Button
                      data-cy={"enable-auto-wrap-button"}
                      variant="contained"
                      size="small"
                      fullWidth={false}
                      onClick={openEnableAutoWrapDialog}
                    >
                      <span>Enable</span>
                    </Button>
                  </ConnectionBoundaryButton>
                ) : null
              ) : null}
              {superToken && (
                <AutoWrapEnableDialog
                  key={"auto-wrap-enable-dialog-section"}
                  closeEnableAutoWrapDialog={closeEnableAutoWrapDialog}
                  isEnableAutoWrapDialogOpen={isEnableAutoWrapDialogOpen}
                  token={superToken}
                  network={network}
                />
              )}
            </ConnectionBoundary>
          </Box>
        </Stack>
      ) : (
        <TableRow data-cy={`${superToken?.symbol}-row`}>
          <TableCell align="left">
            <Stack
              data-cy={"auto-wrap-token"}
              direction="row"
              alignItems="center"
              gap={2}
            >
              <TokenIcon
                isSuper
                chainId={network.id}
                tokenAddress={superTokenAddress}
                isLoading={isTokenLoading}
              />
              <Typography variant="h6" data-cy={"token-symbol"}>
                {superToken?.symbol}
              </Typography>
            </Stack>
          </TableCell>
          <TableCell>
            <Typography data-cy="underlying-token-allowance" variant="h6">
              {(isUnderlyingTokenAllowanceLoading || !underlyingToken) ? (
                <Skeleton width={80} />
              ) : isCloseToUnlimitedTokenAllowance(
                underlyingTokenAllowance || 0
              ) ? (
                <span>Unlimited</span>
              ) : (
                <>
                  <Amount wei={underlyingTokenAllowance || 0} decimals={underlyingToken.decimals} />{" "}
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
                tokenSymbol={superToken?.symbol}
                dataCy="lower-limit"
              />
            </Typography>
          </TableCell>
          <TableCell>
            <Typography variant="h6">
              <TokenLimitComponent
                limit={schedule.upperLimit}
                netFlowRate={accountTokenSnapshot?.totalNetFlowRate}
                tokenSymbol={superToken?.symbol}
                dataCy="upper-limit"
              />
            </Typography>
          </TableCell>
          <TableCell align="center">
            <ConnectionBoundary expectedNetwork={network}>
              {superToken && network.autoWrap ? (
                isAutoWrapLoading ? (
                  <Skeleton width={116} height={22} />
                ) : isAutoWrapOK ? (
                  <DisableAutoWrapTransactionButton
                    key={`auto-wrap-revoke-${superToken?.symbol}`}
                    isDisabled={false}
                    isVisible={true}
                    network={network}
                    token={superToken}
                    ButtonProps={{
                      size: "small",
                      color: "primary",
                      variant: "textContained",
                      sx: {
                        fontWeight: "500"
                      }
                    }}
                    ConnectionBoundaryButtonProps={{
                      impersonationTitle: "Stop viewing",
                      changeNetworkTitle: "Change Network",
                      ButtonProps: {
                        fullWidth: true,
                        variant: "outlined",
                        size: "small",
                      },
                    }}
                  />
                ) : isAutoWrappable ? (
                  <ConnectionBoundaryButton
                    impersonationTitle={"Stop viewing"}
                    changeNetworkTitle={"Change Network"}
                    ButtonProps={{
                      fullWidth: true,
                      variant: "outlined",
                      size: "small",
                    }}
                  >
                    <Button
                      fullWidth={true}
                      data-cy={"enable-auto-wrap-button"}
                      variant="contained"
                      size="small"
                      onClick={openEnableAutoWrapDialog}
                    >
                      <span>Enable</span>
                    </Button>
                  </ConnectionBoundaryButton>
                ) : null
              ) : null}
              {superToken && (
                <AutoWrapEnableDialog
                  key={"auto-wrap-enable-dialog-section"}
                  closeEnableAutoWrapDialog={closeEnableAutoWrapDialog}
                  isEnableAutoWrapDialogOpen={isEnableAutoWrapDialogOpen}
                  token={superToken}
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
