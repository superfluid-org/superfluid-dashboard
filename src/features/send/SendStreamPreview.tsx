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
import { ethers } from "ethers";
import { parseEther } from "ethers/lib/utils";
import { FC, ReactNode, useMemo } from "react";
import { parseEtherOrZero } from "../../utils/tokenUtils";
import { useExpectedNetwork } from "../network/ExpectedNetworkContext";
import { SuperTokenMinimal } from "../redux/endpoints/tokenTypes";
import { rpcApi } from "../redux/store";
import FlowingBalance from "../token/FlowingBalance";
import { useVisibleAddress } from "../wallet/VisibleAddressContext";
import { DisplayAddress } from "./DisplayAddressChip";
import {
  FlowRateEther,
  flowRateEtherToString,
  FlowRateWei,
  flowRateWeiToString,
  UnitOfTime,
} from "./FlowRateInput";
import useCalculateBufferInfo from "./useCalculateBufferInfo";

const PreviewItem: FC<{
  label: string;
  isError?: boolean;
  oldValue?: ReactNode;
}> = ({ label, children, oldValue, isError }) => {
  const theme = useTheme();

  const valueTypography = (
    <Typography
      variant="body2"
      fontWeight="500"
      sx={{
        color: isError ? "red" : theme.palette.primary.main, // TODO(KK): handle colors better?
      }}
    >
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

export const StreamingPreview: FC<{
  receiver: DisplayAddress;
  token: SuperTokenMinimal;
  flowRateEther: FlowRateEther;
  existingStream: {
    flowRateWei: string;
  } | null;
}> = ({ receiver, token, flowRateEther, existingStream }) => {
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
  const realtimeBalance = visibleAddress
    ? realtimeBalanceQuery.data
    : undefined;

  const activeFlowQuery = rpcApi.useGetActiveFlowQuery(
    visibleAddress
      ? {
          chainId: network.id,
          tokenAddress: token.address,
          senderAddress: visibleAddress,
          receiverAddress: receiver.hash,
        }
      : skipToken
  );
  const existingFlow = visibleAddress ? activeFlowQuery.data : undefined;

  const calculateBufferInfo = useCalculateBufferInfo();

  const {
    balanceAfterBuffer,
    oldBufferAmount,
    newBufferAmount,
    newTotalFlowRate,
    oldDateWhenBalanceCritical,
    newDateWhenBalanceCritical,
  } = useMemo(
    () =>
      realtimeBalance
        ? calculateBufferInfo(network, realtimeBalance, existingFlow ?? null, {
            amountWei: parseEtherOrZero(flowRateEther.amountEther).toString(),
            unitOfTime: flowRateEther.unitOfTime,
          })
        : ({} as Record<string, any>),
    [network, realtimeBalance, existingFlow, flowRateEther]
  ); // TODO(KK): Handle existing flow better.

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
              ? flowRateWeiToString(
                  {
                    amountWei: existingStream.flowRateWei,
                    unitOfTime: UnitOfTime.Second,
                  },
                  token.symbol
                )
              : undefined
          }
        >
          {flowRateEtherToString(flowRateEther, token.symbol)}
        </PreviewItem>

        <PreviewItem label="Ends on">Never</PreviewItem>

        {visibleAddress && balanceAfterBuffer && (
          <PreviewItem
            label="Balance after buffer"
            isError={balanceAfterBuffer.isNegative()}
          >
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

        {newBufferAmount && (
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
        )}

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
