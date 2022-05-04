import { Box, Container } from "@mui/material";
import { NextPage } from "next";
import SendCard from "../features/send/SendCard";

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
        <SendCard />
      </Box>
    </Container>
  );
};

export default Send;
