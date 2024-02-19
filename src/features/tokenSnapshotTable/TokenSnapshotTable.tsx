import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { Address } from "@superfluid-finance/sdk-core";
import { sumBy } from "lodash";
import { FC, memo, useEffect, useMemo } from "react";
import NetworkHeadingRow from "../../components/Table/NetworkHeadingRow";
import { tokenSnapshotsDefaultSort } from "../../utils/tokenUtils";
import { useMinigame } from "../minigame/MinigameContext";
import { Network } from "../network/networks";
import { subgraphApi } from "../redux/store";
import TokenSnapshotRow from "./TokenSnapshotRow";
import { FetchingStatus } from "./TokenSnapshotTables";

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
        take: Infinity
      },
    },
    {
      refetchOnFocus: true, // Re-fetch list view more often where there might be something incoming.
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
          take: Infinity
        },
      },
      {
        refetchOnFocus: true, // Re-fetch list view more often where there might be something incoming.
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
      component={Paper}
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
          <NetworkHeadingRow colSpan={5} network={network} />
          {!isBelowMd && (
            <TableRow>
              <TableCell width="200">Asset</TableCell>
              <TableCell>Balance</TableCell>
              <TableCell width="300">Net Flow</TableCell>
              <TableCell width="300">Inflow/Outflow</TableCell>
              <TableCell width="120" align="center"></TableCell>
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
