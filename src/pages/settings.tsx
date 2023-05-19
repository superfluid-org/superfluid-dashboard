import {
  Typography,
  Box,
  Container,
  Stack,
  Divider,
  useTheme,
  useMediaQuery,
  Paper,
} from "@mui/material";
import { NextPage } from "next";
import NotificationSettings from "../components/NotificationSettings/NotificationSettings";
import withStaticSEO from "../components/SEO/withStaticSEO";
import { useAccount } from "wagmi";
import NoWalletConnected from "../components/NoWalletConnected/NoWalletConnected";
import PermissionAndAllowances from "../features/permissionAndAllowances/PermissionAndAllowances";

const SettingsPage: NextPage = () => {
  const { address } = useAccount();

  return (
    <Container maxWidth="lg">
      {!address ? (
        <NoWalletConnected />
      ) : (
        <>
          <Typography component="h1" variant="h4" mb="16px" ml="4px">
            Settings
          </Typography>
          <Stack direction="column" gap={"30px"}>
            <NotificationSettings />
            <PermissionAndAllowances />
          </Stack>
        </>
      )}
    </Container>
  );
};

export default withStaticSEO({ title: "Settings | Superfluid" }, SettingsPage);
