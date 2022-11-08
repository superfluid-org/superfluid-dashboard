import { TabContext, TabList, TabPanel } from "@mui/lab";
import {
  Box,
  Card,
  Container,
  Typography,
  useTheme,
  Tab,
  Divider,
} from "@mui/material";
import { NextPage } from "next";
import { SyntheticEvent, useState } from "react";
import { useExpectedNetwork } from "../features/network/ExpectedNetworkContext";
import { CreateVestingSection } from "../features/vesting/CreateVestingSection";
import CreateVestingFormProvider from "../features/vesting/CreateVestingFormProvider";
import { VestingScheduleTable } from "../features/vesting/VestingScheduleTable";

const VestingPage: NextPage = () => {
  const theme = useTheme();
  const { network } = useExpectedNetwork();

  const [value, setValue] = useState("1");

  const handleChange = (event: SyntheticEvent, newValue: string) => {
    setValue(newValue);
  };

  return (
    <Container key={`${network.slugName}`} maxWidth="md">
      <TabContext value={value}>
        <Card>
          <Box sx={{ mb: 3 }}>
            <Typography component="h1" variant="h4">
              Vesting
            </Typography>
            <Typography variant="subtitle1">
              You can vest using Superfluid streams! Look at the tutorial here.
            </Typography>
          </Box>
          <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
            <TabList onChange={handleChange} aria-label="lab API tabs example">
              <Tab label="Vesting Schedules" value="1" />
              <Tab label="Create a Vesting Schedule" value="2" />
            </TabList>
          </Box>
        </Card>

        <TabPanel value="1">
          <Card>
            <Typography variant="h5" component="h2" sx={{ mb: 3 }}>
              Sent Vesting Schedules
            </Typography>
            <Divider />
            <VestingScheduleTable />
          </Card>
        </TabPanel>
        <TabPanel value="2">
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "left",
              [theme.breakpoints.up("md")]: {
                my: 4,
              },
            }}
          >
            <Card>
              <CreateVestingFormProvider>
                <CreateVestingSection />
              </CreateVestingFormProvider>
            </Card>
          </Box>
        </TabPanel>
      </TabContext>
    </Container>
  );
};

export default VestingPage;