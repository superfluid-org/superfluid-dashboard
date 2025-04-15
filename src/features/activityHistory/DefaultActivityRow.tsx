import HistoryIcon from "@mui/icons-material/History";
import {
  ListItem,
  ListItemText,
  TableCell,
  TableRow,
} from "@mui/material";
import { format } from "date-fns";
import { FC, memo, useMemo } from "react";
import { Activity } from "../../utils/activityUtils";
import TxHashLink from "../common/TxHashLink";
import NetworkBadge from "../network/NetworkBadge";
import ActivityIcon from "./ActivityIcon";

interface DefaultActivityRowProps extends Activity {
  dateFormat?: string;
}

const DefaultActivityRow: FC<DefaultActivityRowProps> = ({
  keyEvent,
  network,
  dateFormat = "HH:mm",
}) => {
  const { name: rawName, timestamp, transactionHash } = keyEvent;

  const name = useMemo(() => {
    return rawName.replace(/([A-Z])/g, ' $1').trim()
  }, [rawName]);

  return (
    <TableRow>
      <TableCell>
        <ListItem sx={{ p: 0 }}>
          <ActivityIcon icon={HistoryIcon} />
          <ListItemText
            primary={name}
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
      </TableCell>
      <TableCell>
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