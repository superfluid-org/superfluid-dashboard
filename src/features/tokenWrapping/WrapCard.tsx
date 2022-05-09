import { memo } from "react";
import {
  SuperTokenDowngradeRestoration,
  SuperTokenUpgradeRestoration,
} from "../transactionRestoration/transactionRestorations";
import { Card, ToggleButton, ToggleButtonGroup } from "@mui/material";
import { WrapTabUpgrade } from "./WrapTabUpgrade";
import { WrapTabDowngrade } from "./WrapTabDowngrade";
import { useRouter } from "next/router";

export default memo(function WrapCard({
  tabValue,
  upgradeRestoration,
  downgradeRestoration,
}: {
  tabValue: "upgrade" | "downgrade";
  upgradeRestoration?: SuperTokenUpgradeRestoration;
  downgradeRestoration?: SuperTokenDowngradeRestoration;
}) {
  const router = useRouter();
    const handleTabChange = (_e: unknown, newTab: "upgrade" | "downgrade") =>
        router.replace("/wrap?" + newTab);

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
});
