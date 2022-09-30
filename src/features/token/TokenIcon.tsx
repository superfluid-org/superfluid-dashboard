import QuestionMarkIcon from "@mui/icons-material/QuestionMark";
import { Avatar, Skeleton, styled, Tooltip, useTheme } from "@mui/material";
import { skipToken } from "@reduxjs/toolkit/dist/query";
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

export interface TokenIconProps {
  tokenSymbol?: string;
  isSuper?: boolean;
  isUnlisted?: boolean;
  isLoading?: boolean;
  size?: number;
}

const TokenIcon: FC<TokenIconProps> = ({
  tokenSymbol,
  isSuper = false,
  isUnlisted = false,
  isLoading = false,
  size = 36,
}) => {
  const theme = useTheme();

  const { isLoading: isQueryLoading, data: tokenManifest } =
    assetApiSlice.useTokenManifestQuery(
      !!tokenSymbol
        ? {
            tokenSymbol,
          }
        : skipToken
    );

  const isSuperToken = isSuper || tokenManifest?.isSuperToken;
  const diameter = size - (isSuperToken ? 4 : 0);
  const loading = isLoading || isQueryLoading;

  return (
    <Tooltip
      arrow
      disableInteractive
      placement="top"
      title={isUnlisted ? "Unlisted token, use with caution" : ""}
    >
      <AvatarWrapper
        isSuperToken={isSuperToken}
        isUnlisted={!loading && isUnlisted}
      >
        {isSuperToken && !isLoading && (
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
                isUnlisted
                  ? theme.palette.warning.main
                  : theme.palette.primary.main
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
                isUnlisted
                  ? theme.palette.warning.main
                  : theme.palette.primary.main
              }
              strokeWidth="2"
              fill="transparent"
            />
          </BorderSvg>
        )}

        {loading && (
          <Avatar
            sx={{
              width: diameter,
              height: diameter,
              background: "transparent",
              color: theme.palette.warning.main,
            }}
          >
            <Skeleton
              variant="circular"
              sx={{
                width: diameter,
                height: diameter,
              }}
            />
          </Avatar>
        )}

        {!loading && isUnlisted && (
          <Avatar
            sx={{
              width: diameter,
              height: diameter,
              background: "transparent",
              color: theme.palette.warning.main,
            }}
          >
            <QuestionMarkIcon />
          </Avatar>
        )}

        {!loading && !isUnlisted && (
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
        )}
      </AvatarWrapper>
    </Tooltip>
  );
};

export default TokenIcon;
