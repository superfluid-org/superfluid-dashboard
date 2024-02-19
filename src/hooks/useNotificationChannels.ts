import { addDays, differenceInDays, isAfter } from "date-fns";
import { useMemo } from "react";
import { useArchivedNotifications } from "../features/notifications/notificationHooks";
import { parseNotificationBody } from "../utils/notification";
import { usePushProtocol } from "./usePushProtocol";

export type NotificationChannelType = "PUSH";
export type Notification = {
  id: string;
  title: string;
  message: {
    parsed: MessageData;
    raw: string;
  };
  epoch: Date;
};

export type NotificationChannel = {
  name: string;
  channelType: NotificationChannelType;
  subscription: {
    isSubscribed: boolean;
    isLoading: boolean;
  };
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
  tokenAddress: string;
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

const autoArchivationInDays = 30;

const isArchived = (
  {
    id,
    epoch,
    message: {
      parsed: { liquidation, type },
    },
  }: Notification,
  archivedNotifications: Record<string, boolean>
) =>
  (type !== "liquidation" &&
    isAfter(Date.now(), addDays(Number(liquidation) * 1000, 1))) ||
  differenceInDays(new Date(), epoch) > autoArchivationInDays ||
  archivedNotifications[id];

export const useNotificationChannels: UseNotificationChannels = () => {
  const {
    toggleSubscribe: toggleSubscribePush,
    subscription: pushSubscription,
    notifications: pushNotifcations,
  } = usePushProtocol();

  const archivedNotifications = useArchivedNotifications();

  const push: NotificationChannel = useMemo(
    () => ({
      name: "Push Protocol",
      channelType: "PUSH",
      subscription: pushSubscription,
      onToggle: toggleSubscribePush,
      notifications: pushNotifcations.map(({ epoch, payload }) => ({
        id: payload.data.sid,
        title: payload.notification.title.replace("Superfluid - ", ""),
        message: {
          raw: payload.notification.body,
          parsed: parseNotificationBody(payload.notification.body),
        },
        epoch: new Date(epoch),
      })),
    }),
    [pushSubscription, toggleSubscribePush, pushNotifcations]
  );

  return {
    channels: {
      [push.channelType]: push,
    },
    notifications: {
      new: push.notifications.filter(
        (n) => !isArchived(n, archivedNotifications)
      ),
      archive: push.notifications.filter((n) =>
        isArchived(n, archivedNotifications)
      ),
    },
  };
};
