import { ErrorMessage } from "@hookform/error-message";

import { Alert, Card, Stack, useTheme } from "@mui/material";
import { useRouter } from "next/router";
import { memo } from "react";
import { useExpectedNetwork } from "../network/ExpectedNetworkContext";
import NetworkBadge from "../network/NetworkBadge";
import { TabUnwrap } from "./TabUnwrap";
import { TabWrap } from "./TabWrap";
import { CardTabButton } from "../../components/CardTabButton/CardTabButton";

type WrapTab = "upgrade" | "downgrade";

export default memo(function WrapCard({ tabValue }: { tabValue: WrapTab }) {
  const theme = useTheme();
  const router = useRouter();
  const { network } = useExpectedNetwork();

  const handleTabChange = (newTab: WrapTab) => () =>
    router.replace("/wrap?" + newTab, undefined, {
      shallow: true,
    });

  return (
    <Card
      sx={{
        maxWidth: "500px",
        borderRadius: "20px",
        position: "relative",
        [theme.breakpoints.down("md")]: {
          boxShadow: "none",
          backgroundImage: "none",
          borderRadius: 0,
          border: 0,
          p: 0,
        },
      }}
      elevation={1}
    >
      <NetworkBadge
        network={network}
        sx={{
          position: "absolute",
          top: 0,
          right: theme.spacing(3.5),
        }}
        NetworkIconProps={{
          size: 32,
          fontSize: 18,
          sx: { [theme.breakpoints.down("md")]: { borderRadius: 1 } },
        }}
      />
      <Stack direction="row" gap={1} sx={{ mb: 4 }}>

        <CardTabButton dataCy="wrap-toggle" isActive={tabValue === "upgrade"} onClick={handleTabChange("upgrade")} >Wrap</CardTabButton>
        <CardTabButton dataCy="unwrap-toggle" isActive={tabValue === "downgrade"} onClick={handleTabChange("downgrade")} >Unwrap</CardTabButton>

      </Stack>
      <ErrorMessage
        name="data"
        render={({ message }) =>
          !!message && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {message}
            </Alert>
          )
        }
      />
      {tabValue === "upgrade" && (
        <TabWrap onSwitchMode={handleTabChange("downgrade")} />
      )}
      {tabValue === "downgrade" && (
        <TabUnwrap onSwitchMode={handleTabChange("upgrade")} />
      )}
    </Card>
  );
});
