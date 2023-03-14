import type { PayloadAction } from "@reduxjs/toolkit";
import { createSelector, createSlice } from "@reduxjs/toolkit";
import { RootState } from "../redux/store";

export interface NotificationsState {
  lastSeenNotification: Record<string, string>;
  displayedToasts: Record<string, boolean>;
  archived: Record<string, boolean>;
}

const initialState: NotificationsState = {
  lastSeenNotification: {},
  displayedToasts: {},
  archived: {},
};

export const notificationsSlice = createSlice({
  name: "notifications",
  initialState,
  reducers: {
    markAsArchived: (
      state,
      action: PayloadAction<{
        address: string;
        notificationId: string;
        nextNotificationId?: string;
      }>
    ) => ({
      ...state,
      lastSeenNotification: {
        ...state.lastSeenNotification,
        [action.payload.address]:
          action.payload.nextNotificationId ??
          state.lastSeenNotification[action.payload.address],
      },
      archived: {
        ...state.archived,
        [action.payload.notificationId]: true,
      },
    }),
    updateDisplayedToasts: (state, action: PayloadAction<string>) => ({
      ...state,
      displayedToasts: {
        ...state.displayedToasts,
        [action.payload]: true,
      },
    }),
    updateLastSeenNotification: (
      state,
      action: PayloadAction<{ address: string; notificationId: string }>
    ) => ({
      ...state,
      lastSeenNotification: {
        ...state.lastSeenNotification,
        [action.payload.address]: action.payload.notificationId,
      },
    }),
  },
});

const selectSelf = (state: RootState): NotificationsState =>
  state.notifications;

// TODO: somehow make this infer the right returnType instead of the sum of all.
export const notificationsSelector = createSelector(
  [selectSelf, (_state: RootState, key: keyof NotificationsState) => key],
  (state: NotificationsState, key: keyof NotificationsState) => state[key]
);

export const {
  markAsArchived,
  updateLastSeenNotification,
  updateDisplayedToasts,
} = notificationsSlice.actions;
export default notificationsSlice.reducer;
