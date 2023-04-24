import { LoadingButton } from "@mui/lab";
import { Button, ButtonProps } from "@mui/material";
import { FC, PropsWithChildren } from "react";
import { useConnectionBoundary } from "./ConnectionBoundary";

interface ConnectionBoundaryButtonProps {
  dataCy?: string;
  ButtonProps?: ButtonProps;
}

const ConnectionBoundaryButton: FC<
  PropsWithChildren<ConnectionBoundaryButtonProps>
> = ({ children, ButtonProps }) => {
  const {
    allowImpersonation,
    isImpersonated,
    stopImpersonation,
    isConnected,
    isConnecting,
    connectWallet,
    expectedNetwork,
    isCorrectNetwork,
    switchNetwork,
  } = useConnectionBoundary();

  if (isImpersonated && !allowImpersonation) {
    return (
      <Button
        data-cy={"view-mode-button"}
        {...ButtonProps}
        color="warning"
        onClick={stopImpersonation}
      >
        Stop Viewing an Address
      </Button>
    );
  }

  if (!(isConnected || (isImpersonated && allowImpersonation))) {
    return (
      <LoadingButton
        data-cy={"connect-wallet-button"}
        {...ButtonProps}
        loading={isConnecting}
        color="primary"
        onClick={connectWallet}
      >
        <span>Connect Wallet</span>
      </LoadingButton>
    );
  }

  if (!isCorrectNetwork && !allowImpersonation) {
    return (
      <Button
        data-cy={"change-network-button"}
        {...ButtonProps}
        color="primary"
        disabled={!switchNetwork}
        onClick={() => switchNetwork?.()}
      >
        <span translate="no">Change Network to {expectedNetwork.name}</span>
      </Button>
    );
  }

  return <>{children}</>;
};

export default ConnectionBoundaryButton;
