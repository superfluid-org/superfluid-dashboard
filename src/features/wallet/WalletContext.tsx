import {
  initiateOldPendingTransactionsTrackingThunk,
  setFrameworkForSdkRedux,
  setSignerForSdkRedux,
} from "@superfluid-finance/sdk-redux";
import {
  createContext,
  FC,
  useContext,
  useEffect,
  useMemo,
} from "react";
import { networks } from "../network/networks";
import readOnlyFrameworks from "../network/readOnlyFrameworks";
import { useAppDispatch } from "../redux/store";
import {
  useAccount,
  useNetwork,
  useSigner,
} from "wagmi";

interface WalletContextValue {
  walletChainId: number | undefined;
  walletAddress: string | undefined;
}

const WalletContext = createContext<WalletContextValue>(null!);

export default WalletContext;

export const WalletContextProvider: FC = ({ children }) => {
  const { data: wallet } = useAccount();
  const walletAddress = wallet?.address;

  const { activeChain } = useNetwork();
  const walletChainId = activeChain?.id;

  const contextValue = useMemo(
    () => ({
      walletChainId,
      walletAddress,
    }),
    [walletAddress, walletChainId]
  );

  const { data: signer } = useSigner();

  const dispatch = useAppDispatch();

  useEffect(() => {
    if (walletAddress) {
      dispatch(
        initiateOldPendingTransactionsTrackingThunk({
          chainIds: networks.map((x) => x.chainId),
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

  return (
    <WalletContext.Provider value={contextValue}>
      {children}
    </WalletContext.Provider>
  );
};

export const useWalletContext = () => useContext(WalletContext);
