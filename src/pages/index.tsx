import {
  useTheme,
  Container,
  Stack,
  Typography,
  Box,
  Button,
} from "@mui/material";
import type { NextPage } from "next";
import { FC, useState, useCallback } from "react";
import TokenSnapshotTables from "../features/tokenSnapshotTable/TokenSnapshotTables";
import ConnectWallet from "../features/wallet/ConnectWallet";
import { useVisibleAddress } from "../features/wallet/VisibleAddressContext";
import PersonSearchIcon from "@mui/icons-material/PersonSearch";
import { useImpersonation } from "../features/impersonation/ImpersonationContext";
import AddressSearchIndex from "../features/impersonation/AddressSearchIndex";
import AddressSearchDialog from "../components/AddressSearchDialog/AddressSearchDialog";

const ConnectView: FC = () => {
  const { impersonate } = useImpersonation();
  const [addressSearchOpen, setAddressSearchOpen] = useState(false);
  const openAddressSearchDialog = useCallback(() => setAddressSearchOpen(true), [setAddressSearchOpen]);
  const closeAddressSearchDialog = useCallback(() => setAddressSearchOpen(false), [setAddressSearchOpen]);
  const onImpersonate = useCallback((address: string) => impersonate(address), [])

  return (
    <Stack sx={{ maxWidth: 500, m: "0 auto" }} gap={6}>
      <Typography variant="h4">Connect to Superfluid</Typography>

      <Box>
        <ConnectWallet />
      </Box>

      <Box alignContent="center">
        <Typography variant="h6">-or-</Typography>
      </Box>

      <Box>
        <Stack data-cy={"view-mode-inputs"} direction="row" gap={2.5}>
          <Button
            variant="outlined"
            color="secondary"
            size="xl"
            startIcon={<PersonSearchIcon />}
            onClick={openAddressSearchDialog}
            sx={{ maxWidth: "400px", justifyContent: "flex-start" }}
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
