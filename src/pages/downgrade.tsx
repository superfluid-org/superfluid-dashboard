import { Box, Container } from "@mui/material";
import type { NextPage } from "next";
import { WrappingWidget } from "../components/TokenWrapping/WrappingWidget";

const Downgrade: NextPage = () => {
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
        <WrappingWidget tabValue="downgrade"></WrappingWidget>
      </Box>
    </Container>
  );
};

export default Downgrade;
