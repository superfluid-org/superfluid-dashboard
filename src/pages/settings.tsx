import { Typography, Container, Stack, CircularProgress } from "@mui/material";
import { NextPage } from "next";
import NotificationSettings from "../components/NotificationSettings/NotificationSettings";
import withStaticSEO from "../components/SEO/withStaticSEO";
import { useAccount } from "@/hooks/useAccount";
import NoWalletConnected from "../components/NoWalletConnected/NoWalletConnected";
import TokenAccessTables from "../features/tokenAccess/TokenAccessTables";
import { useVisibleAddress } from "../features/wallet/VisibleAddressContext";
import { Suspense, useEffect, useState } from "react";

const SettingsPage: NextPage = () => {
  const { address } = useAccount();
  const { visibleAddress } = useVisibleAddress();
  const [isReady, setIsReady] = useState(false);

  // Add a slight delay before showing to ensure wallet connection is established
  useEffect(() => {
    if (visibleAddress) {
      // Wait a moment to ensure connection is established
      const timer = setTimeout(() => {
        setIsReady(true);
      }, 100);
      return () => clearTimeout(timer);
    } else {
      setIsReady(false);
    }
  }, [visibleAddress]);

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
            {/* 
            // Notifications hidden until a source of notifications is added.
            <NotificationSettings /> 
            */}
            {visibleAddress && (
              <Suspense
                fallback={
                  <Stack
                    height="300px"
                    alignItems="center"
                    justifyContent="center"
                  >
                    <CircularProgress />
                  </Stack>
                }
              >
                <div key={`settings-${visibleAddress}-${isReady}`}>
                  {isReady && <TokenAccessTables />}
                </div>
              </Suspense>
            )}
          </Stack>
        </>
      )}
    </Container>
  );
};

export default withStaticSEO({ title: "Settings | Superfluid" }, SettingsPage);
