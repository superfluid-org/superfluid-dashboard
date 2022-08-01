import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import {
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
import { skipToken } from "@reduxjs/toolkit/dist/query";
import { TransferEvent } from "@superfluid-finance/sdk-core";
import { format } from "date-fns";
import { FC, memo, useMemo } from "react";
import AddressAvatar from "../../components/AddressAvatar/AddressAvatar";
import AddressName from "../../components/AddressName/AddressName";
import { Activity } from "../../utils/activityUtils";
import AddressCopyTooltip from "../common/AddressCopyTooltip";
import TxHashLink from "../common/TxHashLink";
import NetworkBadge from "../network/NetworkBadge";
import { subgraphApi } from "../redux/store";
import Amount from "../token/Amount";
import TokenIcon from "../token/TokenIcon";
import { useVisibleAddress } from "../wallet/VisibleAddressContext";
import ActivityIcon from "./ActivityIcon";

const TransferActivityRow: FC<Activity<TransferEvent>> = ({
  keyEvent,
  network,
}) => {
  const { from, to, token, value, timestamp, transactionHash } = keyEvent;

  const theme = useTheme();
  const isBelowMd = useMediaQuery(theme.breakpoints.down("md"));
  const { visibleAddress } = useVisibleAddress();

  const tokenQuery = subgraphApi.useTokenQuery(
    token
      ? {
          chainId: network.id,
          id: token,
        }
      : skipToken
  );

  const isOutgoing = useMemo(
    () => visibleAddress?.toLowerCase() === from.toLowerCase(),
    [visibleAddress, from]
  );

  return (
    <TableRow data-cy={`${network.slugName}-row`}>
      <TableCell>
        <ListItem sx={{ p: 0 }}>
          <ActivityIcon icon={isOutgoing ? ArrowForwardIcon : ArrowBackIcon} />
          <ListItemText
            data-cy={"activity"}
            primary={isOutgoing ? "Send Transfer" : "Receive Transfer"}
            secondary={timestamp}
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
            {tokenQuery.data && (
              <ListItem sx={{ p: 0 }}>
                <ListItemAvatar>
                  <TokenIcon tokenSymbol={tokenQuery.data.symbol} />
                </ListItemAvatar>
                <ListItemText
                  data-cy={"amount"}
                primary={
                  <Amount wei={value} decimals={tokenQuery.data.decimals}>
                      {" "}
                      {tokenQuery.data.symbol}
                    </Amount>
                  }
                  /**
                   * TODO: Remove fixed lineHeight from primaryTypographyProps after adding secondary text back
                   * This is just used to make table row look better
                   */
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
            <ListItem sx={{ p: 0 }}>
              <ListItemAvatar>
                <AddressAvatar address={isOutgoing ? to : from} />
              </ListItemAvatar>
              <ListItemText
                data-cy={"amountToFrom"}
                primary={isOutgoing ? "To" : "From"}
                secondary={
                  <AddressCopyTooltip address={isOutgoing ? to : from}>
                    <Typography
                      variant="h6"
                      color="text.primary"
                      component="span"
                    >
                      <AddressName address={isOutgoing ? to : from} />
                    </Typography>
                  </AddressCopyTooltip>
                }
                primaryTypographyProps={{
                  variant: "body2",
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
          {tokenQuery.data && (<Stack direction="row" alignItems="center" gap={2}>
            <ListItemText
                data-cy={"mobile-amount"}
              primary={
                <Amount wei={value} decimals={tokenQuery.data.decimals}>
                    {" "}
                    {tokenQuery.data.symbol}
                  </Amount>
                }
                primaryTypographyProps={{ variant: "h7mono" }}
                secondaryTypographyProps={{ variant: "body2mono" }}
              />
              <TokenIcon tokenSymbol={tokenQuery.data.symbol} />
            </Stack>
          )}
        </TableCell>
      )}
    </TableRow>
  );
};

export default memo(TransferActivityRow);
