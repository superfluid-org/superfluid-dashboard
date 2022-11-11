import { Box, Container, Divider, Stack, Typography } from "@mui/material";
import { FC, PropsWithChildren } from "react";
import { useExpectedNetwork } from "../network/ExpectedNetworkContext";

export const VestingLayout: FC<
  PropsWithChildren
> = ({ children }) => {
  const { network } = useExpectedNetwork();

  return (
    <Container key={`${network.slugName}`} maxWidth="lg">
      <Stack gap={4.5}>
        <Box>
          <Typography component="h1" variant="h3">
            Vesting
          </Typography>
            <Typography variant="subtitle1">
              You can now vest using Superfluid streams!
            </Typography>
        </Box>
        <Divider />
        {children}
      </Stack>
    </Container>
  );
};
