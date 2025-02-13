import {
  Avatar,
  Box,
  Divider,
  Paper,
  Stack,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { FC } from "react";
import { useAccount } from "wagmi";
import Blockies from "react-blockies";
import { CopyIconBtn } from "../../features/common/CopyIconBtn";

import { useNotificationChannels } from "../../hooks/useNotificationChannels";
import shortenHex from "../../utils/shortenHex";
import { LoadingButton } from "@mui/lab";
import { useImpersonation } from "../../features/impersonation/ImpersonationContext";
import NoWalletConnected from "../NoWalletConnected/NoWalletConnected";

const NotificationSettings: FC = () => {
  const { address } = useAccount();

  const { channels } = useNotificationChannels();

  const theme = useTheme();
  const isBelowMd = useMediaQuery(theme.breakpoints.down("md"));
  const { isImpersonated } = useImpersonation();

  if (!address) {
    return <NoWalletConnected />;
  }

  return (
    <Paper>
      <Stack p={4} justifyContent="space-between">
        <Stack>
          <Stack direction="row" justifyContent="space-between">
            <Typography component="h1" variant="h5">
              Notifications
            </Typography>

            {/* 
            
            <LoadingButton
              disabled={isImpersonated}
              data-cy={"notification-button"}
              variant="contained"
              onClick={channels.PUSH.onToggle}
              loading={channels.PUSH.subscription.isLoading}
            >
              {channels.PUSH.subscription.isSubscribed ? "Disable" : "Enable"}{" "}
              Notifications
            </LoadingButton> */}
          </Stack>

          <Typography variant="body1" color="secondary">
            Get notified about your Superfluid streams and Super Token activity.
          </Typography>
        </Stack>
      </Stack>
      <Divider />
      <Stack p={4} direction="row" alignItems="center" gap={4}>
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
        <Stack direction="row" spacing={0.5}>
          <Typography data-cy={"wallet-address"} variant="body1">
            {isBelowMd ? shortenHex(address) : address}
          </Typography>
          <CopyIconBtn IconButtonProps={{ size: "small" }} copyText={address} />
        </Stack>
      </Stack>
    </Paper>
  );
};

export default NotificationSettings;
