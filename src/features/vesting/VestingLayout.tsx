import { Box, Container, Typography } from "@mui/material";
import { FC, PropsWithChildren } from "react";
import { useExpectedNetwork } from "../network/ExpectedNetworkContext";

export const VestingLayout: FC<PropsWithChildren> = ({ children }) => {
  const { network } = useExpectedNetwork();

  return (
    <Container key={`${network.slugName}`} maxWidth="md">
      <Box sx={{ mb: 3 }}>
        <Typography component="h1" variant="h4">
          Vesting
        </Typography>
        <Typography variant="subtitle1">
          You can vest using Superfluid streams! Look at the tutorial here.
        </Typography>
      </Box>
      {children}
    </Container>
  );
};
