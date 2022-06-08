import {
  Alert,
  alpha,
  Stack,
  Tooltip,
  Typography,
  useTheme,
} from "@mui/material";
import { skipToken } from "@reduxjs/toolkit/dist/query";
import { format } from "date-fns";
import { BigNumber, ethers } from "ethers";
import { FC, ReactNode, useCallback, useMemo } from "react";
import { calculateMaybeCriticalAtTimestamp } from "../../utils/tokenUtils";
import { useExpectedNetwork } from "../network/ExpectedNetworkContext";
import { Network } from "../network/networks";
import { Web3FlowInfo } from "../redux/endpoints/adHocRpcEndpoints";
import { RealtimeBalance } from "../redux/endpoints/balanceFetcher";
import { SuperTokenMinimal } from "../redux/endpoints/tokenTypes";
import { rpcApi } from "../redux/store";
import FlowingBalance from "../token/FlowingBalance";
import { useVisibleAddress } from "../wallet/VisibleAddressContext";
import { calculateBufferAmount } from "./calculateBufferAmounts";
import { DisplayAddress } from "./DisplayAddressChip";
import {
  calculateTotalAmountWei,
  FlowRateWithTime,
  flowRateWithTimeToString,
  UnitOfTime,
} from "./FlowRateInput";

const PreviewItem: FC<{
  label: string;
  isError?: boolean;
  oldValue?: ReactNode;
}> = ({ label, children, oldValue, isError }) => {
  const theme = useTheme();

  const valueTypography = (
    <Typography variant="body2" fontWeight="500" sx={{
      color: isError ? theme.palette.error : theme.palette.primary.main
    }}>
      {children}
    </Typography>
  );

  return (
    <Stack direction="row" alignItems="center" justifyContent="space-between">
      <Typography variant="body2">{label}</Typography>
      {oldValue ? (
        <Tooltip title={<>Current: {oldValue}</>} arrow placement="top">
          {valueTypography}
        </Tooltip>
      ) : (
        valueTypography
      )}
    </Stack>
  );
};

export const useCalculateBufferInfo = () =>
  useCallback(
    (
      network: Network,
      realtimeBalance: RealtimeBalance,
      activeFlow: Web3FlowInfo | null,
      flowRate: FlowRateWithTime
    ) => {
      const newBufferAmount = calculateBufferAmount({
        network,
        flowRateWithTime: flowRate,
      });

      const oldBufferAmount = activeFlow
        ? calculateBufferAmount({
            network,
            flowRateWithTime: {
              amountWei: activeFlow.flowRateWei,
              unitOfTime: UnitOfTime.Second,
            },
          })
        : BigNumber.from(0);

      const bufferDelta = newBufferAmount.sub(oldBufferAmount);

      const balanceAfterBuffer = BigNumber.from(
        realtimeBalance?.balance ?? 0
      ).sub(bufferDelta);

      const newFlowRate = calculateTotalAmountWei({
        amountWei: flowRate.amountWei,
        unitOfTime: flowRate.unitOfTime,
      });

      const flowRateDelta = activeFlow
        ? newFlowRate.sub(BigNumber.from(activeFlow.flowRateWei))
        : newFlowRate;

      const newTotalFlowRate =
        flowRateDelta && realtimeBalance
          ? BigNumber.from(realtimeBalance.flowRate).sub(flowRateDelta)
          : undefined;

      const oldDateWhenBalanceCritical =
        realtimeBalance && newTotalFlowRate
          ? newTotalFlowRate.isNegative()
            ? new Date(
                calculateMaybeCriticalAtTimestamp({
                  balanceUntilUpdatedAtWei: realtimeBalance.balance.toString(),
                  updatedAtTimestamp: realtimeBalance.balanceTimestamp,
                  totalNetFlowRateWei: newTotalFlowRate.toString(),
                })
                  .mul(1000)
                  .toNumber()
              )
            : undefined
          : undefined;

      const newDateWhenBalanceCritical =
        realtimeBalance && newTotalFlowRate && flowRateDelta
          ? newTotalFlowRate.isNegative()
            ? new Date(
                calculateMaybeCriticalAtTimestamp({
                  balanceUntilUpdatedAtWei: realtimeBalance.balance.toString(),
                  updatedAtTimestamp: realtimeBalance.balanceTimestamp,
                  totalNetFlowRateWei: BigNumber.from(realtimeBalance.flowRate)
                    .sub(flowRateDelta)
                    .toString(),
                })
                  .mul(1000)
                  .toNumber()
              )
            : undefined
          : undefined;

      return {
        newBufferAmount,
        oldBufferAmount,
        bufferDelta,
        balanceAfterBuffer,
        newFlowRate,
        flowRateDelta,
        newTotalFlowRate,
        oldDateWhenBalanceCritical,
        newDateWhenBalanceCritical,
      };
    },
    []
  );

