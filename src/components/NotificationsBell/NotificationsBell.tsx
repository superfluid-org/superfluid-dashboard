import NotificationsIcon from "@mui/icons-material/Notifications";
import {
  Badge,
  Box,
  IconButton,
  Popover,
  Stack,
  Typography,
} from "@mui/material";
import { FC, useEffect, useMemo, useState } from "react";
import {} from "../../features/network/networks";
import { useAppDispatch } from "../../features/redux/store";
import {
  Notification,
  useNotificationChannels,
} from "../../hooks/useNotificationChannels";

import NotificationList from "./NotificationList";
import NotificationHeader from "./NotificationHeader";
import { useAccount } from "wagmi";
import ConnectWallet from "../../features/wallet/ConnectWallet";
import useUpdateEffect from "react-use/lib/useUpdateEffect";
import differenceBy from "lodash/differenceBy";
import isEqual from "lodash/isEqual";
import { displayToast } from "../Toast/toast";
import { updateLastSeenNotification } from "../../features/notifications/notifications.slice";
import { useLastSeenNotification } from "../../features/notifications/notificationHooks";
import { usePrevious } from "react-use";

export type NotificationTab = "new" | "archive";

const NotificationsBell: FC = () => {
  const { address } = useAccount();
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);
  const [badgeContent, setBadgeContent] = useState(0);
  const { notifications } = useNotificationChannels();

  const [activeTab, setActiveTab] = useState<NotificationTab>("new");

  const dispatch = useAppDispatch();

  const lastSeenNotification = useLastSeenNotification(address ?? "");

  const onBellClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
    if (address) {
      dispatch(
        updateLastSeenNotification({
          address,
          notificationId: notifications.new[0].id,
        })
      );
    }
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const previousNewNotifications = usePrevious(notifications.new) ?? [];

  useUpdateEffect(() => {
    if (
      previousNewNotifications.length > 0 &&
      !isEqual(previousNewNotifications, notifications.new)
    ) {
      differenceBy(
        notifications.new,
        previousNewNotifications,
        (n) => n.id
      ).map(({ title, message }) => displayToast({ title, message }));
    }
  }, [notifications]);

  useEffect(() => {
    if (lastSeenNotification === notifications.new[0]?.id) {
      setBadgeContent(0);
    } else {
      setBadgeContent(
        (badgeContent) =>
          badgeContent +
          notifications.new.length -
          previousNewNotifications.length
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
          invisible={lastSeenNotification === notifications.new[0]?.id}
        >
          <NotificationsIcon />
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
              <Typography variant="body1" align="center">
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
