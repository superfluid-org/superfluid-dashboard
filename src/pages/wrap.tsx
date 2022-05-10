import { Box, Container } from "@mui/material";
import type { NextPage } from "next";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { SelectedTokenContextProvider } from "../features/tokenWrapping/SelectedTokenPairContext";
import { WrapCard } from "../features/tokenWrapping/WrapCard";
import { useTransactionRestorationContext } from "../features/transactionRestoration/TransactionRestorationContext";
import {
  SuperTokenDowngradeRestoration,
  SuperTokenUpgradeRestoration,
  RestorationType,
} from "../features/transactionRestoration/transactionRestorations";

const Wrap: NextPage = () => {
  const router = useRouter();
  const { upgrade, downgrade } = router.query;
  const [tabValue, setTabValue] = useState<
    "upgrade" | "downgrade" | undefined
  >();

  useEffect(() => {
    if (upgrade !== undefined) {
      setTabValue("upgrade");
    } else if (downgrade !== undefined) {
      setTabValue("downgrade");
    } else {
      setTabValue("upgrade");
    }
  }, [upgrade, downgrade]);

  const { restoration, onRestored } = useTransactionRestorationContext();

  const [upgradeRestoration, setUpgradeRestoration] = useState<
    SuperTokenUpgradeRestoration | undefined
  >();

  const [downgradeRestoration, setDowngradeRestoration] = useState<
    SuperTokenDowngradeRestoration | undefined
  >();

  useEffect(() => {
    if (restoration) {
      switch (restoration.type) {
        case RestorationType.Upgrade:
          setUpgradeRestoration(restoration);
          break;
        case RestorationType.Downgrade:
          setDowngradeRestoration(restoration);
          break;
      }
      onRestored();
    }
  }, [setUpgradeRestoration, setDowngradeRestoration, restoration, onRestored]);

  return (
    <Container maxWidth="lg">
      <Box
        sx={{
          my: 4,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <SelectedTokenContextProvider>
          {tabValue && (
            <WrapCard
              tabValue={tabValue}
              upgradeRestoration={upgradeRestoration}
              downgradeRestoration={downgradeRestoration}
              onTabChange={(tabValue) => {
                setTabValue(tabValue);
                // Reset restorations on tab change.
                setUpgradeRestoration(undefined);
                setDowngradeRestoration(undefined);
              }}
            />
          )}
        </SelectedTokenContextProvider>
      </Box>
    </Container>
  );
};

export default Wrap;
