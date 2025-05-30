import { createSlice, EntityState, PayloadAction } from "@reduxjs/toolkit";
import { uniq } from "lodash";

interface NetworkPreferences {
  id: "network-preferences";
  /**
   * Chain ID-s
   */
  hidden: number[];
}

export type NetworkPreferencesState = EntityState<NetworkPreferences, string>;

export const networkPreferencesSlice = createSlice({
  name: "network-preferences",
  initialState: {
    id: "network-preferences",
    hidden: [],
  } as NetworkPreferences,
  reducers: {
    hideNetwork: (state, action: PayloadAction<number>) => {
      state.hidden = uniq([...state.hidden, action.payload]);
    },
    unhideNetwork: (state, action: PayloadAction<number>) => {
      state.hidden = state.hidden.filter(
        (chainId) => chainId !== action.payload
      );
    }
  },
});


export const { hideNetwork, unhideNetwork } = networkPreferencesSlice.actions;