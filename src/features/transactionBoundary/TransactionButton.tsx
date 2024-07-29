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
  loading?: boolean;

  onClick: (signer: Signer) => Promise<void>; // TODO(KK): Longer-term, get rid of async to avoid wagmi's UX pitfalls
  ButtonProps?: ButtonProps;
  ConnectionBoundaryButtonProps?: Partial<ConnectionBoundaryButtonProps>;
}

export const TransactionButton: FC<TransactionButtonProps> = ({
  children,
  dataCy,
  disabled,
  loading: _isLoading,
  onClick,
  ButtonProps = {},
  ConnectionBoundaryButtonProps = {},
}) => {
  const { signer, mutationResult, transaction } = useTransactionBoundary();

  const buttonProps: ButtonProps = {
    ...transactionButtonDefaultProps,
    ...ButtonProps,
  };

  const isLoading = _isLoading || mutationResult.isLoading || transaction?.status === "Pending";

  return (
    <ConnectionBoundaryButton
      ButtonProps={buttonProps}
      {...ConnectionBoundaryButtonProps}
    >
      <LoadingButton
        {...(dataCy ? { "data-cy": dataCy } : {})}
        color="primary"
        {...buttonProps}
        loading={isLoading}
        disabled={disabled || !signer}
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