export const StreamingPreview: FC<{
  receiver: DisplayAddress;
  token: SuperTokenMinimal;
  flowRateWithTime: FlowRateWithTime;
  existingStream: {
    flowRateWei: string;
  } | null;
}> = ({ receiver, token, flowRateWithTime, existingStream }) => {
  const theme = useTheme();
  const { network } = useExpectedNetwork();
  const { visibleAddress } = useVisibleAddress();

  const realtimeBalanceQuery = rpcApi.useRealtimeBalanceQuery(
    visibleAddress
      ? {
          chainId: network.id,
          tokenAddress: token.address,
          accountAddress: visibleAddress,
        }
      : skipToken
  );
  const realtimeBalance = realtimeBalanceQuery.data;

  const { data: existingFlow } = rpcApi.useGetActiveFlowQuery(
    visibleAddress
      ? {
          chainId: network.id,
          tokenAddress: token.address,
          senderAddress: visibleAddress,
          receiverAddress: receiver.hash,
        }
      : skipToken
  );

  const calculateBufferInfo = useCalculateBufferInfo();

  const {
    balanceAfterBuffer,
    oldBufferAmount,
    newBufferAmount,
    newTotalFlowRate,
    oldDateWhenBalanceCritical,
    newDateWhenBalanceCritical,
  } = realtimeBalance
    ? calculateBufferInfo(
        network,
        realtimeBalance,
        existingFlow ?? null,
        flowRateWithTime
      )
    : ({} as Record<string, any>); // TODO(KK): Handle existing flow better.

  return (
    <Alert
      icon={false}
      variant="outlined"
      severity="success"
      sx={{
        py: 1,
        px: 2.5,
        borderColor: theme.palette.primary.main,
        backgroundColor: alpha(theme.palette.primary.main, 0.04),
        //TODO: This alert message rule should be looked deeper into. This should not be needed
        ".MuiAlert-message": {
          flex: 1,
        },
      }}
    >
      <Stack gap={0.5}>
        <PreviewItem label="Receiver">{receiver.hash}</PreviewItem>

        <PreviewItem
          label="Flow rate"
          oldValue={
            existingStream
              ? flowRateWithTimeToString(
                  {
                    amountWei: existingStream.flowRateWei,
                    unitOfTime: UnitOfTime.Second,
                  },
                  token.symbol
                )
              : undefined
          }
        >
          {flowRateWithTimeToString(flowRateWithTime, token.symbol)}
        </PreviewItem>

        <PreviewItem label="Ends on">Never</PreviewItem>

        {visibleAddress && (
          <PreviewItem label="Balance after buffer" isError={balanceAfterBuffer.isNegative()}>
            {realtimeBalance && (
              <FlowingBalance
                balance={balanceAfterBuffer.toString()}
                balanceTimestamp={realtimeBalance.balanceTimestamp}
                flowRate={realtimeBalance.flowRate}
                tokenSymbol={token.symbol}
              />
            )}
          </PreviewItem>
        )}

        <PreviewItem
          label="Upfront buffer"
          oldValue={
            oldBufferAmount
              ? `${ethers.utils.formatEther(oldBufferAmount)} ${token.symbol}`
              : undefined
          }
        >
          {newBufferAmount &&
            `${ethers.utils.formatEther(newBufferAmount)} ${token.symbol}`}
        </PreviewItem>

        {newTotalFlowRate?.isNegative() && (
          <PreviewItem
            label="Date when balance critical"
            oldValue={
              oldDateWhenBalanceCritical
                ? format(oldDateWhenBalanceCritical, "d MMM. yyyy")
                : undefined
            }
          >
            {newDateWhenBalanceCritical &&
              format(newDateWhenBalanceCritical, "d MMM. yyyy")}
          </PreviewItem>
        )}
      </Stack>
    </Alert>
  );
};
