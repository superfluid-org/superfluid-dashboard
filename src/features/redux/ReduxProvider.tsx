import {
  initiateOldPendingTransactionsTrackingThunk,
  setFrameworkForSdkRedux,
  setSignerForSdkRedux,
} from "@superfluid-finance/sdk-redux";
import { FC, useEffect } from "react";
import { Provider } from "react-redux";
import { useAccount, useNetwork, useSigner } from "wagmi";
import { networks } from "../network/networks";
import readOnlyFrameworks from "../network/readOnlyFrameworks";
import { reduxStore, useAppDispatch } from "./store";

const ReduxProviderCore: FC = ({ children }) => {
  const { data: signer } = useSigner();

  const { data: wallet } = useAccount();
  const walletAddress = wallet?.address;

  const { activeChain } = useNetwork();
  const walletChainId = activeChain?.id;

  const dispatch = useAppDispatch();

  useEffect(() => {
    if (walletAddress) {
      dispatch(
        initiateOldPendingTransactionsTrackingThunk({
          chainIds: networks.map((x) => x.id),
          signerAddress: walletAddress,
        }) as any
      ); // TODO(weird version mismatch):
    }
  }, [walletAddress]);

  useEffect(() => {
    if (walletChainId && signer) {
      setSignerForSdkRedux(walletChainId, () => Promise.resolve(signer));
    }
  }, [walletChainId, signer]);

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
