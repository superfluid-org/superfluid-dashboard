import AddIcon from "@mui/icons-material/Add";
import InboxIcon from "@mui/icons-material/Inbox";
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
import NextLink from "next/link";

const WrapperAvatar = styled(Avatar)(({ theme }) => ({
  width: 70,
  height: 70,
  borderRadius: "50%",
  background: alpha(theme.palette.primary.main, 0.08),
}));

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
        You are not whitelisted
      </Typography>
      <Typography variant="h7">
        To access Auto-Wrap settings your wallet has to be on our whitelist.
      </Typography>
    </Box>
    <Button
      data-cy={"no-balance-wrap-button"}
      variant="contained"
      color="primary"
      size="large"
    >
     Apply for Whitelist
    </Button>
  </Card>

);

export default ScheduledWrapApplyCard;
