import PriorityHighIcon from "@mui/icons-material/PriorityHigh";
import {
  Avatar,
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
import { format } from "date-fns";
import { FC, memo, useMemo } from "react";
import AddressAvatar from "../../components/Avatar/AddressAvatar";
import AddressName from "../../components/AddressName/AddressName";
import { AgreementLiquidatedActivity } from "../../utils/activityUtils";
import AddressCopyTooltip from "../common/AddressCopyTooltip";
import TxHashLink from "../common/TxHashLink";
import NetworkBadge from "../network/NetworkBadge";
import { subgraphApi } from "../redux/store";
import TokenIcon from "../token/TokenIcon";
import { useVisibleAddress } from "../wallet/VisibleAddressContext";
import ActivityIcon from "./ActivityIcon";

interface LiquidatedActivityRowProps extends AgreementLiquidatedActivity {
  dateFormat?: string;
}

const LiquidatedActivityRow: FC<LiquidatedActivityRowProps> = ({
  keyEvent,
  flowUpdatedEvent,
  network,
  dateFormat = "HH:mm",
}) => {
  const { token, timestamp, transactionHash } = keyEvent;
  const { sender = "", receiver = "" } = flowUpdatedEvent || {};

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
    () => visibleAddress?.toLowerCase() === sender?.toLowerCase(),
    [visibleAddress, sender]
  );

  return (
    <TableRow data-cy={`${network.slugName}-row`}>
      <TableCell>
        <ListItem sx={{ p: 0 }}>
          <ActivityIcon icon={PriorityHighIcon} />
          <ListItemText
            data-cy={"activity"}
            primary={"Liquidated"}
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
                  isSuper
                  tokenSymbol={tokenQuery.data?.symbol}
                  isUnlisted={!tokenQuery.data?.isListed}
                  isLoading={tokenQuery.isLoading}
                />
              </ListItemAvatar>
              <ListItemText
                data-cy={"amount"}
                primary={"-"}
                /**
                 * TODO: Remove fixed lineHeight from primaryTypographyProps after adding secondary text back
                 * This is just used to make table row look better
                 */
                // secondary="$12.59"
                primaryTypographyProps={{
                  variant: "h6",
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
                <AddressAvatar
                  address={isOutgoing ? receiver : sender}
                  AvatarProps={{ variant: "rounded" }}
                />
              </ListItemAvatar>
              <ListItemText
                data-cy={"amountToFrom"}
                primary={isOutgoing ? "To" : "From"}
                secondary={
                  <AddressCopyTooltip address={isOutgoing ? receiver : sender}>
                    <Typography
                      variant="h6"
                      color="text.primary"
                      component="span"
                    >
                      <AddressName address={isOutgoing ? receiver : sender} />
                    </Typography>
                  </AddressCopyTooltip>
                }
                primaryTypographyProps={{
                  translate: "yes",
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
          <Stack direction="row" alignItems="center" justifyContent="end">
            <TokenIcon
              isSuper
              tokenSymbol={tokenQuery.data?.symbol}
              isUnlisted={!tokenQuery.data?.isListed}
              isLoading={tokenQuery.isLoading}
            />
          </Stack>
        </TableCell>
      )}
    </TableRow>
  );
};

export default memo(LiquidatedActivityRow);
