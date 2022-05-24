import { Avatar, ListItem, ListItemAvatar, ListItemText } from "@mui/material";
import { memo } from "react";
import { useAppNetwork } from "../network/AppNetworkContext";
import shortenAddress from "../../utils/shortenAddress";
import { LoadingButton } from "@mui/lab";
import AddIcon from "@mui/icons-material/Add";
import { useAccount, useConnect, useNetwork } from "wagmi";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import Blockies from "react-blockies";

export default memo(function ConnectWallet() {
  const { network } = useAppNetwork();

  const { data: account } = useAccount();
  const { activeChain } = useNetwork();
  const { isConnecting } = useConnect();

  return (
    <ConnectButton.Custom>
      {({ openConnectModal, openAccountModal }) =>
        account?.address && activeChain ? (
          // TODO(KK): Better solution for pointer/click
          <ListItem
            sx={{ px: 2, py: 0, cursor: "pointer" }}
            onClick={openAccountModal}
          >
            <ListItemAvatar>
              <Avatar variant="rounded">
                <Blockies seed={account?.address} size={12} scale={3} />
              </Avatar>
            </ListItemAvatar>
            <ListItemText
              primary={shortenAddress(account.address)}
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
