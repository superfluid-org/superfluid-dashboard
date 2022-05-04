import { FC, useCallback, useState, useMemo, useEffect } from "react";
import {
  SuperTokenPair,
  TokenMinimal,
  TokenType,
  UnderlyingTokenType,
  isUnderlying,
  isSuper,
} from "../redux/endpoints/adHocSubgraphEndpoints";
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
} from "@mui/material";
import { useNetworkContext } from "../network/NetworkContext";
import { useWalletContext } from "../wallet/WalletContext";
import { rpcApi, subgraphApi } from "../redux/store";
import { skipToken } from "@reduxjs/toolkit/query";
import Fuse from "fuse.js";
import CloseIcon from "@mui/icons-material/Close";
import { TokenItem } from "./TokenItem";
import { ethers } from "ethers";
import ResponsiveDialog from "../common/ResponsiveDialog";

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
    <ResponsiveDialog open={open} onClose={onClose}>
      <DialogTitle>
        <Typography>Select a token</Typography>
        <IconButton
          aria-label="close"
          onClick={onClose}
          sx={{
            position: "absolute",
            right: 8,
            top: 8,
            color: (t) => t.palette.grey[500],
          }}
        >
          <CloseIcon />
        </IconButton>
        <TextField
          value={searchTerm}
          autoFocus
          placeholder="Search name or symbol"
          fullWidth={true}
          variant="outlined"
          sx={{
            pt: 2.5,
            pb: 1,
          }}
          onChange={(e) => setSearchTerm(e.currentTarget.value)}
        />
      </DialogTitle>
      <DialogContent dividers sx={{ p: 0 }}>
        <List>
          {tokenPairsQuery.isLoading && (
            <Stack
              component={ListItem}
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
                No tokens. :(
              </Stack>
            )}

          {!!tokens.length &&
            searchedTokens.map((token) => (
              <ListItem key={token.address} disablePadding>
                <ListItemButton onClick={() => onSelect(token)}>
                  {isSuper(token) ? (
                    <TokenItem
                      token={token}
                      chainId={network.chainId}
                      accountAddress={walletAddress}
                      balanceWei={
                        superTokenBalances[token.address]?.balanceUntilUpdatedAt
                      }
                      balanceTimestamp={
                        superTokenBalances[token.address]?.updatedAtTimestamp
                      }
                      flowRate={
                        superTokenBalances[token.address]?.totalNetFlowRate
                      }
                      showUpgrade={showUpgrade}
                    />
                  ) : (
                    <TokenItem
                      token={token}
                      chainId={network.chainId}
                      accountAddress={walletAddress}
                      balanceWei={underlyingTokenBalances[token.address]}
                      showUpgrade={showUpgrade}
                    />
                  )}
                </ListItemButton>
              </ListItem>
            ))}
        </List>
      </DialogContent>
      <DialogActions></DialogActions>
    </ResponsiveDialog>
  );
};
