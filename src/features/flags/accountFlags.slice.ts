import {
  createEntityAdapter,
  createSlice,
  EntityState,
  isAnyOf,
} from "@reduxjs/toolkit";
import { Address } from "@superfluid-finance/sdk-core";
import { getAddress } from "../../utils/memoizedEthersUtils";
import faucetApi from "../faucet/faucetApi.slice";
import { RootState } from "../redux/store";

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

/**
 * Account flags are used to store simple boolean type account data.
 * Optionally a flag can be turned to true/false in a specific network.
 * For example faucet funds received, onboarding steps done etc.
 */

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
      isAnyOf(
        faucetApi.endpoints.claimTestTokens.matchFulfilled,
        faucetApi.endpoints.claimTestTokens.matchRejected
      ),
      (state, { meta: { arg, requestStatus }, payload }) => {
        const { account, chainId } = arg.originalArgs;

        if (
          requestStatus === "fulfilled" ||
          (requestStatus === "rejected" && payload === 405)
        ) {
          adapter.addOne(state, {
            flag: Flag.TestTokensReceived,
            account,
            chainId,
          });
        }
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
