import { NextPage } from "next";
import { useVisibleAddress } from "../features/wallet/VisibleAddressContext";
import { FC } from "react";
import { Box, Container, Paper, Typography, useMediaQuery, useTheme } from "@mui/material";
import ConnectWallet from "../features/wallet/ConnectWallet";
import withStaticSEO from "../components/SEO/withStaticSEO";
import ScheduledWrapTables from "../features/auto-wrap/ScheduledWrapTables";

const NoWalletConnected: FC = () => {
  const theme = useTheme();
  const isBelowMd = useMediaQuery(theme.breakpoints.down("md"));

  return (
    <Paper
      elevation={1}
      sx={{
        px: 4,
        py: 7,
        [theme.breakpoints.down("md")]: {
          px: 2,
          py: 3,
        },
      }}
    >
      <Typography
        data-cy={"no-user-settings"}
        variant={isBelowMd ? "h5" : "h4"}
        textAlign="center"
      >
        Wallet not connected
      </Typography>
      <Typography
        data-cy={"no-history-text"}
        color="text.secondary"
        textAlign="center"
      >
        Wallet is not connected, please connect wallet to modify settings.
      </Typography>

      <Box sx={{ maxWidth: 400, width: "100%", mx: "auto", mt: 4 }}>
        <ConnectWallet />
      </Box>
    </Paper>
  );
};

const AutoWrap: NextPage = () => {
  const { visibleAddress } = useVisibleAddress();

  return (
    <Container maxWidth="lg" key={visibleAddress}>
      {visibleAddress ? (
        <ScheduledWrapTables address={visibleAddress} />
      ) : (
        <NoWalletConnected />
      )}
    </Container>
  );
};

export default withStaticSEO({ title: "Auto-Wrap | Superfluid" }, AutoWrap);
