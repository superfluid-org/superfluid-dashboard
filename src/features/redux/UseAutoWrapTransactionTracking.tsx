import {
  listenerMiddleware,
  transactionTracker,
  useAppDispatch,
  RootState,
} from "./store";
import { useEffect } from "react";
import { transactionTrackerSelectors } from "@superfluid-finance/sdk-redux";
import { allNetworks, tryFindNetwork } from "../network/networks";
import promiseRetry from "promise-retry";
import {
  pendingUpdateSelectors,
  pendingUpdateSlice,
} from "../pendingUpdates/pendingUpdate.slice";
import { autoWrapSubgraphApi } from "../../auto-wrap-subgraph/autoWrapSubgraphApi";

// WARNING: This shouldn't be set up more than once in the app.
export const useAutoWrapTransactionTracking = () => {
  const dispatch = useAppDispatch();
  const [pollQuery] = autoWrapSubgraphApi.useLazyPollQuery();

  // # Cache invalidation for auto-wrap:
  useEffect(
    () =>
      listenerMiddleware.startListening({
        actionCreator: transactionTracker.actions.updateTransaction,
        effect: ({ payload }, { getState }) => {
          const { blockTransactionSucceededIn } = payload.changes;
          const state = getState() as RootState;
          const trackedTransaction = transactionTrackerSelectors.selectById(
            state,
            payload.id
          )!;
          const network = tryFindNetwork(
            allNetworks,
            trackedTransaction.chainId
          );

          if (
            network &&
            network.autoWrap &&
            blockTransactionSucceededIn
          ) {
            // Poll Subgraph for all the events for this block and then invalidate Subgraph cache based on that.
            promiseRetry(
              (retry, _number) =>
                pollQuery({
                  chainId: trackedTransaction.chainId,
                  block: {
                    number: blockTransactionSucceededIn,
                  },
                })
                  .then((queryResult) =>
                    queryResult.isError
                      ? void retry(queryResult.error)
                      : queryResult
                  )
                  .catch(retry),
              {
                minTimeout: 500,
                factor: 2,
                forever: true,
              }
            ).then((_subgraphEventsQueryResult) => {
              const pendingUpdate = pendingUpdateSelectors.selectById(
                state.pendingUpdates,
                payload.id
              );

              if (pendingUpdate?.relevantSubgraph === "Auto-Wrap") {
                dispatch(pendingUpdateSlice.actions.removeOne(payload.id));
                dispatch(
                  autoWrapSubgraphApi.util.invalidateTags([
                    {
                      type: "GENERAL",
                      id: trackedTransaction.chainId,
                    },
                  ])
                );
              }
            });
          }
        },
      }),
    [dispatch, pollQuery]
  );
};
