import {CircularProgress, Stack, Typography,} from "@mui/material";
import {FC} from "react";
import {ethers} from "ethers";
import TokenIcon from "../TokenIcon";

export const TokenItem: FC<{
  chainId?: number;
  accountAddress?: string;
  tokenAddress: string;
  tokenSymbol: string;
  tokenName: string;
  balanceWei?: string;
}> = ({
  chainId,
  accountAddress,
  tokenAddress,
  tokenSymbol,
  tokenName,
  balanceWei,
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
              ethers.utils.formatEther(balanceWei)
            ) : (
              <CircularProgress />
            )}
          </Typography>
        )}
      </Stack>
    </Stack>
  );
};


