import MoveToInboxRoundedIcon from "@mui/icons-material/MoveToInboxRounded";
import {
  Button,
  ListItem,
  ListItemIcon,
  ListItemText,
  Paper,
} from "@mui/material";
import { FC, useState } from "react";
import FaucetDialog from "./FaucetDialog";

interface FaucetCardProps {}

const FaucetCard: FC<FaucetCardProps> = ({}) => {
  const [faucetDialogOpen, setFaucetDialogOpen] = useState(false);

  const openFaucetDialog = () => setFaucetDialogOpen(true);
  const closeFaucetDialog = () => setFaucetDialogOpen(false);

  return (
    <>
      <Paper sx={{ px: 6.5, py: 3.5 }}>
        <ListItem
          disablePadding
          disableGutters
          secondaryAction={
            <Button
              variant="contained"
              size="large"
              color="primary"
              sx={{ width: "180px" }}
              onClick={openFaucetDialog}
            >
              Claim
            </Button>
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
      <FaucetDialog open={faucetDialogOpen} onClose={closeFaucetDialog} />
    </>
  );
};

export default FaucetCard;
