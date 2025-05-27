import { Box, Container, useTheme } from "@mui/material";
import type { NextPage } from "next";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import withStaticSEO from "../components/SEO/withStaticSEO";
import { useExpectedNetwork } from "../features/network/ExpectedNetworkContext";
import WrapCard from "../features/tokenWrapping/WrapCard";
import WrappingFormProvider from "../features/tokenWrapping/WrappingFormProvider";
import { useTransactionRestorationContext } from "../features/transactionRestoration/TransactionRestorationContext";
import {
  RestorationType,
  SuperTokenDowngradeRestoration as SuperTokenUnwrapRestoration,
  SuperTokenUpgradeRestoration as SuperTokenWrapRestoration,
} from "../features/transactionRestoration/transactionRestorations";


const Wrap: NextPage = () => {
  const theme = useTheme();
  const router = useRouter();
  const { network } = useExpectedNetwork();
  const { upgrade, downgrade } = router.query;
  const [tabValue, setTabValue] = useState<
    "upgrade" | "downgrade"
  >("upgrade");

  useEffect(() => {
    const newTabValue = downgrade !== undefined ? "downgrade" : "upgrade"; // Default is "upgrade".
    setTabValue(newTabValue);
  }, [upgrade, downgrade]);

  const { restoration, onRestored } = useTransactionRestorationContext();

  let wrapRestoration: SuperTokenWrapRestoration | undefined;
  let unwrapRestoration: SuperTokenUnwrapRestoration | undefined;

  if (restoration) {
    switch (restoration.type) {
      case RestorationType.Wrap:
        wrapRestoration = restoration as SuperTokenWrapRestoration;
        break;
      case RestorationType.Unwrap:
        unwrapRestoration = restoration as SuperTokenUnwrapRestoration;
        break;
    }
    onRestored();
  }

  return (
    <Container key={`${network.slugName}`} maxWidth="lg">
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          [theme.breakpoints.up("md")]: {
            my: 4,
          },
        }}
      >
        <WrappingFormProvider
          restoration={wrapRestoration || unwrapRestoration}
        >
          {tabValue && <WrapCard tabValue={tabValue} />}
        </WrappingFormProvider>
      </Box>
    </Container>
  );
};

export default withStaticSEO({ title: "Wrap / Unwrap | Superfluid" }, Wrap);