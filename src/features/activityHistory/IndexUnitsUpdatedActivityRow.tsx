import EditIcon from "@mui/icons-material/Edit";
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
import { format } from "date-fns";
import { BigNumber } from "ethers";
import { FC, useCallback, useMemo } from "react";
import AddressAvatar from "../../components/AddressAvatar/AddressAvatar";
import AddressName from "../../components/AddressName/AddressName";
import { IndexUnitsUpdatedActivity } from "../../utils/activityUtils";
import { BIG_NUMBER_ZERO } from "../../utils/tokenUtils";
import AddressCopyTooltip from "../common/AddressCopyTooltip";
import TxHashLink from "../common/TxHashLink";
import NetworkBadge from "../network/NetworkBadge";
import { subgraphApi } from "../redux/store";
import Amount from "../token/Amount";
import TokenIcon from "../token/TokenIcon";
import { useVisibleAddress } from "../wallet/VisibleAddressContext";
import ActivityIcon from "./ActivityIcon";

const IndexUnitsUpdatedActivityRow: FC<IndexUnitsUpdatedActivity> = ({
  keyEvent,
  subscriptionUnitsUpdatedEvent,
  network,
}) => {
  const theme = useTheme();
  const isBelowMd = useMediaQuery(theme.breakpoints.down("md"));

  const { visibleAddress } = useVisibleAddress();

  const {
    timestamp,
    publisher,
    subscriber,
    token,
    units,
    oldUnits,
    transactionHash,
  } = keyEvent;

  const tokenQuery = subgraphApi.useTokenQuery({
    chainId: network.id,
    id: token,
  });

  const getUnitsLabel = (units: string) =>
    BigNumber.from(units).eq(BigNumber.from(1)) ? "unit" : "units";

  const unitsDiffString = useMemo(() => {
    const diff = BigNumber.from(units).sub(BigNumber.from(oldUnits));
    const sign = diff.gte(BIG_NUMBER_ZERO) ? "+" : "-";
    return `${sign}${diff} ${getUnitsLabel(diff.toString())}`;
  }, [units, oldUnits]);

  const isPublisher = visibleAddress?.toLowerCase() === publisher.toLowerCase();

  return (
    <TableRow>
      <TableCell>
        <ListItem sx={{ p: 0 }}>
          <ActivityIcon icon={EditIcon} />
          <ListItemText
            primary="Subscription updated"
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
          <ListItemText
            primary={`${units} ${getUnitsLabel(units)}`}
            secondary={unitsDiffString}
            primaryTypographyProps={{
              variant: "h6mono",
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
            <AddressAvatar address={publisher} />
          </ListItemAvatar>
          <ListItemText
            primary={isPublisher ? "Subscriber" : "Publisher"}
            secondary={
              <AddressCopyTooltip
                address={isPublisher ? subscriber : publisher}
              >
                <Typography variant="h6" color="text.primary" component="span">
                  <AddressName address={isPublisher ? subscriber : publisher} />
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

export default IndexUnitsUpdatedActivityRow;
