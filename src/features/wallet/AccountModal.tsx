import {
  Button,
  DialogContent,
  DialogTitle,
  IconButton,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { ChangeEvent, FC, useCallback, useEffect, useState } from "react";
import { useAccount, useDisconnect } from "wagmi";
import AddressName from "../../components/AddressName/AddressName";
import AddressAvatar from "../../components/Avatar/AddressAvatar";
import ResponsiveDialog from "../common/ResponsiveDialog";

import ContentCopyRoundedIcon from "@mui/icons-material/ContentCopyRounded";
import LogoutRoundedIcon from "@mui/icons-material/LogoutRounded";
import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import copyToClipboard from "../../utils/copyToClipboard";
interface AccountModalProps {
  open: boolean;
  onClose: () => void;
}

const AccountModal: FC<AccountModalProps> = ({ open, onClose }) => {
  const { address } = useAccount();
  const { disconnectAsync } = useDisconnect();

  const [viewAddress, setViewAddress] = useState("");

  useEffect(() => {
    if (open && !address) onClose();
  }, [open, address, onClose]);

  const onViewAddressChange = (e: ChangeEvent<HTMLInputElement>) => {
    setViewAddress(e.target.value);
  };

  const onDisconnect = () => disconnectAsync();

  const onCopyAddress = useCallback(() => {
    if (address) copyToClipboard(address);
  }, [address]);

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
        <DialogContent sx={{ p: 5, pt: 0 }}>
          <Stack alignItems="center">
            <AddressAvatar address={address} />
            <Typography variant="h4" component="span" sx={{ mt: 1.5 }}>
              <AddressName address={address} />
            </Typography>
            <Typography variant="h5" color="text.secondary">
              1 MATIC
            </Typography>
          </Stack>

          <Stack direction="row" gap={1} sx={{ my: 4 }}>
            <Button
              variant="outlined"
              color="secondary"
              size="large"
              endIcon={<ContentCopyRoundedIcon />}
              sx={{ flex: 1 }}
              onClick={onCopyAddress}
            >
              Copy Address
            </Button>

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
              autoComplete="false"
              sx={{ flex: 1 }}
            />
            <IconButton color="secondary" sx={{ border: "1px solid #D1D2D3" }}>
              <ArrowForwardRoundedIcon />
            </IconButton>
          </Stack>
        </DialogContent>
      )}
    </ResponsiveDialog>
  );
};

export default AccountModal;
