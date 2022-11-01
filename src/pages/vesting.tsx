import { Box, Card, Container, Typography, useTheme } from "@mui/material";
import { NextPage } from "next";
import { useExpectedNetwork } from "../features/network/ExpectedNetworkContext";
import { CreateVestingCard } from "../features/vesting/CreateVestingCard";
import CreateVestingFormProvider from "../features/vesting/CreateVestingFormProvider";

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
        <CreateVestingFormProvider>
          <CreateVestingCard />
        </CreateVestingFormProvider>
      </Box>
    </Container>
  );
};

export default VestingPage;
