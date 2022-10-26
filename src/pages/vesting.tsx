import { Box, Card, Container, useTheme } from "@mui/material";
import { NextPage } from "next";
import { useExpectedNetwork } from "../features/network/ExpectedNetworkContext";
import VestingForm from "../features/vesting/VestingForm";
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
        <Card>
          <VestingFormProvider>
            <VestingForm />
          </VestingFormProvider>
        </Card>
      </Box>
    </Container>
  );
};

export default VestingPage;
