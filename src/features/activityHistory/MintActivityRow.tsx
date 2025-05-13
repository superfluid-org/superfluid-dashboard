import SwapVertIcon from "@mui/icons-material/SwapVert";
import {
  ListItem,
  ListItemAvatar,
  ListItemText,
  Stack,
  TableCell,
  TableRow,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { skipToken } from "@reduxjs/toolkit/query";
import { format } from "date-fns";
import { FC, memo } from "react";
import { MintedActivity } from "../../utils/activityUtils";
import TxHashLink from "../common/TxHashLink";
import NetworkBadge from "../network/NetworkBadge";
import Amount from "../token/Amount";
import TokenIcon from "../token/TokenIcon";
import FiatAmount from "../tokenPrice/FiatAmount";
import useTokenPrice from "../tokenPrice/useTokenPrice";
import ActivityIcon from "./ActivityIcon";
import { useTokenQuery } from "../../hooks/useTokenQuery";

interface MintActivityRowProps extends MintedActivity {
  dateFormat?: string;
}

const MintActivityRow: FC<MintActivityRowProps> = ({
  keyEvent,
  transferEvent,
  network,
  dateFormat = "HH:mm",
}) => {
  const theme = useTheme();
  const isBelowMd = useMediaQuery(theme.breakpoints.down("md"));

  const { amount, transactionHash, timestamp } = keyEvent;
  const { token: superTokenAddress } = transferEvent || {};

  const tokenPrice = useTokenPrice(network.id, superTokenAddress);

  const superTokenQuery = useTokenQuery(
    superTokenAddress
      ? {
          chainId: network.id,
          id: superTokenAddress,
          onlySuperToken: true
        }
      : skipToken
  );
  const superToken = superTokenQuery.data;

  const underlyingTokenQuery = useTokenQuery(
    superToken?.underlyingAddress
      ? {
          chainId: network.id,
          id: superToken.underlyingAddress,
        }
      : skipToken
  );
  const underlyingToken = underlyingTokenQuery.data;

  const isSuperTokenListed = Boolean(superToken?.isListed);

  return (
    <TableRow data-cy={`${network.slugName}-row`}>
      <TableCell>
        <ListItem sx={{ p: 0 }}>
          <ActivityIcon icon={SwapVertIcon} />
          <ListItemText
            data-cy={"activity"}
            primary={"Wrap"}
            secondary={format(timestamp * 1000, dateFormat)}
            primaryTypographyProps={{
              translate: "yes",
              variant: isBelowMd ? "h7" : "h6",
            }}
            secondaryTypographyProps={{
              variant: "body2mono",
              color: "text.secondary",
            }}
          />
        </ListItem>
      </TableCell>

      {!isBelowMd ? (
        <>
          <TableCell>
            <ListItem sx={{ p: 0 }}>
              <ListItemAvatar>
                <TokenIcon
                  chainId={network.id}
                  tokenAddress={underlyingToken?.address}
                  isLoading={underlyingTokenQuery.isLoading}
                />
              </ListItemAvatar>
              {underlyingToken && (
                <ListItemText
                  data-cy={"amount"}
                  primary={
                    <>
                      -
                      <Amount wei={amount} /> {underlyingToken.symbol}
                    </>
                  }
                  secondary={
                    tokenPrice && <FiatAmount price={tokenPrice} wei={amount} />
                  }
                  primaryTypographyProps={{
                    variant: "h6mono",
                  }}
                  secondaryTypographyProps={{
                    variant: "body2mono",
                    color: "text.secondary",
                  }}
                />
              )}
            </ListItem>
          </TableCell>
          <TableCell>
            <ListItem sx={{ p: 0 }}>
              <ListItemAvatar>
                <TokenIcon
                  isSuper
                  chainId={network.id}
                  tokenAddress={superTokenAddress}
                  isUnlisted={!isSuperTokenListed}
                  isLoading={superTokenQuery.isLoading}
                />
              </ListItemAvatar>
              {superToken && (
                <ListItemText
                  data-cy={"amountToFrom"}
                  primary={
                    <>
                      +<Amount wei={amount}> {superToken.symbol}</Amount>
                    </>
                  }
                  secondary={
                    tokenPrice && <FiatAmount price={tokenPrice} wei={amount} />
                  }
                  primaryTypographyProps={{
                    variant: "h6mono",
                  }}
                  secondaryTypographyProps={{
                    variant: "body2mono",
                    color: "text.secondary",
                  }}
                />
              )}
            </ListItem>
          </TableCell>
          <TableCell sx={{ position: "relative" }}>
            <TxHashLink txHash={transactionHash} network={network} />
            <NetworkBadge
              network={network}
              sx={{ position: "absolute", top: "0px", right: "16px" }}
            />
          </TableCell>
        </>
      ) : (
        <TableCell align="right">
          <Stack direction="row" alignItems="center" gap={2}>
            {!!(superToken && underlyingToken) && (
              <ListItemText
                data-cy={"mobile-amount"}
                primary={
                  <>
                    +<Amount wei={amount}> {superToken.symbol}</Amount>
                  </>
                }
                secondary={
                  <>
                    -<Amount wei={amount}> {underlyingToken.symbol}</Amount>
                  </>
                }
                primaryTypographyProps={{ variant: "h7mono" }}
                secondaryTypographyProps={{ variant: "body2mono" }}
              />
            )}
            <TokenIcon
              isSuper
              chainId={network.id}
              tokenAddress={superTokenAddress}
              isUnlisted={!isSuperTokenListed}
              isLoading={superTokenQuery.isLoading}
            />
          </Stack>
        </TableCell>
      )}
    </TableRow>
  );
};

export default memo(MintActivityRow);
