import { Chip, Box, ChipProps, Avatar } from "@mui/material";
import { FC } from "react";
import TokenIcon, { TokenIconProps } from "./TokenIcon";

interface TokenChipProps {
  symbol: string;
  ChipProps?: ChipProps;
  IconProps?: TokenIconProps;
}

const TokenChip: FC<TokenChipProps> = ({
  symbol,
  ChipProps = {},
  IconProps = {},
}) => (
  <Chip
    variant="outlined"
    {...ChipProps}
    label={symbol}
    avatar={
      <Avatar sx={{ background: "transparent" }}>
        <TokenIcon tokenSymbol={symbol} size={24} {...IconProps} />
      </Avatar>
    }
  />
);

export default TokenChip;
