import { Alert, alpha, Stack, Typography, useTheme } from "@mui/material";
import { skipToken } from "@reduxjs/toolkit/dist/query";
import { BigNumber, ethers } from "ethers";
import { FC, useMemo } from "react";
import { useNetworkContext } from "../network/NetworkContext";
import { SuperTokenMinimal } from "../redux/endpoints/adHocSubgraphEndpoints";
import { rpcApi } from "../redux/store";
import FlowingBalance from "../token/FlowingBalance";
import { useWalletContext } from "../wallet/WalletContext";
import { calculateBufferAmount } from "./calculateBufferAmounts";
import { DisplayAddress } from "./DisplayAddressChip";
import { FlowRateWithTime, timeUnitWordMap } from "./FlowRateInput";

interface PreviewItemProps {
  label: string;
}

const PreviewItem: FC<PreviewItemProps> = ({ label, children }) => (
  <Stack direction="row" alignItems="center" justifyContent="space-between">
    <Typography variant="body2">{label}</Typography>
    <Typography variant="body2" fontWeight="500">
      {children}
    </Typography>
  </Stack>
);

export const SendStreamPreview: FC<{
  receiver: DisplayAddress;
  token: SuperTokenMinimal;
  flowRateWithTime: FlowRateWithTime;
}> = ({ receiver, token, flowRateWithTime }) => {
  const theme = useTheme();
  const { network } = useNetworkContext();
  const { walletAddress } = useWalletContext();

  const realtimeBalanceQuery = rpcApi.useRealtimeBalanceQuery(
    walletAddress
      ? {
          chainId: network.chainId,
          tokenAddress: token.address,
          accountAddress: walletAddress,
        }
      : skipToken
  );
  const realtimeBalance = realtimeBalanceQuery.data;

  // TODO(KK): useMemo
  const bufferAmount = useMemo(
    () => calculateBufferAmount({ network, flowRateWithTime }),
    [network, flowRateWithTime]
  );

  const balanceAfterBuffer = useMemo(
    () => BigNumber.from(realtimeBalance?.balance ?? 0).sub(bufferAmount),
    [realtimeBalance, bufferAmount]
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
        <PreviewItem label="Recipient">{receiver.hash}</PreviewItem>

        <PreviewItem label="Flow rate">
          {`${ethers.utils.formatEther(flowRateWithTime.amountWei)} ${
            token.symbol
          }/${timeUnitWordMap[flowRateWithTime.unitOfTime]}`}
        </PreviewItem>

        <PreviewItem label="Ends on">Never</PreviewItem>

        {walletAddress && (
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

        <PreviewItem label="Upfront buffer">
          {`${ethers.utils.formatEther(bufferAmount)} ${token.symbol}`}
        </PreviewItem>
      </Stack>
    </Alert>
  );
};
