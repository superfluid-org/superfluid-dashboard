import KeyboardDoubleArrowDownIcon from "@mui/icons-material/KeyboardDoubleArrowDown";
import {
  Avatar,
  Box,
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
import { Address } from "@superfluid-finance/sdk-core";
import { FC, memo } from "react";
import { Network } from "../network/networks";
import { subgraphApi } from "../redux/store";
import TokenSnapshotRow from "./TokenSnapshotRow";

interface TokenSnapshotTableProps {
  address: Address;
  network: Network;
}

const TokenSnapshotTable: FC<TokenSnapshotTableProps> = ({
  address,
  network,
}) => {
  const tokensQuery = subgraphApi.useAccountTokenSnapshotsQuery({
    chainId: network.chainId,
    filter: {
      account: address,
    },
    pagination: {
      take: Infinity,
      skip: 0,
    },
  });

  const tokenSnapshots = tokensQuery.data?.data || [];

  if (
    tokensQuery.isLoading ||
    tokensQuery.isFetching ||
    tokenSnapshots.length === 0
  )
    return null;

  return (
    <Box>
      <Paper sx={{ borderRadius: "20px" }}>
        <Stack
          direction="row"
          alignItems="center"
          gap={2}
          sx={{ py: 3, px: 4 }}
        >
          <Avatar src={network.icon} />
          <Typography variant="h5">{network.displayName}</Typography>
        </Stack>

        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Asset</TableCell>
                <TableCell width="300px">Balance</TableCell>
                <TableCell width="300px">Net Flow</TableCell>
                <TableCell width="300px">Inflow/Outflow</TableCell>
                <TableCell width="40px" align="center">
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

export default memo(TokenSnapshotTable);
