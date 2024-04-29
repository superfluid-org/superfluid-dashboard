import {
  autoBatchEnhancer,
  configureStore,
  createListenerMiddleware,
  Dispatch,
  EntityState,
  isRejected,
  isRejectedWithValue,
  Middleware,
  MiddlewareAPI,
} from "@reduxjs/toolkit";
import {
  setupListeners,
} from "@reduxjs/toolkit/query";
import * as Sentry from "@sentry/react";
import {
  allRpcEndpoints,
  allSubgraphEndpoints,
  createApiWithReactHooks,
  initializeRpcApiSlice,
  initializeSubgraphApiSlice,
  initializeTransactionTrackerSlice,
  TrackedTransaction,
} from "@superfluid-finance/sdk-redux";
import { TypedUseSelectorHook, useDispatch, useSelector } from "react-redux";
import {
  FLUSH,
  PAUSE,
  PERSIST,
  PersistedState,
  persistReducer,
  persistStore,
  PURGE,
  REGISTER,
  REHYDRATE,
} from "redux-persist";
import storage from "redux-persist/lib/storage";
import { deserializeError } from "serialize-error";
import { schedulingSubgraphApi } from "../../scheduling-subgraph/schedulingSubgraphApi";
import { vestingSubgraphApi } from "../../vesting-subgraph/vestingSubgraphApi";
import accountingApi from "../accounting/accountingApi.slice";
import { addressBookSlice, AddressBookState } from "../addressBook/addressBook.slice";
import { customTokensSlice, getCustomTokenId, NetworkCustomTokenState } from "../customTokens/customTokens.slice";
import { ensApi } from "../ens/ensApi.slice";
import { lensApi } from "../lens/lensApi.slice";
import faucetApi from "../faucet/faucetApi.slice";
import { flagsSlice } from "../flags/flags.slice";
import gasApi from "../gas/gasApi.slice";
import { impersonationSlice } from "../impersonation/impersonation.slice";
import { notificationsSlice } from "../notifications/notifications.slice";
import { networkPreferencesSlice, NetworkPreferencesState } from "../network/networkPreferences.slice";
import { pushApi } from "../notifications/pushApi.slice";
import { pendingUpdateSlice } from "../pendingUpdates/pendingUpdate.slice";
import appSettingsReducer from "../settings/appSettings.slice";
import { assetApiSlice } from "../token/tokenManifestSlice";
import tokenPriceApi from "../tokenPrice/tokenPriceApi.slice";
import { adHocRpcEndpoints } from "./endpoints/adHocRpcEndpoints";
import { adHocSubgraphEndpoints } from "./endpoints/adHocSubgraphEndpoints";
import { flowSchedulerEndpoints } from "./endpoints/flowSchedulerEndpoints";
import {
  vestingSchedulerMutationEndpoints,
  vestingSchedulerQueryEndpoints,
} from "./endpoints/vestingSchedulerEndpoints";
import { platformApi } from "./platformApi/platformApi";
import addressBookRpcApi from "../addressBook/addressBookRpcApi.slice";
import { autoWrapEndpoints } from "./endpoints/autoWrapEndpoints";
import { autoWrapSubgraphApi } from "../../auto-wrap-subgraph/autoWrapSubgraphApi";
import { tokenAccessMutationEndpoints } from "./endpoints/tokenAccessEndpoints";
import { deprecatedNetworkChainIds } from "../network/networks";
import { isUndefined } from "lodash";
import _ from "lodash";
import { isDefined } from "../../utils/ensureDefined";

export const rpcApi = initializeRpcApiSlice((options) =>
  createApiWithReactHooks({
    ...options,
    keepUnusedDataFor: 180,
    refetchOnMountOrArgChange: 90,
    refetchOnReconnect: true,
  })
)
  .injectEndpoints(allRpcEndpoints)
  .injectEndpoints(adHocRpcEndpoints)
  .injectEndpoints(flowSchedulerEndpoints)
  .injectEndpoints(vestingSchedulerMutationEndpoints)
  .injectEndpoints(tokenAccessMutationEndpoints)
  .injectEndpoints(vestingSchedulerQueryEndpoints)
  .injectEndpoints(autoWrapEndpoints);

export const subgraphApi = initializeSubgraphApiSlice((options) =>
  createApiWithReactHooks({
    ...options,
    extractRehydrationInfo(action, { reducerPath }) {
      if (
        action.type === REHYDRATE &&
        action.payload &&
        action.payload[reducerPath]
      ) {
        return action.payload[reducerPath];
      }
    },
    keepUnusedDataFor: 180,
    refetchOnMountOrArgChange: 90,
    refetchOnReconnect: true,
  })
)
  .injectEndpoints(allSubgraphEndpoints)
  .injectEndpoints(adHocSubgraphEndpoints);

