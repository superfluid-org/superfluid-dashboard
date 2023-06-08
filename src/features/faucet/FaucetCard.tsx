import MoveToInboxRoundedIcon from "@mui/icons-material/MoveToInboxRounded";
import {
  Button,
  ListItem,
  ListItemIcon,
  ListItemText,
  Paper,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { FC } from "react";
import Link from "../common/Link";

const ClaimTokensBtn = () => (
  <Button
    LinkComponent={Link}
    data-cy={"dashboard-claim-button"}
    variant="contained"
    color="primary"
    href="/?showFaucet=true"
    sx={{ width: 88 }}
  >
    Claim
  </Button>
);

const FaucetCard: FC = () => {
  const theme = useTheme();
  const isBelowMd = useMediaQuery(theme.breakpoints.down("md"));

  return (
    <Paper sx={{ px: isBelowMd ? 2 : 6, py: isBelowMd ? 2 : 3 }}>
      <ListItem
        disablePadding
        disableGutters
        secondaryAction={!isBelowMd ? <ClaimTokensBtn /> : undefined}
        sx={{
          [theme.breakpoints.down("md")]: {
            flexDirection: "column",
            textAlign: "center",
            gap: 2,
          },
        }}
      >
        <ListItemIcon
          sx={{
            [theme.breakpoints.down("md")]: {
              mr: 0,
            },
          }}
        >
          <MoveToInboxRoundedIcon fontSize="large" color="primary" />
        </ListItemIcon>
        <ListItemText
          data-cy={"dashboard-faucet-message"}
          primary="Get Testnet Tokens"
          secondary="Claim tokens from our free testnet faucet to try out streaming payments."
          primaryTypographyProps={{ variant: "h5" }}
          secondaryTypographyProps={{
            variant: "body1",
            color: "text.primary",
          }}
        />
        {isBelowMd && <ClaimTokensBtn />}
      </ListItem>
    </Paper>
  );
};

export default FaucetCard;
