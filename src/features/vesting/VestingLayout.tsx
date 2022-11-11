import {
  Box,
  Button,
  Container,
  Divider,
  Stack,
  Typography,
} from "@mui/material";
import { FC, PropsWithChildren } from "react";
import { useExpectedNetwork } from "../network/ExpectedNetworkContext";
import NextLink from "next/link";
import AddIcon from "@mui/icons-material/Add";

const VestingHeader = () => {
  return (
    <Stack direction="row" justifyContent="space-between" alignItems="center">
      <Box>
        <Typography component="h1" variant="h3">
          Vesting
        </Typography>
        <Typography variant="subtitle1">
          You can now vest using Superfluid streams!
        </Typography>
      </Box>
      <NextLink href="/vesting/create" passHref>
        <Button color="primary" variant="contained" endIcon={<AddIcon />}>
          Create Vesting Schedule
        </Button>
      </NextLink>
    </Stack>
  );
};

export const VestingLayout: FC<PropsWithChildren> = ({ children }) => {
  const { network } = useExpectedNetwork();

  return (
    <Container key={`${network.slugName}`} maxWidth="lg">
      <Stack gap={4.5}>
        <VestingHeader />
        <Divider />
        {children}
      </Stack>
    </Container>
  );
};
