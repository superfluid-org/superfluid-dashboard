import React, { FC, useState } from "react";
import { useWalletContext } from "../wallet/WalletContext";
import { useNetworkContext } from "../network/NetworkContext";
import { Button, ButtonProps, Dialog, DialogActions } from "@mui/material";
import { LoadingButton } from "@mui/lab";
import {
  TransactionDialog,
  TransactionDialogActions,
  TransactionDialogButton,
} from "./TransactionDialog";
import UnknownMutationResult from "../../unknownMutationResult";

export const TransactionButton: FC<{
  mutationResult: UnknownMutationResult;
  hidden: boolean;
  disabled: boolean;
  onClick: (
    setTransactionDialogContent: (arg: {
      label?: React.ReactNode;
      successActions?: ReturnType<typeof TransactionDialogActions>;
    }) => void,
    closeTransactionDialog: () => void
  ) => void;
  ButtonProps?: ButtonProps;
}> = ({ children, disabled, onClick, mutationResult, hidden }) => {
  const { walletAddress, walletChainId, connectWallet, isWalletConnecting } =
    useWalletContext();
  const { network } = useNetworkContext();
  const [transactionDialogLabel, setTransactionDialogLabel] = useState<
    React.ReactNode | undefined
  >();
  const [transactionDialogSuccessActions, setTransactionDialogSuccessActions] =
    useState<ReturnType<typeof TransactionDialogActions> | undefined>();
  const [transactionDialogOpen, setTransactionDialogOpen] = useState(false);

  const getButton = () => {
    if (hidden) {
      return null;
    }

    if (disabled) {
      return (
        <Button
          fullWidth
          disabled
          color="primary"
          variant="contained"
          size="xl"
        >
          {children}
        </Button>
      );
    }

    if (!walletAddress) {
      return (
        <LoadingButton
          fullWidth
          loading={isWalletConnecting}
          color="primary"
          variant="contained"
          size="xl"
          onClick={connectWallet}
        >
          Connect Wallet
        </LoadingButton>
      );
    }

    if (walletChainId != network.chainId) {
      return (
        <Button
          disabled
          color="primary"
          variant="contained"
          size="xl"
          fullWidth
        >
          Change Network to {network.displayName}
        </Button>
      );
    }

    return (
      <LoadingButton
        fullWidth
        loading={mutationResult.isLoading}
        color="primary"
        variant="contained"
        size="xl"
        disabled={disabled}
        onClick={() => {
          onClick(
            (arg: {
              label?: React.ReactNode;
              successActions?: ReturnType<typeof TransactionDialogActions>;
            }) => {
              setTransactionDialogLabel(arg?.label);
              setTransactionDialogSuccessActions(arg?.successActions);
            },
            () => setTransactionDialogOpen(false)
          );
          setTransactionDialogOpen(true);
        }}
      >
        {children}
      </LoadingButton>
    );
  };

  return (
    <>
      {getButton()}
      <TransactionDialog
        mutationResult={mutationResult}
        onClose={() => setTransactionDialogOpen(false)}
        open={transactionDialogOpen}
        label={transactionDialogLabel}
        successActions={
          transactionDialogSuccessActions ?? (
            <DialogActions sx={{ p: 3, pt: 0 }}>
              <TransactionDialogButton
                onClick={() => setTransactionDialogOpen(false)}
              >
                OK
              </TransactionDialogButton>
            </DialogActions>
          )
        }
      ></TransactionDialog>
    </>
  );
};
