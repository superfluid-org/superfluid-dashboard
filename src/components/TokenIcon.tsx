import { FC } from "react";
import Image from "next/image";
import useTokenManifest from "../hooks/useTokenManifest";
import CircleIcon from "@mui/icons-material/Circle";

const TokenIcon: FC<{
  tokenSymbol: string;
}> = ({ tokenSymbol }) => {
  const tokenManifest = useTokenManifest(tokenSymbol);

  return tokenManifest ? (
    <Image
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
