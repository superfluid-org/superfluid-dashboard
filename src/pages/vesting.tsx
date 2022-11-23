import { Card, Stack, Typography } from "@mui/material";
import { ReactElement } from "react";
import { SentVestingScheduleTable } from "../features/vesting/SentVestingScheduleTable";
import { VestingLayout } from "../features/vesting/VestingLayout";
import { NextPageWithLayout } from "./_app";

import { ReceivedVestingScheduleTable } from "../features/vesting/ReceivedVestingScheduleTable";
import ReduxPersistGate from "../features/redux/ReduxPersistGate";

const VestingPage: NextPageWithLayout = () => {
  return (
    <Stack gap={2}>
      <Typography variant="h6">Sent Vesting Schedules</Typography>
      <Card sx={{ mb: 3, p: 0 }}>
        <SentVestingScheduleTable />
      </Card>
      <Typography variant="h6">Received Vesting Schedules</Typography>
      <Card sx={{ p: 0 }}>
        <ReceivedVestingScheduleTable />
      </Card>
    </Stack>
  );
};

VestingPage.getLayout = function getLayout(page: ReactElement) {
  return <VestingLayout>{page}</VestingLayout>;
};

export default VestingPage;
