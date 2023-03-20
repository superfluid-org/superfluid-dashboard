import {
  Button,
  DialogContent,
  DialogTitle,
  IconButton,
  Stack,
  TextField,
  Typography,
  useTheme,
} from "@mui/material";
import { ChangeEvent, FC, useCallback, useEffect, useState } from "react";
import { useAccount, useBalance, useDisconnect } from "wagmi";
import AddressName from "../../components/AddressName/AddressName";
import AddressAvatar from "../../components/Avatar/AddressAvatar";
import ResponsiveDialog from "../common/ResponsiveDialog";

import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";
import LogoutRoundedIcon from "@mui/icons-material/LogoutRounded";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import { isAddress } from "../../utils/memoizedEthersUtils";
import CopyBtn from "../common/CopyBtn";
import { useImpersonation } from "../impersonation/ImpersonationContext";
import Amount from "../token/Amount";

interface AccountModalProps {
  open: boolean;
  onClose: () => void;
}

const AccountModal: FC<AccountModalProps> = ({ open, onClose }) => {
  const { address } = useAccount();
  const { disconnectAsync } = useDisconnect();
  const { impersonate } = useImpersonation();
  const theme = useTheme();
  const { data: balanceData } = useBalance({ address });

  const [viewAddress, setViewAddress] = useState("");

  useEffect(() => {
    if (open && !address) onClose();
  }, [open, address, onClose]);

  const onViewAddressChange = (e: ChangeEvent<HTMLInputElement>) => {
    setViewAddress(e.target.value);
  };

  const onDisconnect = () => disconnectAsync();

  const onImpersonate = useCallback(() => {
    if (viewAddress && isAddress(viewAddress)) {
      impersonate(viewAddress);
      onClose();
      setViewAddress("");
    }
  }, [impersonate, viewAddress, setViewAddress, onClose]);

  return (
    <ResponsiveDialog
      open={open}
      onClose={onClose}
      PaperProps={{ sx: { maxWidth: 480 } }}
    >
      <DialogTitle sx={{ px: 5, pt: 3.5 }}>
        <Typography variant="h4" textAlign="center">
          Wallet Connected
        </Typography>
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
          <Typography variant="body1" color="text.secondary">
            We’ll disconnect you if you view as another wallet so be sure to
            reconnect when you are done.
          </Typography>

          <Stack direction="row" alignItems="center" gap={1.25} sx={{ mt: 2 }}>
            <TextField
              variant="outlined"
              size="small"
              placeholder="Paste any wallet address"
              InputProps={{ startAdornment: <SearchRoundedIcon /> }}
              value={viewAddress}
              onChange={onViewAddressChange}
              autoComplete="off"
              sx={{ flex: 1 }}
            />
            <IconButton
              color="secondary"
              sx={{ border: "1px solid #D1D2D3" }}
              onClick={onImpersonate}
            >
              <ArrowForwardRoundedIcon
                sx={{ color: theme.palette.text.primary }}
              />
            </IconButton>
          </Stack>
        </DialogContent>
      )}
    </ResponsiveDialog>
  );
};

export default AccountModal;
