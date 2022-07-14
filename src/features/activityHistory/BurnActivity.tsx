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
import { BurnedActivity } from "../../utils/activityUtils";
import TxHashLink from "../common/TxHashLink";
import NetworkBadge from "../network/NetworkBadge";
import { subgraphApi } from "../redux/store";
import Ether from "../token/Ether";
import TokenIcon from "../token/TokenIcon";
import ActivityIcon from "./ActivityIcon";

const BurnActivity: FC<BurnedActivity> = ({
  keyEvent,
  transferEvent,
  network,
}) => {
  const theme = useTheme();
  const isBelowMd = useMediaQuery(theme.breakpoints.down("md"));

  const { amount, transactionHash, timestamp } = keyEvent;
  const { token } = transferEvent || {};

  const nativeAsset = useMemo(
    () =>
      network.nativeAsset.superToken.address.toLowerCase() ===
      token?.toLowerCase()
        ? network.nativeAsset
        : undefined,
    [network, token]
  );

  const tokenQuery = subgraphApi.useTokenQuery(
    !nativeAsset && token
      ? {
          chainId: network.id,
          id: token,
        }
      : skipToken
  );

  const underlyingTokenQuery = subgraphApi.useTokenQuery(
    !nativeAsset && tokenQuery.data
      ? {
          chainId: network.id,
          id: tokenQuery.data.underlyingAddress,
        }
      : skipToken
  );

  const tokenSymbol = useMemo(
    () => nativeAsset?.superToken.symbol || tokenQuery.data?.symbol,
    [nativeAsset, tokenQuery.data]
  );

  const underlyingTokenSymbol = useMemo(
    () => nativeAsset?.symbol || underlyingTokenQuery.data?.symbol,
    [nativeAsset, underlyingTokenQuery.data]
  );

  return (
    <TableRow>
      <TableCell>
        <ListItem sx={{ p: 0 }}>
          <ActivityIcon icon={SwapVertIcon} />
          <ListItemText
            primary={"Unwrap"}
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
            <ListItem sx={{ p: 0 }}>
              <ListItemAvatar>
                {tokenSymbol && <TokenIcon tokenSymbol={tokenSymbol} />}
              </ListItemAvatar>
              <ListItemText
                primary={
                  <>
                    -<Ether wei={amount}> {tokenSymbol}</Ether>
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
          </TableCell>
          <TableCell>
            <ListItem sx={{ p: 0 }}>
              <ListItemAvatar>
                {underlyingTokenSymbol && (
                  <TokenIcon tokenSymbol={underlyingTokenSymbol} />
                )}
              </ListItemAvatar>
              <ListItemText
                primary={
                  <>
                    +<Ether wei={amount}> {underlyingTokenSymbol}</Ether>
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
            <ListItemText
              primary={
                <>
                  +<Ether wei={amount}> {underlyingTokenSymbol}</Ether>
                </>
              }
              secondary={
                <>
                  -<Ether wei={amount}> {tokenSymbol}</Ether>
                </>
              }
              primaryTypographyProps={{ variant: "h7mono" }}
              secondaryTypographyProps={{ variant: "body2mono" }}
            />
            {underlyingTokenSymbol && (
              <TokenIcon tokenSymbol={underlyingTokenSymbol} />
            )}
          </Stack>
        </TableCell>
      )}
    </TableRow>
  );
};

export default memo(BurnActivity);
