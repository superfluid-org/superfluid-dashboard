import React, { FC, useState } from "react";
import { useWalletContext } from "../wallet/WalletContext";
import { useNetworkContext } from "../network/NetworkContext";
import { Button, ButtonProps } from "@mui/material";
import { LoadingButton } from "@mui/lab";
import { TransactionDialog } from "./TransactionDialog";
import UnknownMutationResult from "../../unknownMutationResult";

export const TransactionButton: FC<{
  mutationResult: UnknownMutationResult;
  hidden: boolean;
  disabled: boolean;
  onClick: (
    setTransactionDialogContent: (children: React.ReactNode) => void
  ) => void;
  ButtonProps?: ButtonProps;
}> = ({ children, disabled, onClick, mutationResult, hidden }) => {
  const { walletAddress, walletChainId, connectWallet, isWalletConnecting } =
    useWalletContext();
  const { network } = useNetworkContext();
  const [transactionDialogContent, setTransactionDialogContent] =
    useState<React.ReactNode>(<></>);
  const [transactionDialogOpen, setTransactionDialogOpen] = useState(false);

  const getButton = () => {
    if (hidden) {
      return null;
    }

    if (disabled) {
      return (
        <Button color="primary" variant="contained" disabled={true}>
          {children}
        </Button>
      );
    }

    if (!walletAddress) {
      return (
        <LoadingButton
          loading={isWalletConnecting}
          color="primary"
          variant="contained"
          fullWidth={true}
          onClick={connectWallet}
        >
          Connect Wallet
        </LoadingButton>
      );
    }

    if (walletChainId != network.chainId) {
      return (
        <Button
          disabled={true}
          color="primary"
          variant="contained"
          fullWidth={true}
        >
          Change Network to {network.displayName}
        </Button>
      );
    }

    return (
      <LoadingButton
        loading={mutationResult.isLoading}
        color="primary"
        variant="contained"
        disabled={disabled}
        fullWidth={true}
        onClick={() => {
          onClick(setTransactionDialogContent);
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
      >
        {transactionDialogContent}
      </TransactionDialog>
    </>
  );
};
