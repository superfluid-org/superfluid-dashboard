import { ListItem, ListItemAvatar, ListItemText } from "@mui/material";
import { memo } from "react";
import { useExpectedNetwork } from "../network/ExpectedNetworkContext";
import { LoadingButton } from "@mui/lab";
import { useAccount, useNetwork } from "wagmi";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import AccountBalanceWalletOutlinedIcon from "@mui/icons-material/AccountBalanceWalletOutlined";
import { useImpersonation } from "../impersonation/ImpersonationContext";
import AddressAvatar from "../../components/AddressAvatar/AddressAvatar";
import AddressName from "../../components/AddressName/AddressName";

export default memo(function ConnectWallet() {
  const { network } = useExpectedNetwork();

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
              <AddressAvatar address={account.address} />
            </ListItemAvatar>
            <ListItemText
              data-cy={"wallet-connection-status"}
              primary={<AddressName address={account?.address} />}
              secondary={
                network.id !== activeChain.id ? "Wrong network" : "Connected"
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
