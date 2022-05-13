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
  styled,
} from "@mui/material";
import { AccountTokenSnapshot, Address } from "@superfluid-finance/sdk-core";
import { FC, memo, useState } from "react";
import { Network } from "../network/networks";
import { rpcApi } from "../redux/store";
import EtherFormatted from "../token/EtherFormatted";
import FlowingBalance from "../token/FlowingBalance";
import TokenIcon from "../token/TokenIcon";
import TokenStreamsTable from "./TokenStreamsTable";
import { BigNumber } from "ethers";
import { UnitOfTime } from "../send/FlowRateInput";

interface OpenIconProps {
  open: boolean;
}

const OpenIcon = styled(ExpandCircleDownOutlinedIcon)<OpenIconProps>(
  ({ theme, open }) => ({
    transform: `rotate(${open ? 180 : 0}deg)`,
    transition: theme.transitions.create("transform", {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
  })
);

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

  const {
    account,
    token,
    tokenSymbol,
    totalInflowRate,
    totalOutflowRate,
    totalNumberOfActiveStreams,
    totalNumberOfClosedStreams,
  } = snapshot;

  const realtimeBalance = rpcApi.useRealtimeBalanceQuery({
    chainId: network.chainId,
    accountAddress: account,
    tokenAddress: token,
  });

  const balance =
    realtimeBalance?.data?.balance ?? snapshot.balanceUntilUpdatedAt;
  const balanceTimestamp =
    realtimeBalance?.data?.balanceTimestamp ?? snapshot.updatedAtTimestamp;
  const netFlowRate =
    realtimeBalance?.data?.flowRate ?? snapshot.totalNetFlowRate;

  const hasStreams =
    totalNumberOfActiveStreams + totalNumberOfClosedStreams > 0;

  const toggleOpen = () => hasStreams && setOpen(!open);

  return (
    <>
      <TableRow
        hover
        onClick={toggleOpen}
        sx={{
          cursor: hasStreams ? "pointer" : "initial",
          ...(lastElement && {
            td: {
              border: "none",
              ":first-of-type": { borderRadius: "0 0 0 20px" },
              ":last-of-type": { borderRadius: "0 0 20px" },
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
              primary={tokenSymbol}
              /**
               * TODO: Remove fixed lineHeight from primaryTypographyProps after adding secondary text back
               * This is just used to make table row look better
               */
              // secondary="$1.00"
              primaryTypographyProps={{ lineHeight: "46px" }}
              secondaryTypographyProps={{
                variant: "body2mono",
                color: "text.secondary",
              }}
            />
          </ListItem>
        </TableCell>
        <TableCell>
          <ListItemText
            primary={
              <FlowingBalance
                balance={balance}
                flowRate={netFlowRate}
                balanceTimestamp={balanceTimestamp}
                etherDecimalPlaces={8}
                disableRoundingIndicator
              />
            }
            // secondary="$1.00"
            primaryTypographyProps={{ variant: "h6mono" }}
            secondaryTypographyProps={{
              variant: "body2mono",
              color: "text.secondary",
            }}
          />
        </TableCell>
        <TableCell>
          {totalNumberOfActiveStreams > 0 ? (
            <Typography variant="body2mono">
              {netFlowRate.charAt(0) !== "-" && "+"}
              <EtherFormatted
                wei={BigNumber.from(netFlowRate).mul(UnitOfTime.Month)}
                etherDecimalPlaces={8}
                disableRoundingIndicator
              />
              /mo
            </Typography>
          ) : (
            "-"
          )}
        </TableCell>
        <TableCell>
          {totalNumberOfActiveStreams > 0 ? (
            <Stack>
              <Typography variant="body2mono" color="primary">
                +
                <EtherFormatted
                  wei={BigNumber.from(totalInflowRate).mul(UnitOfTime.Month)}
                  etherDecimalPlaces={8}
                  disableRoundingIndicator
                />
                /mo
              </Typography>
              <Typography variant="body2mono" color="error">
                -
                <EtherFormatted
                  wei={BigNumber.from(totalOutflowRate).mul(UnitOfTime.Month)}
                  etherDecimalPlaces={8}
                  disableRoundingIndicator
                />
                /mo
              </Typography>
            </Stack>
          ) : (
            "-"
          )}
        </TableCell>
        <TableCell>
          {hasStreams && (
            <IconButton onClick={toggleOpen}>
              <OpenIcon open={open} />
            </IconButton>
          )}
        </TableCell>
      </TableRow>
      <TableRow sx={{ "> td:first-of-type": { padding: 0 } }}>
        <TableCell
          colSpan={5}
          sx={{
            border: "none",
          }}
        >
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
