import { FC } from "react";
import { useWalletContext } from "../wallet/WalletContext";
import { useNetworkContext } from "../network/NetworkContext";
import { Button, ButtonProps, CircularProgress } from "@mui/material";
import { TransactionInfo } from "@superfluid-finance/sdk-redux";
import { useTransactionDialogContext } from "./TransactionDialogContext";

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
  const { walletAddress, walletChainId, connect } = useWalletContext();
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
      <Button
        color="primary"
        variant="contained"
        fullWidth={true}
        onClick={connect}
      >
        Connect Wallet
      </Button>
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
    <Button
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
      {isLoading ? <CircularProgress /> : text}
    </Button>
  );
};
