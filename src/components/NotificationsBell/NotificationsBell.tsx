import NotificationsIcon from "@mui/icons-material/Notifications";
import {
  Badge,
  Box,
  IconButton,
  Popover,
  Stack,
  Typography,
  useTheme,
} from "@mui/material";
import { FC, useEffect, useState } from "react";
import {} from "../../features/network/networks";
import { useAppDispatch } from "../../features/redux/store";
import { useNotificationChannels } from "../../hooks/useNotificationChannels";

import NotificationList from "./NotificationList";
import NotificationHeader from "./NotificationHeader";
import { useAccount } from "wagmi";
import ConnectWallet from "../../features/wallet/ConnectWallet";
import useUpdateEffect from "react-use/lib/useUpdateEffect";

import { updateLastSeenNotification } from "../../features/notifications/notifications.slice";
import { useLastSeenNotification } from "../../features/notifications/notificationHooks";
import { useToast } from "../../components/Toast/toast";

export type NotificationTab = "new" | "archive";

const NotificationsBell: FC = () => {
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);
  const [badgeContent, setBadgeContent] = useState(0);
  const [activeTab, setActiveTab] = useState<NotificationTab>("new");

  const theme = useTheme();

  const { address } = useAccount();
  const { notifications } = useNotificationChannels();
  const lastSeenNotification = useLastSeenNotification(address ?? "");
  const dispatch = useAppDispatch();
  const displayToast = useToast();

  const onBellClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);

    if (address && notifications.new.length > 0) {
      setTimeout(
        () =>
          dispatch(
            updateLastSeenNotification({
              address,
              notificationId: notifications.new[0].id,
            })
          ),
        100
      );
    }
  };

  useUpdateEffect(() => {
    const lastSeenIndex = notifications.new.findIndex(
      (n) => n.id === lastSeenNotification
    );
    if (lastSeenIndex > 0) {
      notifications.new.slice(0, lastSeenIndex).map(displayToast);
    }
    if (!lastSeenNotification && notifications.new.length > 0) {
      displayToast({
        id: notifications.new[0].id,
        title: notifications.new[0].title,
        message: notifications.new[0].message,
      });
    }
  }, [notifications.new.length]);

  useEffect(() => {
    const lastSeenIndex = notifications.new.findIndex(
      (n) => n.id === lastSeenNotification
    );
    if (lastSeenNotification && lastSeenIndex <= 0) {
      setBadgeContent(0);
    } else {
      setBadgeContent(
        lastSeenNotification ? lastSeenIndex : notifications.new.length
      );
    }
  }, [lastSeenNotification, notifications.new.length]);

  const id = "notifications-bell";

  return (
    <>
      <IconButton aria-describedby={id} onClick={onBellClick}>
        <Badge
          badgeContent={badgeContent}
          color="primary"
          invisible={notifications.new.length === 0}
        >
          <NotificationsIcon
            sx={{
              color:
                theme.palette.mode === "dark"
                  ? "white"
                  : theme.palette.text.primary,
            }}
          />
        </Badge>
      </IconButton>
      <Popover
        id={id}
        PaperProps={{
          sx: {
            width: 350,
            overflow: "hidden",
          },
        }}
        open={Boolean(anchorEl)}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "center",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "center",
        }}
      >
        <NotificationHeader activeTab={activeTab} setActiveTab={setActiveTab} />
        <Box sx={{ maxHeight: 350, overflow: "auto" }}>
          {address ? (
            <NotificationList
              notifications={notifications}
              activeTab={activeTab}
            />
          ) : (
            <Stack p={2} gap={1}>
              <Typography data-cy={"notif-no-wallet"} variant="body1" align="center">
                Connect your wallet to check your notifications.
              </Typography>
              <ConnectWallet />
            </Stack>
          )}
        </Box>
      </Popover>
    </>
  );
};

export default NotificationsBell;
