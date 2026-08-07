import AddCircleOutlineRoundedIcon from "@mui/icons-material/AddCircleOutlineRounded";
import CurrencyExchangeRoundedIcon from "@mui/icons-material/CurrencyExchangeRounded";
import SendRoundedIcon from "@mui/icons-material/SendRounded";
import SwapHorizRoundedIcon from "@mui/icons-material/SwapHorizRounded";
import { IconButton, Stack, Tooltip } from "@mui/material";
import { FC, MouseEvent } from "react";
import Link from "../common/Link";
import { tokenActionIconButtonSx } from "../token/tokenActionIconButtonStyles";

interface PortfolioMobileActionsProps {
  streamPath?: string;
  swapPath?: string;
  symbol: string;
  transferPath: string;
  wrapPath?: string;
  onClick?: (event: MouseEvent<HTMLElement>) => void;
}

const PortfolioMobileActions: FC<PortfolioMobileActionsProps> = ({
  streamPath,
  swapPath,
  symbol,
  transferPath,
  wrapPath,
  onClick,
}) => {
  return (
    <Stack
      direction="row"
      onClick={onClick}
      sx={{ alignItems: "center", gap: 0.5, whiteSpace: "nowrap" }}
    >
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

export default PortfolioMobileActions;
