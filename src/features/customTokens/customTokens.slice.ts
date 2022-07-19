import {
  createEntityAdapter,
  createSelector,
  createSlice,
  EntityState,
} from "@reduxjs/toolkit";
import { Address } from "@superfluid-finance/sdk-core";
import { getAddress } from "../../utils/memoizedEthersUtils";
import { RootState } from "../redux/store";

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
    addNetworkCustomToken: (
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

export const { addNetworkCustomToken, addCustomTokens } =
  customTokensSlice.actions;

const selectSelf = (state: RootState): EntityState<NetworkCustomTokens> =>
  state.customTokens;

const adapterSelectors = adapter.getSelectors();

const searchNetworkCustomToken = createSelector(
  [
    selectSelf,
    (_items: RootState, search: string, chainId: number) => ({
      search,
      chainId,
    }),
  ],
  (
    state: EntityState<NetworkCustomTokens>,
    { chainId, search }: CustomTokenSearch
  ): Address[] =>
    (adapterSelectors.selectById(state, chainId)?.customTokens || []).filter(
      (tokenAddress) =>
        tokenAddress.toLowerCase().indexOf(search.toLowerCase()) >= 0
    )
);

export const customTokensSelectors = {
  ...adapterSelectors,
  searchNetworkCustomToken,
};
