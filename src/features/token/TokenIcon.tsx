import { Avatar, styled, useTheme } from "@mui/material";
import { FC } from "react";
import { assetApiSlice } from "./tokenManifestSlice";

const BorderSvg = styled("svg")(() => ({
  "@keyframes rotating": {
    from: { transform: "rotate(0)" },
    to: { transform: "rotate(360deg)" },
  },
  animationName: "rotating",
  animationDuration: "8s",
  animationTimingFunction: "linear",
  animationIterationCount: "infinite",
  width: "100%",
  height: "100%",
  position: "absolute",
  top: 0,
  left: 0,
}));

const AvatarWrapper = styled("div")<{ border?: boolean }>(({ border }) => ({
  position: "relative",
  padding: border ? 2 : 0,
}));

interface TokenIconProps {
  tokenSymbol: string;
  size?: number;
}

const TokenIcon: FC<TokenIconProps> = ({ tokenSymbol, size = 36 }) => {
  const theme = useTheme();

  const { data: tokenManifest } = assetApiSlice.useTokenManifestQuery({
    tokenSymbol,
  });

  return (
    <AvatarWrapper border={tokenManifest?.isSuperToken}>
      {tokenManifest?.isSuperToken && (
        <BorderSvg viewBox="0 0 36 36">
          <clipPath id="clip">
            <polygon points="18,18, 30.5,0 36,10.2" />
          </clipPath>

          <mask id="mask">
            <rect x="-3" y="-3" width="42" height="42" fill="white" />
            <polygon points="18,18, 30.5,0 36,10.2" fill="black" />
          </mask>

          <circle
            mask="url(#mask)"
            r="17.5px"
            cx="18"
            cy="18"
            stroke={theme.palette.primary.main}
            strokeWidth="1"
            fill="transparent"
          />
          <circle
            clipPath="url(#clip)"
            r="17px"
            cx="18"
            cy="18"
            strokeDasharray="2"
            stroke={theme.palette.primary.main}
            strokeWidth="2"
            fill="transparent"
          />
        </BorderSvg>
      )}
      <Avatar
        alt={`${tokenSymbol} token icon`}
        sx={{
          width: size - (tokenManifest?.isSuperToken ? 4 : 0),
          height: size - (tokenManifest?.isSuperToken ? 4 : 0),
        }}
        imgProps={{ sx: { objectFit: "contain", borderRadius: "50%" } }}
        src={
          tokenManifest?.svgIconPath
            ? `https://raw.githubusercontent.com/superfluid-finance/assets/master/public/${tokenManifest.svgIconPath}`
            : "/icons/token-default.webp"
        }
      />
    </AvatarWrapper>
  );
};

export default TokenIcon;
