import ExpandCircleDownOutlinedIcon from "@mui/icons-material/ExpandCircleDownOutlined";
import {
  Collapse,
  IconButton,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Stack,
  TableCell,
  TableRow,
  Typography,
} from "@mui/material";
import { AccountTokenSnapshot, Address } from "@superfluid-finance/sdk-core";
import { FC, memo, useState } from "react";
import { Network } from "../network/networks";
import EtherFormatted from "../token/EtherFormatted";
import FlowingBalance from "../token/FlowingBalance";
import TokenIcon from "../token/TokenIcon";
import TokenStreamsTable from "./TokenStreamsTable";

interface TokenSnapshotRowProps {
  address: Address;
  network: Network;
  snapshot: AccountTokenSnapshot;
  lastElement: boolean;
}

const TokenSnapshotRow: FC<TokenSnapshotRowProps> = ({
  address,
  network,
  snapshot,
  lastElement,
}) => {
  const [open, setOpen] = useState(false);

  const toggleOpen = () => setOpen(!open);

  const {
    tokenSymbol,
    balanceUntilUpdatedAt,
    totalNetFlowRate,
    totalInflowRate,
    totalOutflowRate,
    updatedAtTimestamp,
    totalNumberOfActiveStreams,
    totalNumberOfClosedStreams,
  } = snapshot;

  return (
    <>
      <TableRow
        hover
        sx={{
          ...(lastElement && {
            td: {
              border: "none",
              ":first-child": { borderRadius: "0 0 0 20px" },
              ":last-child": { borderRadius: "0 0 20px" },
            },
          }),
        }}
      >
        <TableCell>
          <ListItem sx={{ p: 0 }}>
            <ListItemAvatar>
              <TokenIcon tokenSymbol={tokenSymbol} />
            </ListItemAvatar>
            <ListItemText
              primaryTypographyProps={{ variant: "h6" }}
              primary={tokenSymbol}
              secondary="$1.00"
            />
          </ListItem>
        </TableCell>
        <TableCell>
          <ListItemText
            primaryTypographyProps={{ variant: "h6" }}
            primary={
              <FlowingBalance
                balance={balanceUntilUpdatedAt}
                flowRate={totalNetFlowRate}
                balanceTimestamp={updatedAtTimestamp}
              />
            }
            secondary="$1.00"
          />
        </TableCell>
        <TableCell>
          {totalNumberOfActiveStreams > 0 ? (
            <>
              <EtherFormatted wei={totalNetFlowRate} />
              /mo
            </>
          ) : (
            "-"
          )}
        </TableCell>
        <TableCell>
          {totalNumberOfActiveStreams > 0 ? (
            <Stack>
              <Typography variant="body2" color="primary">
                + <EtherFormatted wei={totalInflowRate} />
                /mo
              </Typography>
              <Typography variant="body2" color="error">
                - <EtherFormatted wei={totalOutflowRate} />
                /mo
              </Typography>
            </Stack>
          ) : (
            "-"
          )}
        </TableCell>
        <TableCell>
          {/* TODO: change for iconbutton and add top/bottom negative margin not to push the column too high */}
          {totalNumberOfActiveStreams + totalNumberOfClosedStreams > 0 && (
            <IconButton onClick={toggleOpen}>
              <ExpandCircleDownOutlinedIcon />
            </IconButton>
          )}
        </TableCell>
      </TableRow>
      <TableRow>
        <TableCell colSpan={5} sx={{ padding: 0, border: "none" }}>
          <Collapse in={open} timeout="auto" unmountOnExit>
            <TokenStreamsTable
              address={address}
              network={network}
              token={snapshot.token}
              lastElement={lastElement}
            />
          </Collapse>
        </TableCell>
      </TableRow>
    </>
  );
};

export default memo(TokenSnapshotRow);
