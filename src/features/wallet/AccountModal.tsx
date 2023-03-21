import LogoutRoundedIcon from "@mui/icons-material/LogoutRounded";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import PersonSearchRoundedIcon from "@mui/icons-material/PersonSearchRounded";
import {
  Button,
  DialogContent,
  DialogTitle,
  IconButton,
  Stack,
  Typography,
  useTheme,
} from "@mui/material";
import { FC, useCallback, useEffect, useState } from "react";
import { useAccount, useBalance, useDisconnect } from "wagmi";
import AddressName from "../../components/AddressName/AddressName";
import { AddressSearchDialogContent } from "../../components/AddressSearchDialog/AddressSearchDialog";
import AddressAvatar from "../../components/Avatar/AddressAvatar";
import CopyBtn from "../common/CopyBtn";
import ResponsiveDialog from "../common/ResponsiveDialog";
import AddressSearchIndex from "../impersonation/AddressSearchIndex";
import { useImpersonation } from "../impersonation/ImpersonationContext";
import Amount from "../token/Amount";

interface AccountModalProps {
  open: boolean;
  onClose: () => void;
}

const AccountModal: FC<AccountModalProps> = ({ open, onClose }) => {
  const theme = useTheme();

  const { address } = useAccount();
  const { disconnectAsync } = useDisconnect();
  const { impersonate } = useImpersonation();
  const { data: balanceData } = useBalance({ address });

  const [addressSearchOpen, setAddressSearchOpen] = useState(false);

  const handleClose = useCallback(() => {
    onClose();

    const timeoutID = setTimeout(() => {
      setAddressSearchOpen(false);
    }, theme.transitions.duration.standard);

    return () => {
      if (timeoutID) clearTimeout(timeoutID);
    };
  }, [onClose, setAddressSearchOpen, theme]);

  useEffect(() => {
    if (open && !address) handleClose();
  }, [open, address, handleClose]);

  const openAddressSearch = () => setAddressSearchOpen(true);
  const closeAddressSearch = () => setAddressSearchOpen(false);

  const onDisconnect = useCallback(() => {
    handleClose();

    const timeoutID = setTimeout(() => {
      disconnectAsync();
    }, theme.transitions.duration.standard);

    return () => {
      if (timeoutID) clearTimeout(timeoutID);
    };
  }, [handleClose, disconnectAsync, theme]);

  const onImpersonate = useCallback(
    (viewAddress: string) => {
      impersonate(viewAddress);
      handleClose();
    },
    [impersonate, handleClose]
  );

  return (
    <ResponsiveDialog
      open={open}
      onClose={handleClose}
      PaperProps={{ sx: { width: 500 } }}
    >
      {!addressSearchOpen ? (
        <>
          <DialogTitle sx={{ px: 5, pt: 3.5 }}>
            <Typography variant="h4" textAlign="center">
              Wallet Connected
            </Typography>
            <IconButton
              onClick={handleClose}
              sx={{ position: "absolute", right: 20, top: 24 }}
              color="inherit"
            >
              <CloseRoundedIcon />
            </IconButton>
          </DialogTitle>
          {address && (
            <DialogContent sx={{ px: 5, pt: 0, pb: 3.5 }}>
              <Stack alignItems="center">
                <AddressAvatar address={address} />
                <Typography variant="h4" component="span" sx={{ mt: 1.5 }}>
                  <AddressName address={address} />
                </Typography>
                {balanceData && (
                  <Typography variant="h5" color="text.secondary">
                    <Amount wei={balanceData.value} /> {balanceData.symbol}
                  </Typography>
                )}
              </Stack>

              <Stack direction="row" gap={1} sx={{ my: 4 }}>
                <CopyBtn
                  label="Copy Address"
                  copyText={address}
                  ButtonProps={{
                    variant: "outlined",
                    color: "secondary",
                    size: "large",
                    sx: { flex: 1 },
                  }}
                />

                <Button
                  variant="outlined"
                  color="secondary"
                  size="large"
                  endIcon={<LogoutRoundedIcon />}
                  sx={{ flex: 1 }}
                  onClick={onDisconnect}
                >
                  Disconnect
                </Button>
              </Stack>

              <Typography variant="h6">View as any wallet</Typography>

              <Stack
                direction="row"
                alignItems="center"
                gap={1.25}
                sx={{ mt: 2 }}
              >
                <Button
                  variant="outlined"
                  color="secondary"
                  size="large"
                  fullWidth
                  startIcon={<PersonSearchRoundedIcon />}
                  onClick={openAddressSearch}
                >
                  View the dashboard as any address
                </Button>
              </Stack>
            </DialogContent>
          )}
        </>
      ) : (
        <AddressSearchDialogContent
          title="Select Address To View"
          open={addressSearchOpen}
          onClose={handleClose}
          onBack={closeAddressSearch}
          onSelectAddress={onImpersonate}
          index={<AddressSearchIndex onSelectAddress={onImpersonate} />}
        />
      )}
    </ResponsiveDialog>
  );
};

export default AccountModal;
