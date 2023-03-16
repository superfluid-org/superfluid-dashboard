import { transactionTrackerSelectors } from "@superfluid-finance/sdk-redux";
import promiseRetry from "promise-retry";
import { useEffect } from "react";
import { schedulingSubgraphApi } from "../../scheduling-subgraph/schedulingSubgraphApi";
import { allNetworks, tryFindNetwork } from "../network/networks";
import {
  pendingUpdateSelectors,
  pendingUpdateSlice,
} from "../pendingUpdates/pendingUpdate.slice";
import {
  listenerMiddleware,
  RootState,
  transactionTracker,
  useAppDispatch,
} from "./store";

// WARNING: This shouldn't be set up more than once in the app.
export const useSchedulerTransactionTracking = () => {
  const dispatch = useAppDispatch();
  const [pollQuery] = schedulingSubgraphApi.useLazyPollQuery();

  // # Cache invalidation for scheduling:
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
            network.flowSchedulerContractAddress &&
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
              const pendingUpdateIDs = pendingUpdateSelectors
                .selectAll(state.pendingUpdates)
                .filter(
                  (pendingUpdate) =>
                    pendingUpdate &&
                    pendingUpdate.transactionHash === payload.id &&
                    pendingUpdate.relevantSubgraph === "Scheduler"
                )
                .map((pendingUpdate) => pendingUpdate.id);

              if (pendingUpdateIDs.length > 0) {
                dispatch(
                  pendingUpdateSlice.actions.removeMany(pendingUpdateIDs)
                );
                dispatch(
                  schedulingSubgraphApi.util.invalidateTags([
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
