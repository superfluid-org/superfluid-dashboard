import {
  Typography,
  Container,
  Stack,
} from "@mui/material";
import { NextPage } from "next";
import NotificationSettings from "../components/NotificationSettings/NotificationSettings";
import withStaticSEO from "../components/SEO/withStaticSEO";
import { useAccount } from "wagmi";
import NoWalletConnected from "../components/NoWalletConnected/NoWalletConnected";
import PermissionAndAllowancesTables from "../features/permissionAndAllowances/PermissionAndAllowancesTables";
import { useVisibleAddress } from "../features/wallet/VisibleAddressContext";

const SettingsPage: NextPage = () => {
  const { address } = useAccount();
  const { visibleAddress } = useVisibleAddress();

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
            {visibleAddress && <PermissionAndAllowancesTables address={visibleAddress} />}
          </Stack>
        </>
      )}
    </Container>
  );
};

export default withStaticSEO({ title: "Settings | Superfluid" }, SettingsPage);
