import { useTokenSearch } from "@lifi/widget/hooks";
import { Button, Divider, Stack, Typography } from "@mui/material";
import { findIndex } from "lodash";
import Link from "next/link";
import { FC, useCallback } from "react";
import { useDispatch } from "react-redux";
import { useAccount } from "wagmi";

import { useLastSeenNotification } from "../../features/notifications/notificationHooks";
import { markAsArchived } from "../../features/notifications/notifications.slice";

import { Notification } from "../../hooks/useNotificationChannels";

import NotificationEntry from "./NotificationEntry";
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
  const lastSeenNotification = useLastSeenNotification(address ?? "");

  const isSeen = useCallback(
    (notification: Notification) => {
      const lastSeenNotificationIndex = notifications.new.findIndex(
        (n) => n.id === lastSeenNotification
      );

      if (lastSeenNotificationIndex < 0) {
        return false;
      }

      const currentNotificationIndex = notifications.new.findIndex(
        (n) => n.id === notification.id
      );

      return currentNotificationIndex >= lastSeenNotificationIndex;
    },
    [lastSeenNotification, notifications.new]
  );

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
              index === 0 && notifications.new[index + 1]
                ? notifications.new[index + 1].id
                : undefined,
          })
        );
      }
    },
    [notifications]
  );

  return notifications[activeTab].length > 0 ? (
    <>
      {notifications[activeTab].map((notification) => (
        <NotificationEntry
          key={notification.id}
          type={activeTab}
          notification={notification}
          seen={isSeen(notification)}
          archive={archive}
        />
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
