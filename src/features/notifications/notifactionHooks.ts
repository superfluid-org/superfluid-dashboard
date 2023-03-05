import { useAppSelector } from "../redux/store";
import { notificationsSelector } from "./notifications.slice";

export const useSeenNotifications = () =>
  useAppSelector((state) => notificationsSelector(state, "seen"));
