import {
  Box,
  colors,
  Divider,
  Stack,
  Tooltip,
  Typography,
} from "@mui/material";
import format from "date-fns/format";
import Link from "next/link";
import { FC } from "react";
import NetworkIcon from "../../features/network/NetworkIcon";
import {
  allNetworks,
  findNetworkOrThrow,
} from "../../features/network/networks";
import { useSeenNotifications } from "../../features/notifications/notifactionHooks";
import { markAsSeen } from "../../features/notifications/notifications.slice";
import { useAppDispatch } from "../../features/redux/store";
import { MessageData, Notification } from "../../hooks/useNotificationChannels";

type NotificationListProps = {
  notifications: {
    new: Notification[];
    archive: Notification[];
  };
  activeTab: "new" | "archive";
};

const createLiquidationRiskMessage = (message: MessageData) =>
  `Your ${message.token}(${
    message.symbol
  }) is about to be liquidated at ${format(
    Number(message.liquidation) * 1000,
    "yyyy/MM/dd HH:mm."
  )}`;

const createLiquidatedMessage = (message: MessageData) =>
  `Your ${message.token}(${message.symbol}) was liquidated.`;

const NotificationList: FC<NotificationListProps> = ({
  notifications,
  activeTab,
}) => {
  const seen = useSeenNotifications();

  const dispatch = useAppDispatch();

  const onMarkAsSeen = (id: string) => () => {
    dispatch(markAsSeen(id));
  };

  return notifications[activeTab].length > 0 ? (
    <>
      {notifications[activeTab].map(({ id, title, message, channel }) => (
        <Stack key={id}>
          <Tooltip
            followCursor
            title={seen[id] ? "" : "Click to archive"}
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
                justifyContent: "center",
              }}
            >
              <Stack direction="row" justifyContent="space-between">
                <Typography variant="h6">{title}</Typography>
                {message.network && (
                  <NetworkIcon
                    network={findNetworkOrThrow(allNetworks, message.network)}
                    size={24}
                  />
                )}
              </Stack>
              <Typography variant="body2">
                {message.liquidation
                  ? createLiquidationRiskMessage(message)
                  : createLiquidatedMessage(message)}
              </Typography>
            </Stack>
          </Tooltip>
          <Divider />
        </Stack>
      ))}
    </>
  ) : (
    <Typography variant="body1" p={1.5}>
      No {activeTab} notifications found. <br /> Check{" "}
      <Link href="/settings">settings</Link> to see if you are subscribed.
    </Typography>
  );
};

export default NotificationList;
