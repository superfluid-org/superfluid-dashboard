import type { PayloadAction } from "@reduxjs/toolkit";
import { createSelector, createSlice } from "@reduxjs/toolkit";
import { CurrencyCode } from "../../utils/currencyUtils";
import { RootState } from "../redux/store";

export interface AppSettingsState {
  currencyCode: CurrencyCode;
}

const initialState: AppSettingsState = { currencyCode: CurrencyCode.USD };

const appSettingsSlice = createSlice({
  name: "appSettings",
  initialState,
  reducers: {
    applySettings: (
      state,
      action: PayloadAction<Partial<AppSettingsState>>
    ) => ({ ...state, ...action.payload }),
  },
});

const selectSelf = (state: RootState): AppSettingsState => state.appSettings;

export const settingSelector = createSelector(
  [selectSelf, (_state: RootState, setting: keyof AppSettingsState) => setting],
  (state: AppSettingsState, setting: keyof AppSettingsState) => state[setting]
);

export const { applySettings } = appSettingsSlice.actions;
export default appSettingsSlice.reducer;