export const transactionTracker = initializeTransactionTrackerSlice();

const transactionTrackerPersistedReducer = persistReducer(
  { storage, key: "transactions", version: 2, migrate: async (persistedState, currentVersion) => {
    if (persistedState && currentVersion === 1) {
      const oldState = persistedState as PersistedState & EntityState<TrackedTransaction>;
      const transactionsToRemove = Object.values(oldState.entities).filter(isDefined).filter(x => deprecatedNetworkChainIds.includes(x.chainId)) as TrackedTransaction[];
      const newEntities = { ...oldState.entities };
      for (const tx of transactionsToRemove) {
        delete newEntities[tx.hash];
      }
      return {
        ...oldState,
        entities: newEntities,
        ids: Object.values(newEntities).filter(isDefined).map(x => x.hash)
      }
    }
    return persistedState;
  } },
  transactionTracker.reducer
);

const impersonationPersistedReducer = persistReducer(
  { storage, key: "impersonations", version: 1 },
  impersonationSlice.reducer
);

const addressBookPersistedReducer = persistReducer(
  { storage, key: "addressBook", version: 2, migrate: async (persistedState, currentVersion) => {
    if (persistedState && currentVersion === 1) {
      const oldState = persistedState as PersistedState & AddressBookState;
      const newEntities = { ...oldState.entities };
      Object.values(newEntities).filter(isDefined).forEach((x) => {
        if (x.associatedNetworks?.length) {
          x.associatedNetworks = _.without(x.associatedNetworks, ...deprecatedNetworkChainIds);
        }
      });
      return {
        ...oldState,
        entities: newEntities,
      }
    }
    return persistedState;
  } },
  addressBookSlice.reducer
);

const customTokensPersistedReducer = persistReducer(
  { storage, key: "customTokens", version: 2, migrate: async (persistedState, currentVersion) => {
    if (persistedState && currentVersion === 1) {
      const oldState = persistedState as PersistedState & NetworkCustomTokenState;
      const newEntities = { ...oldState.entities };
      Object.values(newEntities).forEach((x) => {
        if (x && deprecatedNetworkChainIds.includes(x.chainId)) {
          delete newEntities[x.customToken];
        }
      });
      return {
        ...oldState,
        entities: newEntities,
        ids: Object.values(newEntities).filter(isDefined).map(x => getCustomTokenId(x.chainId, x.customToken))
      }
    }
    return persistedState;
  } },
  customTokensSlice.reducer
);

const networkPreferencesPersistedReducer = persistReducer(
  { storage, key: "networkPreferences", version: 2, migrate: async (persistedState, currentVersion) => {
    if (persistedState && currentVersion === 1) {
      const oldState = persistedState as PersistedState & NetworkPreferencesState;
      const newEntities = { ...oldState.entities };
      Object.values(newEntities).forEach((x) => {
        if (x?.hidden) {
          x.hidden = _.without(x.hidden, ...deprecatedNetworkChainIds);
        }
      });
      return {
        ...oldState,
        entities: newEntities
      }
    }
  } },
  networkPreferencesSlice.reducer
);

const flagsPersistedReducer = persistReducer(
  { storage, key: "flags", version: 1 },
  flagsSlice.reducer
);

const appSettingsPersistedReducer = persistReducer(
  { storage, key: "appSettings", version: 1 },
  appSettingsReducer
);

const notificatonsPersistedReducer = persistReducer(
  { storage, key: "notifications", version: 1 },
  notificationsSlice.reducer
);

export const listenerMiddleware = createListenerMiddleware();

