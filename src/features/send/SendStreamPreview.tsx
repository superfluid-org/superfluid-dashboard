import { FC, useMemo } from "react";
import { Card, List, ListItem, ListItemText, Typography } from "@mui/material";
import { BigNumber, ethers } from "ethers";
import { FlowRateWithTime, timeUnitWordMap } from "./FlowRateInput";
import { calculateBufferAmount } from "./calculateBufferAmounts";
import { DisplayAddress } from "./DisplayAddressChip";
import { SuperTokenMinimal } from "../redux/endpoints/adHocSubgraphEndpoints";
import { useWalletContext } from "../wallet/WalletContext";
import { rpcApi } from "../redux/store";
import { skipToken } from "@reduxjs/toolkit/dist/query";
import FlowingBalance from "../token/FlowingBalance";
import { useNetworkContext } from "../network/NetworkContext";

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
    <Card>
      <List>
        <ListItem>
          <ListItemText primary="Receiver" secondary={receiver.hash} />
        </ListItem>
        <ListItem>
          <ListItemText
            primary="Flow rate"
            secondary={
              <>
                <Typography component="span">{`${ethers.utils.formatEther(
                  flowRateWithTime.amountWei
                )} ${token.symbol}/${
                  timeUnitWordMap[flowRateWithTime.unitOfTime]
                }`}</Typography>
              </>
            }
          />
        </ListItem>
        <ListItem>
          <ListItemText primary="Ends on" secondary={"Never"} />
        </ListItem>
        {walletAddress && (
          <ListItem>
            <ListItemText
              primary="Balance after buffer"
              secondary={
                realtimeBalance ? (
                  <FlowingBalance
                    balance={balanceAfterBuffer.toString()}
                    balanceTimestamp={realtimeBalance.balanceTimestamp}
                    flowRate={realtimeBalance.flowRate}
                  ></FlowingBalance>
                ) : (
                  ""
                )
              }
            />
          </ListItem>
        )}
        <ListItem>
          <ListItemText
            primary="Upfront buffer"
            secondary={`${ethers.utils.formatEther(bufferAmount)} ${
              token.symbol
            }`}
          />
        </ListItem>
      </List>
    </Card>
  );
};
