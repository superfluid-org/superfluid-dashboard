import { Signer } from "ethers";
import {
  FC,
  ReactNode,
  useState,
  useMemo,
  createContext,
  useContext,
  useEffect,
} from "react";
import { useAccount, useNetwork, useSigner, useSwitchNetwork } from "wagmi";
import UnknownMutationResult from "../../unknownMutationResult";
import { useAutoConnect } from "../autoConnect/AutoConnect";
import { useImpersonation } from "../impersonation/ImpersonationContext";
import { useExpectedNetwork } from "../network/ExpectedNetworkContext";
import { Network } from "../network/networks";
import { useConnectButton } from "../wallet/ConnectButtonProvider";
import { TransactionDialog } from "./TransactionDialog";

interface TransactionBoundaryContextValue {
  signer: Signer | null | undefined;
  isImpersonated: boolean;
  stopImpersonation: () => void;
  isConnecting: boolean;
  isConnected: boolean;
  connectWallet: () => void;
  isCorrectNetwork: boolean;
  switchNetwork: (() => void) | undefined;
  expectedNetwork: Network;
  dialogOpen: boolean;
  openDialog: () => void;
  closeDialog: () => void;
  setDialogLoadingInfo: (children: ReactNode) => void;
  setDialogSuccessActions: (children: ReactNode) => void;
  mutationResult: UnknownMutationResult;
}

const TransactionBoundaryContext =
  createContext<TransactionBoundaryContextValue>(null!);

export const useTransactionBoundary = () =>
  useContext(TransactionBoundaryContext);

interface TransactionBoundaryProps {
  children: (arg: TransactionBoundaryContextValue) => ReactNode;
  dialog?: (arg: TransactionBoundaryContextValue) => ReactNode;
  mutationResult: UnknownMutationResult;
  expectedNetwork?: Network;
}

export const TransactionBoundary: FC<TransactionBoundaryProps> = ({
  children,
  dialog,
  mutationResult,
  ...props
}) => {
  const { data: signer } = useSigner();
  const { isImpersonated, stopImpersonation } = useImpersonation();
  const { chain: activeChain } = useNetwork();
  const { switchNetwork } = useSwitchNetwork();
  const { isConnecting, isConnected } = useAccount();
  const { isAutoConnecting } = useAutoConnect();
  const { openConnectModal } = useConnectButton();
  const { network } = useExpectedNetwork();
  const expectedNetwork = props.expectedNetwork ?? network;

  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogLoadingInfo, setDialogLoadingInfo] = useState<ReactNode>(null);
  const [dialogSuccessActions, setDialogSuccessActions] =
    useState<ReactNode>(null);

  const contextValue = useMemo<TransactionBoundaryContextValue>(
    () => ({
      signer,
      isImpersonated,
      stopImpersonation,
      isConnected,
      isConnecting: isConnecting || isAutoConnecting,
      connectWallet: () => openConnectModal(),
      isCorrectNetwork: expectedNetwork.id === activeChain?.id,
      switchNetwork: switchNetwork
        ? () => void switchNetwork(expectedNetwork.id)
        : undefined,
      expectedNetwork,
      dialogOpen,
      openDialog: () => setDialogOpen(true),
      closeDialog: () => {
        setDialogOpen(false);
        mutationResult.reset();
      },
      setDialogLoadingInfo,
      setDialogSuccessActions,
      mutationResult,
    }),
    [
      signer,
      isImpersonated,
      stopImpersonation,
      isConnected,
      isConnecting,
      isAutoConnecting,
      openConnectModal,
      switchNetwork,
      expectedNetwork,
      dialogOpen,
      setDialogLoadingInfo,
      setDialogSuccessActions,
      mutationResult,
    ]
  );

  useEffect(() => {
    if (mutationResult.isLoading) {
      setDialogOpen(true);
    }
  }, [mutationResult.isLoading]);

  return (
    <TransactionBoundaryContext.Provider value={contextValue}>
      {children(contextValue)}
      <TransactionDialog
        loadingInfo={dialogLoadingInfo}
        successActions={dialogSuccessActions}
      >
        {dialog?.(contextValue)}
      </TransactionDialog>
    </TransactionBoundaryContext.Provider>
  );
};
