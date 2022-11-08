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
import { FC, memo, useEffect, useMemo } from "react";
import { tokenSnapshotsDefaultSort } from "../../utils/tokenUtils";
import { useMinigame } from "../minigame/MinigameContext";
import NetworkIcon from "../network/NetworkIcon";
import { Network } from "../network/networks";
import { subgraphApi } from "../redux/store";
import TokenSnapshotRow from "./TokenSnapshotRow";
import { FetchingStatus } from "./TokenSnapshotTables";
import { sumBy } from "lodash";

interface TokenSnapshotTableProps {
  address: Address;
  network: Network;
  fetchingCallback: (networkId: number, fetchingStatus: FetchingStatus) => void;
}

const TokenSnapshotTable: FC<TokenSnapshotTableProps> = ({
  address,
  network,
  fetchingCallback,
}) => {
  const theme = useTheme();
  const isBelowMd = useMediaQuery(theme.breakpoints.down("md"));

  const listedTokensSnapshotsQuery = subgraphApi.useAccountTokenSnapshotsQuery(
    {
      chainId: network.id,
      filter: {
        account: address,
        token_: {
          isListed: true,
        },
      },
      pagination: {
        take: Infinity,
        skip: 0,
      },
    },
    {
      selectFromResult: (result) => ({
        ...result,
        listedTokenSnapshots:
          result.data?.data
            .map((snapshot) => ({
              ...snapshot,
              isListed: true,
            }))
            .sort(tokenSnapshotsDefaultSort) || [],
      }),
    }
  );

  const unlistedTokensSnapshotsQuery =
    subgraphApi.useAccountTokenSnapshotsQuery(
      {
        chainId: network.id,
        filter: {
          account: address,
          token_: {
            isListed: false,
          },
        },
        pagination: {
          take: Infinity,
          skip: 0,
        },
      },
      {
        selectFromResult: (result) => ({
          ...result,
          unlistedTokenSnapshots:
            result.data?.data
              .map((snapshot) => ({
                ...snapshot,
                isListed: false,
              }))
              .sort(tokenSnapshotsDefaultSort) || [],
        }),
      }
    );

  const tokenSnapshots = useMemo(
    () =>
      listedTokensSnapshotsQuery.listedTokenSnapshots.concat(
        unlistedTokensSnapshotsQuery.unlistedTokenSnapshots
      ),
    [listedTokensSnapshotsQuery, unlistedTokensSnapshotsQuery]
  );

  const { setCosmetics } = useMinigame();

  useEffect(() => {
    fetchingCallback(network.id, {
      isLoading:
        listedTokensSnapshotsQuery.isLoading ||
        unlistedTokensSnapshotsQuery.isLoading,
      hasContent: !!tokenSnapshots.length,
    });

    if (!network.testnet && tokenSnapshots.length) {
      const activeStreamCount = sumBy(
        tokenSnapshots,
        (x) => x.totalNumberOfActiveStreams
      );
      if (activeStreamCount === 1) {
        setCosmetics(1);
      } else if (activeStreamCount >= 2 && activeStreamCount <= 4) {
        setCosmetics(2);
      } else if (activeStreamCount >= 5 && activeStreamCount <= 9) {
        setCosmetics(3);
      } else if (activeStreamCount > 9) {
        setCosmetics(4);
      }
    }
  }, [
    network.id,
    listedTokensSnapshotsQuery.isLoading,
    unlistedTokensSnapshotsQuery.isLoading,
    tokenSnapshots.length,
    fetchingCallback,
  ]);

  if (
    listedTokensSnapshotsQuery.isLoading ||
    unlistedTokensSnapshotsQuery.isLoading ||
    tokenSnapshots.length === 0
  )
    return null;

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
                  translate="no"
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