export const sentryErrorLogger: Middleware =
  (api: MiddlewareAPI) => (next) => (action) => {
    const { error } = action;

    // Log when there was an error/exception but it wasn't explicitly rejected.
    if (error && isRejected(action) && !isRejectedWithValue(action)) {
      // "aborted" & "condition" inspired by: https://github.com/reduxjs/redux-toolkit/blob/64a30d83384d77bcbc59231fa32aa2f1acd67020/packages/toolkit/src/createAsyncThunk.ts#L521
      const aborted = error?.name === "AbortError";
      const condition = error?.name === "ConditionError";
      if (!aborted && !condition) {
        try {
          const deserializedError = deserializeError(error); // We need to deserialize the error because RTK has already turned it into a "SerializedError" here. We prefer the deserialized error because Sentry works a lot better with an Error object.

          const errorMessage = (deserializedError as { message?: string })
            .message;
          const ethersV5ErrorParts = (errorMessage ?? "").split(
            " [ See: https://links.ethers.org/v5-errors-"
          ); // https://github.com/ethers-io/ethers.js/blob/c80fcddf50a9023486e9f9acb1848aba4c19f7b6/packages/logger/src.ts/index.ts#L261
          const isEthersV5Error = ethersV5ErrorParts.length === 2;

          if (isEthersV5Error) {
            (deserializedError as { message: string }).message =
              ethersV5ErrorParts[0]; // Shorten ethers error message to just "reason".
          }

          const isUserRejectedRequest =
            (deserializedError as { code?: string }).code === "ACTION_REJECTED"; // Inspired by wagmi: https://github.com/wagmi-dev/wagmi/blob/348148b4048e4c6cb930a03b88a7aebe2fad4121/packages/core/src/actions/transactions/sendTransaction.ts#L105 & ethers: https://github.com/ethers-io/ethers.js/blob/ec1b9583039a14a0e0fa15d0a2a6082a2f41cf5b/packages/logger/src.ts/index.ts#L156
          if (!isUserRejectedRequest) {
            Sentry.captureException(deserializedError);
          }
        } catch (e) {
          Sentry.captureException(e); // If deserialization failed, let's not break the Redux middleware chain. This should never happen though.
        }
      }
    }
    return next(action);
  };

export const reduxStore = configureStore({
  reducer: {
    // API slices
    [rpcApi.reducerPath]: rpcApi.reducer,
    [subgraphApi.reducerPath]: subgraphApi.reducer,
    [transactionTracker.reducerPath]: transactionTrackerPersistedReducer,
    [assetApiSlice.reducerPath]: assetApiSlice.reducer,
    [ensApi.reducerPath]: ensApi.reducer,
    [lensApi.reducerPath]: lensApi.reducer,
    [gasApi.reducerPath]: gasApi.reducer,
    [platformApi.reducerPath]: platformApi.reducer,
    [faucetApi.reducerPath]: faucetApi.reducer,
    [tokenPriceApi.reducerPath]: tokenPriceApi.reducer,
    [accountingApi.reducerPath]: accountingApi.reducer,
    [vestingSubgraphApi.reducerPath]: vestingSubgraphApi.reducer,
    [autoWrapSubgraphApi.reducerPath]: autoWrapSubgraphApi.reducer,
    [pushApi.reducerPath]: pushApi.reducer,
    [schedulingSubgraphApi.reducerPath]: schedulingSubgraphApi.reducer,
    [addressBookRpcApi.reducerPath]: addressBookRpcApi.reducer,

    // Persisted slices
    appSettings: appSettingsPersistedReducer,
    impersonations: impersonationPersistedReducer,
    addressBook: addressBookPersistedReducer,
    customTokens: customTokensPersistedReducer,
    networkPreferences: networkPreferencesPersistedReducer,
    notifications: notificatonsPersistedReducer,
    flags: flagsPersistedReducer,

    // Default slices
    pendingUpdates: pendingUpdateSlice.reducer,
  },
  enhancers: (existingEnhancers) =>
    existingEnhancers.concat(
      autoBatchEnhancer({
        type: typeof window !== "undefined" ? "raf" : "tick",
      })
    ), // https://redux-toolkit.js.org/api/autoBatchEnhancer#autobatchenhancer-1
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER], // Ignore redux-persist actions: https://stackoverflow.com/a/62610422
      },
    })
      .prepend(listenerMiddleware.middleware)
      .prepend(sentryErrorLogger)
      .concat(rpcApi.middleware)
      .concat(vestingSubgraphApi.middleware)
      .concat(autoWrapSubgraphApi.middleware)
      .concat(schedulingSubgraphApi.middleware)
      .concat(subgraphApi.middleware)
      .concat(assetApiSlice.middleware)
      .concat(ensApi.middleware)
      .concat(lensApi.middleware)
      .concat(gasApi.middleware)
      .concat(platformApi.middleware)
      .concat(faucetApi.middleware)
      .concat(tokenPriceApi.middleware)
      .concat(accountingApi.middleware)
      .concat(pushApi.middleware)
      .concat(addressBookRpcApi.middleware),
});

export const reduxPersistor = persistStore(reduxStore);

// optional, but required for refetchOnFocus/refetchOnReconnect behaviors of RTK-Query
setupListeners(reduxStore.dispatch);

export type AppStore = typeof reduxStore;
export type RootState = ReturnType<AppStore["getState"]>;
export type AppDispatch = AppStore["dispatch"];

export const useAppDispatch = () => useDispatch<Dispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
