import { useAppSelector } from "../redux/store";
import { notificationsSelector } from "./notifications.slice";

export const useLastSeenNotification = (address: string) =>
  useAppSelector(
    (state) => notificationsSelector(state, "lastSeenNotification")[address]
  );

export const useDisplayedToasts = () =>
  useAppSelector((state) => notificationsSelector(state, "displayedToasts"));

// TODO: Figure out the typing for this
export const useArchivedNotifications = () =>
  useAppSelector((state) => state.notifications.archived);
