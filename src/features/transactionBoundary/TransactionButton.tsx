import { FC, ReactNode } from "react";
import { useTransactionBoundary } from "./TransactionBoundary";
import { Button, ButtonProps } from "@mui/material";
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

  onClick: () => Promise<void>;
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
  const { accountAddress, mutationResult, transaction } =
    useTransactionBoundary();

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
      <Button
        {...(dataCy ? { "data-cy": dataCy } : {})}
        color="primary"
        {...buttonProps}
        loading={isLoading}
        disabled={disabled || !accountAddress}
        onClick={() => {
          if (!accountAddress) throw Error("Account not connected.");
          onClick();
        }}
      >
        <span>{children}</span>
      </Button>
    </ConnectionBoundaryButton>
  );
};
