import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import PersonSearchIcon from "@mui/icons-material/PersonSearch";
import {
  Box,
  Button,
  Container,
  InputAdornment,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { isAddress } from "ethers/lib/utils";
import type { NextPage } from "next";
import { FC, useMemo, useState } from "react";
import { useImpersonation } from "../features/impersonation/ImpersonationContext";
import TokenSnapshotTables from "../features/tokenSnapshotTable/TokenSnapshotTables";
import ConnectWallet from "../features/wallet/ConnectWallet";
import { useVisibleAddress } from "../features/wallet/VisibleAddressContext";

const ConnectView: FC = () => {
  const { impersonate } = useImpersonation();
  const [impersonateAddress, setImpersonateAddress] = useState("");
  const isValidImpersonateAddress = useMemo(
    () => isAddress(impersonateAddress),
    [impersonateAddress]
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

      <Box sx={{ mb: 2 }}>
        <ConnectWallet />
      </Box>

      <Typography variant="h6" textAlign="center" sx={{ mb: 1 }}>
        -or-
      </Typography>

      <Box>
        <Typography variant="h6" sx={{ mb: 1 }}>
          View any account
        </Typography>
        <Stack data-cy={"view-mode-inputs"} direction="row" gap={2.5}>
          <TextField
            hiddenLabel
            placeholder="Paste any account address"
            value={impersonateAddress}
            onChange={(e) => setImpersonateAddress(e.target.value)}
            sx={{
              flex: 1,
              padding: 0,
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <PersonSearchIcon />
                </InputAdornment>
              ),
            }}
          />
          <Button
            data-cy={"view-mode-search-button"}
            disabled={!isValidImpersonateAddress}
            title="View address"
            variant="outlined"
            color="secondary"
            size="small"
            sx={{ p: 0, minWidth: "56px", justifyContent: "center" }}
            onClick={() => impersonate(impersonateAddress)}
          >
            <ArrowForwardIcon />
          </Button>
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
