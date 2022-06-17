import PersonSearchIcon from "@mui/icons-material/PersonSearch";
import { Box, Button, Container, Stack, Typography } from "@mui/material";
import type { NextPage } from "next";
import { FC, useCallback, useState } from "react";
import AddressSearchDialog from "../components/AddressSearchDialog/AddressSearchDialog";
import AddressSearchIndex from "../features/impersonation/AddressSearchIndex";
import { useImpersonation } from "../features/impersonation/ImpersonationContext";
import TokenSnapshotTables from "../features/tokenSnapshotTable/TokenSnapshotTables";
import ConnectWallet from "../features/wallet/ConnectWallet";
import { useVisibleAddress } from "../features/wallet/VisibleAddressContext";

const ConnectView: FC = () => {
  const { impersonate } = useImpersonation();
  const [addressSearchOpen, setAddressSearchOpen] = useState(false);
  const openAddressSearchDialog = useCallback(
    () => setAddressSearchOpen(true),
    [setAddressSearchOpen]
  );
  const closeAddressSearchDialog = useCallback(
    () => setAddressSearchOpen(false),
    [setAddressSearchOpen]
  );
  const onImpersonate = useCallback(
    (address: string) => impersonate(address),
    []
  );

  return (
    <Stack sx={{ maxWidth: 500, m: "0 auto" }}>
      <Typography variant="h4" textAlign="center" sx={{ mb: 1 }}>
        Connect to Superfluid
      </Typography>
      <Typography
        variant="h6"
        color="text.secondary"
        textAlign="center"
        sx={{ mb: 6 }}
      >
        Connect your wallet, view any wallet, or take a look around!
      </Typography>

      <ConnectWallet />

      <Typography variant="h6" textAlign="center" sx={{ my: 2 }}>
        -or-
      </Typography>

      <Box>
        <Stack data-cy={"view-mode-inputs"} direction="row" gap={2.5}>
          <Button
            variant="outlined"
            color="secondary"
            size="xl"
            startIcon={<PersonSearchIcon />}
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
    </Stack>
  );
};

const Home: NextPage = () => {
  const { visibleAddress } = useVisibleAddress();

  return (
    <Container maxWidth="lg">
      {visibleAddress ? (
        <TokenSnapshotTables address={visibleAddress} />
      ) : (
        <ConnectView />
      )}
    </Container>
  );
};

export default Home;
