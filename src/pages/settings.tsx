import {
  Typography,
  Container,
  Stack,
} from "@mui/material";
import { NextPage } from "next";
import withStaticSEO from "../components/SEO/withStaticSEO";
import { useAccount } from "@/hooks/useAccount"
import NoWalletConnected from "../components/NoWalletConnected/NoWalletConnected";
import { TokenAccessTables } from "../features/tokenAccess/TokenAccessTables";
import { useVisibleAddress } from "../features/wallet/VisibleAddressContext";

const SettingsPage: NextPage = () => {
  const { address } = useAccount();
  const { visibleAddress } = useVisibleAddress();

  return (
    <Container maxWidth="lg" key={visibleAddress}>
      {!address ? (
        <NoWalletConnected />
      ) : (
        <>
          <Typography component="h1" variant="h4" mb="16px" ml="4px">
            Settings
          </Typography>
          <Stack direction="column" gap={"30px"}>
            {/* 
            // Notifications hidden until a source of notifications is added.
            <NotificationSettings /> 
            */}
            {visibleAddress && <TokenAccessTables key={visibleAddress} />}
          </Stack>
        </>
      )}
    </Container>
  );
};

export default withStaticSEO({ title: "Settings | Superfluid" }, SettingsPage);
