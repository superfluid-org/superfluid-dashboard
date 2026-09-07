import type { PayloadAction } from "@reduxjs/toolkit";
import { createSelector, createSlice } from "@reduxjs/toolkit";
import { CurrencyCode } from "../../utils/currencyUtils";
import { RootState } from "../redux/store";
import {MinigameCosmetics} from "../minigame/MinigameContext";
import type { ClearMacroPaymentMode } from "../clearMacro/executeClearMacro";

export interface AppSettingsState {
  currencyCode: CurrencyCode;
  lastSuperfluidRunnerCosmetics: MinigameCosmetics;
  /** Execute eligible writes gaslessly through the Clear Macro relay (EIP-712 signature only). */
  clearMacroEnabled: boolean;
  /** How the Clear Macro relay fee is funded (the relay chip is the only writer). */
  clearMacroPaymentMode: ClearMacroPaymentMode;
}

// No redux-persist migration needed for new keys: missing keys rehydrate from this
// initialState (same as `clearMacroEnabled`), and `applySettings` merges partials.
const initialState: AppSettingsState = {
  currencyCode: CurrencyCode.USD,
  lastSuperfluidRunnerCosmetics: 1,
  clearMacroEnabled: false,
  clearMacroPaymentMode: "usdcx-direct",
};

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
