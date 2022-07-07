import { Framework } from "@superfluid-finance/sdk-core";
import {
  initiateOldPendingTransactionsTrackingThunk,
  setFrameworkForSdkRedux,
} from "@superfluid-finance/sdk-redux";
import { FC, useCallback, useEffect } from "react";
import { Provider } from "react-redux";
import { useConnect, useSigner } from "wagmi";
import { networks } from "../network/networks";
import readOnlyFrameworks from "../network/readOnlyFrameworks";
import { reduxStore, useAppDispatch } from "./store";

const ReduxProviderCore: FC = ({ children }) => {
  const { activeConnector } = useConnect();
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

  useEffect(() => initializeReadonlyFrameworks(), []);

  useEffect(() => {
    // TODO(KK): There is a weird state in wagmi on full refreshes where signer is present but not the connector.
    if (signer && activeConnector) {
      initializeReadonlyFrameworks(); // Re-initialize to override the old signer framework if it was present.

      signer.getChainId().then((chainId) => {
        setFrameworkForSdkRedux(chainId, () =>
          Framework.create({
            chainId: chainId,
            provider: signer,
          })
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

  return <>{children}</>;
};

const ReduxProvider: FC = ({ children }) => {
  return (
    <Provider store={reduxStore}>
      <ReduxProviderCore>{children}</ReduxProviderCore>
    </Provider>
  );
};

export default ReduxProvider;
