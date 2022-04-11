import { configureStore, Dispatch } from "@reduxjs/toolkit";
import {
  persistReducer,
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
  persistStore,
} from "redux-persist";
import {
  allRpcEndpoints,
  allSubgraphEndpoints,
  createApiWithReactHooks,
  initializeRpcApiSlice,
  initializeSubgraphApiSlice,
  initializeTransactionTrackerSlice,
} from "@superfluid-finance/sdk-redux";
import { TypedUseSelectorHook, useDispatch, useSelector } from "react-redux";
import storage from "redux-persist/lib/storage";
import { adHocMulticallEndpoints } from "./endpoints/adHocMulticallEndpoints";
import { adHocRpcEndpoints } from "./endpoints/adHocRpcEndpoints";
import { adHocSubgraphEndpoints } from "./endpoints/adHocSubgraphEndpoints";

export const rpcApi = initializeRpcApiSlice(createApiWithReactHooks)
  .injectEndpoints(allRpcEndpoints)
  .injectEndpoints(adHocMulticallEndpoints)
  .injectEndpoints(adHocRpcEndpoints);

export const subgraphApi = initializeSubgraphApiSlice((options) =>
  createApiWithReactHooks({
    ...options,
    extractRehydrationInfo(action, { reducerPath }) {
      if (action.type === REHYDRATE && action.payload && action.payload[reducerPath]) {
        return action.payload[reducerPath];
      }
    },
  })
)
  .injectEndpoints(allSubgraphEndpoints)
  .injectEndpoints(adHocSubgraphEndpoints);

const subgraphApiPersistedReducer = persistReducer(
  { storage, key: "subgraph-api", version: 2 },
  subgraphApi.reducer
);

export const transactionTracker = initializeTransactionTrackerSlice();

const transactionTrackerPersistedReducer = persistReducer(
  { storage, key: "transactions", version: 2 },
  transactionTracker.reducer
);

export const reduxStore = configureStore({
  reducer: {
    [rpcApi.reducerPath]: rpcApi.reducer,
    [subgraphApi.reducerPath]: subgraphApiPersistedReducer,
    [transactionTracker.reducerPath]: transactionTrackerPersistedReducer
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER], // Ignore redux-persist actions: https://stackoverflow.com/a/62610422
      },
    })
      .concat(rpcApi.middleware)
      .concat(subgraphApi.middleware),
});

export const reduxPersistor = persistStore(reduxStore);

export type AppStore = typeof reduxStore;
export type RootState = ReturnType<AppStore["getState"]>;
export type AppDispatch = AppStore["dispatch"];

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export const useAppDispatch = () => useDispatch<Dispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
