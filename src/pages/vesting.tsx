import { Card, Typography, Divider, Button, Stack, Box } from "@mui/material";
import { ReactElement } from "react";
import { VestingScheduleTable } from "../features/vesting/VestingScheduleTable";
import { NextPageWithLayout } from "./_app";
import { VestingLayout } from "../features/vesting/VestingLayout";
import NextLink from "next/link";

const VestingPage: NextPageWithLayout = () => {
  return (
    <Stack gap={2}>
      <Box sx={{ display: "flex", justifyContent: "right" }}>
        <NextLink href="/vesting/create" passHref>
          <Button color="primary" variant="outlined">
            Create a Vesting Schedule
          </Button>
        </NextLink>
      </Box>
      <Card>
        <Typography variant="h5" component="h2" sx={{ mb: 3 }}>
          Sent Vesting Schedules
        </Typography>
        <Divider />
        <VestingScheduleTable />
      </Card>
    </Stack>
  );
};

VestingPage.getLayout = function getLayout(page: ReactElement) {
  return <VestingLayout>{page}</VestingLayout>;
};

export default VestingPage;
