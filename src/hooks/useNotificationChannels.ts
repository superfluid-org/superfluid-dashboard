import { ApiNotificationType } from "@pushprotocol/restapi";
import { isWithinInterval } from "date-fns";
import sub from "date-fns/sub";
import subWeeks from "date-fns/subWeeks";
import { useMemo } from "react";
import { useSeenNotifications } from "../features/notifications/notifactionHooks";
import { usePushProtocol } from "./usePushProtocol";

export type NotificationChannelType = "PUSH";
export type Notification = {
  id: string;
  title: string;
  message: MessageData;
  epoch: Date;
};

export type NotificationChannel = {
  name: string;
  channelType: NotificationChannelType;
  isSubscribed: boolean;
  onToggle: (...args: unknown[]) => unknown;
  notifications: Notification[];
};

export type MessageType =
  | "liquidation"
  | "liquidation-risk-2day"
  | "liquidation-risk-7day";

export type MessageData = {
  type: MessageType;
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
      channelType: "PUSH",
      isSubscribed: isPushSubscribed,
      onToggle: toggleSubscribePush,
      notifications: pushNotifcations
        .map(({ epoch, payload }) => ({
          id: payload.data.sid,
          title: payload.notification.title.replace("Superfluid - ", ""),
          message: parseNotificationData(payload.notification.body),
          epoch: new Date(epoch),
        }))
        .filter(({ epoch }) =>
          isWithinInterval(epoch, {
            start: subWeeks(Date.now(), 1),
            end: Date.now(),
          })
        ),
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
