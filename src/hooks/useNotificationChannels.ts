import { useMemo } from "react";
import { usePushProtocol } from "./usePushProtocol";

export type NotificationChannelType = "PUSH";
export type Notification = {
  id: string;
  title: string;
  message: string;
  channel: NotificationChannelType;
};

export type NotificationChannel = {
  name: string;
  channelType: NotificationChannelType;
  isSubscribed: boolean;
  onToggle: (...args: unknown[]) => unknown;
  notifications: Notification[];
};

export type UseNotificationChannels = () => {
  channels: Record<NotificationChannelType, NotificationChannel>;
  notifications: Notification[];
};

export const useNotificationChannels: UseNotificationChannels = () => {
  const {
    toggleSubscribe: toggleSubscribePush,
    isSubscribed: isPushSubscribed,
    notifications: pushNotifcations,
  } = usePushProtocol();

  const push: NotificationChannel = useMemo(
    () => ({
      name: "Push Protocol",
      channelType: "PUSH",
      isSubscribed: isPushSubscribed,
      onToggle: toggleSubscribePush,
      notifications: pushNotifcations.map((n) => ({
        id: n.sid,
        title: n.title,
        message: n.message,
        channel: "PUSH",
      })),
    }),
    [isPushSubscribed, toggleSubscribePush, pushNotifcations]
  );

  const notifications: Notification[] = useMemo(
    () => ([] as Notification[]).concat(push.notifications),
    [pushNotifcations]
  );

  return {
    channels: {
      [push.channelType]: push,
    },
    notifications,
  };
};
