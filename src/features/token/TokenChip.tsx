import { Chip, Box } from "@mui/material";
import { FC } from "react";
import TokenIcon from "./TokenIcon";

interface TokenChipProps {
  symbol: string;
}

const TokenChip: FC<TokenChipProps> = ({ symbol }) => (
  <Chip
    variant="outlined"
    label={symbol}
    avatar={
      <Box
        sx={{
          ml: 1.5, // Adding ml manually because TokenIcon is not wrapped by <Icon> or <Avatar> which is usually required by MUI theme.
        }}
      >
        <TokenIcon tokenSymbol={symbol} size={24} />
      </Box>
    }
  />
);

export default TokenChip;
