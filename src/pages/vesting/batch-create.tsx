import { Box, Card, Container, useTheme } from "@mui/material";
import { ReactElement } from "react";
import withStaticSEO from "../../components/SEO/withStaticSEO";
import { useExpectedNetwork } from "../../features/network/ExpectedNetworkContext";
import ConnectionBoundary from "../../features/transactionBoundary/ConnectionBoundary";
import { BigLoader } from "../../features/vesting/BigLoader";
import VestingLayout from "../../features/vesting/VestingLayout";
import { NextPageWithLayout } from "../_app";
import { useAccount } from "@/hooks/useAccount"
import { useWhitelist } from "../../hooks/useWhitelist";
import { BatchVestingFormProvider } from "../../features/vesting/batch/BatchVestingFormProvider";
import { BatchVestingSection } from "../../features/vesting/batch/BatchVestingSection";


const BatchCreateVestingSchedulePage: NextPageWithLayout = () => {
  const theme = useTheme();

  const { network } = useExpectedNetwork();
  const { address: accountAddress } = useAccount();

  const { isPlatformWhitelisted, isWhitelistLoading } = useWhitelist({ accountAddress, network });

  return (
    <Container key={`${network.slugName}`} maxWidth="md">
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
        <ConnectionBoundary>
          <Card
            elevation={1}
            sx={{
              maxWidth: "600px",
              width: "100%",
              position: "relative",
              [theme.breakpoints.down("md")]: {
                boxShadow: "none",
                backgroundImage: "none",
                borderRadius: 0,
                border: 0,
                p: 0,
              },
            }}
          >
            <BatchVestingFormProvider>
              {(isInitialized) =>
                isInitialized && !isWhitelistLoading ? (
                  <BatchVestingSection whitelisted={isPlatformWhitelisted} />
                ) : (
                  <BigLoader />
                )
              }
            </BatchVestingFormProvider>
          </Card>
        </ConnectionBoundary>
      </Box>
    </Container>
  );
};

BatchCreateVestingSchedulePage.getLayout = (page: ReactElement) => (
  <VestingLayout>{page}</VestingLayout>
);

export default withStaticSEO(
  { title: "Create Batch of Vesting Schedules | Superfluid" },
  BatchCreateVestingSchedulePage
);
