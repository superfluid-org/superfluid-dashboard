import { FC } from "react";
import {
  SuperTokenDowngradeRestoration,
  SuperTokenUpgradeRestoration,
} from "../transactionRestoration/transactionRestorations";
import { Card, Tab, ToggleButton, ToggleButtonGroup } from "@mui/material";
import { TabContext, TabList, TabPanel } from "@mui/lab";
import { WrapTabUpgrade } from "./WrapTabUpgrade";
import { WrapTabDowngrade } from "./WrapTabDowngrade";

export const WrapCard: FC<{
  tabValue: "upgrade" | "downgrade";
  onTabChange: (tabValue: "upgrade" | "downgrade") => void;
  upgradeRestoration?: SuperTokenUpgradeRestoration;
  downgradeRestoration?: SuperTokenDowngradeRestoration;
}> = ({ tabValue, upgradeRestoration, downgradeRestoration, onTabChange }) => {
  const handleTabChange = (_e: unknown, newTab: "upgrade" | "downgrade") =>
    onTabChange(newTab);

  return (
    <Card
      sx={{
        position: "fixed",
        top: "25%",
        width: "500px",
        p: 4,
        borderRadius: "20px",
      }}
      elevation={1}
    >
      <ToggleButtonGroup
        exclusive
        size="large"
        color="primary"
        value={tabValue}
        onChange={handleTabChange}
        sx={{ mb: 4 }}
      >
        <ToggleButton value="upgrade" size="large">
          Wrap
        </ToggleButton>
        <ToggleButton value="downgrade">Unwrap</ToggleButton>
      </ToggleButtonGroup>

      {tabValue === "upgrade" && (
        <WrapTabUpgrade restoration={upgradeRestoration}></WrapTabUpgrade>
      )}

      {tabValue === "downgrade" && (
        <WrapTabDowngrade restoration={downgradeRestoration} />
      )}
    </Card>
  );
};
