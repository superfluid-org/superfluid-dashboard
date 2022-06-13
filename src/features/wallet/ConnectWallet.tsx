import { Avatar, ListItem, ListItemAvatar, ListItemText } from "@mui/material";
import { memo } from "react";
import { useExpectedNetwork } from "../network/ExpectedNetworkContext";
import shortenAddress from "../../utils/shortenAddress";
import { LoadingButton } from "@mui/lab";
import { useAccount, useNetwork } from "wagmi";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import Blockies from "react-blockies";
import AccountBalanceWalletOutlinedIcon from "@mui/icons-material/AccountBalanceWalletOutlined";
import { useImpersonation } from "../impersonation/ImpersonationContext";

export default memo(function ConnectWallet() {
  const { network } = useExpectedNetwork();

  // TODO(KK): `isLoading` might not be the correct thing to look at for button loading state.
  const { data: account } = useAccount();
  const { activeChain } = useNetwork();

  const { stopImpersonation: stopImpersonation } = useImpersonation();

  return (
    <ConnectButton.Custom>
      {({ openConnectModal, openAccountModal, mounted }) =>
        account?.address && activeChain && mounted ? (
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
              data-cy={"wallet-connection-status"}
              primary={shortenAddress(account.address)}
              secondary={
                network.id !== activeChain.id
                  ? "Wrong network"
                  : "Connected"
              }
              secondaryTypographyProps={{
                color: network.id !== activeChain.id ? "error" : "primary",
              }}
            />
          </ListItem>
        ) : (
          <LoadingButton
            data-cy={"connect-wallet-button"}
            loading={!mounted}
            variant="contained"
            size="xl"
            onClick={() => {
              openConnectModal();
              stopImpersonation();
            }}
          >
            <AccountBalanceWalletOutlinedIcon sx={{ mr: 1 }} />
            Connect Wallet
          </LoadingButton>
        )
      }
    </ConnectButton.Custom>
  );
});
