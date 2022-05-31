import {
  useTheme,
  Container,
  Stack,
  Typography,
  IconButton,
  Box,
  InputAdornment,
  TextField,
} from "@mui/material";
import type { NextPage } from "next";
import { FC, useMemo, useState } from "react";
import TokenSnapshotTables from "../features/tokenSnapshotTable/TokenSnapshotTables";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import ConnectWallet from "../features/wallet/ConnectWallet";
import { useVisibleAddress } from "../features/wallet/VisibleAddressContext";
import PersonSearchIcon from "@mui/icons-material/PersonSearch";
import { isAddress } from "ethers/lib/utils";
import { useImpersonation } from "../features/impersonation/ImpersonationContext";

const ConnectView: FC = () => {
  const theme = useTheme();

  const { impersonate } = useImpersonation();
  const [impersonateAddress, setImpersonateAddress] = useState("");
  const isValidImpersonateAddress = useMemo(
    () => isAddress(impersonateAddress),
    [impersonateAddress]
  );

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
        <Typography variant="h6" sx={{ mb: 1 }}>
          View any account
        </Typography>
        <Stack direction="row" gap={2.5}>
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
          <IconButton
            disabled={!isValidImpersonateAddress}
            title="View address"
            sx={{
              border: `1px solid ${theme.palette.other.outline}`,
              borderRadius: "10px",
            }}
            onClick={() => impersonate(impersonateAddress)}
          >
            <ArrowForwardIcon />
          </IconButton>
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
