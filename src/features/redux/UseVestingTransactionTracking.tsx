import {listenerMiddleware, transactionTracker, useAppDispatch} from "./store";
import {useLazyPollQuery} from "../../vesting-subgraph/poll.generated";
import {useEffect} from "react";
import {transactionTrackerSelectors} from "@superfluid-finance/sdk-redux";
import {networkDefinition} from "../network/networks";
import promiseRetry from "promise-retry";
import {vestingSubgraphApi} from "../../vesting-subgraph/vestingSubgraphApiEnhancements";

// WARNING: This shouldn't be set up more than once in the app.
export const useVestingTransactionTracking = () => {
    const dispatch = useAppDispatch();
    const [pollQuery] = useLazyPollQuery();

    // # Cache invalidation for vesting:
    useEffect(
        () =>
            listenerMiddleware.startListening({
                actionCreator: transactionTracker.actions.updateTransaction,
                effect: ({payload}, {getState}) => {
                    const {blockTransactionSucceededIn} = payload.changes;
                    const trackedTransaction = transactionTrackerSelectors.selectById(
                        getState() as any, // TODO(KK): Get rid of any
                        payload.id
                    )!;

                    if (
                        trackedTransaction.chainId === networkDefinition.goerli.id &&
                        blockTransactionSucceededIn
                    ) {
                        // Poll Subgraph for all the events for this block and then invalidate Subgraph cache based on that.
                        promiseRetry(
                            (retry, _number) =>
                                pollQuery({
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
                            dispatch(
                                vestingSubgraphApi.util.invalidateTags([
                                    {
                                        type: "GENERAL",
                                        id: trackedTransaction.chainId,
                                    },
                                ])
                            );
                        });
                    }
                },
            }),
        []
    );
};