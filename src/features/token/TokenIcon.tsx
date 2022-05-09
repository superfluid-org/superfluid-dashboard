import { Avatar } from "@mui/material";
import { FC } from "react";
import { assetApiSlice } from "./tokenManifestSlice";
interface TokenIconProps {
  tokenSymbol: string;
  size?: number;
}
const TokenIcon: FC<TokenIconProps> = ({ tokenSymbol, size = 36 }) => {
  const { data: tokenManifest } = assetApiSlice.useTokenManifestQuery({
    tokenSymbol,
  });

  return (
    <Avatar
      imgProps={{ sx: { objectFit: "contain" } }}
      alt={`${tokenSymbol} token icon`}
      sx={{ width: `${size}px`, height: `${size}px` }}
      src={
        tokenManifest?.svgIconPath &&
        `https://raw.githubusercontent.com/superfluid-finance/assets/master/public/${tokenManifest.svgIconPath}`
      }
    />
  );
};

export default TokenIcon;
