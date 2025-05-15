import {
  initiateOldPendingTransactionsTrackingThunk,
  setFrameworkForSdkRedux,
} from "@superfluid-finance/sdk-redux";
import { FC, PropsWithChildren, useCallback, useEffect } from "react";
import { Provider } from "react-redux";
import { useAccount } from "@/hooks/useAccount"
import { parseV1CustomTokens } from "../../utils/customTokenUtils";
import { addCustomTokens } from "../customTokens/customTokens.slice";
import { allNetworks } from "../network/networks";
import readOnlyFrameworks from "../network/readOnlyFrameworks";
import { reduxPersistor, reduxStore, useAppDispatch } from "./store";
import { useSchedulerTransactionTracking } from "./UseSchedulerTransactionTracking";
import { useVestingTransactionTracking } from "./UseVestingTransactionTracking";
import { useEthersSigner } from "../../utils/wagmiEthersAdapters";
import { PersistGate } from "redux-persist/integration/react";
import { useMutation } from "@tanstack/react-query";

// Initialize SDK-core Frameworks for SDK-redux.
readOnlyFrameworks.forEach(
  (x) => void setFrameworkForSdkRedux(x.chainId, x.frameworkGetter)
);

const ReduxProviderCore: FC<PropsWithChildren> = () => {
  const { connector: activeConnector } = useAccount();

  const signer = useEthersSigner();
  const dispatch = useAppDispatch();

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
    importV1CustomTokens();
  }, [importV1CustomTokens]);

  const initiatePendingTransactions = useMutation({
    mutationFn: async () => {
      if (!signer || !activeConnector) return;
      const address = await signer.getAddress();
      return { address };
    },
    onSuccess: (data) => {
      if (data) {
        dispatch(
          initiateOldPendingTransactionsTrackingThunk({
            chainIds: allNetworks.map((x) => x.id),
            signerAddress: data.address,
          })
        );
      }
    }
  });

  useEffect(() => {
    // TODO(KK): There is a weird state in wagmi on full refreshes where signer is present but not the connector.
    if (signer && activeConnector) {
      // TODO(KK): There is a weird state in wagmi on full refreshes where signer is present but not the connector.
      if (signer && activeConnector) {
        initiatePendingTransactions.mutate();
      }
    }
  }, [signer, dispatch]);

  useVestingTransactionTracking();
  useSchedulerTransactionTracking();

  return null;
};

const ReduxProvider: FC<PropsWithChildren> = ({ children }) => {
  return (
    <Provider store={reduxStore}>
      {children}
      <PersistGate persistor={reduxPersistor}>
        {
          (bootstrapped) => {
            if (!bootstrapped) {
              return null;
            }
            return (
              <ReduxProviderCore />
            );
          }
        }
      </PersistGate>
    </Provider>
  );
};

export default ReduxProvider;
