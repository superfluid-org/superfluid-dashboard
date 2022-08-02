import SwapVertIcon from "@mui/icons-material/SwapVert";
import {
  Avatar,
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
import ActivityIcon from "./ActivityIcon";

const MintActivityRow: FC<MintedActivity> = ({
  keyEvent,
  transferEvent,
  network,
}) => {
  const theme = useTheme();
  const isBelowMd = useMediaQuery(theme.breakpoints.down("md"));

  const { amount, transactionHash, timestamp } = keyEvent;
  const { token: superTokenAddress } = transferEvent || {};

  const isNativeAssetSuperToken =
    network.nativeCurrency.superToken.address.toLowerCase() ===
    superTokenAddress?.toLowerCase();

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
            {underlyingToken && (
              <ListItem sx={{ p: 0 }}>
                <ListItemAvatar>
                  <TokenIcon tokenSymbol={underlyingToken.symbol} />
                </ListItemAvatar>
                <ListItemText
                  data-cy={"amount"}
                  primary={
                    <>
                      -
                      <Amount wei={amount} />{" "}
                      {underlyingToken.symbol}
                    </>
                  }
                  /**
                   * TODO: Remove fixed lineHeight from primaryTypographyProps after adding secondary text back
                   * This is just used to make table row look better
                   */
                  // secondary="$12.59"
                  primaryTypographyProps={{
                    variant: "h6mono",
                    sx: { lineHeight: "46px" },
                  }}
                  secondaryTypographyProps={{
                    variant: "body2mono",
                    color: "text.secondary",
                  }}
                />
              </ListItem>
            )}
          </TableCell>
          <TableCell>
            {superToken && (
              <ListItem sx={{ p: 0 }}>
                <ListItemAvatar>
                  <TokenIcon tokenSymbol={superToken.symbol} />
                </ListItemAvatar>
                <ListItemText
                  data-cy={"amountToFrom"}
                  primary={
                    <>
                      +
                      <Amount wei={amount}>
                        {" "}
                        {superToken.symbol}
                      </Amount>
                    </>
                  }
                  /**
                   * TODO: Remove fixed lineHeight from primaryTypographyProps after adding secondary text back
                   * This is just used to make table row look better
                   */
                  // secondary="$12.59"
                  primaryTypographyProps={{
                    variant: "h6mono",
                    sx: { lineHeight: "46px" },
                  }}
                  secondaryTypographyProps={{
                    variant: "body2mono",
                    color: "text.secondary",
                  }}
                />
              </ListItem>
            )}
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
          {!!(superToken && underlyingToken) && (
            <Stack direction="row" alignItems="center" gap={2}>
              <ListItemText
                data-cy={"mobile-amount"}
                primary={
                  <>
                    +
                    <Amount wei={amount}>
                      {" "}
                      {superToken.symbol}
                    </Amount>
                  </>
                }
                secondary={
                  <>
                    -
                    <Amount wei={amount}>
                      {" "}
                      {underlyingToken.symbol}
                    </Amount>
                  </>
                }
                primaryTypographyProps={{ variant: "h7mono" }}
                secondaryTypographyProps={{ variant: "body2mono" }}
              />
              <TokenIcon tokenSymbol={superToken.symbol} />
            </Stack>
          )}
        </TableCell>
      )}
    </TableRow>
  );
};

export default memo(MintActivityRow);
