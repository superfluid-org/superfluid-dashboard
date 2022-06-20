import { ErrorMessage } from "@hookform/error-message";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import {
  Alert,
  Avatar,
  Button,
  Card,
  Paper,
  Stack,
  useTheme,
} from "@mui/material";
import { useRouter } from "next/router";
import { FC, memo } from "react";
import { WrapTabDowngrade } from "./WrapTabDowngrade";
import { WrapTabUpgrade } from "./WrapTabUpgrade";

export const WrapInputCard: FC = ({ children }) => {
  const theme = useTheme();

  return (
    <Stack
      component={Paper}
      elevation={theme.palette.mode === "dark" ? 4 : 1}
      spacing={1}
      sx={{
        px: 2.5,
        py: 1.5,
        border: "1px solid",
        borderColor: theme.palette.other.outline,
        borderRadius: "15px",
      }}
    >
      {children}
    </Stack>
  );
};

export const ArrowDownIcon: FC = () => {
  const theme = useTheme();

  return (
    <Paper
      component={Avatar}
      elevation={theme.palette.mode === "light" ? 1 : 16}
      sx={{
        width: 30,
        height: 30,
        my: -1,
        ...(theme.palette.mode === "dark" && {
          boxShadow: "none",
        }),
      }}
    >
      <ArrowDownwardIcon
        color={theme.palette.mode === "light" ? "primary" : "inherit"}
        fontSize="small"
      />
    </Paper>
  );
};

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
        name="data"
        render={({ message }) =>
          !!message && (
            <Alert severity="error" sx={{ mb: 1 }}>
              {message}
            </Alert>
          )
        }
      />
      {tabValue === "upgrade" && <WrapTabUpgrade />}
      {tabValue === "downgrade" && <WrapTabDowngrade />}
    </Card>
  );
});
