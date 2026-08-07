import AddIcon from "@mui/icons-material/Add";
import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import CurrencyExchangeRoundedIcon from "@mui/icons-material/CurrencyExchangeRounded";
import RemoveIcon from "@mui/icons-material/Remove";
import SendRoundedIcon from "@mui/icons-material/SendRounded";
import SwapHorizRoundedIcon from "@mui/icons-material/SwapHorizRounded";
import {
  Box,
  Chip,
  IconButton,
  Stack,
  Tooltip,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import NextLink from "next/link";
import { FC, useMemo } from "react";
import { useAccount } from "@/hooks/useAccount";
import { getAddress } from "../../utils/memoizedEthersUtils";
import { Flag } from "../flags/flags.slice";
import { useHasFlag } from "../flags/flagsHooks";
import NetworkIcon from "../network/NetworkIcon";
import { Network } from "../network/networks";
import { getSuperTokenType } from "../redux/endpoints/adHocSubgraphEndpoints";
import { isWrappable, SuperTokenMinimal } from "../redux/endpoints/tokenTypes";
import ConnectionBoundary from "../transactionBoundary/ConnectionBoundary";
import AddToWalletButton from "../wallet/AddToWalletButton";
import TokenIcon from "./TokenIcon";
import { getSendPagePath } from "../../pages/send";
import { getTransferPagePath } from "../../pages/transfer";
import { getBridgePagePath } from "../bridge/getBridgePagePath";
import { tokenActionIconButtonSx } from "./tokenActionIconButtonStyles";

interface TokenToolbarData {
  chainId: number;
  tokenAddress: string;
  symbol: string;
  name: string;
  isUnlisted: boolean;
}

const TokenToolbarData: FC<TokenToolbarData> = ({
  chainId,
  tokenAddress,
  symbol,
  name,
  isUnlisted,
}) => (
  <Stack
    data-cy={"token-header"}
    direction="row"
    sx={{
      alignItems: "center",
      gap: 2,
    }}
  >
    <TokenIcon
      chainId={chainId}
      tokenAddress={tokenAddress}
      isUnlisted={isUnlisted}
    />
    <Typography data-cy={"token-name"} variant="h3" component="h1">
      {name}
    </Typography>
    <Typography
      data-cy={"token-symbol"}
      variant="h4"
      sx={{
        color: "text.secondary",
      }}
    >
      {symbol}
    </Typography>
  </Stack>
);

interface TokenToolbarProps {
  token: SuperTokenMinimal;
  network: Network;
  onBack?: () => void;
}

const TokenToolbar: FC<TokenToolbarProps> = ({ token, network, onBack }) => {
  const theme = useTheme();
  const isBelowMd = useMediaQuery(theme.breakpoints.down("md"));
  const {
    address: tokenAddress,
    underlyingAddress,
    symbol,
    decimals,
    name,
    isListed,
  } = token;
  const { address: accountAddress } = useAccount();

  const wrappable = useMemo(
    () =>
      isWrappable({
        type: getSuperTokenType({
          network,
          address: tokenAddress,
          underlyingAddress: underlyingAddress,
        }),
      }),
    [network, tokenAddress, underlyingAddress]
  );

  const hasAddedToWallet = useHasFlag(
    accountAddress
      ? {
          type: Flag.TokenAdded,
          chainId: network.id,
          token: getAddress(tokenAddress),
          account: getAddress(accountAddress),
        }
      : undefined
  );
  const streamPath = getSendPagePath({
    token: tokenAddress,
    network: network.slugName,
  });
  const transferPath = getTransferPagePath({
    token: tokenAddress,
    network: network.slugName,
  });
  const swapPath = getBridgePagePath({
    fromChain: network.id,
    fromToken: tokenAddress,
  });

  return (
    <Stack
      sx={{
        gap: 3,
      }}
    >
      <Stack
        direction="row"
        sx={{
          alignItems: "center",
          gap: 2,
        }}
      >
        <IconButton color="inherit" onClick={onBack} aria-label="Back">
          <ArrowBackRoundedIcon />
        </IconButton>

        {!isBelowMd && (
          <>
            <TokenToolbarData
              chainId={network.id}
              tokenAddress={tokenAddress}
              symbol={symbol}
              name={name}
              isUnlisted={!isListed}
            />
            <Chip
              size="small"
              label={network.name}
              translate="no"
              avatar={<NetworkIcon network={network} size={18} fontSize={14} />}
            />
          </>
        )}
      </Stack>
      {isBelowMd && (
        <TokenToolbarData
          chainId={network.id}
          tokenAddress={tokenAddress}
          symbol={symbol}
          name={name}
          isUnlisted={!isListed}
        />
      )}
      <Box
        sx={{
          display: "flex",
          flexWrap: "wrap",
          justifyContent: { sm: "flex-end" },
          gap: 1,
        }}
      >
        {!hasAddedToWallet ? (
          <ConnectionBoundary expectedNetwork={network}>
            {({ isConnected }) =>
              isConnected ? (
                <AddToWalletButton
                  token={tokenAddress}
                  symbol={symbol}
                  decimals={decimals}
                />
              ) : null
            }
          </ConnectionBoundary>
        ) : null}
        <Tooltip title="Stream">
          <IconButton
            component={NextLink}
            href={streamPath}
            data-cy="token-stream-button"
            aria-label={`Stream ${symbol}`}
            sx={tokenActionIconButtonSx}
          >
            <SendRoundedIcon />
          </IconButton>
        </Tooltip>
        <Tooltip title="Transfer">
          <IconButton
            component={NextLink}
            href={transferPath}
            data-cy="token-transfer-button"
            aria-label={`Transfer ${symbol}`}
            sx={tokenActionIconButtonSx}
          >
            <SwapHorizRoundedIcon />
          </IconButton>
        </Tooltip>
        {!network.testnet ? (
          <Tooltip title="Swap">
            <IconButton
              component={NextLink}
              href={swapPath}
              data-cy="token-swap-button"
              aria-label={`Swap ${symbol}`}
              sx={tokenActionIconButtonSx}
            >
              <CurrencyExchangeRoundedIcon />
            </IconButton>
          </Tooltip>
        ) : null}
        {wrappable ? (
          <>
            <Tooltip title="Wrap">
              <IconButton
                component={NextLink}
                href={`/wrap?upgrade&token=${token.address}&network=${network.slugName}`}
                data-cy="wrap-button"
                aria-label={`Wrap ${symbol}`}
                sx={tokenActionIconButtonSx}
              >
                <AddIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Unwrap">
              <IconButton
                component={NextLink}
                href={`/wrap?downgrade&token=${token.address}&network=${network.slugName}`}
                data-cy="unwrap-button"
                aria-label={`Unwrap ${symbol}`}
                sx={tokenActionIconButtonSx}
              >
                <RemoveIcon />
              </IconButton>
            </Tooltip>
          </>
        ) : null}
      </Box>
    </Stack>
  );
};

export default TokenToolbar;
