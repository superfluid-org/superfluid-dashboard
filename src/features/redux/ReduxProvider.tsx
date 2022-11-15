import { Framework } from "@superfluid-finance/sdk-core";
import {
  initiateOldPendingTransactionsTrackingThunk,
  setFrameworkForSdkRedux,
  transactionTrackerSelectors,
} from "@superfluid-finance/sdk-redux";
import promiseRetry from "promise-retry";
import { FC, PropsWithChildren, useCallback, useEffect } from "react";
import { Provider } from "react-redux";
import { useAccount, useSigner } from "wagmi";
import { parseV1AddressBookEntries } from "../../utils/addressBookUtils";
import { parseV1CustomTokens } from "../../utils/customTokenUtils";
import { useLazyPollQuery } from "../../vesting-subgraph/poll.generated";
import { vestingSubgraphApi } from "../../vesting-subgraph/vestingSubgraphApiEnhancements";
import { addAddressBookEntries } from "../addressBook/addressBook.slice";
import { addCustomTokens } from "../customTokens/customTokens.slice";
import { networkDefinition, networks } from "../network/networks";
import readOnlyFrameworks from "../network/readOnlyFrameworks";
import {
  listenerMiddleware,
  reduxStore,
  subgraphApi,
  transactionTracker,
  useAppDispatch,
} from "./store";

const ReduxProviderCore: FC<PropsWithChildren> = ({ children }) => {
  const { connector: activeConnector } = useAccount();
  const { data: signer } = useSigner();
  const dispatch = useAppDispatch();

  const initializeReadonlyFrameworks = useCallback(
    () =>
      // TODO(KK): Use wagmi's providers. Wagmi might be better at creating providers and then we don't create double providers.
      readOnlyFrameworks.forEach((x) =>
        setFrameworkForSdkRedux(x.chainId, x.frameworkGetter)
      ),
    []
  );

  /**
   * TODO: We might want to remove importV1AddressBook and importV1CustomTokens in the future.
   * These functions read dashboard v1 address book and custom tokens from local storage,
   * import data into new persistent stores and delete the old data.
   */
  const importV1AddressBook = useCallback(() => {
    try {
      const v1AddressBook = localStorage.getItem("addressBook");

      if (v1AddressBook) {
        const v1Entries = parseV1AddressBookEntries(v1AddressBook);
        dispatch(addAddressBookEntries(v1Entries));
        localStorage.setItem("addressBook_v1", v1AddressBook);
        localStorage.removeItem("addressBook");
      }
    } catch (e) {
      console.error("Failed to parse v1 address book.", e);
    }
  }, [dispatch]);

  const importV1CustomTokens = useCallback(() => {
    try {
      const v1CustomTokens = localStorage.getItem("customTokens");

      if (v1CustomTokens) {
        const parsedV1Tokens = parseV1CustomTokens(v1CustomTokens);
        dispatch(addCustomTokens(parsedV1Tokens));
        localStorage.setItem("customTokens_v1", v1CustomTokens);
        localStorage.removeItem("customTokens");
      }
    } catch (e) {
      console.error("Failed to parse v1 custom tokens.", e);
    }
  }, [dispatch]);

  useEffect(() => {
    initializeReadonlyFrameworks();
    importV1AddressBook();
    importV1CustomTokens();
  }, [initializeReadonlyFrameworks, importV1AddressBook, importV1CustomTokens]);

  useEffect(() => {
    // TODO(KK): There is a weird state in wagmi on full refreshes where signer is present but not the connector.
    if (signer && activeConnector) {
      initializeReadonlyFrameworks(); // Re-initialize to override the old signer framework if it was present.

      signer.getChainId().then((chainId) => {
        setFrameworkForSdkRedux(chainId, () =>
          promiseRetry<Framework>(
            (retry) =>
              Framework.create({
                chainId: chainId,
                provider: signer,
              }).catch(retry),
            {
              minTimeout: 500,
              maxTimeout: 2000,
              retries: 10,
            }
          )
        );
      });

      signer.getAddress().then((address) => {
        dispatch(
          initiateOldPendingTransactionsTrackingThunk({
            chainIds: networks.map((x) => x.id),
            signerAddress: address,
          }) as any
        ); // TODO(weird version mismatch):
      });
    }
  }, [signer]);

  const [pollQuery] = useLazyPollQuery();

  // # Cache invalidation for vesting:
  useEffect(
    () =>
      listenerMiddleware.startListening({
        actionCreator: transactionTracker.actions.updateTransaction,
        effect: ({ payload }, { getState }) => {
          const { blockTransactionSucceededIn } = payload.changes;
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

  return <>{children}</>;
};

const ReduxProvider: FC<PropsWithChildren> = ({ children }) => {
  return (
    <Provider store={reduxStore}>
      <ReduxProviderCore>{children}</ReduxProviderCore>
    </Provider>
  );
};

export default ReduxProvider;
