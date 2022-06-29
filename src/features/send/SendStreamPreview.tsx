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
import { FC, ReactNode, useMemo } from "react";
import { parseEtherOrZero } from "../../utils/tokenUtils";
import { useExpectedNetwork } from "../network/ExpectedNetworkContext";
import { SuperTokenMinimal } from "../redux/endpoints/tokenTypes";
import { rpcApi } from "../redux/store";
import Ether from "../token/Ether";
import FlowingBalance from "../token/FlowingBalance";
import { useVisibleAddress } from "../wallet/VisibleAddressContext";
import {
  FlowRateEther,
  flowRateEtherToString,
  flowRateWeiToString,
  UnitOfTime,
} from "./FlowRateInput";
import useCalculateBufferInfo from "./useCalculateBufferInfo";

const PreviewItem: FC<{
  label: string;
  isError?: boolean;
  oldValue?: ReactNode;
  dataCy?: string;
}> = ({ label, children, oldValue, isError, dataCy }) => {
  const theme = useTheme();

  const valueTypography = (
    <Typography
      data-cy={dataCy}
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
  receiver: string;
  token: SuperTokenMinimal;
  flowRateEther: FlowRateEther;
  existingStream: {
    flowRateWei: string;
  } | null;
}> = ({ receiver, token, flowRateEther, existingStream }) => {
  const theme = useTheme();
  const { network } = useExpectedNetwork();
  const { visibleAddress } = useVisibleAddress();

  const {
    data: _discard,
    currentData: realtimeBalance,
    ...realtimeBalanceQuery
  } = rpcApi.useRealtimeBalanceQuery(
    visibleAddress
      ? {
          chainId: network.id,
          tokenAddress: token.address,
          accountAddress: visibleAddress,
        }
      : skipToken
  );

  const {
    data: _discard2,
    currentData: existingFlow,
    ...activeFlowQuery
  } = rpcApi.useGetActiveFlowQuery(
    visibleAddress
      ? {
          chainId: network.id,
          tokenAddress: token.address,
          senderAddress: visibleAddress,
          receiverAddress: receiver,
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
  } = useMemo(
    () =>
      realtimeBalance &&
      realtimeBalanceQuery.isSuccess &&
      activeFlowQuery.isSuccess
        ? calculateBufferInfo(network, realtimeBalance, existingFlow ?? null, {
            amountWei: parseEtherOrZero(flowRateEther.amountEther).toString(),
            unitOfTime: flowRateEther.unitOfTime,
          })
        : ({} as Record<string, any>),
    [network, realtimeBalanceQuery, activeFlowQuery, flowRateEther]
  );

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
        <PreviewItem dataCy="preview-receiver" label="Receiver">
          {receiver}
        </PreviewItem>

        <PreviewItem
          dataCy="preview-flow-rate"
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

        <PreviewItem dataCy="preview-ends-on" label="Ends on">
          Never
        </PreviewItem>

        {visibleAddress && balanceAfterBuffer && (
          <PreviewItem
            dataCy="preview-balance-after-buffer"
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
            dataCy="preview-upfront-buffer"
            label="Upfront buffer"
            oldValue={
              oldBufferAmount ? (
                <Ether wei={oldBufferAmount}> {token.symbol}</Ether>
              ) : undefined
            }
          >
            <Ether wei={newBufferAmount}> {token.symbol}</Ether>
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
