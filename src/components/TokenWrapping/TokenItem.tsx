import { Stack, Typography } from "@mui/material";
import { FC } from "react";
import TokenIcon from "../TokenIcon";
import EtherFormatted from "../EtherFormatted";
import FlowingBalance from "../FlowingBalance";

const etherDecimalPlaces = 8;

export const TokenItem: FC<{
  chainId?: number;
  accountAddress?: string;
  tokenAddress: string;
  tokenSymbol: string;
  tokenName: string;
  balanceLoading: boolean;
  balanceWei?: string;
  balanceTimestamp?: number;
  flowRate?: string;
}> = ({
  chainId,
  accountAddress,
  tokenAddress,
  tokenSymbol,
  tokenName,
  balanceLoading,
  balanceWei,
  balanceTimestamp,
  flowRate,
}) => {
  return (
    <Stack
      direction="row"
      alignItems="center"
      sx={{ pl: 1, width: "100%" }}
      spacing={2}
    >
      <TokenIcon tokenSymbol={tokenSymbol}></TokenIcon>
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        sx={{ width: "100%" }}
      >
        <Stack direction="column">
          <Typography variant="body1">{tokenSymbol}</Typography>
          <Typography variant="body2">{tokenName}</Typography>
        </Stack>
        {!!accountAddress && (
          <Typography variant="body1">
            {balanceWei ? (
              balanceTimestamp && flowRate ? (
                <FlowingBalance
                  balance={balanceWei}
                  balanceTimestamp={balanceTimestamp}
                  flowRate={flowRate}
                  etherDecimalPlaces={etherDecimalPlaces}
                />
              ) : (
                <EtherFormatted
                  wei={balanceWei}
                  etherDecimalPlaces={etherDecimalPlaces}
                />
              )
            ) : balanceLoading ? (
              null // We could show something else for loading... but I feel like the spinners draw too much attention in this case. 
            ) : (
              <EtherFormatted wei={0} />
            )}
          </Typography>
        )}
      </Stack>
    </Stack>
  );
};
