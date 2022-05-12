import AddIcon from "@mui/icons-material/Add";
import InboxIcon from "@mui/icons-material/Inbox";
import { Avatar, Button, Card, Stack, Typography } from "@mui/material";
import { Box, lighten, styled } from "@mui/system";
import NextLink from "next/link";

const WrapperAvatar = styled(Avatar)(({ theme }) => ({
  width: 70,
  height: 70,
  borderRadius: "50%",
  background: lighten(theme.palette.primary.main, 0.92),
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
      <Typography variant="h4">No Super Token Balance</Typography>
      <Typography>
        Wrap some tokens to start streaming payments in real time.
      </Typography>
    </Box>
    <NextLink href={"/wrap?upgrade"} passHref>
      <Button
        variant="contained"
        color="primary"
        size="large"
        endIcon={<AddIcon />}
      >
        Wrap
      </Button>
    </NextLink>
  </Card>
);

export default TokenSnapshotEmptyCard;
