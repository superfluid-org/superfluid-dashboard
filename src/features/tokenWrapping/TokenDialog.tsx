import CloseIcon from "@mui/icons-material/Close";
import {
  CircularProgress,
  DialogContent,
  DialogTitle,
  Divider,
  IconButton,
  List,
  ListItem,
  Stack,
  TextField,
  Typography,
  useTheme,
} from "@mui/material";
import { skipToken } from "@reduxjs/toolkit/query";
import { ethers } from "ethers";
import Fuse from "fuse.js";
import { memo, useCallback, useEffect, useMemo, useState } from "react";
import ResponsiveDialog from "../common/ResponsiveDialog";
import {
  isSuper,
  isUnderlying,
  TokenMinimal,
} from "../redux/endpoints/tokenTypes";
import { rpcApi, subgraphApi } from "../redux/store";
import { useVisibleAddress } from "../wallet/VisibleAddressContext";
import { TokenListItem } from "./TokenListItem";
import { Network } from "../network/networks";
import { EMPTY_ARRAY } from "../../utils/constants";

interface TokenDialogProps {
  open: boolean;
  onClose: () => void;
  onSelect: (token: TokenMinimal) => void;
  network: Network;
  showUpgrade?: boolean;
  tokens: TokenMinimal[] | undefined;
  isTokensFetching: boolean;
}

export default memo(function TokenDialog({
  open,
  onClose,
  onSelect,
  tokens = EMPTY_ARRAY,
  isTokensFetching,
  showUpgrade = false,
  network,
}: TokenDialogProps) {
  const theme = useTheme();
  const { visibleAddress } = useVisibleAddress();

  const [openCounter, setOpenCounter] = useState(0);

  useEffect(() => {
    if (open) {
      setOpenCounter(openCounter + 1);
      setSearchTerm(""); // Reset the search term when the dialog opens, not when it closes (because then there would be noticable visual clearing of the field). It's smoother UI to do it on opening.
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const underlyingTokens = useMemo(
    () => tokens.filter(isUnderlying) ?? [],
    [network.id, tokens?.length ?? 0]
  );
  const superTokens = useMemo(
    () => tokens?.filter(isSuper) ?? [],
    [network.id, tokens?.length ?? 0]
  );

  const { data: _discard, ...underlyingTokenBalancesQuery } =
    rpcApi.useUnderlyingBalancesQuery(
      underlyingTokens.length && visibleAddress
        ? {
            chainId: network.id,
            accountAddress: visibleAddress,
            tokenAddresses: underlyingTokens.map((x) => x.address),
          }
        : skipToken
    );

  const underlyingTokenBalances = useMemo(
    () => underlyingTokenBalancesQuery.currentData?.balances ?? {},
    [underlyingTokenBalancesQuery.currentData]
  );

  const { data: _discard2, ...superTokenBalancesQuery } =
    subgraphApi.useAccountTokenSnapshotsQuery(
      tokens && visibleAddress
        ? {
            chainId: network.id,
            filter: {
              account: visibleAddress,
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
      superTokenBalancesQuery.currentData
        ? Object.fromEntries(
            superTokenBalancesQuery.currentData.items.map((x) => [x.token, x])
          )
        : {},
    [network.id, superTokenBalancesQuery.currentData?.items.length ?? 0]
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

        const aBigNumber = ethers.BigNumber.from(aBalance ?? 0);
        const bBigNumber = ethers.BigNumber.from(bBalance ?? 0);

        if (aBigNumber.lt(bBigNumber)) {
          return 1;
        }
        if (aBigNumber.gt(bBigNumber)) {
          return -1;
        }
        return 0;
      }),
    [open, tokens] // Don't depend on balances query to avoid UI hopping.
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
        <Typography variant="h4" sx={{ mb: 3 }} translate="yes">
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
          data-cy="token-search-input"
          autoFocus
          fullWidth
          value={searchTerm}
          placeholder="Search name or symbol"
          variant="outlined"
          onChange={(e) => setSearchTerm(e.currentTarget.value)}
        />
      </DialogTitle>
      <Divider />
      <DialogContent sx={{ p: 0 }}>
        <List>
          {isTokensFetching && (
            <Stack
              direction="row"
              justifyContent="center"
              alignItems="center"
              spacing={2}
            >
              <CircularProgress />
            </Stack>
          )}

          {!isTokensFetching && !searchedTokens.length && (
            <Stack
              data-cy={"token-search-no-results"}
              component={ListItem}
              direction="row"
              justifyContent="center"
              alignItems="center"
              spacing={2}
              translate="yes"
            >
              Could not find any tokens. :(
            </Stack>
          )}

          {!!tokens.length &&
            searchedTokens.map((token) => (
              <TokenListItem
                key={token.address}
                token={token}
                chainId={network.id}
                accountAddress={visibleAddress}
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
});
