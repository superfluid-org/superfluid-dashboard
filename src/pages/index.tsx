import PersonSearchIcon from "@mui/icons-material/PersonSearch";
import {
  Box,
  Button,
  Container,
  Divider,
  Link,
  Stack,
  Typography,
  useTheme,
} from "@mui/material";
import type { NextPage } from "next";
import { FC, useCallback, useState } from "react";
import AddressSearchDialog from "../components/AddressSearchDialog/AddressSearchDialog";
import SEO from "../components/SEO/SEO";
import AddressSearchIndex from "../features/impersonation/AddressSearchIndex";
import { useImpersonation } from "../features/impersonation/ImpersonationContext";
import OnboardingCards from "../features/onboarding/OnboardingCards";
import TokenSnapshotTables from "../features/tokenSnapshotTable/TokenSnapshotTables";
import ConnectWallet from "../features/wallet/ConnectWallet";
import { useVisibleAddress } from "../features/wallet/VisibleAddressContext";

const ConnectView: FC = () => {
  const theme = useTheme();
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
    [impersonate]
  );

  return (
    <Stack
      sx={{
        pt: 6,
        [theme.breakpoints.down("md")]: {
          pt: 2,
        },
      }}
    >
      <Typography variant="h4" textAlign="center" sx={{ mb: 1 }}>
        Connect to Superfluid
      </Typography>
      <Typography
        variant="h6"
        color="text.secondary"
        textAlign="center"
        sx={{ mb: 4 }}
      >
        Connect your wallet, view any wallet, or take a look around!
      </Typography>

      <OnboardingCards />

      <Box sx={{ maxWidth: 400, width: "100%", mx: "auto", mt: 4 }}>
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

        <Divider sx={{ mt: 6, mb: 4.5 }} />
      </Box>

      <Typography variant="h7" color="secondary" textAlign="center">
        By connecting your wallet, you accept our{" "}
        <Link href="https://www.superfluid.finance/termsofuse/" target="_blank">
          Terms of Use
        </Link>
        {" and "}
        <Link
          href="https://www.iubenda.com/privacy-policy/34415583/legal"
          target="_blank"
        >
          Privacy Policy
        </Link>
      </Typography>
    </Stack>
  );
};

const Home: NextPage = () => {
  const { visibleAddress } = useVisibleAddress();

  return (
    <SEO title="Dashboard | Superfluid">
      <Container maxWidth="lg">
        {visibleAddress ? (
          <TokenSnapshotTables address={visibleAddress} />
        ) : (
          <ConnectView />
        )}
      </Container>
    </SEO>
  );
};

export default Home;
