import { useAppSelector } from "../redux/store";
import {
  notificationsSelector,
  NotificationsState,
} from "./notifications.slice";

export const useSeenNotifications = () =>
  useAppSelector((state) => notificationsSelector(state, "seen"));
