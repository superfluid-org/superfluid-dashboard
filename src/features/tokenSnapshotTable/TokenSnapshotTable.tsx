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
import { EMPTY_ARRAY } from "../../utils/constants";
import ERC20BalanceRow from "./ERC20BalanceRow";
import useERC20Balances, { ERC20Balance } from "./useERC20Balances";

interface TokenSnapshotTableProps {
  address: Address;
  network: Network;
  erc20Balances: ERC20Balance[];
  erc20BalancesLoading: boolean;
  useERC20Fallback: boolean;
  fetchingCallback: (networkId: number, fetchingStatus: FetchingStatus) => void;
}

const TokenSnapshotTable: FC<TokenSnapshotTableProps> = ({
  address,
  network,
  erc20Balances: portfolioERC20Balances,
  erc20BalancesLoading,
  useERC20Fallback,
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
          take: Infinity,
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
              .sort(tokenSnapshotsDefaultSort) || EMPTY_ARRAY,
        }),
      }
    );

  const tokenSnapshots = useMemo(() => {
    return listedTokensSnapshotsQuery.listedTokenSnapshots.concat(
      unlistedTokensSnapshotsQuery.unlistedTokenSnapshots
    );
  }, [
    network,
    listedTokensSnapshotsQuery.data?.items?.length ?? 0,
    unlistedTokensSnapshotsQuery.data?.items?.length ?? 0,
  ]);

  const {
    tokensWithBalances: fallbackERC20Balances,
    isLoading: fallbackERC20BalancesLoading,
  } = useERC20Balances({
    address,
    network,
    enabled: useERC20Fallback,
  });

  const erc20Balances = useMemo(() => {
    const superTokenAddresses = new Set(
      tokenSnapshots.map(({ token }) => token.toLowerCase())
    );
    const balances = useERC20Fallback
      ? fallbackERC20Balances
      : portfolioERC20Balances;

    return balances.filter(
      ({ token }) => !superTokenAddresses.has(token.address.toLowerCase())
    );
  }, [
    fallbackERC20Balances,
    portfolioERC20Balances,
    tokenSnapshots,
    useERC20Fallback,
  ]);

  const { setCosmetics } = useMinigame();

  const isLoading =
    listedTokensSnapshotsQuery.isLoading ||
    unlistedTokensSnapshotsQuery.isLoading ||
    erc20BalancesLoading ||
    fallbackERC20BalancesLoading;
  const hasContent = tokenSnapshots.length > 0 || erc20Balances.length > 0;
  useEffect(() => {
    fetchingCallback(network.id, {
      isLoading,
      hasContent,
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
    network,
    setCosmetics,
    fetchingCallback,
    isLoading,
    hasContent,
    tokenSnapshots,
  ]);

  if (isLoading || !hasContent) return null;

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
              <TableCell width="300">Net Flow Rate</TableCell>
              <TableCell width="260">Actions</TableCell>
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
              lastElement={
                erc20Balances.length === 0 && tokenSnapshots.length <= index + 1
              }
            />
          ))}
          {erc20Balances.map(({ token, balance, priceUsd }) => (
            <ERC20BalanceRow
              key={token.address}
              network={network}
              token={token}
              balance={balance}
              priceUsd={priceUsd}
            />
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default memo(TokenSnapshotTable);
