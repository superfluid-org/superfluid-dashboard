import AccountBalanceWalletOutlinedIcon from "@mui/icons-material/AccountBalanceWalletOutlined";
import { LoadingButton } from "@mui/lab";
import {
  ListItem,
  ListItemAvatar,
  ListItemText,
  Typography,
} from "@mui/material";
import { memo } from "react";
import { useAccount, useNetwork } from "wagmi";
import AddressAvatar from "../../components/AddressAvatar/AddressAvatar";
import AddressName from "../../components/AddressName/AddressName";
import { useImpersonation } from "../impersonation/ImpersonationContext";
import { useExpectedNetwork } from "../network/ExpectedNetworkContext";
import { useConnectButton } from "./ConnectButtonProvider";

export default memo(function ConnectWallet() {
  const { network } = useExpectedNetwork();
  const { openConnectModal, openAccountModal, mounted } = useConnectButton();
  const { data: account } = useAccount();
  const { activeChain } = useNetwork();
  const { stopImpersonation: stopImpersonation } = useImpersonation();

  if (account?.address && activeChain && mounted) {
    // TODO(KK): Better solution for pointer/click
    return (
      <ListItem
        sx={{ px: 2, py: 0, cursor: "pointer" }}
        onClick={openAccountModal}
      >
        <ListItemAvatar>
          <AddressAvatar address={account.address} />
        </ListItemAvatar>
        <ListItemText
          data-cy={"wallet-connection-status"}
          primary={
            <Typography
              variant="h6"
              sx={{
                textOverflow: "ellipsis",
                whiteSpace: "pre",
                overflow: "hidden",
              }}
            >
              <AddressName address={account?.address} />
            </Typography>
          }
          secondary={
            network.id !== activeChain.id ? "Wrong network" : "Connected"
          }
          secondaryTypographyProps={{
            color: network.id !== activeChain.id ? "error" : "primary",
          }}
        />
      </ListItem>
    );
  }

  return (
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
  );
});
