import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import {
  ListItem,
  ListItemAvatar,
  ListItemText,
  TableCell,
  TableRow,
} from "@mui/material";
import { format } from "date-fns";
import { FC, memo } from "react";
import AddressAvatar from "../../components/Avatar/AddressAvatar";
import AddressName from "../../components/AddressName/AddressName";
import { Activity } from "../../utils/activityUtils";
import TxHashLink from "../common/TxHashLink";
import NetworkBadge from "../network/NetworkBadge";
import TokenIcon from "../token/TokenIcon";
import ActivityIcon from "./ActivityIcon";

interface DefaultActivityRowProps extends Activity {
  dateFormat?: string;
}

const DefaultActivityRow: FC<DefaultActivityRowProps> = ({
  keyEvent,
  network,
  dateFormat = "HH:mm",
}) => {
  const { name, timestamp, transactionHash } = keyEvent;
  return (
    <TableRow>
      <TableCell>
        <ListItem sx={{ p: 0 }}>
          <ActivityIcon icon={ArrowForwardIcon} />
          <ListItemText
            primary={`FIX: ${name}`}
            secondary={format(timestamp * 1000, dateFormat)}
            primaryTypographyProps={{
              variant: "h6",
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
            <TokenIcon isUnlisted isSuper chainId={137} tokenAddress="0x1305F6B6Df9Dc47159D12Eb7aC2804d4A33173c2" /> {/* DAIx */}
          </ListItemAvatar>
          <ListItemText
            primary={"-12.59 ETH"}
            /**
             * TODO: Remove fixed lineHeight from primaryTypographyProps after adding secondary text back
             * This is just used to make table row look better
             */
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
              address={"0x618ada3f9f7BC1B2f2765Ba1728BEc5057B3DE40"}
            />
          </ListItemAvatar>
          <ListItemText
            primary={"To"}
            secondary={
              <AddressName
                address={"0x618ada3f9f7BC1B2f2765Ba1728BEc5057B3DE40"}
              />
            }
            primaryTypographyProps={{
              variant: "h6",
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
    </TableRow>
  );
};

export default memo(DefaultActivityRow);
