import AddRoundedIcon from "@mui/icons-material/AddRounded";
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
import { IndexCreatedEvent } from "@superfluid-finance/sdk-core";
import { format } from "date-fns";
import { FC } from "react";
import { Activity } from "../../utils/activityUtils";
import TxHashLink from "../common/TxHashLink";
import NetworkBadge from "../network/NetworkBadge";
import TokenIcon from "../token/TokenIcon";
import ActivityIcon from "./ActivityIcon";
import { useTokenQuery } from "../../hooks/useTokenQuery";

interface IndexCreatedActivityRowProps extends Activity<IndexCreatedEvent> {
  dateFormat?: string;
}

const IndexCreatedActivityRow: FC<IndexCreatedActivityRowProps> = ({
  keyEvent,
  network,
  dateFormat = "HH:mm",
}) => {
  const theme = useTheme();
  const isBelowMd = useMediaQuery(theme.breakpoints.down("md"));

  const { timestamp, token, transactionHash } = keyEvent;

  const tokenQuery = useTokenQuery({
    chainId: network.id,
    id: token,
    onlySuperToken: true
  });

  return (
    <TableRow>
      <TableCell>
        <ListItem sx={{ p: 0 }}>
          <ActivityIcon icon={AddRoundedIcon} />
          <ListItemText
            data-cy={"activity"}
            primary="Index Created"
            secondary={format(timestamp * 1000, dateFormat)}
            primaryTypographyProps={{
              variant: isBelowMd ? "h7" : "h6",
              translate: "yes",
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
                  chainId={network.id}
                  tokenAddress={token}
                  isUnlisted={!tokenQuery.data?.isListed}
                  isLoading={tokenQuery.isLoading}
                />
              </ListItemAvatar>
              <ListItemText data-cy={"amount"} primary={tokenQuery.data?.symbol} />
            </ListItem>
          </TableCell>
          <TableCell></TableCell>
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
          <Stack direction="row" alignItems="center" gap={1}>
            <ListItemText primary={tokenQuery.data?.symbol} />
            <TokenIcon
              isSuper
              chainId={network.id}
              tokenAddress={token}
              isUnlisted={!tokenQuery.data?.isListed}
              isLoading={tokenQuery.isLoading}
            />
          </Stack>
        </TableCell>
      )}
    </TableRow>
  );
};

export default IndexCreatedActivityRow;
