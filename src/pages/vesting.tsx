import { Box, Card, Container, Typography, useTheme } from "@mui/material";
import { NextPage } from "next";
import { useExpectedNetwork } from "../features/network/ExpectedNetworkContext";
import { CreateVestingScheduleCard } from "../features/vesting/VestingForm";
import VestingFormProvider from "../features/vesting/VestingFormProvider";

const VestingPage: NextPage = () => {
  const theme = useTheme();
  const { network } = useExpectedNetwork();

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
        <Typography component="h1" variant="h4" sx={{ mb: 3 }}>
          Vesting
        </Typography>
        <VestingFormProvider>
          <CreateVestingScheduleCard />
        </VestingFormProvider>
      </Box>
    </Container>
  );
};

export default VestingPage;
