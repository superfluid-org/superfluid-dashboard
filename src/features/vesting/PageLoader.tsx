import { CircularProgress, Container } from "@mui/material";
import { FC } from "react";

export const PageLoader: FC = () => {
  return (
    <Container maxWidth="md">
      <CircularProgress size="48px" />
    </Container>
  );
};
