import KeyboardDoubleArrowDownIcon from "@mui/icons-material/KeyboardDoubleArrowDown";
import {
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  useMediaQuery,
  useTheme,
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
  const theme = useTheme();
  const isBelowMd = useMediaQuery(theme.breakpoints.down("md"));

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
    <TableContainer
      data-cy={network.slugName + "-token-snapshot-table"}
      sx={{
        [theme.breakpoints.down("md")]: {
          mx: -2,
          width: "auto",
          borderRadius: 0,
          border: "none",
          borderBottom: `1px solid ${theme.palette.divider}`,
          boxShadow: "none",
        },
      }}
    >
      <Table>
        <TableHead>
          <TableRow>
            <TableCell
              colSpan={5}
              sx={{
                p: 0,
                [theme.breakpoints.up("md")]: { border: "none" },
                [theme.breakpoints.down("md")]: { p: 0 },
              }}
            >
              <Stack
                direction="row"
                alignItems="center"
                gap={2}
                sx={{ py: 2, px: 4, [theme.breakpoints.down("md")]: { p: 2 } }}
              >
                <NetworkIcon network={network} />
                <Typography
                  data-cy="network-name"
                  variant="h5"
                  color="text.primary"
                >
                  {network.name}
                </Typography>
              </Stack>
            </TableCell>
          </TableRow>
          {!isBelowMd && (
            <TableRow>
              <TableCell width="200">Asset</TableCell>
              <TableCell>Balance</TableCell>
              <TableCell width="300">Net Flow</TableCell>
              <TableCell width="300">Inflow/Outflow</TableCell>
              <TableCell width="120" align="center">
                <KeyboardDoubleArrowDownIcon />
              </TableCell>
            </TableRow>
          )}
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
