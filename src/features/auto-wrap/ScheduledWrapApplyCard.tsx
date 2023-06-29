import {
  useTheme,
  useMediaQuery,
  Typography,
  Button,
  Stack,
  Paper,
} from "@mui/material";
import Link from "next/link";

const ScheduledWrapApplyCard = () => {
  const theme = useTheme();
  const isBelowMd = useMediaQuery(theme.breakpoints.down("md"));
  return (
    <Stack
      gap={1}
      component={Paper}
      alignItems={"center"}
      sx={{
        px: 4,
        py: 7,
        [theme.breakpoints.down("md")]: {
          px: 2,
          py: 3,
        },
      }}
    >
      <Typography
        data-cy={"no-scheduled-wrap-message"}
        variant={isBelowMd ? "h5" : "h4"}
        textAlign="center"
      >
        You are not on the allow list.
      </Typography>
      <Typography color="text.secondary" textAlign="center">
        To access Auto-Wrap settings your wallet has to be on our whitelist.
      </Typography>
      <Link
        data-cy={"auto-wrap-allowlist-link"}
        href="https://use.superfluid.finance/autowrap"
        target="_blank"
      >
        <Button variant="contained" color="primary" size="large">
          Apply for access
        </Button>
      </Link>
    </Stack>
  );
};

export default ScheduledWrapApplyCard;
