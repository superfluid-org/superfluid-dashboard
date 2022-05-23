import { Avatar, ListItem, ListItemAvatar, ListItemText } from "@mui/material";
import { memo } from "react";
import { useNetworkContext } from "../network/NetworkContext";
import shortenAddress from "../../utils/shortenAddress";
import { LoadingButton } from "@mui/lab";
import AddIcon from "@mui/icons-material/Add";
import { useAccount, useConnect, useNetwork } from "wagmi";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import Blockies from "react-blockies";

export default memo(function ConnectWallet() {
  const { network } = useNetworkContext();

  const { data: wagmiAccount } = useAccount();
  const { activeChain } = useNetwork();
  const { isConnecting } = useConnect();

  return (
    <ConnectButton.Custom>
      {({ openConnectModal, openAccountModal }) =>
        wagmiAccount?.address && activeChain ? (
          // TODO(KK): Better solution for pointer/click
          <ListItem
            sx={{ px: 2, py: 0, cursor: "pointer" }}
            onClick={openAccountModal}
          >
            <ListItemAvatar>
              <Avatar variant="rounded">
                <Blockies seed={wagmiAccount?.address} size={12} scale={3} />
              </Avatar>
            </ListItemAvatar>
            <ListItemText
              primary={shortenAddress(wagmiAccount.address)}
              secondary={
                network.chainId !== activeChain.id
                  ? "Wrong network"
                  : "Connected"
              }
              secondaryTypographyProps={{
                color: network.chainId !== activeChain.id ? "error" : "primary",
              }}
            />
          </ListItem>
        ) : (
          <LoadingButton
            loading={isConnecting}
            variant="contained"
            size="xl"
            onClick={openConnectModal}
          >
            <AddIcon sx={{ mr: 1 }} />
            Connect Wallet
          </LoadingButton>
        )
      }
    </ConnectButton.Custom>
  );
});
