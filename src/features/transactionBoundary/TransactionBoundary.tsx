import {
  TrackedTransaction,
  TransactionInfo,
  transactionTrackerSelectors,
} from "@superfluid-finance/sdk-redux";
import { Overrides, Signer } from "ethers";
import {
  createContext,
  FC,
  ReactNode,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useSigner } from "wagmi";
import useGetTransactionOverrides from "../../hooks/useGetTransactionOverrides";
import MutationResult from "../../MutationResult";
import { Network } from "../network/networks";
import { useAppSelector } from "../redux/store";
import { useConnectionBoundary } from "./ConnectionBoundary";
import { TransactionDialog } from "./TransactionDialog";
import { TxAnalyticsFn, useAnalytics } from "../analytics/useAnalytics";

interface TransactionBoundaryContextValue {
  signer: Signer | null | undefined;
  dialogOpen: boolean;
  openDialog: () => void;
  closeDialog: () => void;
  setDialogLoadingInfo: (children: ReactNode) => void;
  setDialogSuccessActions: (children: ReactNode) => void;
  mutationResult: MutationResult<TransactionInfo>;
  getOverrides: () => Promise<Overrides>;
  transaction: TrackedTransaction | undefined;
  network: Network;
  txAnalytics: TxAnalyticsFn;
}

const TransactionBoundaryContext =
  createContext<TransactionBoundaryContextValue>(null!);

export const useTransactionBoundary = () =>
  useContext(TransactionBoundaryContext);

export interface TransactionBoundaryProps {
  children: (transactionContext: TransactionBoundaryContextValue) => ReactNode;
  dialog?: (transactionContext: TransactionBoundaryContextValue) => ReactNode;
  mutationResult: MutationResult<TransactionInfo>;
}

export const TransactionBoundary: FC<TransactionBoundaryProps> = ({
  children,
  dialog,
  mutationResult,
  ...props
}) => {
  const { data: signer } = useSigner();
  const { expectedNetwork } = useConnectionBoundary();
  const getTransactionOverrides = useGetTransactionOverrides();
  const { txAnalytics } = useAnalytics();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogLoadingInfo, setDialogLoadingInfo] = useState<ReactNode>(null);
  const [dialogSuccessActions, setDialogSuccessActions] =
    useState<ReactNode>(null);
  const trackedTransaction = useAppSelector((state) =>
    mutationResult.isSuccess
      ? transactionTrackerSelectors.selectById(state, mutationResult.data!.hash)
      : undefined
  );

  const contextValue = useMemo<TransactionBoundaryContextValue>(
    () => ({
      signer,
      dialogOpen,
      openDialog: () => setDialogOpen(true),
      closeDialog: () => setDialogOpen(false),
      setDialogLoadingInfo,
      setDialogSuccessActions,
      mutationResult,
      getOverrides: () => getTransactionOverrides(expectedNetwork),
      transaction: trackedTransaction,
      network: expectedNetwork,
      txAnalytics,
    }),
    [
      signer,
      dialogOpen,
      setDialogLoadingInfo,
      setDialogSuccessActions,
      mutationResult,
      getTransactionOverrides,
      trackedTransaction,
      expectedNetwork,
      txAnalytics
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
