import { FC, ReactNode } from "react";
import { useTransactionBoundary } from "./TransactionBoundary";
import { Button, ButtonProps } from "@mui/material";
import { LoadingButton } from "@mui/lab";
import { Signer } from "ethers";
import ConnectionBoundaryButton, {
  ConnectionBoundaryButtonProps,
} from "./ConnectionBoundaryButton";

export const transactionButtonDefaultProps: ButtonProps = {
  fullWidth: true,
  variant: "contained",
  size: "xl",
};

export interface TransactionButtonProps {
  children: ReactNode;
  dataCy?: string;
  disabled?: boolean;
  onClick: (signer: Signer) => Promise<void>; // TODO(KK): Longer-term, get rid of async to avoid wagmi's UX pitfalls
  ButtonProps?: ButtonProps;
  ConnectionBoundaryButtonProps?: Partial<ConnectionBoundaryButtonProps>;
}

export const TransactionButton: FC<TransactionButtonProps> = ({
  children,
  dataCy,
  disabled,
  onClick,
  ButtonProps = {},
  ConnectionBoundaryButtonProps = {},
}) => {
  const { signer, mutationResult, transaction } = useTransactionBoundary();

  const buttonProps: ButtonProps = {
    ...transactionButtonDefaultProps,
    ...ButtonProps,
  };

  if (disabled) {
    return (
      <Button data-cy={dataCy} {...buttonProps} disabled>
        <span>{children}</span>
      </Button>
    );
  }

  return (
    <ConnectionBoundaryButton
      ButtonProps={buttonProps}
      {...ConnectionBoundaryButtonProps}
    >
      <LoadingButton
        {...(dataCy ? { "data-cy": dataCy } : {})}
        color="primary"
        {...buttonProps}
        loading={mutationResult.isLoading || transaction?.status === "Pending"}
        disabled={!signer}
        onClick={() => {
          if (!signer) throw Error("Signer not defined.");
          onClick(signer);
        }}
      >
        <span>{children}</span>
      </LoadingButton>
    </ConnectionBoundaryButton>
  );
};
