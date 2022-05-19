import AddIcon from "@mui/icons-material/Add";
import { LoadingButton } from "@mui/lab";
import { Avatar, ListItem, ListItemAvatar, ListItemText } from "@mui/material";
import { memo } from "react";
import Blockies from "react-blockies";
import shortenAddress from "../../utils/shortenAddress";
import { useNetworkContext } from "../network/NetworkContext";
import { useWalletContext } from "./WalletContext";

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
            <Avatar variant="rounded">
              <Blockies seed={walletAddress} size={12} scale={3} />
            </Avatar>
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
