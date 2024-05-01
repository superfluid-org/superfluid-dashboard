import {
  createEntityAdapter,
  createSlice,
  EntityState,
} from "@reduxjs/toolkit";
import { Address } from "@superfluid-finance/sdk-core";
import { useMemo } from "react";
import { getAddress } from "../../utils/memoizedEthersUtils";
import { RootState, useAppSelector } from "../redux/store";

export interface NetworkCustomToken {
  chainId: number;
  customToken: Address;
}

export type NetworkCustomTokenState = EntityState<NetworkCustomToken>;

export const getCustomTokenId = (chainId: number, customToken: Address) => `${chainId}-${getAddress(customToken)}`;

const adapter = createEntityAdapter<NetworkCustomToken>({
  selectId: ({ chainId, customToken }) => getCustomTokenId(chainId, customToken)
});


export const customTokensSlice = createSlice({
  name: "customTokens",
  initialState: adapter.getInitialState(),
  reducers: {
    addCustomToken: (
      state: EntityState<NetworkCustomToken>,
      { payload }: { payload: NetworkCustomToken }
    ) =>
      adapter.addOne(state, {
        ...payload,
        customToken: getAddress(payload.customToken),
      }),

    addCustomTokens: (
      state: EntityState<NetworkCustomToken>,
      { payload }: { payload: NetworkCustomToken[] }
    ) =>
      adapter.addMany(
        state,
        payload.map((newCustomToken) => ({
          ...newCustomToken,
          customToken: getAddress(newCustomToken.customToken),
        }))
      ),
  },
});

export const { addCustomToken, addCustomTokens } = customTokensSlice.actions;

const selectSelf = (state: RootState): EntityState<NetworkCustomToken> =>
  state.customTokens;

const adapterSelectors = adapter.getSelectors<RootState>(selectSelf);

export const customTokensSelectors = {
  ...adapterSelectors,
};

export const useNetworkCustomTokens = (chainId: number) => {
  const customTokens = useAppSelector((state) =>
    adapterSelectors.selectAll(state)
  );

  return useMemo(
    () =>
      customTokens
        .filter((customToken) => customToken.chainId === chainId)
        .map(({ customToken }) => customToken),
    [customTokens, chainId]
  );
};
