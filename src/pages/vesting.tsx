import { TabContext, TabList, TabPanel } from "@mui/lab";
import { Box, Card, Container, Typography, useTheme, Tab } from "@mui/material";
import { NextPage } from "next";
import { SyntheticEvent, useState } from "react";
import { useExpectedNetwork } from "../features/network/ExpectedNetworkContext";
import { CreateVestingCard } from "../features/vesting/CreateVestingCard";
import CreateVestingFormProvider from "../features/vesting/CreateVestingFormProvider";
import { VestingScheduleTableCard } from "../features/vesting/SentVestingScheduleTableCard";

const VestingPage: NextPage = () => {
  const theme = useTheme();
  const { network } = useExpectedNetwork();

  const [value, setValue] = useState("1");

  const handleChange = (event: SyntheticEvent, newValue: string) => {
    setValue(newValue);
  };

  return (
    <Container key={`${network.slugName}`} maxWidth="md">
      <Box sx={{ mb: 3 }}>
        <Typography component="h1" variant="h4">
          Vesting
        </Typography>
        <Typography variant="subtitle1">
          You can vest using Superfluid streams! Look at the tutorial here.
        </Typography>
      </Box>

      <TabContext value={value}>
        <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
          <TabList onChange={handleChange} aria-label="lab API tabs example">
            <Tab label="Vesting Schedules" value="1" />
            <Tab label="Create a Vesting Schedule" value="2" />
          </TabList>
        </Box>
        <TabPanel value="1">
          <VestingScheduleTableCard />
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
            <CreateVestingFormProvider>
              <CreateVestingCard />
            </CreateVestingFormProvider>
          </Box>
        </TabPanel>
      </TabContext>
    </Container>
  );
};

export default VestingPage;
