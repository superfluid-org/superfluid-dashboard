import KeyboardDoubleArrowDownIcon from "@mui/icons-material/KeyboardDoubleArrowDown";
import {
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
import NetworkIcon from "../network/NetworkIcon";
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
    chainId: network.id,
    filter: {
      account: address,
    },
    pagination: {
      take: Infinity,
      skip: 0,
    },
  });

  const tokenSnapshots = tokensQuery.data?.items || [];

  if (tokensQuery.isLoading || tokenSnapshots.length === 0) return null;

  return (
    <TableContainer>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell colSpan={5} sx={{ border: "none", p: 0 }}>
              <Stack
                direction="row"
                alignItems="center"
                gap={2}
                sx={{ py: 2.75, px: 4 }}
              >
                <NetworkIcon network={network} />
                <Typography variant="h5" color="text.primary">
                  {network.name}
                </Typography>
              </Stack>
            </TableCell>
          </TableRow>
          <TableRow>
            <TableCell width="200">Asset</TableCell>
            <TableCell width="400">Balance</TableCell>
            <TableCell width="300">Net Flow</TableCell>
            <TableCell width="300">Inflow/Outflow</TableCell>
            <TableCell width="120" align="center">
              <KeyboardDoubleArrowDownIcon />
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {tokenSnapshots.map((snapshot, index) => (
            <TokenSnapshotRow
              key={snapshot.id}
              network={network}
              snapshot={snapshot}
              lastElement={tokenSnapshots.length <= index + 1}
            />
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default memo(TokenSnapshotTable);
