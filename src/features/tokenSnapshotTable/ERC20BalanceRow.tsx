import SwapHorizRoundedIcon from "@mui/icons-material/SwapHorizRounded";
import {
  Button,
  Chip,
  IconButton,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Stack,
  TableCell,
  TableRow,
  Tooltip,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { FC, memo } from "react";
import { getTransferPagePath } from "../../pages/transfer";
import { getTokenPagePath } from "../../pages/token/[_network]/[_token]";
import { useRouter } from "next/router";
import Link from "../common/Link";
import { Network } from "../network/networks";
import PortfolioFiatAmount from "../portfolio/PortfolioFiatAmount";
import Amount from "../token/Amount";
import TokenIcon from "../token/TokenIcon";
import FiatAmount from "../tokenPrice/FiatAmount";
import useTokenPrice from "../tokenPrice/useTokenPrice";
import { ERC20Balance } from "./useERC20Balances";

interface ERC20BalanceRowProps extends ERC20Balance {
  network: Network;
}

const ERC20BalanceRow: FC<ERC20BalanceRowProps> = ({
  network,
  token,
  balance,
  priceUsd,
}) => {
  const theme = useTheme();
  const isBelowMd = useMediaQuery(theme.breakpoints.down("md"));
  const router = useRouter();
  const tokenPrice = useTokenPrice(
    network.id,
    priceUsd === undefined ? token.address : undefined
  );
  const transferPath = getTransferPagePath({
    token: token.address,
    network: network.slugName,
  });
  const tokenPath = getTokenPagePath({
    token: token.address,
    network: network.slugName,
  });

  return (
    <TableRow hover data-cy={`${token.symbol}-erc20-cell`}>
      <TableCell onClick={() => router.push(tokenPath)} sx={{ cursor: "pointer" }}>
        <ListItem disablePadding>
          <ListItemAvatar>
            <TokenIcon
              chainId={network.id}
              tokenAddress={token.address}
              logoURI={token.logoURI}
              symbol={token.symbol}
            />
          </ListItemAvatar>
          <ListItemText
            primary={
              <Stack direction="row" alignItems="center" gap={1}>
                <span>{token.symbol}</span>
                <Chip
                  label="ERC-20"
                  size="small"
                  variant="outlined"
                  color="secondary"
                  sx={{ height: 22 }}
                />
              </Stack>
            }
            secondary={token.name}
            primaryTypographyProps={{ variant: "h6", component: "div" }}
            secondaryTypographyProps={{
              variant: "body2",
              color: "text.secondary",
              noWrap: true,
            }}
            sx={{ minWidth: 0 }}
          />
        </ListItem>
      </TableCell>
      <TableCell onClick={() => router.push(tokenPath)} sx={{ cursor: "pointer" }}>
        <ListItemText
          primary={<Amount wei={balance} decimals={token.decimals} />}
          secondary={
            priceUsd !== undefined ? (
              <PortfolioFiatAmount
                balance={balance}
                decimals={token.decimals}
                priceUsd={priceUsd}
              />
            ) : tokenPrice ? (
              <FiatAmount
                wei={balance}
                decimals={token.decimals}
                price={tokenPrice}
              />
            ) : null
          }
          primaryTypographyProps={{ variant: isBelowMd ? "h7mono" : "h6mono" }}
          secondaryTypographyProps={{
            variant: "body2mono",
            color: "text.secondary",
          }}
        />
      </TableCell>
      {!isBelowMd ? (
        <>
          <TableCell>
            <Typography color="text.secondary">—</Typography>
          </TableCell>
          <TableCell>
            <Button
              data-cy="portfolio-transfer-button"
              LinkComponent={Link}
              href={transferPath}
              size="small"
              variant="outlined"
              startIcon={<SwapHorizRoundedIcon />}
            >
              Transfer
            </Button>
          </TableCell>
        </>
      ) : null}
      <TableCell align="center" sx={{ px: { xs: 0.5, md: 2 } }}>
        {isBelowMd ? (
          <Tooltip title="Transfer">
            <IconButton
              data-cy="portfolio-transfer-button"
              LinkComponent={Link}
              href={transferPath}
              color="primary"
              aria-label={`Transfer ${token.symbol}`}
            >
              <SwapHorizRoundedIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        ) : null}
      </TableCell>
    </TableRow>
  );
};

export default memo(ERC20BalanceRow);
