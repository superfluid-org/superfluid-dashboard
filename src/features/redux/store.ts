import {
  configureStore,
  createListenerMiddleware,
  Dispatch,
} from "@reduxjs/toolkit";
import { setupListeners } from "@reduxjs/toolkit/query";
import {
  allRpcEndpoints,
  allSubgraphEndpoints,
  createApiWithReactHooks,
  initializeRpcApiSlice,
  initializeSubgraphApiSlice,
  initializeTransactionTrackerSlice,
} from "@superfluid-finance/sdk-redux";
import { TypedUseSelectorHook, useDispatch, useSelector } from "react-redux";
import {
  FLUSH,
  PAUSE,
  PERSIST,
  persistReducer,
  persistStore,
  PURGE,
  REGISTER,
  REHYDRATE,
} from "redux-persist";
import storage from "redux-persist/lib/storage";
import { vestingSubgraphApi } from "../../vesting-subgraph/vestingSubgraphApi";
import { addressBookSlice } from "../addressBook/addressBook.slice";
import { customTokensSlice } from "../customTokens/customTokens.slice";
import { ensApi } from "../ens/ensApi.slice";
import faucetApi from "../faucet/faucetApi.slice";
import { flagsSlice } from "../flags/flags.slice";
import gasApi from "../gas/gasApi.slice";
import { impersonationSlice } from "../impersonation/impersonation.slice";
import { networkPreferencesSlice } from "../network/networkPreferences.slice";
import { pendingUpdateSlice } from "../pendingUpdates/pendingUpdate.slice";
import appSettingsReducer from "../settings/appSettings.slice";
import { assetApiSlice } from "../token/tokenManifestSlice";
import tokenPriceApi from "../tokenPrice/tokenPriceApi.slice";
import { adHocMulticallEndpoints } from "./endpoints/adHocMulticallEndpoints";
import { adHocRpcEndpoints } from "./endpoints/adHocRpcEndpoints";
import { adHocSubgraphEndpoints } from "./endpoints/adHocSubgraphEndpoints";
import { streamSchedulerEndpoints } from "./endpoints/streamSchedulerEndpoints";
import { vestingSchedulerEndpoints } from "./endpoints/vestingSchedulerEndpoints";
import { platformApi } from "./platformApi/platformApi";

export const rpcApi = initializeRpcApiSlice((options) =>
  createApiWithReactHooks({
    ...options,
    refetchOnFocus: true,
    refetchOnReconnect: true,
  })
)
  .injectEndpoints(allRpcEndpoints)
  .injectEndpoints(adHocMulticallEndpoints)
  .injectEndpoints(adHocRpcEndpoints)
  .injectEndpoints(streamSchedulerEndpoints)
  .injectEndpoints(vestingSchedulerEndpoints);

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
    refetchOnFocus: true,
    refetchOnReconnect: true,
  })
)
  .injectEndpoints(allSubgraphEndpoints)
  .injectEndpoints(adHocSubgraphEndpoints);

export const transactionTracker = initializeTransactionTrackerSlice();

const transactionTrackerPersistedReducer = persistReducer(
  { storage, key: "transactions", version: 1 },
  transactionTracker.reducer
);

const impersonationPersistedReducer = persistReducer(
  { storage, key: "impersonations", version: 1 },
  impersonationSlice.reducer
);

const addressBookPersistedReducer = persistReducer(
  { storage, key: "addressBook", version: 1 },
  addressBookSlice.reducer
);

const customTokensPersistedReducer = persistReducer(
  { storage, key: "customTokens", version: 1 },
  customTokensSlice.reducer
);

const networkPreferencesPersistedReducer = persistReducer(
  { storage, key: "networkPreferences", version: 1 },
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

export const listenerMiddleware = createListenerMiddleware();

export const reduxStore = configureStore({
  reducer: {
    // API slices
    [rpcApi.reducerPath]: rpcApi.reducer,
    [subgraphApi.reducerPath]: subgraphApi.reducer,
    [transactionTracker.reducerPath]: transactionTrackerPersistedReducer,
    [assetApiSlice.reducerPath]: assetApiSlice.reducer,
    [ensApi.reducerPath]: ensApi.reducer,
    [gasApi.reducerPath]: gasApi.reducer,
    [platformApi.reducerPath]: platformApi.reducer,
    [faucetApi.reducerPath]: faucetApi.reducer,
    [tokenPriceApi.reducerPath]: tokenPriceApi.reducer,
    [vestingSubgraphApi.reducerPath]: vestingSubgraphApi.reducer,

    // Persisted slices
    appSettings: appSettingsPersistedReducer,
    impersonations: impersonationPersistedReducer,
    addressBook: addressBookPersistedReducer,
    customTokens: customTokensPersistedReducer,
    networkPreferences: networkPreferencesPersistedReducer,
    flags: flagsPersistedReducer,

    // Default slices
    pendingUpdates: pendingUpdateSlice.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER], // Ignore redux-persist actions: https://stackoverflow.com/a/62610422
      },
    })
      .prepend(listenerMiddleware.middleware)
      .concat(rpcApi.middleware)
      .concat(subgraphApi.middleware)
      .concat(assetApiSlice.middleware)
      .concat(ensApi.middleware)
      .concat(gasApi.middleware)
      .concat(platformApi.middleware)
      .concat(faucetApi.middleware)
      .concat(tokenPriceApi.middleware)
      .concat(vestingSubgraphApi.middleware),
});

export const reduxPersistor = persistStore(reduxStore);

// optional, but required for refetchOnFocus/refetchOnReconnect behaviors of RTK-Query
setupListeners(reduxStore.dispatch);

export type AppStore = typeof reduxStore;
export type RootState = ReturnType<AppStore["getState"]>;
export type AppDispatch = AppStore["dispatch"];

export const useAppDispatch = () => useDispatch<Dispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
