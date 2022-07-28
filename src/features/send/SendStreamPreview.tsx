import {
  Alert,
  alpha,
  Stack,
  Tooltip,
  Typography,
  TypographyProps,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { skipToken } from "@reduxjs/toolkit/dist/query";
import { format } from "date-fns";
import { FC, ReactNode, useMemo } from "react";
import shortenHex from "../../utils/shortenHex";
import { parseEtherOrZero } from "../../utils/tokenUtils";
import { useExpectedNetwork } from "../network/ExpectedNetworkContext";
import { SuperTokenMinimal } from "../redux/endpoints/tokenTypes";
import { rpcApi } from "../redux/store";
import Amount from "../token/Amount";
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
  TypographyProps?: Partial<TypographyProps>;
}> = ({ label, children, oldValue, isError, dataCy, TypographyProps = {} }) => {
  const theme = useTheme();
  const isBelowMd = useMediaQuery(theme.breakpoints.down("md"));

  const valueTypography = (
    <Typography
      data-cy={dataCy}
      variant="body2"
      fontWeight="500"
      sx={{
        color: isError ? "red" : theme.palette.primary.main, // TODO(KK): handle colors better?
      }}
      {...TypographyProps}
    >
      {children}
    </Typography>
  );

  return (
    <Stack
      direction={isBelowMd ? "column" : "row"}
      alignItems={isBelowMd ? "start" : "center"}
      justifyContent="space-between"
    >
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
  const isBelowMd = useMediaQuery(theme.breakpoints.down("md"));

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
    [
      network,
      realtimeBalanceQuery,
      activeFlowQuery,
      flowRateEther,
      calculateBufferInfo,
      existingFlow,
      realtimeBalance,
    ]
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
      <Stack
        gap={0.5}
        sx={{
          [theme.breakpoints.down("md")]: {
            flexDirection: "row",
            flexWrap: "wrap",
            columnGap: 1,
            "> *": {
              minWidth: `calc(50% - ${theme.spacing(1)})`,
            },
          },
        }}
      >
        <PreviewItem dataCy="preview-receiver" label="Receiver">
          {isBelowMd ? shortenHex(receiver, 14) : receiver}
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
            TypographyProps={{ variant: "body2mono" }}
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
                <Amount wei={oldBufferAmount}> {token.symbol}</Amount>
              ) : undefined
            }
          >
            <Amount wei={newBufferAmount}> {token.symbol}</Amount>
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
