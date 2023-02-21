import { Container, Typography } from "@mui/material";
import { ReactElement } from "react";
import withStaticSEO from "../components/SEO/withStaticSEO";
import VestingHeader from "../features/vesting/VestingHeader";
import VestingLayout from "../features/vesting/VestingLayout";
import VestingScheduleTables from "../features/vesting/VestingScheduleTables";
import { useVisibleAddress } from "../features/wallet/VisibleAddressContext";
import { NextPageWithLayout } from "./_app";

const VestingPage: NextPageWithLayout = () => {
  const { visibleAddress } = useVisibleAddress();

  return (
    <Container maxWidth="lg">
      <VestingHeader>
        <Typography component="h1" variant="h4">
          Vesting
        </Typography>
      </VestingHeader>

      {visibleAddress && <VestingScheduleTables />}
    </Container>
  );
};

VestingPage.getLayout = function getLayout(page: ReactElement) {
  return <VestingLayout>{page}</VestingLayout>;
};

export default withStaticSEO({ title: "Vesting | Superfluid" }, VestingPage);
