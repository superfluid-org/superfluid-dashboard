import { Box, Container, Typography } from "@mui/material";
import { FC, PropsWithChildren } from "react";
import { useExpectedNetwork } from "../network/ExpectedNetworkContext";

export const VestingLayout: FC<
  PropsWithChildren<{
    showSubtitle?: boolean;
  }>
> = ({ children, showSubtitle }) => {
  const { network } = useExpectedNetwork();

  return (
    <Container key={`${network.slugName}`} maxWidth="lg">
      <Box sx={{ mb: 5 }}>
        <Typography component="h1" variant="h4">
          Vesting
        </Typography>
        {showSubtitle && (
          <Typography variant="subtitle1">
            You can now vest using Superfluid streams!
          </Typography>
        )}
      </Box>
      {children}
    </Container>
  );
};
