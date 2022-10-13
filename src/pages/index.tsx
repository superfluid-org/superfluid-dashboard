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
import { useRouter } from "next/router";
import { FC, useCallback, useEffect, useState } from "react";
import AddressSearchDialog from "../components/AddressSearchDialog/AddressSearchDialog";
import withStaticSEO from "../components/SEO/withStaticSEO";
import FaucetDialog from "../features/faucet/FaucetDialog";
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
      translate="yes"
    >
      <Typography variant="h4" component="h1" textAlign="center" sx={{ mb: 1 }}>
        Connect to Superfluid
      </Typography>
      <Typography
        variant="h6"
        component="p"
        color="text.secondary"
        textAlign="center"
        sx={{ mb: 4 }}
      >
        Connect your wallet, view any wallet, or take a look around!
      </Typography>

      <OnboardingCards />

      <Box sx={{ maxWidth: 400, width: "100%", mx: "auto", mt: 4 }}>
        <ConnectWallet />

        <Typography
          variant="h6"
          component="p"
          textAlign="center"
          sx={{ my: 2 }}
        >
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

      <Typography
        variant="h7"
        component="p"
        color="secondary"
        textAlign="center"
      >
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

  const router = useRouter();

  const [faucetDialogOpen, setFaucetDialogOpen] = useState(false);

  useEffect(() => {
    const { showFaucet, ...remainingQuery } = router.query;

    if (!faucetDialogOpen && Boolean(showFaucet)) {
      setFaucetDialogOpen(true);

      router.replace(
        {
          query: remainingQuery,
        },
        undefined,
        {
          shallow: true,
        }
      );
    }
  }, [faucetDialogOpen, router]);

  const closeFaucetDialog = () => setFaucetDialogOpen(false);

  return (
    <Container maxWidth="lg">
      {visibleAddress ? (
        <TokenSnapshotTables address={visibleAddress} />
      ) : (
        <ConnectView />
      )}

      {faucetDialogOpen && <FaucetDialog onClose={closeFaucetDialog} />}
    </Container>
  );
};

export default withStaticSEO({ title: "Dashboard | Superfluid" }, Home);
