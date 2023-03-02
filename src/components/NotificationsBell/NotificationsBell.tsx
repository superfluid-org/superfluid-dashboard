import NotificationsIcon from "@mui/icons-material/Notifications";
import {
  Badge,
  Box,
  Button,
  colors,
  Divider,
  IconButton,
  Popover,
  Stack,
  Tooltip,
  Typography,
  useTheme,
} from "@mui/material";
import { FC, useMemo, useState } from "react";
import { useSeenNotifications } from "../../features/notifications/notifactionHooks";
import {
  markAsSeen,
  markAsSeenBatch,
} from "../../features/notifications/notifications.slice";
import { useAppDispatch } from "../../features/redux/store";
import { useNotificationChannels } from "../../hooks/useNotificationChannels";
import Link from "next/link";
import { useRouter } from "next/router";

const NotificationsBell: FC = () => {
  const theme = useTheme();
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);

  const dispatch = useAppDispatch();

  const seen = useSeenNotifications();

  const onBellClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const onMarkAsSeen = (id: string) => () => {
    dispatch(markAsSeen(id));
  };

  const onMarkAllAsSeen = (ids: string[]) => () => {
    dispatch(markAsSeenBatch(ids));
  };

  const { notifications } = useNotificationChannels();

  const unseenCount = useMemo(
    () =>
      (notifications.length &&
        notifications.length - Object.values(seen).filter((n) => n).length) ??
      0,
    [notifications, seen]
  );

  const id = "notifications-bell";

  return (
    <>
      <IconButton aria-describedby={id} onClick={onBellClick}>
        <Badge
          badgeContent={unseenCount}
          color="primary"
          invisible={unseenCount === 0}
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
        <Box>
          {notifications.length > 0 ? (
            notifications.map(({ id, title, message, channel }, i, arr) => (
              <>
                <Tooltip
                  followCursor
                  title={seen[id] ? "" : "Click to mark this as seen"}
                  sx={{ zIndex: 10000 }}
                >
                  <Stack
                    onClick={onMarkAsSeen(id)}
                    p={2}
                    sx={{
                      cursor: "pointer",
                      ":hover": {
                        background: colors.grey[100],
                      },
                    }}
                  >
                    <Badge variant="dot" color="primary" invisible={seen[id]} />
                    <Stack direction="row" alignItems="center" gap={1}>
                      <Typography variant="subtitle1">{title}</Typography>
                      <Typography
                        variant="subtitle1"
                        px={1}
                        fontSize="10px"
                        borderRadius={2}
                        color="white"
                        sx={{ backgroundColor: theme.palette.primary.main }}
                      >
                        {channel}
                      </Typography>
                    </Stack>
                    g<Typography variant="caption">{message}</Typography>
                  </Stack>
                </Tooltip>
                {i !== arr.length - 1 && <Divider />}
              </>
            ))
          ) : (
            <Typography variant="body1" p={1.5}>
              You seem to have no notifications. <br /> Go to{" "}
              <Link href="/settings">settings</Link>, and subscribe to some
              channels.
            </Typography>
          )}
          <Stack>
            {unseenCount > 1 && (
              <Button onClick={onMarkAllAsSeen(notifications.map((n) => n.id))}>
                Mark all as seen
              </Button>
            )}
          </Stack>
        </Box>
      </Popover>
    </>
  );
};

export default NotificationsBell;
