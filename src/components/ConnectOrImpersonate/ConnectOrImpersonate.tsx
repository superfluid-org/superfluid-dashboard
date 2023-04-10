import PersonSearchRoundedIcon from "@mui/icons-material/PersonSearchRounded";
import {
  Box,
  Button,
  Stack,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { FC, useCallback, useState } from "react";
import AddressSearchIndex from "../../features/impersonation/AddressSearchIndex";
import { useImpersonation } from "../../features/impersonation/ImpersonationContext";
import ConnectWallet from "../../features/wallet/ConnectWallet";
import AddressSearchDialog from "../AddressSearchDialog/AddressSearchDialog";

interface ConnectOrImpersonateProps {}

const ConnectOrImpersonate: FC<ConnectOrImpersonateProps> = ({}) => {
  const theme = useTheme();
  const isBelowMd = useMediaQuery(theme.breakpoints.down("md"));

  const { impersonate } = useImpersonation();

  const [addressSearchOpen, setAddressSearchOpen] = useState(false);

  const openAddressSearchDialog = () => setAddressSearchOpen(true);
  const closeAddressSearchDialog = () => setAddressSearchOpen(false);

  const onImpersonate = useCallback(
    (address: string) => impersonate(address),
    [impersonate]
  );

  return (
    <>
      <ConnectWallet
        ButtonProps={{ size: isBelowMd ? "large" : "xl", fullWidth: true }}
      />

      <Typography variant="h6" component="p" textAlign="center" sx={{ my: 2 }}>
        -or-
      </Typography>

      <Box>
        <Stack direction="row" justifyContent="center" gap={2.5}>
          <Button
            fullWidth
            variant="outlined"
            color="secondary"
            size={isBelowMd ? "medium" : "xl"}
            startIcon={<PersonSearchRoundedIcon />}
            onClick={openAddressSearchDialog}
          >
            View the dashboard as any address
          </Button>
          <AddressSearchDialog
            title="Select Address To View"
            open={addressSearchOpen}
            onClose={closeAddressSearchDialog}
            onSelectAddress={onImpersonate}
            index={<AddressSearchIndex onSelectAddress={onImpersonate} />}
          />
        </Stack>
      </Box>
    </>
  );
};

export default ConnectOrImpersonate;
