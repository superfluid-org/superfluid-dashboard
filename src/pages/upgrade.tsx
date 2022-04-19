import { Box, Container } from "@mui/material";
import type { NextPage } from "next";
import { Wrap } from "../features/tokenWrapping/Wrap";

const Upgrade: NextPage = () => {
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
        <Wrap tabValue="upgrade"></Wrap>
      </Box>
    </Container>
  );
};

export default Upgrade;
