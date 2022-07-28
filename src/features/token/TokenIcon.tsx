import QuestionMarkIcon from "@mui/icons-material/QuestionMark";
import { Avatar, Skeleton, styled, Tooltip, useTheme } from "@mui/material";
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

const AvatarWrapper = styled("div", {
  shouldForwardProp: (prop: string) =>
    !["isSuperToken", "isUnlisted"].includes(prop),
})<{ isSuperToken?: boolean; isUnlisted: boolean }>(
  ({ isSuperToken, isUnlisted, theme }) => ({
    position: "relative",
    padding: isSuperToken ? 2 : 0,
    ...(isUnlisted &&
      !isSuperToken && {
        border: `1px solid ${theme.palette.warning.main}`,
        borderRadius: "50%",
      }),
  })
);

interface TokenIconProps {
  tokenSymbol: string;
  isListed?: boolean;
  size?: number;
}

const TokenIcon: FC<TokenIconProps> = ({
  tokenSymbol,
  isListed,
  size = 36,
}) => {
  const theme = useTheme();

  const { data: tokenManifest } = assetApiSlice.useTokenManifestQuery({
    tokenSymbol,
  });

  const diameter = size - (tokenManifest?.isSuperToken ? 4 : 0);

  return (
    <Tooltip
      arrow
      disableInteractive
      placement="top"
      title={isListed === false ? "Unlisted token, use with caution" : ""}
    >
      <AvatarWrapper
        isSuperToken={tokenManifest?.isSuperToken}
        isUnlisted={isListed === false}
      >
        {tokenManifest?.isSuperToken && isListed !== undefined && (
          <BorderSvg data-cy={"animation"} viewBox="0 0 36 36">
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
              stroke={
                isListed
                  ? theme.palette.primary.main
                  : theme.palette.warning.main
              }
              strokeWidth="1"
              fill="transparent"
            />
            <circle
              clipPath="url(#clip)"
              r="17px"
              cx="18"
              cy="18"
              strokeDasharray="2"
              stroke={
                isListed
                  ? theme.palette.primary.main
                  : theme.palette.warning.main
              }
              strokeWidth="2"
              fill="transparent"
            />
          </BorderSvg>
        )}
        {isListed ? (
          <Avatar
            data-cy={"token-icon"}
            alt={`${tokenSymbol} token icon`}
            sx={{
              width: diameter,
              height: diameter,
            }}
            imgProps={{ sx: { objectFit: "contain", borderRadius: "50%" } }}
            src={
              tokenManifest?.svgIconPath
                ? `https://raw.githubusercontent.com/superfluid-finance/assets/master/public/${tokenManifest.svgIconPath}`
                : "/icons/token-default.webp"
            }
          />
        ) : (
          <Avatar
            sx={{
              width: diameter,
              height: diameter,
              background: "transparent",
              color: theme.palette.warning.main,
            }}
          >
            {isListed === false ? (
              <QuestionMarkIcon />
            ) : (
              <Skeleton
                variant="circular"
                sx={{
                  width: diameter,
                  height: diameter,
                }}
              />
            )}
          </Avatar>
        )}
      </AvatarWrapper>
    </Tooltip>
  );
};

export default TokenIcon;
