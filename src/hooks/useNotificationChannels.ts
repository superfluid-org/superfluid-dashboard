import { useMemo } from "react";
import { usePushProtocol } from "./usePushProtocol";

export type NotificationChannelType = "PUSH";

export type NotificationChannel = {
  name: string;
  channelType: NotificationChannelType;
  isSubscribed: boolean;
  onToggle: (...args: unknown[]) => unknown;
};

export const useNotificationChannels = (): Record<
  NotificationChannelType,
  NotificationChannel
> => {
  const {
    toggleSubscribe: toggleSubscribePush,
    isSubscribed: isPushSubscribed,
  } = usePushProtocol();

  const push: NotificationChannel = useMemo(
    () => ({
      name: "Push Protocol",
      channelType: "PUSH",
      isSubscribed: isPushSubscribed,
      onToggle: toggleSubscribePush,
    }),
    [isPushSubscribed, toggleSubscribePush]
  );

  return {
    [push.channelType]: push,
  };
};
