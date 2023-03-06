import {
  Avatar,
  Box,
  Divider,
  FormControlLabel,
  Paper,
  Stack,
  Switch,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { FC } from "react";
import { useAccount } from "wagmi";
import Blockies from "react-blockies";
import { CopyIconBtn } from "../../features/common/CopyIconBtn";

import ConnectWallet from "../../features/wallet/ConnectWallet";
import { useNotificationChannels } from "../../hooks/useNotificationChannels";
import Link from "next/link";
import shortenHex from "../../utils/shortenHex";

const NoWalletConnected: FC = () => {
  const theme = useTheme();

  const isBelowMd = useMediaQuery(theme.breakpoints.down("md"));

  return (
    <Paper
      elevation={1}
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
        data-cy={"no-user-settings"}
        variant={isBelowMd ? "h5" : "h4"}
        textAlign="center"
      >
        Wallet not connected
      </Typography>
      <Typography
        data-cy={"no-history-text"}
        color="text.secondary"
        textAlign="center"
      >
        Wallet is not connected, please connect wallet to modify settings.
      </Typography>

      <Box sx={{ maxWidth: 400, width: "100%", mx: "auto", mt: 4 }}>
        <ConnectWallet />
      </Box>
    </Paper>
  );
};

const NotificationSettings: FC = () => {
  const { address } = useAccount();

  const { channels } = useNotificationChannels();

  const theme = useTheme();
  const isBelowMd = useMediaQuery(theme.breakpoints.down("md"));

  return address ? (
    <Box borderRadius="20px" sx={{ border: "1px solid #E0E0E0" }}>
      <Stack p="30px" direction="row" justifyContent="space-between">
        <Stack>
          <Typography component="h1" variant="h5">
            Notifications
          </Typography>
          <Typography variant="body1" color="secondary">
            Get notified about your Superfluid streams and Super Token activity.
          </Typography>
        </Stack>
        {/* <Button variant="contained">Save</Button> */}
      </Stack>
      <Divider />
      <Stack p="30px" direction="row" alignItems="center" gap={4}>
        <Stack sx={{ width: 350 }}>
          <Typography component="h1" variant="h5">
            Wallet Address
          </Typography>
          <Typography variant="body1" color="secondary">
            You will be notified about your currently connected wallet address.
          </Typography>
        </Stack>
        <Avatar
          alt="generated blockie avatar"
          variant="square"
          sx={{ width: "20px", height: "20px", borderRadius: "4px" }}
        >
          <Blockies seed={address.toLowerCase()} />
        </Avatar>
        <Stack direction="row">
          <Typography variant="body1">
            {isBelowMd ? shortenHex(address) : address}
          </Typography>
          <CopyIconBtn IconButtonProps={{ size: "small" }} copyText={address} />
        </Stack>
      </Stack>
      <Divider />
      <Stack p="30px" direction="row" alignItems="center" gap={4}>
        <Stack sx={{ width: 350 }}>
          <Typography component="h1" variant="h5">
            Notification Channel
          </Typography>
          <Typography variant="body1" color="secondary">
            Turn on notifications for every channel you want to receive them
            through. To access your Push Protocol inbox, click{" "}
            <Link href="https://app.push.org/#/inbox" target="_blank">
              here.
            </Link>
          </Typography>
        </Stack>
        {Object.values(channels).map((channel) => (
          <FormControlLabel
            key={channel.name}
            control={
              <Switch
                onChange={channel.onToggle}
                checked={channel.isSubscribed}
              />
            }
            label={channel.name}
          />
        ))}
      </Stack>
    </Box>
  ) : (
    <NoWalletConnected />
  );
};

export default NotificationSettings;
