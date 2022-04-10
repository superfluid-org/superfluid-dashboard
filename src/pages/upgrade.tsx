import { Box, Container } from "@mui/material";
import type { NextPage } from "next";
import { TokenPanel } from "../components/TokenWrapping/TokenPanel";

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
        <TokenPanel tabValue="upgrade"></TokenPanel>
      </Box>
    </Container>
  );
};

export default Upgrade;
