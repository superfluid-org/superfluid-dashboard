import AccountBalanceWalletOutlinedIcon from "@mui/icons-material/AccountBalanceWalletOutlined";
import ExpandMoreRoundedIcon from "@mui/icons-material/ExpandMoreRounded";
import { LoadingButton, LoadingButtonProps } from "@mui/lab";
import {
  Button,
  ButtonProps,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { Address } from "@superfluid-finance/sdk-core";
import { FC, memo } from "react";
import { useAccount, useNetwork } from "wagmi";
import AddressAvatar from "../../components/AddressAvatar/AddressAvatar";
import AddressName from "../../components/AddressName/AddressName";
import { useAutoConnect } from "../autoConnect/AutoConnect";
import { useImpersonation } from "../impersonation/ImpersonationContext";
import { useExpectedNetwork } from "../network/ExpectedNetworkContext";
import { useConnectButton } from "./ConnectButtonProvider";

interface AccountInfoProps {
  address: Address;
  isConnected?: boolean;
  onClick?: () => void;
}

const AccountInfo: FC<AccountInfoProps> = ({
  address,
  isConnected,
  onClick,
}) => {
  return (
    <ListItem sx={{ px: 2, py: 0, cursor: "pointer" }} onClick={onClick}>
      <ListItemAvatar sx={{ mr: 2 }}>
        <AddressAvatar address={address} />
      </ListItemAvatar>
      <ListItemText
        data-cy={"wallet-connection-status"}
        primary={<AddressName address={address} />}
        secondary={isConnected ? "Connected" : "Wrong network"}
        primaryTypographyProps={{
          variant: "h6",
          sx: {
            textOverflow: "ellipsis",
            whiteSpace: "pre",
            overflow: "hidden",
          },
        }}
        secondaryTypographyProps={{
          color: isConnected ? "primary" : "error",
        }}
      />
    </ListItem>
  );
};

const MobileAccountInfo: FC<AccountInfoProps> = ({ address, onClick }) => {
  return (
    <Button
      onClick={onClick}
      variant="outlined"
      color="secondary"
      startIcon={
        <AddressAvatar
          address={address}
          AvatarProps={{
            sx: { width: "21px", height: "21px", borderRadius: "5px" },
          }}
          BlockiesProps={{ size: 7, scale: 3 }}
        />
      }
    >
      <AddressName address={address} />
    </Button>
  );
};

interface ConnectWalletProps {
  small?: boolean;
}

const ConnectWallet: FC<ConnectWalletProps> = ({ small = false }) => {
  const theme = useTheme();
  const isAboveMd = useMediaQuery(theme.breakpoints.up("md"));

  const { network } = useExpectedNetwork();
  const { openConnectModal, openAccountModal, mounted } = useConnectButton();
  const { data: account } = useAccount();
  const accountAddress = account?.address;
  const { activeChain } = useNetwork();
  const { stopImpersonation: stopImpersonation } = useImpersonation();
  const { isAutoConnecting } = useAutoConnect();

  if (accountAddress && activeChain && mounted) {
    // TODO(KK): Better solution for pointer/click
    return isAboveMd ? (
      <AccountInfo
        address={accountAddress}
        isConnected={network.id === activeChain.id}
        onClick={openAccountModal}
      />
    ) : (
      <MobileAccountInfo address={accountAddress} onClick={openAccountModal} />
    );
  }

  return (
    <LoadingButton
      data-cy={"connect-wallet-button"}
      loading={!mounted || isAutoConnecting}
      variant="contained"
      size={small ? "small" : "xl"}
      onClick={() => {
        openConnectModal();
        stopImpersonation();
      }}
    >
      <AccountBalanceWalletOutlinedIcon
        sx={{ mr: 1, ...(small ? { width: "22px", height: "22px" } : {}) }}
      />
      Connect Wallet
    </LoadingButton>
  );
};

export default memo<ConnectWalletProps>(ConnectWallet);
