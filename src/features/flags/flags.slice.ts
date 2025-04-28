import {
  createEntityAdapter,
  createSlice,
  EntityState,
  isAnyOf,
  nanoid,
  PayloadAction,
} from "@reduxjs/toolkit";
import { Address } from "@superfluid-finance/sdk-core";
import { getAddress } from "../../utils/memoizedEthersUtils";
import faucetApi from "../faucet/faucetApi.slice";
import { RootState } from "../redux/store";
import { VestingVersion } from "../network/networkConstants";

export enum Flag {
  TestTokensReceived = "test-tokens-received",
  TokenAdded = "token-added",
  VestingScheduler = "vesting-scheduler-v2",
}

interface BaseFlag<T> {
  id: string;
  type: T;
}

export interface TestTokensReceivedFlag
  extends BaseFlag<Flag.TestTokensReceived> {
  account: Address;
  chainId: number;
}

export interface TokenAddedFlag 
  extends BaseFlag<Flag.TokenAdded> {
  chainId: number;
  account: Address;
  token: Address;
  walletId: string;
}

export interface VestingSchedulerFlag 
  extends BaseFlag<Flag.VestingScheduler> {
  chainId: number;
  account: Address;
  version: VestingVersion;
}

type FlagType = TestTokensReceivedFlag | TokenAddedFlag | VestingSchedulerFlag;

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
    addTestTokensReceivedFlag: {
      reducer: (
        state: EntityState<FlagType>,
        action: PayloadAction<TestTokensReceivedFlag>
      ) => adapter.addOne(state, action.payload),
      prepare: (payload: Omit<TestTokensReceivedFlag, "id" | "type">) => ({
        payload: {
          ...payload,
          id: nanoid(),
          type: Flag.TestTokensReceived,
          account: getAddress(payload.account),
        } as TestTokensReceivedFlag,
      }),
    },
    addTokenAddedFlag: {
      reducer: (
        state: EntityState<FlagType>,
        action: PayloadAction<TokenAddedFlag>
      ) => adapter.addOne(state, action.payload),
      prepare: (payload: Omit<TokenAddedFlag, "id" | "type">) => ({
        payload: {
          ...payload,
          id: nanoid(),
          type: Flag.TokenAdded,
          account: getAddress(payload.account),
          token: getAddress(payload.token),
        } as TokenAddedFlag,
      }),
    },
    setVestingSchedulerFlag: {
      reducer: (
        state: EntityState<FlagType>,
        action: PayloadAction<VestingSchedulerFlag>
      ) => adapter.upsertOne(state, action.payload),
      prepare: (payload: Omit<VestingSchedulerFlag, "id" | "type">) => ({
        payload: {
          ...payload,
          id: `${payload.chainId}-${payload.account.toLowerCase()}`,
          type: Flag.VestingScheduler,
          account: getAddress(payload.account),
        } as VestingSchedulerFlag,
      }),
    },
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

export const { addTestTokensReceivedFlag, addTokenAddedFlag, setVestingSchedulerFlag } =
  flagsSlice.actions;

const selectSelf = (state: RootState): EntityState<FlagType> => state.flags;

const adapterSelectors = adapter.getSelectors<RootState>(selectSelf);

export const flagsSelectors = {
  ...adapterSelectors,
};
