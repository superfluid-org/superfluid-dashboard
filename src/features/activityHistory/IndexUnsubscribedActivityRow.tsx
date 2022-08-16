import {
  ListItem,
  ListItemAvatar,
  ListItemText,
  TableCell,
  TableRow,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { FC } from "react";
import {
  IndexSubscribedActivity,
  IndexUnsubscribedActivity,
} from "../../utils/activityUtils";
import EditIcon from "@mui/icons-material/Edit";
import ActivityIcon from "./ActivityIcon";
import { format } from "date-fns";
import TxHashLink from "../common/TxHashLink";
import NetworkBadge from "../network/NetworkBadge";
import AddressAvatar from "../../components/AddressAvatar/AddressAvatar";
import AddressName from "../../components/AddressName/AddressName";
import AddressCopyTooltip from "../common/AddressCopyTooltip";

const IndexUnsubscribedActivityRow: FC<IndexUnsubscribedActivity> = ({
  keyEvent,
  subscriptionRevokedEvent,
  network,
}) => {
  const theme = useTheme();
  const isBelowMd = useMediaQuery(theme.breakpoints.down("md"));

  const { timestamp, token, publisher, subscriber, transactionHash } = keyEvent;

  return (
    <TableRow>
      <TableCell>
        <ListItem sx={{ p: 0 }}>
          <ActivityIcon icon={EditIcon} />
          <ListItemText
            primary="Subscription Revoked"
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
      <TableCell></TableCell>
      <TableCell>
        <ListItem sx={{ p: 0 }}>
          <ListItemAvatar>
            <AddressAvatar address={publisher} />
          </ListItemAvatar>
          <ListItemText
            primary={"Publisher"}
            secondary={
              <AddressCopyTooltip address={publisher}>
                <Typography variant="h6" color="text.primary" component="span">
                  <AddressName address={publisher} />
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
    </TableRow>
  );
};

export default IndexUnsubscribedActivityRow;
