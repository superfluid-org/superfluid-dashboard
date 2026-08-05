import {
  Chip,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Paper,
  Skeleton,
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
import { BigNumber } from "ethers";
import { FC, memo, useEffect, useMemo } from "react";
import NetworkHeadingRow from "../../components/Table/NetworkHeadingRow";
import { getTokensFromTokenList } from "../../hooks/useTokenQuery";
import Amount from "../token/Amount";
import TokenIcon from "../token/TokenIcon";
import FiatAmount from "../tokenPrice/FiatAmount";
import useTokenPrice from "../tokenPrice/useTokenPrice";
import { Network } from "../network/networks";
import { rpcApi } from "../redux/store";
import {
  TokenType,
  UnderlyingTokenMinimal,
} from "../redux/endpoints/tokenTypes";
import { FetchingStatus } from "./TokenSnapshotTables";

interface ERC20BalanceTableProps {
  address: Address;
  network: Network;
  fetchingCallback: (networkId: number, fetchingStatus: FetchingStatus) => void;
}

interface ERC20BalanceRowProps {
  network: Network;
  token: UnderlyingTokenMinimal;
  balance: string;
}

const ERC20BalanceRow: FC<ERC20BalanceRowProps> = ({
  network,
  token,
  balance,
}) => {
  const tokenPrice = useTokenPrice(network.id, token.address);

  return (
    <TableRow hover data-cy={`${token.symbol}-erc20-cell`}>
      <TableCell>
        <ListItem disablePadding>
          <ListItemAvatar>
            <TokenIcon chainId={network.id} tokenAddress={token.address} />
          </ListItemAvatar>
          <ListItemText
            primary={token.symbol}
            secondary={token.name}
            primaryTypographyProps={{ variant: "h6" }}
            secondaryTypographyProps={{
              variant: "body2",
              color: "text.secondary",
            }}
          />
        </ListItem>
      </TableCell>
      <TableCell>
        <ListItemText
          primary={<Amount wei={balance} decimals={token.decimals} />}
          secondary={
            tokenPrice ? (
              <FiatAmount
                wei={balance}
                decimals={token.decimals}
                price={tokenPrice}
              />
            ) : null
          }
          primaryTypographyProps={{ variant: "h6mono" }}
          secondaryTypographyProps={{
            variant: "body2mono",
            color: "text.secondary",
          }}
        />
      </TableCell>
      <TableCell align="right">
        <Chip
          label="ERC-20"
          size="small"
          variant="outlined"
          color="secondary"
        />
      </TableCell>
    </TableRow>
  );
};

const ERC20BalanceTable: FC<ERC20BalanceTableProps> = ({
  address,
  network,
  fetchingCallback,
}) => {
  const theme = useTheme();
  const isBelowMd = useMediaQuery(theme.breakpoints.down("md"));
  const tokens = useMemo(
    () =>
      getTokensFromTokenList(network.id).filter(
        (token): token is UnderlyingTokenMinimal =>
          token.type === TokenType.ERC20UnderlyingToken
      ),
    [network.id]
  );
  const tokenAddresses = useMemo(
    () => tokens.map((token) => token.address),
    [tokens]
  );
  const balancesQuery = rpcApi.useUnderlyingBalancesQuery(
    {
      chainId: network.id,
      accountAddress: address,
      tokenAddresses,
    },
    { refetchOnFocus: true }
  );
  const tokensWithBalances = useMemo(() => {
    const balances = balancesQuery.currentData?.balances;
    if (!balances) return [];

    return tokens
      .map((token) => ({ token, balance: balances[token.address] ?? "0" }))
      .filter(({ balance }) => !BigNumber.from(balance).isZero())
      .sort((a, b) => a.token.symbol.localeCompare(b.token.symbol));
  }, [balancesQuery.currentData, tokens]);

  useEffect(() => {
    fetchingCallback(network.id, {
      isLoading: balancesQuery.isLoading,
      hasContent: tokensWithBalances.length > 0,
    });
  }, [
    balancesQuery.isLoading,
    fetchingCallback,
    network.id,
    tokensWithBalances.length,
  ]);

  if (balancesQuery.isLoading) {
    return <Skeleton variant="rounded" height={124} />;
  }

  if (tokensWithBalances.length === 0) return null;

  return (
    <TableContainer
      data-cy={`${network.slugName}-erc20-balance-table`}
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
          <NetworkHeadingRow colSpan={3} network={network} />
          {!isBelowMd ? (
            <TableRow>
              <TableCell width="45%">Asset</TableCell>
              <TableCell>Balance</TableCell>
              <TableCell width="120" align="right">
                Type
              </TableCell>
            </TableRow>
          ) : null}
        </TableHead>
        <TableBody>
          {tokensWithBalances.map(({ token, balance }) => (
            <ERC20BalanceRow
              key={token.address}
              network={network}
              token={token}
              balance={balance}
            />
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default memo(ERC20BalanceTable);
