import {
  Avatar,
  Button,
  CircularProgress,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Stack,
  Typography,
} from "@mui/material";
import { FC, memo, useMemo } from "react";
import { useNetworkContext } from "../network/NetworkContext";
import { useWalletContext } from "./WalletContext";
import shortenAddress from "../../utils/shortenAddress";
import { LoadingButton } from "@mui/lab";
import AddIcon from "@mui/icons-material/Add";
export default memo(function ConnectWallet() {
  const { network } = useNetworkContext();
  const {
    walletAddress,
    walletChainId,
    walletProvider,
    connectWallet,
    isWalletConnecting,
  } = useWalletContext();

  return (
    <>
      {walletProvider && walletAddress ? (
        <ListItem sx={{ px: 2, py: 0 }}>
          <ListItemAvatar>
            <Avatar variant="rounded" />
          </ListItemAvatar>
          <ListItemText
            primary={shortenAddress(walletAddress)}
            secondary={
              network.chainId !== walletChainId ? "Wrong network" : "Connected"
            }
            primaryTypographyProps={{ variant: "h6" }}
            secondaryTypographyProps={{
              color: network.chainId !== walletChainId ? "error" : "primary",
            }}
          />
        </ListItem>
      ) : (
        <LoadingButton
          loading={isWalletConnecting}
          variant="contained"
          size="xl"
          onClick={connectWallet}
        >
          <AddIcon sx={{ mr: 1 }} />
          Connect Wallet
        </LoadingButton>
      )}
    </>
  );
});
