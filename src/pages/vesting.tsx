import { Card, Typography, Divider, Button, Stack, Box } from "@mui/material";
import { ReactElement } from "react";
import { SentVestingScheduleTable } from "../features/vesting/SentVestingScheduleTable";
import { NextPageWithLayout } from "./_app";
import { VestingLayout } from "../features/vesting/VestingLayout";
import NextLink from "next/link";
import { ReceivedVestingScheduleTable } from "../features/vesting/ReceivedVestingScheduleTable";

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

      <Card sx={{ mb: 3}}>
        <Typography variant="h6" component="h2" sx={{ mb: 3 }}>
          Sent Vesting Schedules
        </Typography>
        <Divider />
        <SentVestingScheduleTable />
      </Card>

      <Card>
        <Typography variant="h6" component="h2" sx={{ mb: 3 }}>
          Received Vesting Schedules
        </Typography>
        <Divider />
        <ReceivedVestingScheduleTable />
      </Card>
    </Stack>
  );
};

VestingPage.getLayout = function getLayout(page: ReactElement) {
  return <VestingLayout>{page}</VestingLayout>;
};

export default VestingPage;
