import PersonSearchRoundedIcon from "@mui/icons-material/PersonSearchRounded";
import { Box, Button, Stack, Typography } from "@mui/material";
import { FC, useCallback, useState } from "react";
import AddressSearchIndex from "../../features/impersonation/AddressSearchIndex";
import { useImpersonation } from "../../features/impersonation/ImpersonationContext";
import ConnectWallet from "../../features/wallet/ConnectWallet";
import AddressSearchDialog from "../AddressSearchDialog/AddressSearchDialog";

interface ConnectOrImpersonateProps {}

const ConnectOrImpersonate: FC<ConnectOrImpersonateProps> = ({}) => {
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
      <ConnectWallet />

      <Typography variant="h6" component="p" textAlign="center" sx={{ my: 2 }}>
        -or-
      </Typography>

      <Box>
        <Stack direction="row" gap={2.5}>
          <Button
            variant="outlined"
            color="secondary"
            size="xl"
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
