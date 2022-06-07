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
import { FC, ReactNode, useMemo } from "react";
import { calculateMaybeCriticalAtTimestamp } from "../../utils/tokenUtils";
import { useExpectedNetwork } from "../network/ExpectedNetworkContext";
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
  oldValue?: ReactNode;
}> = ({ label, children, oldValue }) => (
  <Stack direction="row" alignItems="center" justifyContent="space-between">
    <Typography variant="body2">{label}</Typography>
    <Typography variant="body2" fontWeight="500">
      {oldValue ? (
        <Tooltip title={<>{oldValue}</>}>
          <>TEST {children}</>
        </Tooltip>
      ) : (
        children
      )}
    </Typography>
  </Stack>
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

  const newBufferAmount = useMemo(
    () => calculateBufferAmount({ network, flowRateWithTime }),
    [network, flowRateWithTime] // TODO(KK): Spread flowRateWithTime?
  );

  const oldBufferAmount = useMemo(
    () =>
      existingStream
        ? calculateBufferAmount({
            network,
            flowRateWithTime: {
              amountWei: existingStream.flowRateWei,
              unitOfTime: UnitOfTime.Second,
            },
          })
        : BigNumber.from(0),
    [network, existingStream] // TODO(KK): Spread flowRateWithTime?
  );

  const bufferDelta = useMemo(
    () => newBufferAmount.sub(oldBufferAmount),
    [newBufferAmount, oldBufferAmount]
  );

  const balanceAfterBuffer = useMemo(
    () => BigNumber.from(realtimeBalance?.balance ?? 0).sub(bufferDelta),
    [realtimeBalance, newBufferAmount]
  );

  const newFlowRate = useMemo(
    () =>
      calculateTotalAmountWei({
        amountWei: flowRateWithTime.amountWei,
        unitOfTime: flowRateWithTime.unitOfTime,
      }),
    [flowRateWithTime]
  );

  const flowRateDelta = useMemo(
    () =>
      existingStream
        ? newFlowRate.sub(BigNumber.from(existingStream.flowRateWei))
        : newFlowRate,
    [newFlowRate, existingStream]
  );

  const newTotalFlowRate = useMemo(
    () =>
      flowRateDelta && realtimeBalance
        ? BigNumber.from(realtimeBalance.flowRate).sub(flowRateDelta)
        : undefined,
    [flowRateDelta, realtimeBalance]
  );

  const oldDateWhenBalanceCritical = useMemo(
    () =>
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
        : undefined,
    [realtimeBalance, newTotalFlowRate]
  );

  const newDateWhenBalanceCritical = useMemo(
    () =>
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
        : undefined,
    [flowRateDelta, realtimeBalance]
  );

  return (
    <Alert
      icon={false}
      variant="outlined"
      severity="success"
      sx={{
        py: 1,
        px: 2.5,
        color: theme.palette.primary.main,
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
          <PreviewItem label="Balance after buffer">
            {realtimeBalance && (
              <FlowingBalance
                balance={balanceAfterBuffer.toString()}
                balanceTimestamp={realtimeBalance.balanceTimestamp}
                flowRate={realtimeBalance.flowRate}
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
          {`${ethers.utils.formatEther(newBufferAmount)} ${token.symbol}`}
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
