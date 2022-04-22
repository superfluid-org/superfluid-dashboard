import { FC } from "react";
import Image from "next/image";
import CircleIcon from "@mui/icons-material/Circle";
import { assetApiSlice } from "./tokenManifestSlice";

const TokenIcon: FC<{
  tokenSymbol: string;
}> = ({ tokenSymbol }) => {
  const { data: tokenManifest } = assetApiSlice.useTokenManifestQuery({
    tokenSymbol
  });

  return tokenManifest?.svgIconPath ? (
    <Image
      alt={`${tokenSymbol} token icon`}
      unoptimized
      width="24px"
      height="24px"
      src={`https://raw.githubusercontent.com/superfluid-finance/assets/master/public/${tokenManifest.svgIconPath}`}
    />
  ) : (
    <CircleIcon
      width="24px"
      height="24px"
      sx={{ color: "transparent" }}
    ></CircleIcon>
  );
};

export default TokenIcon;
