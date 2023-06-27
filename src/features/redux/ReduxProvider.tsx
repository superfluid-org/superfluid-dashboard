import {
  initiateOldPendingTransactionsTrackingThunk,
  setFrameworkForSdkRedux,
} from "@superfluid-finance/sdk-redux";
import { FC, PropsWithChildren, useCallback, useEffect } from "react";
import { Provider } from "react-redux";
import { useAccount } from "wagmi";
import { parseV1AddressBookEntries } from "../../utils/addressBookUtils";
import { parseV1CustomTokens } from "../../utils/customTokenUtils";
import { addAddressBookEntries } from "../addressBook/addressBook.slice";
import { addCustomTokens } from "../customTokens/customTokens.slice";
import { allNetworks } from "../network/networks";
import readOnlyFrameworks from "../network/readOnlyFrameworks";
import { reduxStore, useAppDispatch } from "./store";
import { useSchedulerTransactionTracking } from "./UseSchedulerTransactionTracking";
import { useVestingTransactionTracking } from "./UseVestingTransactionTracking";
import { useEthersSigner } from "../../utils/wagmiEthersAdapters";

// Initialize SDK-core Frameworks for SDK-redux.
readOnlyFrameworks.forEach(
  (x) => void setFrameworkForSdkRedux(x.chainId, x.frameworkGetter)
);

const ReduxProviderCore: FC<PropsWithChildren> = ({ children }) => {
  const { connector: activeConnector } = useAccount();

  const signer = useEthersSigner();

  const dispatch = useAppDispatch();

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
    importV1AddressBook();
    importV1CustomTokens();
  }, [importV1AddressBook, importV1CustomTokens]);

  useEffect(() => {
    // TODO(KK): There is a weird state in wagmi on full refreshes where signer is present but not the connector.
    if (signer && activeConnector) {
      signer.getAddress().then((address) => {
        dispatch(
          initiateOldPendingTransactionsTrackingThunk({
            chainIds: allNetworks.map((x) => x.id),
            signerAddress: address,
          }) as any
        ); // TODO(weird version mismatch):
      });
    }
  }, [signer]);

  useVestingTransactionTracking();
  useSchedulerTransactionTracking();

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
