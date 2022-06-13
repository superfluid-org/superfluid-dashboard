import ExpandCircleDownOutlinedIcon from "@mui/icons-material/ExpandCircleDownOutlined";
import {
  Collapse,
  IconButton,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Stack,
  styled,
  TableCell,
  TableRow,
  Typography,
  useTheme,
} from "@mui/material";
import { AccountTokenSnapshot } from "@superfluid-finance/sdk-core";
import { BigNumber } from "ethers";
import NextLink from "next/link";
import { useRouter } from "next/router";
import { FC, memo, useState } from "react";
import { Network } from "../network/networks";
import { rpcApi } from "../redux/store";
import { UnitOfTime } from "../send/FlowRateInput";
import StreamsTable from "../streamsTable/StreamsTable";
import EtherFormatted from "../token/EtherFormatted";
import FlowingBalance from "../token/FlowingBalance";
import TokenIcon from "../token/TokenIcon";

interface OpenIconProps {
  open: boolean;
}

const OpenIcon = styled(ExpandCircleDownOutlinedIcon)<OpenIconProps>(
  ({ theme, open }) => ({
    transform: `rotate(${open ? 180 : 0}deg)`,
    transition: theme.transitions.create("transform", {
      easing: theme.transitions.easing.easeInOut,
      duration: theme.transitions.duration.leavingScreen,
    }),
  })
);

interface SnapshotRowProps {
  lastElement?: boolean;
  open?: boolean;
}

const SnapshotRow = styled(TableRow)<SnapshotRowProps>(
  ({ lastElement, open, theme }) => ({
    cursor: "pointer",
    ...(lastElement && {
      td: {
        border: "none",
        ":first-of-type": { borderRadius: "0 0 0 20px" },
        ":last-of-type": { borderRadius: "0 0 20px 0" },
        transition: theme.transitions.create("border-radius", {
          duration: theme.transitions.duration.shortest,
          easing: theme.transitions.easing.easeOut,
          delay: theme.transitions.duration.shorter,
        }),
        ...(open && {
          ":first-of-type": { borderRadius: "0" },
          ":last-of-type": { borderRadius: "0" },
          transition: theme.transitions.create("border-radius", {
            duration: theme.transitions.duration.shortest,
            easing: theme.transitions.easing.easeInOut,
          }),
        }),
      },
    }),
  })
);

interface TokenSnapshotRowProps {
  network: Network;
  snapshot: AccountTokenSnapshot;
  lastElement: boolean;
}

const TokenSnapshotRow: FC<TokenSnapshotRowProps> = ({
  network,
  snapshot,
  lastElement,
}) => {
  const theme = useTheme();
  const router = useRouter();
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
    chainId: network.id,
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

  const openTokenPage = () =>
    router.push(`/${network.slugName}/token?token=${token}`);

  return (
    <>
      <SnapshotRow hover lastElement={lastElement} open={open} data-cy={`${tokenSymbol}-cell`}>
        <TableCell onClick={openTokenPage}>
          <ListItem sx={{ p: 0 }}>
            <ListItemAvatar>
              <TokenIcon tokenSymbol={tokenSymbol} />
            </ListItemAvatar>
            <ListItemText
              data-cy={"token-symbol"}
              onClick={openTokenPage}
              primary={tokenSymbol}
              /**
               * TODO: Remove fixed lineHeight from primaryTypographyProps after adding secondary text back
               * This is just used to make table row look better
               */
              // secondary="$1.00"
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
        <TableCell onClick={openTokenPage}>
          <ListItemText
            primary={
              <FlowingBalance
                balance={balance}
                flowRate={netFlowRate}
                balanceTimestamp={balanceTimestamp}
                etherDecimalPlaces={netFlowRate === "0" ? 8 : undefined}
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
        <TableCell data-cy={"net-flow"} onClick={openTokenPage}>
          {totalNumberOfActiveStreams > 0 ? (
            <Typography data-cy={"net-flow-value"} variant="body2mono">
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
        <TableCell onClick={openTokenPage}>
          {totalNumberOfActiveStreams > 0 ? (
            <Stack>
              <Typography data-cy={"inflow"} variant="body2mono" color="primary">
                +
                <EtherFormatted
                  wei={BigNumber.from(totalInflowRate).mul(UnitOfTime.Month)}
                  etherDecimalPlaces={8}
                  disableRoundingIndicator
                />
                /mo
              </Typography>
              <Typography data-cy={"outflow"} variant="body2mono" color="error">
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
        <TableCell align="center" sx={{ cursor: "initial" }}>
          {hasStreams && (
            <IconButton data-cy={"show-streams-button"} color="inherit" onClick={toggleOpen}>
              <OpenIcon open={open} />
            </IconButton>
          )}
        </TableCell>
      </SnapshotRow>
      <TableRow
        sx={{ background: "transparent", "> td:first-of-type": { padding: 0 } }}
      >
        <TableCell
          colSpan={5}
          sx={{
            border: "none",
            minHeight: 0,
          }}
        >
          <Collapse
            data-cy={"streams-table"}
            in={open}
            timeout={theme.transitions.duration.standard}
            unmountOnExit
          >
            <StreamsTable
              subTable
              network={network}
              tokenAddress={snapshot.token}
              lastElement={lastElement}
            />
          </Collapse>
        </TableCell>
      </TableRow>
    </>
  );
};

export default memo(TokenSnapshotRow);
