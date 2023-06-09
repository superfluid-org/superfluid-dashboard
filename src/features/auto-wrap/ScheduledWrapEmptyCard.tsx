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
import AutoWrapAddTokenButtonSection from "./AutoWrapAddTokenButtonSection";

const WrapperAvatar = styled(Avatar)(({ theme }) => ({
  width: 70,
  height: 70,
  borderRadius: "50%",
  background: alpha(theme.palette.primary.main, 0.08),
}));

const ScheduledWrapEmptyCard = () => (
  <Card
    sx={{ py: 5, textAlign: "center" }}
    component={Stack}
    gap={3}
    alignItems="center"
    elevation={1}
  >
    <Box>
      <Typography data-cy={"no-scheduled-wrap-message"} variant="h5">
        Nothing to see here
      </Typography>
      <Typography>
        Add your first Auto-Wrap configuration
      </Typography>
    </Box>
      <AutoWrapAddTokenButtonSection />
  </Card>
);

export default ScheduledWrapEmptyCard;
