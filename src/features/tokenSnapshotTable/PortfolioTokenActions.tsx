import AddCircleOutlineRoundedIcon from "@mui/icons-material/AddCircleOutlineRounded";
import CurrencyExchangeRoundedIcon from "@mui/icons-material/CurrencyExchangeRounded";
import SendRoundedIcon from "@mui/icons-material/SendRounded";
import SwapHorizRoundedIcon from "@mui/icons-material/SwapHorizRounded";
import { IconButton, Stack, Tooltip } from "@mui/material";
import { FC, MouseEvent } from "react";
import { useAccount } from "@/hooks/useAccount";
import { getAddress } from "../../utils/memoizedEthersUtils";
import Link from "../common/Link";
import { Flag } from "../flags/flags.slice";
import { useHasFlag } from "../flags/flagsHooks";
import { Network } from "../network/networks";
import { tokenActionIconButtonSx } from "../token/tokenActionIconButtonStyles";
import ConnectionBoundary from "../transactionBoundary/ConnectionBoundary";
import AddToWalletButton from "../wallet/AddToWalletButton";

interface PortfolioTokenActionsProps {
  decimals: number;
  network: Network;
  streamPath?: string;
  swapPath?: string;
  symbol: string;
  tokenAddress: string;
  transferPath: string;
  wrapPath?: string;
  onClick?: (event: MouseEvent<HTMLElement>) => void;
}

const PortfolioTokenActions: FC<PortfolioTokenActionsProps> = ({
  decimals,
  network,
  streamPath,
  swapPath,
  symbol,
  tokenAddress,
  transferPath,
  wrapPath,
  onClick,
}) => {
  const { address: accountAddress } = useAccount();
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
    <Stack
      direction="row"
      onClick={onClick}
      sx={{
        alignItems: "center",
        flexShrink: 0,
        gap: 0.5,
        whiteSpace: "nowrap",
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
      {streamPath ? (
        <Tooltip title="Stream">
          <IconButton
            size="small"
            data-cy="portfolio-stream-button"
            LinkComponent={Link}
            href={streamPath}
            aria-label={`Stream ${symbol}`}
            sx={tokenActionIconButtonSx}
          >
            <SendRoundedIcon />
          </IconButton>
        </Tooltip>
      ) : null}
      {wrapPath ? (
        <Tooltip title="Wrap">
          <IconButton
            size="small"
            data-cy="portfolio-wrap-button"
            LinkComponent={Link}
            href={wrapPath}
            aria-label={`Wrap ${symbol}`}
            sx={tokenActionIconButtonSx}
          >
            <AddCircleOutlineRoundedIcon />
          </IconButton>
        </Tooltip>
      ) : null}
      <Tooltip title="Transfer">
        <IconButton
          size="small"
          data-cy="portfolio-transfer-button"
          LinkComponent={Link}
          href={transferPath}
          aria-label={`Transfer ${symbol}`}
          sx={tokenActionIconButtonSx}
        >
          <SwapHorizRoundedIcon />
        </IconButton>
      </Tooltip>
      {swapPath ? (
        <Tooltip title="Swap">
          <IconButton
            size="small"
            data-cy="portfolio-swap-button"
            LinkComponent={Link}
            href={swapPath}
            aria-label={`Swap ${symbol}`}
            sx={tokenActionIconButtonSx}
          >
            <CurrencyExchangeRoundedIcon />
          </IconButton>
        </Tooltip>
      ) : null}
    </Stack>
  );
};

export default PortfolioTokenActions;
