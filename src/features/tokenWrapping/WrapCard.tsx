import { ErrorMessage } from "@hookform/error-message";
import { Alert, Button, Card, Stack } from "@mui/material";
import { useRouter } from "next/router";
import { memo } from "react";
import { WrapTabDowngrade } from "./WrapTabDowngrade";
import { WrapTabUpgrade } from "./WrapTabUpgrade";

export default memo(function WrapCard({
  tabValue,
}: {
  tabValue: "upgrade" | "downgrade";
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
          data-cy="wrap-toggle"
          color={tabValue === "upgrade" ? "primary" : "secondary"}
          variant="textContained"
          size="large"
          onClick={handleTabChange("upgrade")}
        >
          Wrap
        </Button>
        <Button
          data-cy="unwrap-toggle"
          color={tabValue === "downgrade" ? "primary" : "secondary"}
          variant="textContained"
          size="large"
          onClick={handleTabChange("downgrade")}
        >
          Unwrap
        </Button>
      </Stack>

      <ErrorMessage
        as={<Alert severity="error"></Alert>}
        name="data.amountEther.hov"
        render={({ messages }) => {
          return (
            messages &&
            Object.entries(messages).map(([type, message]) => (
              <p key={type}>{message}</p>
            ))
          );
        }}
      />

      {tabValue === "upgrade" && <WrapTabUpgrade />}
      {tabValue === "downgrade" && <WrapTabDowngrade />}
    </Card>
  );
});
