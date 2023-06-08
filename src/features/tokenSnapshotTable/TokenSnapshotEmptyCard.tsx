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
import Link from "../common/Link";

const WrapperAvatar = styled(Avatar)(({ theme }) => ({
  width: 70,
  height: 70,
  borderRadius: "50%",
  background: alpha(theme.palette.primary.main, 0.08),
}));

const TokenSnapshotEmptyCard = () => (
  <Card
    sx={{ py: 5, textAlign: "center" }}
    component={Stack}
    gap={3}
    alignItems="center"
    elevation={1}
  >
    <WrapperAvatar>
      <InboxIcon color="primary" sx={{ fontSize: 51 }} />
    </WrapperAvatar>
    <Box>
      <Typography data-cy={"no-balance-message"} variant="h5">
        No Super Token Balance
      </Typography>
      <Typography>
        Wrap some tokens to start streaming payments in real time.
      </Typography>
    </Box>
    <Button
      LinkComponent={Link}
      href={"/wrap?upgrade"}
      data-cy={"no-balance-wrap-button"}
      variant="contained"
      color="primary"
      size="large"
      endIcon={<AddIcon />}
    >
      Wrap
    </Button>
  </Card>
);

export default TokenSnapshotEmptyCard;
