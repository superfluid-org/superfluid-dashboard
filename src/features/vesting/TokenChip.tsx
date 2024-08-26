import { FC } from "react";
import { Chip, Stack, Typography } from "@mui/material";
import TokenIcon from "../token/TokenIcon";
import AddressCopyTooltip from "../common/AddressCopyTooltip";

export const TokenChip: FC<{
  chainId: number;
  token: {
    address: string;
    symbol: string;
    name: string;
  };
}> = ({ chainId, token }) => {
  return (
    <Chip
      avatar={<TokenIcon chainId={chainId} tokenAddress={token.address} isSuper />}
      label={
        <Stack>
          <Typography color="text.primary">{token.symbol}</Typography>
          <AddressCopyTooltip address={token.address}>
            <Typography color="text.secondary">{token.name}</Typography>
          </AddressCopyTooltip>
        </Stack>
      }
      variant="outlined"
    />
  );
};
