import type { PayloadAction } from "@reduxjs/toolkit";
import { createSelector, createSlice } from "@reduxjs/toolkit";
import { CurrencyCode } from "../../utils/currencyUtils";
import { RootState } from "../redux/store";

export interface NotificationsState {
  lastSeenNotification: string;
}

const initialState: NotificationsState = { lastSeenNotification: "" };

export const notificationsSlice = createSlice({
  name: "notifications",
  initialState,
  reducers: {
    updateLastSeenNotification: (
      state,
      action: PayloadAction<Partial<string>>
    ) => ({ ...state, lastSeenNotification: action.payload }),
  },
});

const selectSelf = (state: RootState): NotificationsState =>
  state.notifications;

export const notificationsSelector = createSelector(
  [selectSelf, (_state: RootState, key: keyof NotificationsState) => key],
  (state: NotificationsState, key: keyof NotificationsState) => state[key]
);

export const { updateLastSeenNotification } = notificationsSlice.actions;
export default notificationsSlice.reducer;
