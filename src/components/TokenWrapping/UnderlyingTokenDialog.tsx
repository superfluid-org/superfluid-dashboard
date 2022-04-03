import {FC, useCallback, useState} from "react";
import {TokenUpgradeDowngradePair} from "../../redux/endpoints/adHocSubgraphEndpoints";
import {
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    IconButton,
    List,
    ListItem,
    ListItemButton,
    TextField,
    Typography,
    useMediaQuery,
    useTheme
} from "@mui/material";
import {useNetworkContext} from "../../contexts/NetworkContext";
import {useWalletContext} from "../../contexts/WalletContext";
import {rpcApi, subgraphApi} from "../../redux/store";
import {skipToken} from "@reduxjs/toolkit/query";
import Fuse from "fuse.js";
import CloseIcon from "@mui/icons-material/Close";
import {TokenItem} from "./TokenItem";

export const UnderlyingTokenDialog: FC<{
    open: boolean;
    handleClose: () => void;
    handleSelected: (token: TokenUpgradeDowngradePair) => void;
}> = ({open, handleClose, handleSelected}) => {
    const theme = useTheme();
    const fullScreen = useMediaQuery(theme.breakpoints.down("sm"));

    const {network} = useNetworkContext();
    const {walletAddress} = useWalletContext();

    const tokenPairsQuery = subgraphApi.useTokenUpgradeDowngradePairsQuery({
        chainId: network.chainId,
    });

    const balancesQuery = rpcApi.useMulticallQuery(
        tokenPairsQuery.data && walletAddress
            ? {
                chainId: network.chainId,
                accountAddress: walletAddress,
                tokenAddresses: tokenPairsQuery.data.map(
                    (x) => x.underlyingToken.address
                ),
            }
            : skipToken
    );

    const tokenPairs = tokenPairsQuery.data ?? [];

    // TODO(KK): Don't think I need to debounce here because it's all client-side anyways.
    const [searchTerm, setSearchTerm] = useState("");

    const getFuse = useCallback(
        () =>
            new Fuse(tokenPairs, {
                keys: [
                    "superToken.symbol",
                    "superToken.name",
                    "underlyingToken.symbol",
                    "underlyingToken.name",
                ],
                threshold: 0.2
            }),
        [tokenPairs]
    );

    const searchedTokenPairs =
        searchTerm.trim() !== ""
            ? getFuse()
                .search(searchTerm.trim())
                .map((x) => x.item)
            : tokenPairs;

    return (
        <Dialog
            open={open}
            fullWidth={true}
            maxWidth={"sm"}
            fullScreen={fullScreen}
            onClose={handleClose}
        >
            <DialogTitle>
                <Typography>Select a token</Typography>
                <IconButton
                    aria-label="close"
                    onClick={handleClose}
                    sx={{
                        position: "absolute",
                        right: 8,
                        top: 8,
                        color: (t) => t.palette.grey[500],
                    }}
                >
                    <CloseIcon/>
                </IconButton>
                <TextField
                    autoFocus={true}
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
            <DialogContent dividers sx={{p: 0}}>
                <List>
                    {searchedTokenPairs.map((x) => (
                        <ListItem key={x.superToken.address} disablePadding>
                            <ListItemButton onClick={() => handleSelected(x)}>
                                <TokenItem
                                    chainId={network.chainId}
                                    accountAddress={walletAddress}
                                    tokenAddress={x.underlyingToken.address}
                                    tokenSymbol={x.underlyingToken.symbol}
                                    tokenName={x.underlyingToken.name}
                                    balanceWei={
                                        balancesQuery.data
                                            ? balancesQuery.data.balances[x.underlyingToken.address]
                                            : undefined
                                    }
                                />
                            </ListItemButton>
                        </ListItem>
                    ))}
                </List>
            </DialogContent>
            <DialogActions></DialogActions>
        </Dialog>
    );
};
export default UnderlyingTokenDialog;