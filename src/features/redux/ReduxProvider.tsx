import {
  initiateOldPendingTransactionsTrackingThunk,
  setFrameworkForSdkRedux,
} from "@superfluid-finance/sdk-redux";
import { FC, useEffect } from "react";
import { Provider } from "react-redux";
import { useAccount, useNetwork, useSigner } from "wagmi";
import { networks } from "../network/networks";
import readOnlyFrameworks from "../network/readOnlyFrameworks";
import { reduxStore, useAppDispatch } from "./store";

const ReduxProviderCore: FC = ({ children }) => {
  const { address: accountAddress } = useAccount();

  const dispatch = useAppDispatch();

  useEffect(() => {
    if (accountAddress) {
      dispatch(
        initiateOldPendingTransactionsTrackingThunk({
          chainIds: networks.map((x) => x.id),
          signerAddress: accountAddress,
        }) as any
      ); // TODO(weird version mismatch):
    }
  }, [accountAddress]);

  // TODO(KK): Use wagmi's providers. Wagmi might be better at creating providers and then we don't create double providers.
  useEffect(() => {
    readOnlyFrameworks.map((x) =>
      setFrameworkForSdkRedux(x.chainId, x.frameworkGetter)
    );
  }, []);

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
