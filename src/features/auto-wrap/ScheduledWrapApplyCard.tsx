import {
  alpha,
  Avatar,
  Box,
  Button,
  Card,
  Stack,
  styled,
  Typography,
} from "@mui/material";
import Link from "next/link";

const ScheduledWrapApplyCard = () => (
  <Card
    sx={{ py: 5, textAlign: "center" }}
    component={Stack}
    gap={4}
    alignItems="center"
    elevation={1}
  >
    <Box>
      <Typography data-cy={"no-scheduled-wrap-message"} variant="h4">
        You are not on the allow list.
      </Typography>
      <Typography variant="h7">
        To access Auto-Wrap settings your wallet has to be on our whitelist.
      </Typography>
    </Box>
    <Link
      data-cy={"auto-wrap-allowlist-link"}
      href="https://use.superfluid.finance/schedulestreams"
      target="_blank"
    >
      <Button variant="contained" color="primary" size="large">
        Apply for access
      </Button>
    </Link>
  </Card>
);

export default ScheduledWrapApplyCard;
