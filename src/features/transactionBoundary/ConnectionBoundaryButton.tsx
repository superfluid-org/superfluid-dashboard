import { LoadingButton } from "@mui/lab";
import { Button, ButtonProps } from "@mui/material";
import { switchNetwork } from "@wagmi/core";
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
    isImpersonated,
    stopImpersonation,
    isConnected,
    isConnecting,
    connectWallet,
    expectedNetwork,
    isCorrectNetwork,
    switchNetwork,
  } = useConnectionBoundary();

  if (isImpersonated) {
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

  if (!isConnected) {
    return (
      <LoadingButton
        data-cy={"connect-wallet"}
        {...ButtonProps}
        loading={isConnecting}
        color="primary"
        onClick={connectWallet}
      >
        <span>Connect Wallet</span>
      </LoadingButton>
    );
  }

  if (!isCorrectNetwork) {
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
