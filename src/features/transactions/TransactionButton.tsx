import { FC } from "react";
import { useWalletContext } from "../wallet/WalletContext";
import { useNetworkContext } from "../network/NetworkContext";
import { Button, ButtonProps, CircularProgress } from "@mui/material";
import { TransactionInfo } from "@superfluid-finance/sdk-redux";
import { useTransactionDialogContext } from "./TransactionDialogContext";
import { LoadingButton } from "@mui/lab";

export const TransactionButton: FC<{
  text: string; // TODO(KK): Rename to button text
  hidden: boolean;
  disabled: boolean;
  mutationResult: { isLoading: boolean };
  onClick: () => {
    infoText: string;
    trigger: () => Promise<TransactionInfo>;
    clean?: () => void;
  };
  ButtonProps?: ButtonProps;
}> = ({ text, hidden, disabled, mutationResult: { isLoading }, onClick }) => {
  const { walletAddress, walletChainId, connectWallet, isWalletConnecting } =
    useWalletContext();
  const { network } = useNetworkContext();
  const { triggerTransaction } = useTransactionDialogContext();

  if (hidden) {
    return null;
  }

  if (disabled) {
    return (
      <Button color="primary" variant="contained" disabled={true}>
        {text}
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
      loading={isLoading}
      color="primary"
      variant="contained"
      disabled={disabled}
      fullWidth={true}
      onClick={async () => {
        const { trigger, infoText } = onClick();
        triggerTransaction({
          trigger,
          description: infoText,
        });
      }}
    >
      {text}
    </LoadingButton>
  );
};
