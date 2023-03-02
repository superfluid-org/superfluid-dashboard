import { createSelector, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "../redux/store";

export interface NotificationsState {
  seen: Record<string, boolean>;
}

const initialState: NotificationsState = {
  seen: {},
};

export const notificationsSlice = createSlice({
  name: "notifications",
  initialState: initialState,
  reducers: {
    markAsSeen: (state, action: PayloadAction<string>) => ({
      ...state,
      seen: {
        ...state.seen,
        [action.payload]: true,
      },
    }),
    markAsSeenBatch: (state, action: PayloadAction<string[]>) => ({
      ...state,
      seen: {
        ...state.seen,
        ...action.payload.reduce<Record<string, boolean>>(
          (acc, curr) => ({ ...acc, [curr]: true }),
          {}
        ),
      },
    }),
  },
});

export const { markAsSeen } = notificationsSlice.actions;

const selectSelf = (state: RootState): NotificationsState =>
  state.notifications;

export const notificationsSelector = createSelector(
  [selectSelf, (_state: RootState, key: keyof NotificationsState) => key],
  (state: NotificationsState, key: keyof NotificationsState) => state[key]
);

export default notificationsSlice.reducer;
