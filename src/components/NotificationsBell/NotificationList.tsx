import { useTokenSearch } from "@lifi/widget/hooks";
import { Button, Divider, Stack, Typography } from "@mui/material";
import Link from "next/link";
import { FC, useCallback } from "react";
import { useDispatch } from "react-redux";
import { useAccount } from "wagmi";
import NetworkBadge from "../../features/network/NetworkBadge";
import {
  allNetworks,
  findNetworkOrThrow,
} from "../../features/network/networks";
import {
  markAsArchived,
  updateLastSeenNotification,
} from "../../features/notifications/notifications.slice";

import { Notification } from "../../hooks/useNotificationChannels";

import { createMessage, getNotificationIcon } from "../../utils/notification";
import { NotificationTab } from "./NotificationsBell";

type NotificationListProps = {
  notifications: {
    new: Notification[];
    archive: Notification[];
  };
  activeTab: NotificationTab;
};

const NotificationList: FC<NotificationListProps> = ({
  notifications,
  activeTab,
}) => {
  const dispatch = useDispatch();
  const { address } = useAccount();

  const archive = useCallback(
    (notificationId: string) => () => {
      if (address) {
        const index = notifications.new.findIndex(
          (n) => n.id === notificationId
        );
        dispatch(
          markAsArchived({
            address,
            notificationId,
            nextNotificationId:
              index === 0 ? notifications.new[index + 1].id : undefined,
          })
        );
      }
    },
    [notifications]
  );

  return notifications[activeTab].length > 0 ? (
    <>
      {notifications[activeTab].map(({ id, title, message }) => (
        <Stack
          key={id}
          sx={{
            position: "relative",
            "&:hover": {
              ".notification-list-archive": {
                maxHeight: 50,
              },
            },
          }}
        >
          {message.parsed.network && (
            <NetworkBadge
              sx={{ position: "absolute", top: 0, right: 20 }}
              NetworkIconProps={{
                size: 16,
              }}
              network={findNetworkOrThrow(allNetworks, message.parsed.network)}
            />
          )}

          <Stack p={2} justifyContent="center">
            <Stack direction="row" justifyContent="space-between">
              <Stack direction="row" alignItems="center" gap={0.5}>
                {getNotificationIcon(message.parsed)}
                <Typography variant="h6"> {title}</Typography>
              </Stack>
            </Stack>
            <Stack pl={3} gap={1}>
              <Typography variant="body2" sx={{ color: "GrayText" }}>
                {createMessage(message)}
              </Typography>
              {activeTab === "new" &&
                message.parsed.type &&
                message.parsed.type.includes("liquidation-risk") && (
                  <Link href="/wrap">
                    <Button sx={{ width: 120 }} variant="contained">
                      Wrap tokens
                    </Button>
                  </Link>
                )}
            </Stack>
          </Stack>
          {activeTab === "new" && (
            <Stack
              sx={{
                maxHeight: 0,
                overflow: "hidden",
                transition: "max-height .5s",
              }}
              className="notification-list-archive"
            >
              <Divider />
              <Button onClick={archive(id)}>Archive</Button>
            </Stack>
          )}

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
