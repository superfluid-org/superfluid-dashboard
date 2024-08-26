import { Divider, Typography } from "@mui/material";
import { FC, Fragment, useCallback } from "react";
import { useDispatch } from "react-redux";
import { useAccount } from "wagmi";

import { useLastSeenNotification } from "../../features/notifications/notificationHooks";
import { markAsArchived } from "../../features/notifications/notifications.slice";

import {
  Notification,
  useNotificationChannels,
} from "../../hooks/useNotificationChannels";

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
  const { address: accountAddress } = useAccount();
  const lastSeenNotification = useLastSeenNotification(accountAddress ?? "");
  const { channels } = useNotificationChannels();

  const isSeen = useCallback(
    (notificationId: string) => {
      const lastSeenNotificationIndex = notifications.new.findIndex(
        (n) => n.id === lastSeenNotification
      );

      if (lastSeenNotificationIndex < 0) {
        return false;
      }

      const currentNotificationIndex = notifications.new.findIndex(
        (n) => n.id === notificationId
      );

      return currentNotificationIndex >= lastSeenNotificationIndex;
    },
    [lastSeenNotification, notifications.new]
  );

  const archive = useCallback(
    (notificationId: string) => () => {
      if (accountAddress) {
        const index = notifications.new.findIndex(
          (n) => n.id === notificationId
        );

        dispatch(
          markAsArchived({
            address: accountAddress,
            notificationId,
            nextNotificationId:
              index === 0 && notifications.new[index + 1]
                ? notifications.new[index + 1].id
                : undefined,
          })
        );
      }
    },
    [notifications, accountAddress, dispatch]
  );

  return notifications[activeTab].length > 0 ? (
    <>
      {notifications[activeTab].map((notification, i, arr) => (
        <Fragment key={notification.id}>
          <NotificationEntry
            type={activeTab}
            notification={notification}
            seen={isSeen(notification.id)}
            archive={archive}
          />
          {i !== arr.length - 1 && <Divider />}
        </Fragment>
      ))}
    </>
  ) : (
    <Typography data-cy={"empty-notifs-message"} variant="body1" p={1.5}>
      {channels.PUSH.subscription.isSubscribed
        ? `You don't have any ${activeTab} notifications.`
        : "You are not subscribed. Check settings to enable notifications"}
    </Typography>
  );
};

export default NotificationList;
