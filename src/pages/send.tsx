import { Box, Container } from "@mui/material";
import { NextPage } from "next";
import SendCard from "../features/send/SendCard";
import { SelectedTokenContextProvider } from "../features/tokenWrapping/SelectedTokenPairContext";

const Send: NextPage = () => {
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
          <SendCard />
        </SelectedTokenContextProvider>
      </Box>
    </Container>
  );
};

export default Send;
