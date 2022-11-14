import { Box, Card, Container, useTheme } from "@mui/material";
import { ReactElement } from "react";
import { useExpectedNetwork } from "../../features/network/ExpectedNetworkContext";
import NetworkBadge from "../../features/network/NetworkBadge";
import ConnectionBoundary from "../../features/transactionBoundary/ConnectionBoundary";
import CreateVestingFormProvider from "../../features/vesting/CreateVestingFormProvider";
import { CreateVestingSection } from "../../features/vesting/CreateVestingSection";
import { BigLoader } from "../../features/vesting/BigLoader";
import { VestingLayout } from "../../features/vesting/VestingLayout";
import { NextPageWithLayout } from "../_app";

const CreateVestingSchedulePage: NextPageWithLayout = () => {
  const theme = useTheme();
  const { network } = useExpectedNetwork();

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
          <NetworkBadge
            network={network}
            sx={{ position: "absolute", top: 0, right: theme.spacing(3.5) }}
            NetworkIconProps={{
              size: 32,
              fontSize: 18,
              sx: { [theme.breakpoints.down("md")]: { borderRadius: 1 } },
            }}
          />

          <ConnectionBoundary>
            <CreateVestingFormProvider>
              {(isInitialized) =>
                isInitialized ? <CreateVestingSection /> : <BigLoader />
              }
            </CreateVestingFormProvider>
          </ConnectionBoundary>
        </Card>
      </Box>
    </Container>
  );
};

CreateVestingSchedulePage.getLayout = function getLayout(page: ReactElement) {
  return <VestingLayout>{page}</VestingLayout>;
};

export default CreateVestingSchedulePage;
