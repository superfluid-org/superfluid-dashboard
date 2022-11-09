import { Box, Container, Typography } from "@mui/material";
import { FC, PropsWithChildren } from "react";
import { useExpectedNetwork } from "../network/ExpectedNetworkContext";

export const VestingLayout: FC<PropsWithChildren> = ({ children }) => {
  const { network } = useExpectedNetwork();

  return (
    <Container key={`${network.slugName}`} maxWidth="md">
      <Box sx={{ mb: 5 }}>
        <Typography component="h1" variant="h4">
          Vesting
        </Typography>
        <Typography variant="subtitle1">
          You can now vest using Superfluid streams!
        </Typography>
      </Box>
      {children}
    </Container>
  );
};
