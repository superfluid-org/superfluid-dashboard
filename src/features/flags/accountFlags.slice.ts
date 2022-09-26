import {
  createAsyncThunk,
  createEntityAdapter,
  createSelector,
  createSlice,
  EntityState,
} from "@reduxjs/toolkit";
import { Address } from "@superfluid-finance/sdk-core";
import { useMemo } from "react";
import { getAddress } from "../../utils/memoizedEthersUtils";
import faucetApi from "../faucet/faucetApi.slice";
import { RootState, useAppSelector } from "../redux/store";

export enum Flag {
  TestTokensReceived = "test-tokens-received",
}

export interface AccountFlag {
  flag: Flag;
  account: Address;
  chainId?: number;
}

const getId = (account: Address, flag: Flag, chainId?: number) =>
  [chainId || "*", getAddress(account), flag].join("-");

const adapter = createEntityAdapter<AccountFlag>({
  selectId: ({ account, flag, chainId }) => getId(account, flag, chainId),
});

export const accountFlagsSlice = createSlice({
  name: "accountFlags",
  initialState: adapter.getInitialState(),
  reducers: {
    addAccountFlag: (
      state: EntityState<AccountFlag>,
      { payload }: { payload: AccountFlag }
    ) =>
      adapter.addOne(state, {
        ...payload,
        account: getAddress(payload.account),
      }),
  },
  extraReducers: (builder) => {
    builder.addMatcher(
      faucetApi.endpoints.claimTestTokens.matchFulfilled,
      (state, { meta }) => {
        const { account, chainId } = meta.arg.originalArgs;

        adapter.addOne(state, {
          flag: Flag.TestTokensReceived,
          account,
          chainId,
        });
      }
    );
  },
});

export const { addAccountFlag } = accountFlagsSlice.actions;

const selectSelf = (state: RootState): EntityState<AccountFlag> =>
  state.accountFlags;

const adapterSelectors = adapter.getSelectors<RootState>(selectSelf);

export const accountFlagSelectors = {
  ...adapterSelectors,
};
