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
import { skipToken } from "@reduxjs/toolkit/dist/query";
import { format } from "date-fns";
import { FC, memo, useMemo } from "react";
import { MintedActivity } from "../../utils/activityUtils";
import TxHashLink from "../common/TxHashLink";
import NetworkBadge from "../network/NetworkBadge";
import { subgraphApi } from "../redux/store";
import Amount from "../token/Amount";
import TokenIcon from "../token/TokenIcon";
import FiatAmount from "../tokenPrice/FiatAmount";
import useTokenPrice from "../tokenPrice/useTokenPrice";
import ActivityIcon from "./ActivityIcon";

const MintActivityRow: FC<MintedActivity> = ({
  keyEvent,
  transferEvent,
  network,
}) => {
  const theme = useTheme();
  const isBelowMd = useMediaQuery(theme.breakpoints.down("md"));

  const { amount, transactionHash, timestamp, token } = keyEvent;
  const { token: superTokenAddress } = transferEvent || {};

  const isNativeAssetSuperToken =
    network.nativeCurrency.superToken.address.toLowerCase() ===
    superTokenAddress?.toLowerCase();

  const tokenPrice = useTokenPrice(network.id, token);

  const superTokenQuery = subgraphApi.useTokenQuery(
    !isNativeAssetSuperToken && superTokenAddress
      ? {
          chainId: network.id,
          id: superTokenAddress,
        }
      : skipToken
  );

  const superToken = useMemo(
    () =>
      isNativeAssetSuperToken
        ? network.nativeCurrency.superToken
        : superTokenQuery.data,
    [isNativeAssetSuperToken, superTokenQuery.data]
  );

  const underlyingTokenQuery = subgraphApi.useTokenQuery(
    !isNativeAssetSuperToken && superTokenQuery.data
      ? {
          chainId: network.id,
          id: superTokenQuery.data.underlyingAddress,
        }
      : skipToken
  );

  const underlyingToken = useMemo(
    () =>
      isNativeAssetSuperToken
        ? network.nativeCurrency
        : underlyingTokenQuery.data,
    [isNativeAssetSuperToken, underlyingTokenQuery.data]
  );

  const isSuperTokenListed = useMemo(
    () => isNativeAssetSuperToken || superTokenQuery.data?.isListed,
    [isNativeAssetSuperToken, superTokenQuery.data]
  );

  return (
    <TableRow data-cy={`${network.slugName}-row`}>
      <TableCell>
        <ListItem sx={{ p: 0 }}>
          <ActivityIcon icon={SwapVertIcon} />
          <ListItemText
            data-cy={"activity"}
            primary={"Wrap"}
            secondary={format(timestamp * 1000, "HH:mm")}
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
                  tokenSymbol={underlyingToken?.symbol}
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
                  tokenSymbol={superToken?.symbol}
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
              tokenSymbol={superToken?.symbol}
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
