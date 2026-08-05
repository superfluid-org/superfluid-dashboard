import {
  Chip,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Stack,
  TableCell,
  TableRow,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { FC, memo } from "react";
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
  const tokenPrice = useTokenPrice(
    network.id,
    priceUsd === undefined ? token.address : undefined
  );

  return (
    <TableRow hover data-cy={`${token.symbol}-erc20-cell`}>
      <TableCell>
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
      <TableCell>
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
            <Typography color="text.secondary">—</Typography>
          </TableCell>
        </>
      ) : null}
      <TableCell />
    </TableRow>
  );
};

export default memo(ERC20BalanceRow);
