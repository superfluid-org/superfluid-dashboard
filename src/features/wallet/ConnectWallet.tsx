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
import { useAutoConnect } from "../autoConnect/AutoConnect";
import { useImpersonation } from "../impersonation/ImpersonationContext";
import { useExpectedNetwork } from "../network/ExpectedNetworkContext";
import { useConnectButton } from "./ConnectButtonProvider";

export default memo(function ConnectWallet() {
  const { network } = useExpectedNetwork();
  const { openConnectModal, openAccountModal, mounted } = useConnectButton();
  const { data: account, error } = useAccount();
  const accountAddress = account?.address;
  const { activeChain } = useNetwork();
  const { stopImpersonation: stopImpersonation } = useImpersonation();
  const { isAutoConnecting, didAutoConnect } = useAutoConnect();

  if (accountAddress && activeChain && mounted) {
    // TODO(KK): Better solution for pointer/click
    return (
      <ListItem
        sx={{ px: 2, py: 0, cursor: "pointer" }}
        onClick={openAccountModal}
      >
        <ListItemAvatar>
          <AddressAvatar address={accountAddress} />
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
              <AddressName address={accountAddress} />
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
      loading={
        !mounted || isAutoConnecting || (didAutoConnect && !account && !error)
      }
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
