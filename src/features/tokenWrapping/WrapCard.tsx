import { FC } from "react";
import {
  SuperTokenDowngradeRestoration,
  SuperTokenUpgradeRestoration,
} from "../transactionRestoration/transactionRestorations";
import { Card, Tab } from "@mui/material";
import { TabContext, TabList, TabPanel } from "@mui/lab";
import { WrapTabUpgrade } from "./WrapTabUpgrade";
import { WrapTabDowngrade } from "./WrapTabDowngrade";

export const WrapCard: FC<{
  tabValue: "upgrade" | "downgrade";
  onTabChange: (tabValue: "upgrade" | "downgrade") => void;
  upgradeRestoration?: SuperTokenUpgradeRestoration
  downgradeRestoration?: SuperTokenDowngradeRestoration
}> = ({ tabValue, upgradeRestoration, downgradeRestoration, onTabChange }) => {
  return (
    <Card
      sx={{ position: "fixed", top: "25%", width: "400px", p: 5 }}
      elevation={6}
    >
      <TabContext value={tabValue}>
        <TabList
          variant="scrollable"
          scrollButtons="auto"
          onChange={(_event, newValue: "upgrade" | "downgrade") => {
            onTabChange(newValue);
          }}
          aria-label="tabs"
        >
          <Tab data-cy={"streams-tab"} label="Upgrade" value="upgrade" />
          <Tab data-cy={"indexes-tab"} label="Downgrade" value="downgrade" />+
        </TabList>

        <TabPanel value="upgrade">
          <WrapTabUpgrade restoration={upgradeRestoration}></WrapTabUpgrade>
        </TabPanel>

        <TabPanel value="downgrade">
          <WrapTabDowngrade
            restoration={downgradeRestoration}
          ></WrapTabDowngrade>
        </TabPanel>
      </TabContext>
    </Card>
  );
};
