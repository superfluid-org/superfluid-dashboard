import MoveToInboxRoundedIcon from "@mui/icons-material/MoveToInboxRounded";
import {
  Button,
  ListItem,
  ListItemIcon,
  ListItemText,
  Paper,
} from "@mui/material";
import Link from "next/link";
import { FC } from "react";

const FaucetCard: FC = () => (
  <Paper sx={{ px: 6.5, py: 3.5 }}>
    <ListItem
      disablePadding
      disableGutters
      secondaryAction={
        <Link href="/?showFaucet=true" passHref>
          <Button
            variant="contained"
            size="large"
            color="primary"
            sx={{ width: "180px" }}
            href="/?showFaucet=true"
          >
            Claim
          </Button>
        </Link>
      }
    >
      <ListItemIcon>
        <MoveToInboxRoundedIcon fontSize="large" color="primary" />
      </ListItemIcon>
      <ListItemText
        primary="Get Testnet Tokens"
        secondary="Claim tokens from our free testnet faucet to try out streaming payments."
        primaryTypographyProps={{ variant: "h5" }}
        secondaryTypographyProps={{
          variant: "body1",
          color: "text.primary",
        }}
      />
    </ListItem>
  </Paper>
);

export default FaucetCard;
