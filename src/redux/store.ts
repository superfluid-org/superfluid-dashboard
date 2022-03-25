import { configureStore, Dispatch } from "@reduxjs/toolkit";
import {
  persistReducer,
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
} from "redux-persist";
import {
  allRpcEndpoints,
  allSubgraphEndpoints,
  createApiWithReactHooks,
  initializeRpcApiSlice,
  initializeSubgraphApiSlice,
  initializeTransactionSlice,
} from "@superfluid-finance/sdk-redux";
import { TypedUseSelectorHook, useDispatch, useSelector } from "react-redux";
import storage from "redux-persist/lib/storage";
import transactionRecoverySliceReducer from "./transactionRecoverySlice";
import { adHocMulticallEndpoints } from "./endpoints/adHocMulticallEndpoints";
import { adHocRpcEndpoints } from "./endpoints/adHocRpcEndpoints";
import { adHocSubgraphEndpoints } from "./endpoints/adHocSubgraphEndpoints";

export const rpcApi = initializeRpcApiSlice(createApiWithReactHooks)
  .injectEndpoints(allRpcEndpoints)
  .injectEndpoints(adHocMulticallEndpoints)
  .injectEndpoints(adHocRpcEndpoints);
export const subgraphApi = initializeSubgraphApiSlice(createApiWithReactHooks)
  .injectEndpoints(allSubgraphEndpoints)
  .injectEndpoints(adHocSubgraphEndpoints);
export const transactionSlice = initializeTransactionSlice();

const transactionSlicePersistedReducer = persistReducer(
  { storage, key: "transactions", version: 1 },
  transactionSlice.reducer
);

const persistedTransactionRecoveryReducer = persistReducer(
  { storage, key: "transaction-recovery", version: 1 },
  transactionRecoverySliceReducer
);

export const reduxStore = configureStore({
  reducer: {
    [rpcApi.reducerPath]: rpcApi.reducer,
    [subgraphApi.reducerPath]: subgraphApi.reducer,
    transactions: transactionSlicePersistedReducer,
    transactionRecovery: persistedTransactionRecoveryReducer,
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

export type AppStore = typeof reduxStore;
export type RootState = ReturnType<AppStore["getState"]>;
export type AppDispatch = AppStore["dispatch"];

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export const useAppDispatch = () => useDispatch<Dispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
