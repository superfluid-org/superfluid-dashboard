import { FC } from "react";
import { useWalletContext } from "../../contexts/WalletContext";
import { useNetworkContext } from "../../contexts/NetworkContext";
import { Button, ButtonProps, CircularProgress } from "@mui/material";

export const TransactionButton: FC<{
  text: string;
  disabled: boolean;
  mutationResult: { isLoading: boolean };
  onClick: () => void;
  ButtonProps?: ButtonProps;
}> = ({ text, disabled, mutationResult: { isLoading }, onClick }) => {
  const { walletAddress, walletChainId, connect } = useWalletContext();
  const { network } = useNetworkContext();

  if (disabled) {
    return <Button color="primary" variant="contained" disabled={true}>
      {text}
    </Button>;
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
      onClick={onClick}
    >
      {isLoading ? <CircularProgress /> : text}
    </Button>
  );
};
