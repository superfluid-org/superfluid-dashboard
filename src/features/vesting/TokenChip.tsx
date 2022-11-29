import { FC } from "react";
import { Chip, Stack, Typography } from "@mui/material";
import TokenIcon from "../token/TokenIcon";
import AddressCopyTooltip from "../common/AddressCopyTooltip";

export const TokenChip: FC<{
  token: {
    address: string;
    symbol: string;
    name: string;
  };
}> = ({ token }) => {
  return (
    <Chip
      avatar={<TokenIcon tokenSymbol={token.symbol} isSuper />}
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
