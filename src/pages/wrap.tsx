import { Box, Container } from "@mui/material";
import type { NextPage } from "next";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import WrapCard from "../features/tokenWrapping/WrapCard";
import WrappingFormProvider from "../features/tokenWrapping/WrappingFormProvider";
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
    const newTabValue = downgrade !== undefined ? "downgrade" : "upgrade"; // Default is "upgrade".
    setTabValue(newTabValue);
  }, [upgrade, downgrade]);

  const { restoration, onRestored } = useTransactionRestorationContext();

  let upgradeRestoration: SuperTokenUpgradeRestoration | undefined;
  let downgradeRestoration: SuperTokenDowngradeRestoration | undefined;

  if (restoration) {
    switch (restoration.type) {
      case RestorationType.Upgrade:
        upgradeRestoration = restoration as SuperTokenUpgradeRestoration;
        break;
      case RestorationType.Downgrade:
        downgradeRestoration = restoration as SuperTokenDowngradeRestoration;
        break;
    }
    onRestored();
  }

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
        <WrappingFormProvider restoration={upgradeRestoration || downgradeRestoration} >
          {tabValue && (
            <WrapCard
              tabValue={tabValue}
            />
          )}
        </WrappingFormProvider>
      </Box>
    </Container>
  );
};

export default Wrap;
