import AddIcon from "@mui/icons-material/Add";
import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import RemoveIcon from "@mui/icons-material/Remove";
import {
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
import { useAccount } from "wagmi";
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
  <Stack data-cy={"token-header"} direction="row" alignItems="center" gap={2}>
    <TokenIcon chainId={chainId} tokenAddress={tokenAddress} isUnlisted={isUnlisted} />
    <Typography data-cy={"token-name"} variant="h3" component="h1">
      {name}
    </Typography>
    <Typography data-cy={"token-symbol"} variant="h4" color="text.secondary">
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

  return (
    <Stack gap={3}>
      <Stack direction="row" alignItems="center" gap={2}>
        <IconButton color="inherit" onClick={onBack}>
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

        <Stack
          direction="row"
          gap={2}
          flex={1}
          alignItems="center"
          justifyContent="flex-end"
        >
          {!hasAddedToWallet && (
            <ConnectionBoundary expectedNetwork={network}>
              {({ isConnected }) =>
                isConnected && (
                  <AddToWalletButton
                    token={tokenAddress}
                    symbol={symbol}
                    decimals={decimals}
                  />
                )
              }
            </ConnectionBoundary>
          )}
          {wrappable && (
            <>
              <NextLink
                href={`/wrap?upgrade&token=${token.address}&network=${network.slugName}`}
                passHref
                legacyBehavior
              >
                <Tooltip title="Wrap">
                  <IconButton data-cy={"wrap-button"} color="primary">
                    <AddIcon />
                  </IconButton>
                </Tooltip>
              </NextLink>
              <NextLink
                href={`/wrap?downgrade&token=${token.address}&network=${network.slugName}`}
                passHref
              >
                <Tooltip title="Unwrap">
                  <IconButton data-cy={"unwrap-button"} color="primary">
                    <RemoveIcon />
                  </IconButton>
                </Tooltip>
              </NextLink>
            </>
          )}
        </Stack>
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
    </Stack>
  );
};

export default TokenToolbar;
