import { FC, ReactNode } from "react";
import { useTransactionBoundary } from "./TransactionBoundary";
import { Button, ButtonProps } from "@mui/material";
import { LoadingButton } from "@mui/lab";
import { Signer } from "ethers";

export const TransactionButton: FC<{
  children: ReactNode;
  dataCy?: string;
  disabled?: boolean;
  onClick: (signer: Signer) => Promise<void>; // TODO(KK): Longer-term, get rid of async to avoid wagmi's UX pitfalls
  ButtonProps?: ButtonProps;
}> = ({ children, dataCy, disabled, onClick, ButtonProps }) => {
  const {
    signer,
    isImpersonated,
    stopImpersonation,
    isConnected,
    isConnecting,
    connectWallet,
    expectedNetwork,
    isCorrectNetwork,
    switchNetwork,
    mutationResult
  } = useTransactionBoundary();

  const buttonProps: ButtonProps = {
    fullWidth: true,
    variant: "contained",
    size: "xl",
    ...ButtonProps,
  };

  if (disabled) {
    return (
      <Button data-cy={dataCy} {...buttonProps} disabled>
        <span>{children}</span>
      </Button>
    );
  }

  if (isImpersonated) {
    return (
      <Button
        data-cy={"view-mode-button"}
        {...buttonProps}
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
        {...buttonProps}
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
        {...buttonProps}
        color="primary"
        disabled={!switchNetwork}
        onClick={() => switchNetwork?.()}
      >
        <span>Change Network to</span>{" "}
        <span translate="no">{expectedNetwork.name}</span>
      </Button>
    );
  }

  return (
    <LoadingButton
      {...(dataCy ? { "data-cy": dataCy } : {})}
      {...buttonProps}
      loading={mutationResult.isLoading}
      color="primary"
      disabled={!signer}
      onClick={() => {
        if (!signer) throw Error("Signer not defined.");
        onClick(signer);
      }}
    >
      <span>{children}</span>
    </LoadingButton>
  );
};
