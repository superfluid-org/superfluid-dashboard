import AddRoundedIcon from "@mui/icons-material/AddRounded";
import { Button, Container, Stack, Typography } from "@mui/material";
import NextLink from "next/link";
import { ReactElement } from "react";
import { useAccount } from "wagmi";
import withStaticSEO from "../components/SEO/withStaticSEO";
import VestingLayout from "../features/vesting/VestingLayout";
import VestingScheduleTables from "../features/vesting/VestingScheduleTables";
import { useVisibleAddress } from "../features/wallet/VisibleAddressContext";
import { NextPageWithLayout } from "./_app";

const VestingPage: NextPageWithLayout = () => {
  const { visibleAddress } = useVisibleAddress();
  const { address: accountAddress } = useAccount();
  return (
    <Container maxWidth="lg">
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        sx={{ mb: 4.5 }}
      >
        <Typography component="h1" variant="h4">
          Vesting
        </Typography>
        {accountAddress && (
          <NextLink href="/vesting/create" passHref>
            <Button
              data-cy="create-schedule-button"
              color="primary"
              variant="contained"
              endIcon={<AddRoundedIcon />}
            >
              Create Vesting Schedule
            </Button>
          </NextLink>
        )}
      </Stack>

      {visibleAddress && <VestingScheduleTables />}
    </Container>
  );
};

VestingPage.getLayout = function getLayout(page: ReactElement) {
  return <VestingLayout>{page}</VestingLayout>;
};

export default withStaticSEO({ title: "Vesting | Superfluid" }, VestingPage);
