import NotificationsIcon from "@mui/icons-material/Notifications";
import {
  Badge,
  Box,
  Button,
  IconButton,
  Paper,
  Popover,
  Stack,
  Typography,
} from "@mui/material";
import { FC, useEffect, useState } from "react";
import { markAsSeenBatch } from "../../features/notifications/notifications.slice";
import {} from "../../features/network/networks";
import { useAppDispatch } from "../../features/redux/store";
import { useNotificationChannels } from "../../hooks/useNotificationChannels";

import NotificationList from "./NotificationList";
import NotificationHeader from "./NotificationHeader";
import { useAccount } from "wagmi";
import ConnectWallet from "../../features/wallet/ConnectWallet";
import usePrevious from "react-use/lib/usePrevious";
import useUpdateEffect from "react-use/lib/useUpdateEffect";
import differenceBy from "lodash/differenceBy";
import isEqual from "lodash/isEqual";
import { displayToast } from "../Toast/toast";

export type NotificationTab = "new" | "archive";

const NotificationsBell: FC = () => {
  const { address } = useAccount();
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);

  const [activeTab, setActiveTab] = useState<NotificationTab>("new");

  const dispatch = useAppDispatch();

  const onBellClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const onMarkAllAsSeen = (ids: string[]) => () => {
    dispatch(markAsSeenBatch(ids));
  };

  const { notifications } = useNotificationChannels();

  const previousNewNotifications = usePrevious(notifications.new);

  useUpdateEffect(() => {
    if (
      previousNewNotifications &&
      previousNewNotifications.length > 0 &&
      isEqual(previousNewNotifications, notifications.new)
    ) {
      differenceBy(
        notifications.new,
        previousNewNotifications,
        (n) => n.id
      ).map(({ title, message }) =>
        displayToast({ title, message: message.network })
      );
    }
  }, [notifications]);

  const id = "notifications-bell";

  return (
    <>
      <IconButton aria-describedby={id} onClick={onBellClick}>
        <Badge
          badgeContent={notifications.new.length}
          color="primary"
          invisible={notifications.new.length === 0}
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
        {notifications.new.length > 1 && activeTab === "new" && (
          <Paper
            sx={{
              background: "white",
              borderRadius: 0,
              border: "none",
            }}
          >
            <Button
              fullWidth
              onClick={onMarkAllAsSeen(
                notifications[activeTab].map((n) => n.id)
              )}
            >
              Archive all
            </Button>
          </Paper>
        )}
      </Popover>
    </>
  );
};

export default NotificationsBell;
