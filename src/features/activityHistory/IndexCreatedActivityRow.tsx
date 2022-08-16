import AddRoundedIcon from "@mui/icons-material/AddRounded";
import {
  ListItem,
  ListItemAvatar,
  ListItemText,
  TableCell,
  TableRow,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { IndexCreatedEvent } from "@superfluid-finance/sdk-core";
import { format } from "date-fns";
import { FC } from "react";
import { Activity } from "../../utils/activityUtils";
import TxHashLink from "../common/TxHashLink";
import NetworkBadge from "../network/NetworkBadge";
import { subgraphApi } from "../redux/store";
import TokenIcon from "../token/TokenIcon";
import ActivityIcon from "./ActivityIcon";

const IndexCreatedActivityRow: FC<Activity<IndexCreatedEvent>> = ({
  keyEvent,
  network,
}) => {
  const theme = useTheme();
  const isBelowMd = useMediaQuery(theme.breakpoints.down("md"));

  const { indexId, timestamp, token, transactionHash } = keyEvent;

  const tokenQuery = subgraphApi.useTokenQuery({
    chainId: network.id,
    id: token,
  });

  return (
    <TableRow>
      <TableCell>
        <ListItem sx={{ p: 0 }}>
          <ActivityIcon icon={AddRoundedIcon} />
          <ListItemText
            primary="Index Created"
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
        </ListItem>
      </TableCell>
      <TableCell>
        <ListItem sx={{ p: 0 }}>
          <ListItemText
            primary={"ID"}
            secondary={indexId}
            primaryTypographyProps={{
              variant: "body2",
              color: "text.secondary",
            }}
            secondaryTypographyProps={{
              variant: "h6",
              color: "text.primary",
            }}
            sx={{ ml: 6.5 }}
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

export default IndexCreatedActivityRow;
