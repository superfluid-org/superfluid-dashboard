import { Avatar } from "@mui/material";
import { FC } from "react";
import { assetApiSlice } from "./tokenManifestSlice";

const TokenIcon: FC<{
  tokenSymbol: string;
}> = ({ tokenSymbol }) => {
  const { data: tokenManifest } = assetApiSlice.useTokenManifestQuery({
    tokenSymbol,
  });

  return (
    <Avatar
      imgProps={{ sx: { objectFit: "contain" } }}
      alt={`${tokenSymbol} token icon`}
      src={
        tokenManifest?.svgIconPath &&
        `https://raw.githubusercontent.com/superfluid-finance/assets/master/public/${tokenManifest.svgIconPath}`
      }
    />
  );
};

export default TokenIcon;
