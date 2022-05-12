import CloseIcon from "@mui/icons-material/Close";
import {
  CircularProgress,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  Stack,
  TextField,
  Typography,
  useTheme,
} from "@mui/material";
import { skipToken } from "@reduxjs/toolkit/query";
import { ethers } from "ethers";
import Fuse from "fuse.js";
import { FC, useCallback, useEffect, useMemo, useState } from "react";
import ResponsiveDialog from "../common/ResponsiveDialog";
import { useNetworkContext } from "../network/NetworkContext";
import {
  isSuper,
  isUnderlying,
  TokenMinimal,
} from "../redux/endpoints/adHocSubgraphEndpoints";
import { rpcApi, subgraphApi } from "../redux/store";
import { useWalletContext } from "../wallet/WalletContext";
import { TokenListItem } from "./TokenListItem";

export type TokenSelectionProps = {
  showUpgrade?: boolean;
  tokenPairsQuery: {
    data: TokenMinimal[] | undefined;
    isUninitialized: boolean;
    isLoading: boolean;
  };
};

export const TokenDialog: FC<{
  open: boolean;
  onClose: () => void;
  onSelect: (token: TokenMinimal) => void;
  tokenSelection: TokenSelectionProps;
}> = ({
  open,
  onClose,
  onSelect,
  tokenSelection: { tokenPairsQuery, showUpgrade = false },
}) => {
  const theme = useTheme();
  const { network } = useNetworkContext();
  const { walletAddress } = useWalletContext();

  const [openCounter, setOpenCounter] = useState(0);
  useEffect(() => {
    if (open) {
      setOpenCounter(openCounter + 1);
      setSearchTerm(""); // Reset the search term when the dialog opens, not when it closes (because then there would be noticable visual clearing of the field). It's smoother UI to do it on opening.
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const underlyingTokens = useMemo(
    () => tokenPairsQuery.data?.filter(isUnderlying) ?? [],
    [tokenPairsQuery.data]
  );
  const superTokens = useMemo(
    () => tokenPairsQuery.data?.filter(isSuper) ?? [],
    [tokenPairsQuery.data]
  );
  const tokens = useMemo(
    () => [...superTokens, ...underlyingTokens],
    [superTokens, underlyingTokens]
  );

  const underlyingTokenBalancesQuery = rpcApi.useBalanceOfMulticallQuery(
    underlyingTokens.length && walletAddress
      ? {
          chainId: network.chainId,
          accountAddress: walletAddress,
          tokenAddresses: underlyingTokens.map((x) => x.address),
        }
      : skipToken
  );

  const underlyingTokenBalances = useMemo(
    () => underlyingTokenBalancesQuery.data?.balances ?? {},
    [underlyingTokenBalancesQuery.data]
  );

  const superTokenBalancesQuery = subgraphApi.useAccountTokenSnapshotsQuery(
    tokenPairsQuery.data && walletAddress
      ? {
          chainId: network.chainId,
          filter: {
            account: walletAddress,
            token_in: superTokens.map((x) => x.address),
          },
          pagination: {
            take: Infinity,
          },
        }
      : skipToken
  );

  const superTokenBalances = useMemo(
    () =>
      superTokenBalancesQuery.data
        ? Object.fromEntries(
            superTokenBalancesQuery.data.items.map((x) => [x.token, x])
          )
        : {},
    [superTokenBalancesQuery.data]
  );

  const tokenOrdered = useMemo(
    () =>
      tokens.sort((a, b) => {
        const aBalance = isSuper(a)
          ? superTokenBalances[a.address]?.balanceUntilUpdatedAt
          : underlyingTokenBalances[a.address];
        const bBalance = isSuper(b)
          ? superTokenBalances[b.address]?.balanceUntilUpdatedAt
          : underlyingTokenBalances[b.address];

        return +ethers.BigNumber.from(aBalance ?? 0).lt(
          ethers.BigNumber.from(bBalance ?? 0)
        );
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [openCounter, tokens.length] // Don't depend on balances query to avoid UI hopping.
  );

  const [searchTerm, setSearchTerm] = useState(""); // No need to debounce here because it's all client-side.

  const getFuse = useCallback(
    () =>
      new Fuse(tokenOrdered, {
        keys: ["symbol"],
        threshold: 0.2,
        ignoreLocation: true,
      }),
    [tokenOrdered]
  );

  const searchedTokens = useMemo(
    () =>
      searchTerm.trim() !== ""
        ? getFuse()
            .search(searchTerm.trim())
            .map((x) => x.item)
        : tokenOrdered,
    [getFuse, searchTerm, tokenOrdered]
  );

  return (
    <ResponsiveDialog
      open={open}
      onClose={onClose}
      PaperProps={{ sx: { borderRadius: "20px", maxWidth: 500 } }}
    >
      <DialogTitle sx={{ p: 3 }}>
        <Typography variant="h4" sx={{ mb: 3 }}>
          Select a token
        </Typography>
        <IconButton
          onClick={onClose}
          sx={{
            position: "absolute",
            right: theme.spacing(3),
            top: theme.spacing(3),
          }}
        >
          <CloseIcon />
        </IconButton>
        <TextField
          autoFocus
          fullWidth
          value={searchTerm}
          placeholder="Search name or symbol"
          variant="outlined"
          onChange={(e) => setSearchTerm(e.currentTarget.value)}
        />
      </DialogTitle>
      <DialogContent dividers sx={{ p: 0 }}>
        <List>
          {tokenPairsQuery.isLoading && (
            <Stack
              direction="row"
              justifyContent="center"
              alignItems="center"
              spacing={2}
            >
              <CircularProgress />
            </Stack>
          )}

          {!tokenPairsQuery.isUninitialized &&
            !tokenPairsQuery.isLoading &&
            !searchedTokens.length && (
              <Stack
                component={ListItem}
                direction="row"
                justifyContent="center"
                alignItems="center"
                spacing={2}
              >
                Could not find any tokens. :(
              </Stack>
            )}

          {!!tokens.length &&
            searchedTokens.map((token) => (
              <TokenListItem
                key={token.address}
                token={token}
                chainId={network.chainId}
                accountAddress={walletAddress}
                balanceWei={
                  superTokenBalances[token.address]?.balanceUntilUpdatedAt
                }
                balanceTimestamp={
                  isSuper(token)
                    ? superTokenBalances[token.address]?.updatedAtTimestamp
                    : undefined
                }
                flowRate={
                  isSuper(token)
                    ? superTokenBalances[token.address]?.totalNetFlowRate
                    : undefined
                }
                showUpgrade={showUpgrade}
                onClick={() => onSelect(token)}
              />
            ))}
        </List>
      </DialogContent>
    </ResponsiveDialog>
  );
};
