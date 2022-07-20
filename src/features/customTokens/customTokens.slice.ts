import {
  createEntityAdapter,
  createSelector,
  createSlice,
  EntityState,
} from "@reduxjs/toolkit";
import { Address } from "@superfluid-finance/sdk-core";
import { useMemo } from "react";
import { getAddress } from "../../utils/memoizedEthersUtils";
import { RootState, useAppSelector } from "../redux/store";

export interface CustomTokenSearch {
  chainId: number;
  search: string;
}

export interface NetworkCustomToken {
  chainId: number;
  customToken: Address;
}

export interface NetworkCustomTokens {
  chainId: number;
  customTokens: Address[];
}

const adapter = createEntityAdapter<NetworkCustomTokens>({
  selectId: ({ chainId }) => chainId,
});

export const customTokensSlice = createSlice({
  name: "customTokens",
  initialState: adapter.getInitialState(),
  reducers: {
    addCustomToken: (
      state: EntityState<NetworkCustomTokens>,
      { payload: { chainId, customToken } }: { payload: NetworkCustomToken }
    ) => {
      const existingCustomTokens = state.entities[chainId]?.customTokens || [];

      if (!existingCustomTokens.includes(customToken)) {
        adapter.upsertOne(state, {
          chainId,
          customTokens: [...existingCustomTokens, getAddress(customToken)],
        });
      }
    },

    addCustomTokens: (
      state: EntityState<NetworkCustomTokens>,
      { payload }: { payload: NetworkCustomTokens[] }
    ) =>
      adapter.upsertMany(
        state,
        payload.map((networkCustomTokens) => {
          const existingCustomTokens =
            state.entities[networkCustomTokens.chainId]?.customTokens || [];
          const normalizedNewCustomTokens =
            networkCustomTokens.customTokens.map((tokenAddress) =>
              getAddress(tokenAddress)
            );

          return {
            ...networkCustomTokens,
            customTokens: existingCustomTokens.concat(
              normalizedNewCustomTokens.filter(
                (tokenAddress) => !existingCustomTokens.includes(tokenAddress)
              )
            ),
          };
        })
      ),
  },
});

export const { addCustomToken, addCustomTokens } = customTokensSlice.actions;

const selectSelf = (state: RootState): EntityState<NetworkCustomTokens> =>
  state.customTokens;

const adapterSelectors = adapter.getSelectors<RootState>(selectSelf);

export const customTokensSelectors = {
  ...adapterSelectors,
};

export const useNetworkCustomTokens = (chainId: number) => {
  const networkCustomTokens = useAppSelector((state) =>
    adapterSelectors.selectById(state, chainId)
  );

  return networkCustomTokens?.customTokens || [];
};
