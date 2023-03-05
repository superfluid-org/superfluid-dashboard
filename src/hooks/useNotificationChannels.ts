import { useMemo } from "react";
import { useSeenNotifications } from "../features/notifications/notifactionHooks";
import { usePushProtocol } from "./usePushProtocol";

export type NotificationChannelType = "Push Protocol";
export type Notification = {
  id: string;
  title: string;
  message: MessageData;
  channel: NotificationChannelType;
};

export type NotificationChannel = {
  name: string;
  channelType: NotificationChannelType;
  isSubscribed: boolean;
  onToggle: (...args: unknown[]) => unknown;
  notifications: Notification[];
};

export type MessageData = {
  type: string;
  token: string;
  symbol: string;
  network: string;
  liquidation?: string;
};

export type UseNotificationChannels = () => {
  channels: Record<NotificationChannelType, NotificationChannel>;
  notifications: {
    new: Notification[];
    archive: Notification[];
  };
};

const parseNotificationData = (raw: string): MessageData =>
  raw.split(",").reduce((acc, curr) => {
    const [key, value] = curr.split(":");

    return {
      ...acc,
      [key]: value,
    };
  }, {} as MessageData);

export const useNotificationChannels: UseNotificationChannels = () => {
  const {
    toggleSubscribe: toggleSubscribePush,
    isSubscribed: isPushSubscribed,
    notifications: pushNotifcations,
  } = usePushProtocol();

  const seenNotifications = useSeenNotifications();

  const push: NotificationChannel = useMemo(
    () => ({
      name: "Push Protocol",
      channelType: "Push Protocol",
      isSubscribed: isPushSubscribed,
      onToggle: toggleSubscribePush,
      notifications: pushNotifcations.map((n) => ({
        id: n.sid,
        title: n.title,
        message: parseNotificationData(n.notification.body),
        channel: "Push Protocol",
        x: console.log(n),
      })),
    }),
    [isPushSubscribed, toggleSubscribePush, pushNotifcations]
  );

  return {
    channels: {
      [push.channelType]: push,
    },
    notifications: {
      new: push.notifications.filter((n) => !seenNotifications[n.id]),
      archive: push.notifications.filter((n) => seenNotifications[n.id]),
    },
  };
};
