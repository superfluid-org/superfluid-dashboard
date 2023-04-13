import { Box, Card, Container, useTheme } from "@mui/material";
import { ReactElement } from "react";
import withStaticSEO from "../../components/SEO/withStaticSEO";
import { useExpectedNetwork } from "../../features/network/ExpectedNetworkContext";
import NetworkBadge from "../../features/network/NetworkBadge";
import ConnectionBoundary from "../../features/transactionBoundary/ConnectionBoundary";
import { BigLoader } from "../../features/vesting/BigLoader";
import CreateVestingFormProvider from "../../features/vesting/CreateVestingFormProvider";
import { CreateVestingSection } from "../../features/vesting/CreateVestingSection";
import VestingLayout from "../../features/vesting/VestingLayout";
import { NextPageWithLayout } from "../_app";
import { platformApi } from "../../features/redux/platformApi/platformApi";
import { useAccount } from "wagmi";
import { useVisibleAddress } from "../../features/wallet/VisibleAddressContext";
import { skipToken } from "@reduxjs/toolkit/dist/query";

const CreateVestingSchedulePage: NextPageWithLayout = () => {
  const theme = useTheme();
  const { network } = useExpectedNetwork();
  const { address: accountAddress } = useAccount();

  const { isPlatformWhitelisted, isLoading: isWhitelistLoading } =
    platformApi.useIsAccountWhitelistedQuery(
      accountAddress && network?.platformUrl
        ? {
            chainId: network.id,
            baseUrl: network.platformUrl,
            account: accountAddress?.toLowerCase(),
          }
        : skipToken,
      {
        selectFromResult: (queryResult) => ({
          ...queryResult,
          isPlatformWhitelisted: !!queryResult.data,
        }),
      }
    );

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
          <ConnectionBoundary>
            <CreateVestingFormProvider>
              {(isInitialized) =>
                isInitialized && !isWhitelistLoading ? (
                  <CreateVestingSection whitelisted={isPlatformWhitelisted} />
                ) : (
                  <BigLoader />
                )
              }
            </CreateVestingFormProvider>
          </ConnectionBoundary>
        </Card>
      </Box>
    </Container>
  );
};

CreateVestingSchedulePage.getLayout = (page: ReactElement) => (
  <VestingLayout>{page}</VestingLayout>
);

export default withStaticSEO(
  { title: "Create Vesting Schedule | Superfluid" },
  CreateVestingSchedulePage
);
