import { FC, useCallback, useState, useMemo, useEffect } from "react";
import { TokenUpgradeDowngradePair } from "../../redux/endpoints/adHocSubgraphEndpoints";
import {
  CircularProgress,
  Dialog,
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
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { useNetworkContext } from "../../contexts/NetworkContext";
import { useWalletContext } from "../../contexts/WalletContext";
import { rpcApi, subgraphApi } from "../../redux/store";
import { skipToken } from "@reduxjs/toolkit/query";
import Fuse from "fuse.js";
import CloseIcon from "@mui/icons-material/Close";
import { TokenItem } from "./TokenItem";
import { ethers } from "ethers";

export const TokenDialog: FC<{
  open: boolean;
  onClose: () => void;
  onSelect: (token: TokenUpgradeDowngradePair) => void;
  prioritizeSuperTokens: boolean;
}> = ({ open, onClose, onSelect, prioritizeSuperTokens }) => {
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down("sm"));
  const { network } = useNetworkContext();
  const { walletAddress } = useWalletContext();

  console.log({
    walletAddress
  })

  const [openCounter, setOpenCounter] = useState(0);

  useEffect(() => {
    if (open) {
      setOpenCounter(openCounter + 1);
      setSearchTerm("");
    }
  }, [open]);

  const tokenPairsQuery = subgraphApi.useTokenUpgradeDowngradePairsQuery({
    chainId: network.chainId,
  });

  const underlyingTokenBalancesQuery = rpcApi.useBalanceOfMulticallQuery(
    tokenPairsQuery.data && walletAddress && !prioritizeSuperTokens
      ? {
          chainId: network.chainId,
          accountAddress: walletAddress,
          tokenAddresses: tokenPairsQuery.data.map(
            (x) => x.underlyingToken.address
          ),
        }
      : skipToken
  );

  const underlyingTokenBalances = useMemo(
    () => underlyingTokenBalancesQuery.data?.balances ?? {},
    [underlyingTokenBalancesQuery.data]
  );

  const superTokenBalancesQuery = subgraphApi.useAccountTokenSnapshotsQuery(
    tokenPairsQuery.data && walletAddress && prioritizeSuperTokens
      ? {
          chainId: network.chainId,
          filter: {
            account: walletAddress,
            token_in: tokenPairsQuery.data.map((x) => x.superToken.address),
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
            superTokenBalancesQuery.data.items.map((x) => [
              x.token,
              x,
            ])
          )
        : {},
    [superTokenBalancesQuery.data]
  );

  const tokenPairs = useMemo(
    () =>
      tokenPairsQuery.data?.map((x) => ({
        superToken: {
          ...x.superToken,
          balance: superTokenBalances[x.superToken.address]?.balanceUntilUpdatedAt,
        },
        underlyingToken: {
          ...x.underlyingToken,
          balance: underlyingTokenBalances[x.underlyingToken.address],
        },
      })) ?? [],
    [tokenPairsQuery.data, superTokenBalances, underlyingTokenBalances]
  );

  const tokenPairsOrdered = useMemo(
    () =>
      tokenPairs.sort((a, b) =>
        prioritizeSuperTokens
          ? +ethers.BigNumber.from(a.superToken.balance ?? 0).lt(
              ethers.BigNumber.from(b.superToken.balance ?? 0)
            )
          : +ethers.BigNumber.from(a.underlyingToken.balance ?? 0).lt(
              ethers.BigNumber.from(b.underlyingToken.balance ?? 0)
            )
      ),
    [openCounter, tokenPairs.length] // Don't depend on balances query to avoid UI hopping.
  );


  const [searchTerm, setSearchTerm] = useState(""); // No need to debounce here because it's all client-side.

  const getFuse = useCallback(
    () =>
      new Fuse(tokenPairsOrdered, {
        keys: ["superToken.symbol", "underlyingToken.symbol"],
        threshold: 0.2,
        ignoreLocation: true,
      }),
    [tokenPairsOrdered]
  );

  const searchedTokenPairs = useMemo(
    () =>
      searchTerm.trim() !== ""
        ? getFuse()
            .search(searchTerm.trim())
            .map((x) => x.item)
        : tokenPairsOrdered,
    [getFuse, searchTerm, tokenPairsOrdered]
  );

  return (
    <Dialog
      open={open}
      fullWidth={true}
      maxWidth={"sm"}
      fullScreen={fullScreen}
      onClose={onClose}
    >
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
            !searchedTokenPairs.length && (
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
          {!!tokenPairs.length &&
            searchedTokenPairs.map((x) => (
              <ListItem key={x.superToken.address} disablePadding>
                <ListItemButton onClick={() => onSelect(x)}>
                  {prioritizeSuperTokens ? (
                    <TokenItem
                      chainId={network.chainId}
                      accountAddress={walletAddress}
                      tokenAddress={x.superToken.address}
                      tokenSymbol={x.superToken.symbol}
                      tokenName={x.superToken.name}
                      balanceLoading={
                        superTokenBalancesQuery.isUninitialized ||
                        superTokenBalancesQuery.isLoading
                      }
                      balanceWei={
                        superTokenBalances[x.superToken.address]
                          ?.balanceUntilUpdatedAt
                      }
                      balanceTimestamp={
                        superTokenBalances[x.superToken.address]
                          ?.updatedAtTimestamp
                      }
                      flowRate={
                        superTokenBalances[x.superToken.address]
                          ?.totalNetFlowRate
                      }
                    />
                  ) : (
                    <TokenItem
                      chainId={network.chainId}
                      accountAddress={walletAddress}
                      tokenAddress={x.underlyingToken.address}
                      tokenSymbol={x.underlyingToken.symbol}
                      tokenName={x.underlyingToken.name}
                      balanceLoading={
                        underlyingTokenBalancesQuery.isUninitialized ||
                        underlyingTokenBalancesQuery.isLoading
                      }
                      balanceWei={
                        underlyingTokenBalances[x.underlyingToken.address]
                      }
                    />
                  )}
                </ListItemButton>
              </ListItem>
            ))}
        </List>
      </DialogContent>
      <DialogActions></DialogActions>
    </Dialog>
  );
};
