import {
  Box,
  Card,
  Container,
  Stack,
  Typography,
  useTheme,
} from "@mui/material";
import { format } from "date-fns";
import { FC, ReactElement, useMemo } from "react";
import { ReceivedVestingScheduleTable } from "../features/vesting/ReceivedVestingScheduleTable";
import { SentVestingScheduleTable } from "../features/vesting/SentVestingScheduleTable";
import VestingHeader from "../features/vesting/VestingHeader";
import { VestingLayout } from "../features/vesting/VestingLayout";
import VestingScheduleProgress from "../features/vesting/VestingScheduleProgress";
import { NextPageWithLayout } from "./_app";

const VestingPage: NextPageWithLayout = () => (
  <Container maxWidth="lg">
    <VestingHeader>
      <Typography component="h1" variant="h4">
        Vesting
      </Typography>
    </VestingHeader>

    <Stack gap={2}>
      <Typography variant="h6">Received Vesting Schedules</Typography>
      <Card sx={{ p: 0, mb: 3 }}>
        <ReceivedVestingScheduleTable />
      </Card>

      <Typography variant="h6">Sent Vesting Schedules</Typography>
      <Card sx={{ p: 0 }}>
        <SentVestingScheduleTable />
      </Card>
    </Stack>

    <VestingScheduleProgress />
  </Container>
);

VestingPage.getLayout = function getLayout(page: ReactElement) {
  return <VestingLayout>{page}</VestingLayout>;
};

export default VestingPage;
