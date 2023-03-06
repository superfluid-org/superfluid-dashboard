import { useMemo } from "react";
import { currenciesByCode, Currency } from "../../utils/currencyUtils";
import { useAppSelector } from "../redux/store";
import {
  notificationsSelector,
  NotificationsState,
} from "./notifications.slice";

export const useLastSeenNotification = () =>
  useAppSelector((state) =>
    notificationsSelector(state, "lastSeenNotification")
  );
