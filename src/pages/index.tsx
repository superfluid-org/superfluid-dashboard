import {
  useTheme,
  Button,
  Avatar,
  Container,
  Stack,
  Typography,
  IconButton,
  OutlinedInput,
  Box,
} from "@mui/material";
import type { NextPage } from "next";
import { FC } from "react";
import TokenSnapshotTables from "../features/tokenSnapshotTable/TokenSnapshotTables";
import { useWalletContext } from "../features/wallet/WalletContext";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import ConnectWallet from "../features/wallet/ConnectWallet";

const WalletOptions = [
  "Metamask",
  "WalletConnect",
  "Gnosis Safe",
  "Portis",
  "Coinbase Wallet",
];

const ConnectView: FC = () => {
  const theme = useTheme();

  return (
    <Stack sx={{ maxWidth: 500, m: "0 auto" }} gap={6}>
      <Typography variant="h4">Connect to Superfluid</Typography>

      <Box>
        <Typography variant="h6" sx={{ mb: 1 }}>
          Connect wallet
        </Typography>
        <Stack
          sx={{ display: "grid", gap: 2.5, gridTemplateColumns: "1fr 1fr" }}
        >
          {WalletOptions.map((walletName, index) => (
            <Button
              key={walletName}
              variant={index === 0 ? "contained" : "outlined"}
              color={index === 0 ? "primary" : "secondary"}
              size="large"
              endIcon={<Avatar sx={{ width: 24, height: 24 }} />}
              sx={{
                ...(index === 0
                  ? { gridColumn: "1/3" }
                  : { ".MuiButton-endIcon": { ml: "auto" } }),
              }}
            >
              {walletName}
            </Button>
          ))}
        </Stack>
      </Box>

      <Box>
        <Typography variant="h6" sx={{ mb: 1 }}>
          View any wallet
        </Typography>
        <Stack direction="row" gap={2.5}>
          <OutlinedInput
            placeholder="Paste any wallet address"
            sx={{
              flex: 1,
              padding: 0,
              lineHeight: "44px",
              height: "44px",
            }}
          />
          <IconButton
            sx={{
              border: `1px solid ${theme.palette.other.outline}`,
              borderRadius: "10px",
              width: 44,
              height: 44,
            }}
          >
            <ArrowForwardIcon />
          </IconButton>
        </Stack>
      </Box>
    </Stack>
  );
};

const PlaceholderConnectView = () => {
  return (
    <Stack sx={{ maxWidth: 360, my: 4, mx: "auto" }} gap={4}>
      <Typography variant="h4" textAlign="center">
        Connect to Superfluid
      </Typography>
      <ConnectWallet />
    </Stack>
  );
};

const Home: NextPage = () => {
  const { walletAddress } = useWalletContext();

  return (
    <Container maxWidth="lg">
      {walletAddress ? (
        <TokenSnapshotTables address={walletAddress} />
      ) : (
        <PlaceholderConnectView />
      )}
    </Container>
  );
};

export default Home;
