import { Chip, Box, ChipProps, Avatar } from "@mui/material";
import { FC } from "react";
import TokenIcon, { TokenIconProps } from "./TokenIcon";

interface TokenChipProps {
  chainId: number;
  tokenAddress: string;
  symbol: string;
  ChipProps?: ChipProps;
  IconProps?: TokenIconProps;
}

const TokenChip: FC<TokenChipProps> = ({
  chainId,
  tokenAddress,
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
        <TokenIcon chainId={chainId} tokenAddress={tokenAddress} size={24} {...IconProps} />
      </Avatar>
    }
  />
);

export default TokenChip;
