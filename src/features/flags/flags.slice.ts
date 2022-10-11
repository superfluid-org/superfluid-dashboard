import {
  createEntityAdapter,
  createSlice,
  EntityState,
  isAnyOf,
  nanoid,
} from "@reduxjs/toolkit";
import { Address } from "@superfluid-finance/sdk-core";
import { getAddress } from "../../utils/memoizedEthersUtils";
import faucetApi from "../faucet/faucetApi.slice";
import { RootState } from "../redux/store";

export enum Flag {
  TestTokensReceived = "test-tokens-received",
  TokenAdded = "token-added",
}

interface BaseFlag<T> {
  id: string;
  type: T;
}

export interface AccountChainFlag extends BaseFlag<Flag.TestTokensReceived> {
  account: Address;
  chainId: number;
}

export interface AccountChainTokenFlag extends BaseFlag<Flag.TokenAdded> {
  chainId: number;
  account: Address;
  token: Address;
}

type FlagType = AccountChainFlag | AccountChainTokenFlag;

/**
 * Account flags are used to store simple boolean type account data.
 * Optionally a flag can be turned to true/false in a specific network.
 * For example faucet funds received, onboarding steps done etc.
 */

const adapter = createEntityAdapter<FlagType>({
  selectId: ({ id }) => id,
});

export const flagsSlice = createSlice({
  name: "flags",
  initialState: adapter.getInitialState(),
  reducers: {
    addFlag: (
      state: EntityState<FlagType>,
      { payload }: { payload: Omit<FlagType, "id"> }
    ) => {
      switch (payload.type) {
        case Flag.TokenAdded: {
          return adapter.addOne(state, {
            ...payload,
            account: getAddress(payload.account),
            token: getAddress((payload as AccountChainTokenFlag).token),
            id: nanoid(),
          } as AccountChainTokenFlag);
        }

        case Flag.TestTokensReceived: {
          return adapter.addOne(state, {
            ...payload,
            account: getAddress(payload.account),
            id: nanoid(),
          } as AccountChainFlag);
        }

        default:
          return;
      }
    },
    addAccountChainFlag: (
      state: EntityState<FlagType>,
      { payload }: { payload: Omit<AccountChainFlag, "id"> }
    ) =>
      adapter.addOne(state, {
        ...payload,
        account: getAddress(payload.account),
        id: nanoid(),
      }),
    addAccountChainTokenFlag: (
      state: EntityState<FlagType>,
      { payload }: { payload: Omit<AccountChainTokenFlag, "id"> }
    ) =>
      adapter.addOne(state, {
        ...payload,
        account: getAddress(payload.account),
        token: getAddress(payload.token),
        id: nanoid(),
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
            id: nanoid(),
            type: Flag.TestTokensReceived,
            account: getAddress(account),
            chainId,
          });
        }
      }
    );
  },
});

export const { addAccountChainFlag, addAccountChainTokenFlag } =
  flagsSlice.actions;

const selectSelf = (state: RootState): EntityState<FlagType> => state.flags;

const adapterSelectors = adapter.getSelectors<RootState>(selectSelf);

export const flagsSelectors = {
  ...adapterSelectors,
};
