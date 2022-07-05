import { Framework } from "@superfluid-finance/sdk-core";
import {
  initiateOldPendingTransactionsTrackingThunk,
  setFrameworkForSdkRedux,
} from "@superfluid-finance/sdk-redux";
import { FC, useEffect } from "react";
import { Provider } from "react-redux";
import { useSigner } from "wagmi";
import { networks } from "../network/networks";
import readOnlyFrameworks from "../network/readOnlyFrameworks";
import { reduxStore, useAppDispatch } from "./store";

const ReduxProviderCore: FC = ({ children }) => {
  const { data: signer } = useSigner();
  const dispatch = useAppDispatch();

  useEffect(() => {
    // TODO(KK): Use wagmi's providers. Wagmi might be better at creating providers and then we don't create double providers.
    readOnlyFrameworks.map((x) =>
      setFrameworkForSdkRedux(x.chainId, x.frameworkGetter)
    );

    if (signer) {
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
