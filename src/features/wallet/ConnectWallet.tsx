import AccountBalanceWalletOutlinedIcon from "@mui/icons-material/AccountBalanceWalletOutlined";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import { LoadingButton } from "@mui/lab";
import {
  Button,
  ButtonProps,
  IconButton,
  ListItem,
  ListItemAvatar,
  ListItemText,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { Address } from "@superfluid-finance/sdk-core";
import { FC, memo, SyntheticEvent, useCallback } from "react";
import { useAccount } from "wagmi";
import AddressAvatar from "../../components/Avatar/AddressAvatar";
import AddressName from "../../components/AddressName/AddressName";
import { useImpersonation } from "../impersonation/ImpersonationContext";
import { useExpectedNetwork } from "../network/ExpectedNetworkContext";
import { useConnectButton } from "./ConnectButtonProvider";
import { useVisibleAddress } from "./VisibleAddressContext";

interface AccountInfoProps {
  address: Address;
  isConnected?: boolean;
  isImpersonating?: boolean;
  onClick?: () => void;
  stopImpersonation: (e: SyntheticEvent) => void;
}

const AccountInfo: FC<AccountInfoProps> = ({
  address,
  isConnected,
  isImpersonating,
  onClick,
  stopImpersonation,
}) => (
  <ListItem data-cy={"connected-wallet-button"} sx={{ px: 2, py: 0, cursor: "pointer" }} onClick={onClick}>
    <ListItemAvatar sx={{ mr: 2 }}>
      <AddressAvatar address={address} />
    </ListItemAvatar>
    <ListItemText
      data-cy={"wallet-connection-status"}
      primary={<AddressName address={address} />}
      secondary={
        isImpersonating
          ? "Viewing as"
          : isConnected
          ? "Connected"
          : "Wrong network"
      }
      primaryTypographyProps={{
        variant: "h6",
        sx: {
          textOverflow: "ellipsis",
          whiteSpace: "pre",
          overflow: "hidden",
        },
      }}
      secondaryTypographyProps={{
        color: isImpersonating
          ? "warning.main"
          : isConnected
          ? "primary"
          : "error",
      }}
    />
    {isImpersonating && (
      <IconButton onClick={stopImpersonation} color="warning" size="small">
        <CloseRoundedIcon color="warning" />
      </IconButton>
    )}
  </ListItem>
);

const MobileAccountInfo: FC<AccountInfoProps> = ({
  address,
  isImpersonating,
  onClick,
  stopImpersonation,
}) => (
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
    {isImpersonating && (
      <IconButton onClick={stopImpersonation}>
        <CloseRoundedIcon />
      </IconButton>
    )}
  </Button>
);

interface ConnectWalletProps {
  ButtonProps?: ButtonProps;
}

const ConnectWallet: FC<ConnectWalletProps> = ({
  ButtonProps = { size: "xl" },
}) => {
  const theme = useTheme();
  const isAboveMd = useMediaQuery(theme.breakpoints.up("md"));

  const { network } = useExpectedNetwork();
  
  const { openConnectModal, openAccountModal } = useConnectButton();

  const { visibleAddress } = useVisibleAddress();
  const { chain: activeChain, isReconnecting } = useAccount();
  const { stopImpersonation, isImpersonated } = useImpersonation();

  const handleStopImpersonation = useCallback(
    (e: SyntheticEvent) => {
      e.preventDefault();
      e.stopPropagation();
      stopImpersonation();
    },
    [stopImpersonation]
  );

  if (visibleAddress && activeChain) {
    // TODO(KK): Better solution for pointer/click
    return isAboveMd ? (
      <AccountInfo
        address={visibleAddress}
        isConnected={network.id === activeChain.id}
        isImpersonating={isImpersonated}
        onClick={openAccountModal}
        stopImpersonation={handleStopImpersonation}
      />
    ) : (
      <MobileAccountInfo
        address={visibleAddress}
        isImpersonating={isImpersonated}
        onClick={openAccountModal}
        stopImpersonation={handleStopImpersonation}
      />
    );
  }

  return (
    <LoadingButton
      data-cy={"connect-wallet-button"}
      loading={isReconnecting}
      variant="contained"
      {...ButtonProps}
      onClick={() => {
        openConnectModal();
        stopImpersonation();
      }}
    >
      <AccountBalanceWalletOutlinedIcon
        sx={{
          mr: 1,
          ...(ButtonProps.size === "small"
            ? { width: "22px", height: "22px" }
            : {}),
        }}
      />
      Connect Wallet
    </LoadingButton>
  );
};

export default memo<ConnectWalletProps>(ConnectWallet);
