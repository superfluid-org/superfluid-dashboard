import {
  Avatar,
  ListItem,
  ListItemAvatar,
  ListItemText,
} from "@mui/material";
import { memo } from "react";
import { useNetworkContext } from "../network/NetworkContext";
import { useWalletContext } from "./WalletContext";
import shortenAddress from "../../utils/shortenAddress";
import { LoadingButton } from "@mui/lab";
import AddIcon from "@mui/icons-material/Add";
import { useConnect } from "wagmi";
import { ConnectButton } from "@rainbow-me/rainbowkit";

export default memo(function ConnectWallet() {
  const { isConnecting } = useConnect();

  const { network } = useNetworkContext();
  const { walletAddress, walletChainId } = useWalletContext();

  return (
    <>
      {walletAddress ? (
        <ListItem sx={{ px: 2, py: 0 }}>
          <ListItemAvatar>
            <Avatar variant="rounded" />
          </ListItemAvatar>
          <ListItemText
            primary={shortenAddress(walletAddress)}
            secondary={
              network.chainId !== walletChainId ? "Wrong network" : "Connected"
            }
            secondaryTypographyProps={{
              color: network.chainId !== walletChainId ? "error" : "primary",
            }}
          />
        </ListItem>
      ) : (
        <ConnectButton.Custom>
          {({ openConnectModal }) => (
            <LoadingButton
              loading={isConnecting}
              variant="contained"
              size="xl"
              onClick={openConnectModal}
            >
              <AddIcon sx={{ mr: 1 }} />
              Connect Wallet
            </LoadingButton>
          )}
        </ConnectButton.Custom>
      )}
    </>
  );
});
