import { QueryDefinition } from "@reduxjs/toolkit/dist/query";
import { QueryActionCreatorResult } from "@reduxjs/toolkit/dist/query/core/buildInitiate";
import differenceInDays from "date-fns/differenceInDays";
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

const autoArchivationInDays = 30;

const isArchived = (
  { id, epoch }: Notification,
  archivedNotifications: Record<string, boolean>
) =>
  differenceInDays(new Date(), epoch) > autoArchivationInDays ||
  archivedNotifications[id];

export const useNotificationChannels: UseNotificationChannels = () => {
  const {
    toggleSubscribe: toggleSubscribePush,
    isSubscribed: isPushSubscribed,
    notifications: pushNotifcations,
  } = usePushProtocol();

  const archivedNotifications = useArchivedNotifications();

  const push: NotificationChannel = useMemo(
    () => ({
      name: "Push Protocol",
      channelType: "PUSH",
      isSubscribed: isPushSubscribed,
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
    [isPushSubscribed, toggleSubscribePush, pushNotifcations]
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
