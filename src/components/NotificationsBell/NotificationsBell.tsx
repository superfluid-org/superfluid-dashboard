import NotificationsIcon from "@mui/icons-material/Notifications";
import {
  Badge,
  Box,
  Button,
  IconButton,
  Paper,
  Popover,
  Stack,
} from "@mui/material";
import { FC, useState } from "react";
import { useSeenNotifications } from "../../features/notifications/notifactionHooks";
import { markAsSeenBatch } from "../../features/notifications/notifications.slice";
import {} from "../../features/network/networks";
import { useAppDispatch } from "../../features/redux/store";
import { useNotificationChannels } from "../../hooks/useNotificationChannels";

import NotificationList from "./NotificationList";
import NotificationHeader from "./NotificationHeader";

export type NotificationTab = "new" | "archive";

const NotificationsBell: FC = () => {
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);

  const [activeTab, setActiveTab] = useState<NotificationTab>("new");

  const dispatch = useAppDispatch();

  const seen = useSeenNotifications();

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
        <Box width={350}>
          <NotificationHeader
            activeTab={activeTab}
            setActiveTab={setActiveTab}
          />
          <NotificationList
            notifications={notifications}
            activeTab={activeTab}
          />
          {notifications.new.length > 1 && activeTab === "new" && (
            <Paper
              sx={{
                position: "sticky",
                bottom: 0,
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
        </Box>
      </Popover>
    </>
  );
};

export default NotificationsBell;
