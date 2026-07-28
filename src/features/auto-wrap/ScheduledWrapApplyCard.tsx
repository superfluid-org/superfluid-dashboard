import {
  useTheme,
  useMediaQuery,
  Typography,
  Button,
  Stack,
  Paper,
} from "@mui/material";
import Link from "next/link";
import { ALLOWLIST_CONTACT_URL } from "../../utils/constants";

const ScheduledWrapApplyCard = () => {
  const theme = useTheme();
  const isBelowMd = useMediaQuery(theme.breakpoints.down("md"));
  return (
    <Stack
      component={Paper}
      sx={{
        gap: 1,
        alignItems: "center",
        px: 4,
        py: 7,

        [theme.breakpoints.down("md")]: {
          px: 2,
          py: 3,
        }
      }}>
      <Typography
        data-cy={"no-scheduled-wrap-message"}
        variant={isBelowMd ? "h5" : "h4"}
        sx={{
          textAlign: "center"
        }}
      >
        You are not on the allow list.
      </Typography>
      <Typography
        sx={{
          color: "text.secondary",
          textAlign: "center"
        }}>
        To access Auto-Wrap settings your wallet has to be on our whitelist.
      </Typography>
      <Link
        data-cy={"auto-wrap-allowlist-link"}
        href={ALLOWLIST_CONTACT_URL}
        target="_blank"
      >
        <Button variant="contained" color="primary" size="large">
          Contact us for access
        </Button>
      </Link>
    </Stack>
  );
};

export default ScheduledWrapApplyCard;
