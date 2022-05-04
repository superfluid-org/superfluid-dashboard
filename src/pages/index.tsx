import AllInclusiveIcon from "@mui/icons-material/AllInclusive";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ExpandCircleDownOutlinedIcon from "@mui/icons-material/ExpandCircleDownOutlined";
import KeyboardDoubleArrowDownIcon from "@mui/icons-material/KeyboardDoubleArrowDown";
import {
  Avatar,
  Box,
  Collapse,
  Container,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import { useTheme } from "@mui/system";
import {
  AccountTokenSnapshot,
  Address,
  Stream,
} from "@superfluid-finance/sdk-core";
import { format } from "date-fns";
import type { NextPage } from "next";
import React, { FC, useState } from "react";
import { Network, networks } from "../features/network/networks";
import { subgraphApi } from "../features/redux/store";
import EtherFormatted from "../features/token/EtherFormatted";
import FlowingBalance from "../features/token/FlowingBalance";
import { useWalletContext } from "../features/wallet/WalletContext";
import shortenAddress from "../utils/shortenAddress";

const Home: NextPage = () => {
  const { walletAddress } = useWalletContext();

  if (!walletAddress) {
    return <Container maxWidth="lg">NO TACO YET</Container>;
  }

  return (
    <Container maxWidth="lg">
      <Stack gap={2.5}>
        {networks.map((network) => (
          <TokenSnapshotTable
            key={network.chainId}
            address={"0x3be39EA586E565683e0C57d1243Aa950Ba466c89".toLowerCase()}
            network={network}
          />
        ))}
      </Stack>
    </Container>
  );
};

interface TokenSnapshotTableProps {
  address: Address;
  network: Network;
}

const TokenSnapshotTable: FC<TokenSnapshotTableProps> = ({
  address,
  network,
}) => {
  const theme = useTheme();

  const tokensQuery = subgraphApi.useAccountTokenSnapshotsQuery({
    chainId: network.chainId,
    filter: {
      account: address,
    },
    pagination: {
      take: 10,
      skip: 0,
    },
  });

  const tokenSnapshots = tokensQuery.data?.data || [];

  if (!tokensQuery.isLoading && tokenSnapshots.length === 0) return null;

  return (
    <Box sx={{ my: 2 }}>
      <Paper sx={{ borderRadius: "20px" }}>
        <Stack
          direction="row"
          alignItems="center"
          gap={theme.spacing(2)}
          sx={{ py: 3, px: 4 }}
        >
          <Avatar />
          <Typography variant="h5">{network.displayName}</Typography>
        </Stack>

        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Asset</TableCell>
                <TableCell>Balance</TableCell>
                <TableCell>Net Flow</TableCell>
                <TableCell>Inflow/Outflow</TableCell>
                <TableCell width="24px">
                  <KeyboardDoubleArrowDownIcon />
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {tokenSnapshots.map((snapshot, index) => (
                <TokenSnapshotRow
                  key={snapshot.id}
                  address={address.toLowerCase()}
                  network={network}
                  snapshot={snapshot}
                  lastElement={tokenSnapshots.length <= index + 1}
                />
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Box>
  );
};

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
            td: { border: "none", borderRadius: "0 0 20px 20px" },
          }),
        }}
      >
        <TableCell>
          <ListItem sx={{ p: 0 }}>
            <ListItemAvatar>
              <Avatar />
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
              <Typography variant="body2">
                <EtherFormatted wei={totalInflowRate} />
                /mo
              </Typography>
              <Typography variant="body2">
                <EtherFormatted wei={totalOutflowRate} />
                /mo
              </Typography>
            </Stack>
          ) : (
            "-"
          )}
        </TableCell>
        <TableCell>
          {/* Mby change for iconbutton and add top/bottom negative margin not to push the column too high */}
          {totalNumberOfActiveStreams + totalNumberOfClosedStreams > 0 && (
            <ExpandCircleDownOutlinedIcon
              sx={{ display: "block" }}
              onClick={() => setOpen(!open)}
            />
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

interface TokenStreamsTableProps {
  address: Address;
  network: Network;
  token: Address;
  lastElement: boolean;
}

const TokenStreamsTable: FC<TokenStreamsTableProps> = ({
  address,
  network,
  token,
  lastElement,
}) => {
  const theme = useTheme();

  const incomingStreamsQuery = subgraphApi.useStreamsQuery({
    chainId: network.chainId,
    filter: {
      receiver: address,
      token: token,
    },
    pagination: {
      take: Infinity,
      skip: 0,
    },
    order: {
      orderBy: "updatedAtTimestamp",
      orderDirection: "desc",
    },
  });

  const outgoingStreamsQuery = subgraphApi.useStreamsQuery({
    chainId: network.chainId,
    filter: {
      sender: address,
      token: token,
    },
    pagination: {
      take: Infinity,
      skip: 0,
    },
    order: {
      orderBy: "updatedAtTimestamp",
      orderDirection: "desc",
    },
  });

  const data = [
    ...(incomingStreamsQuery.data?.data || []),
    ...(outgoingStreamsQuery.data?.data || []),
  ].sort((s1, s2) => s1.updatedAtTimestamp - s2.updatedAtTimestamp);

  return (
    <Table
      size="small"
      sx={{
        ...(lastElement && { borderTop: `1px solid ${theme.palette.divider}` }),
        ...(!lastElement && {
          borderBottom: `1px solid ${theme.palette.divider}`,
        }),
        background: theme.palette.action.hover,
        borderRadius: "0 0 20px 20px",
      }}
    >
      <TableHead>
        <TableRow>
          <TableCell sx={{ pl: "72px" }}>To / From</TableCell>
          <TableCell>Start / End Date</TableCell>
          <TableCell>Monthly Flow</TableCell>
          <TableCell>All Time Flow</TableCell>
          <TableCell>Filter</TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {data.map((stream) => (
          <StreamRow key={stream.id} address={address} stream={stream} />
        ))}
      </TableBody>
    </Table>
  );
};

interface StreamRowProps {
  address: Address;
  stream: Stream;
}

const StreamRow: FC<StreamRowProps> = ({ address, stream }) => {
  const {
    sender,
    receiver,
    currentFlowRate,
    streamedUntilUpdatedAt,
    updatedAtTimestamp,
  } = stream;

  const outgoing = sender === address;
  const ongoing = Number(currentFlowRate) > 0;

  return (
    <TableRow hover>
      <TableCell sx={{ pl: "72px" }}>
        <Stack direction="row" alignItems="center" gap={1.5}>
          <ArrowBackIcon />
          <Avatar variant="rounded" />
          <Typography variant="h6">
            {shortenAddress(outgoing ? receiver : sender)}
          </Typography>
        </Stack>
      </TableCell>
      <TableCell>
        <Stack direction="row" alignItems="center" gap={1}>
          {format(updatedAtTimestamp * 1000, "d MMM. yyyy")}
          {ongoing && <AllInclusiveIcon />}
        </Stack>
      </TableCell>
      <TableCell>
        {ongoing ? (
          <>
            <EtherFormatted wei={currentFlowRate} />
            /mo
          </>
        ) : (
          "-"
        )}
      </TableCell>
      <TableCell>
        <FlowingBalance
          balance={streamedUntilUpdatedAt}
          flowRate={currentFlowRate}
          balanceTimestamp={updatedAtTimestamp}
        />
      </TableCell>
      <TableCell>Cancel</TableCell>
    </TableRow>
  );
};

export default Home;
