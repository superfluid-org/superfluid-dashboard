import { FC, useMemo } from "react";
import { BigNumber, ethers } from "ethers";
import { FlowRateWithTime, timeUnitWordMap } from "./FlowRateInput";
import { calculateBufferAmount } from "./calculateBufferAmounts";
import { DisplayAddress } from "./DisplayAddressChip";
import { Stack, Typography } from "@mui/material";
import { skipToken } from "@reduxjs/toolkit/dist/query";
import { useNetworkContext } from "../network/NetworkContext";
import { SuperTokenMinimal } from "../redux/endpoints/adHocSubgraphEndpoints";
import { rpcApi } from "../redux/store";
import FlowingBalance from "../token/FlowingBalance";
import { useWalletContext } from "../wallet/WalletContext";

interface PreviewItemProps {
  label: string;
  dataCy?: string
}

const PreviewItem: FC<PreviewItemProps> = ({ label,dataCy ,children }) => (
  <Stack direction="row" alignItems="center" justifyContent="space-between">
    <Typography variant="body2">{label}</Typography>
    <Typography data-cy={dataCy} variant="body2" fontWeight="500">
      {children}
    </Typography>
  </Stack>
);

export const SendStreamPreview: FC<{
  receiver: DisplayAddress;
  token: SuperTokenMinimal;
  flowRateWithTime: FlowRateWithTime;
}> = ({ receiver, token, flowRateWithTime }) => {
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
    <Stack gap={0.5}>
      <PreviewItem dataCy="preview-receiver" label="Recipient">{receiver.hash}</PreviewItem>

      <PreviewItem dataCy="preview-flow-rate" label="Flow rate">
        {`${ethers.utils.formatEther(flowRateWithTime.amountWei)} ${
          token.symbol
        }/${timeUnitWordMap[flowRateWithTime.unitOfTime]}`}
      </PreviewItem>

      <PreviewItem dataCy="preview-ends-on" label="Ends on">Never</PreviewItem>

      {walletAddress && (
        <PreviewItem dataCy="preview-balance-after-buffer" label="Balance after buffer">
          {realtimeBalance && (
            <FlowingBalance
              balance={balanceAfterBuffer.toString()}
              balanceTimestamp={realtimeBalance.balanceTimestamp}
              flowRate={realtimeBalance.flowRate}
            />
          )}
        </PreviewItem>
      )}

      <PreviewItem dataCy="preview-upfront-buffer" label="Upfront buffer">
        {`${ethers.utils.formatEther(bufferAmount)} ${token.symbol}`}
      </PreviewItem>
    </Stack>
  );
};
