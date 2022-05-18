import { Button, Card, Stack } from "@mui/material";
import { useRouter } from "next/router";
import { memo } from "react";
import {
  SuperTokenDowngradeRestoration,
  SuperTokenUpgradeRestoration,
} from "../transactionRestoration/transactionRestorations";
import { WrapTabDowngrade } from "./WrapTabDowngrade";
import { WrapTabUpgrade } from "./WrapTabUpgrade";

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

  const handleTabChange = (newTab: "upgrade" | "downgrade") => () =>
    router.replace("/wrap?" + newTab);

  return (
    <Card
      sx={{
        maxWidth: "500px",
        borderRadius: "20px",
        p: 4,
      }}
      elevation={1}
    >
      <Stack direction="row" gap={1} sx={{ mb: 4 }}>
        <Button
          color={tabValue === "upgrade" ? "primary" : "secondary"}
          variant="textContained"
          size="large"
          onClick={handleTabChange("upgrade")}
        >
          Wrap
        </Button>
        <Button
          color={tabValue === "downgrade" ? "primary" : "secondary"}
          variant="textContained"
          size="large"
          onClick={handleTabChange("downgrade")}
        >
          Unwrap
        </Button>
      </Stack>

      {tabValue === "upgrade" && (
        <WrapTabUpgrade restoration={upgradeRestoration}></WrapTabUpgrade>
      )}

      {tabValue === "downgrade" && (
        <WrapTabDowngrade restoration={downgradeRestoration} />
      )}
    </Card>
  );
});
