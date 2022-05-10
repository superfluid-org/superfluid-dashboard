import { Card, ToggleButton, ToggleButtonGroup } from "@mui/material";
import { FC } from "react";
import {
  SuperTokenDowngradeRestoration,
  SuperTokenUpgradeRestoration,
} from "../transactionRestoration/transactionRestorations";
import { WrapTabDowngrade } from "./WrapTabDowngrade";
import { WrapTabUpgrade } from "./WrapTabUpgrade";

export const WrapCard: FC<{
  tabValue: "upgrade" | "downgrade";
  onTabChange: (tabValue: "upgrade" | "downgrade") => void;
  upgradeRestoration?: SuperTokenUpgradeRestoration;
  downgradeRestoration?: SuperTokenDowngradeRestoration;
}> = ({ tabValue, upgradeRestoration, downgradeRestoration, onTabChange }) => {
  const handleTabChange = (_e: unknown, newTab: "upgrade" | "downgrade") =>
    newTab && onTabChange(newTab);

  return (
    <Card
      sx={{
        maxWidth: "500px",
        borderRadius: "20px",
        p: 4,
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
        <ToggleButton value="upgrade">Wrap</ToggleButton>
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
