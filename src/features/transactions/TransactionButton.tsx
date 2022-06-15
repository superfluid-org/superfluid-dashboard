import React, { FC, useState } from "react";
import { useExpectedNetwork } from "../network/ExpectedNetworkContext";
import { Button, ButtonProps, Dialog, DialogActions } from "@mui/material";
import { LoadingButton } from "@mui/lab";
import {
  TransactionDialog,
  TransactionDialogActions,
  TransactionDialogButton,
} from "./TransactionDialog";
import UnknownMutationResult from "../../unknownMutationResult";
import { useAccount, useConnect, useNetwork } from "wagmi";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useImpersonation } from "../impersonation/ImpersonationContext";

export const TransactionButton: FC<{
  mutationResult: UnknownMutationResult;
  hidden: boolean;
  disabled: boolean;
  onClick: (
    setTransactionDialogContent: (arg: {
      label?: React.ReactNode;
      successActions?: ReturnType<typeof TransactionDialogActions>;
    }) => void,
    closeTransactionDialog: () => void
  ) => void;
  ButtonProps?: {
    variant?: ButtonProps["variant"];
  };
  dataCy?: string;
}> = ({
  children,
  disabled,
  onClick,
  mutationResult,
  hidden,
  dataCy,
  ButtonProps = {},
}) => {
  const { isConnecting } = useConnect();
  const { activeChain, switchNetwork } = useNetwork();
  const { data: account } = useAccount();
  const { isImpersonated, stopImpersonation: stopImpersonation } =
    useImpersonation();

  const { network } = useExpectedNetwork();
  const [transactionDialogLabel, setTransactionDialogLabel] = useState<
    React.ReactNode | undefined
  >();
  const [transactionDialogSuccessActions, setTransactionDialogSuccessActions] =
    useState<ReturnType<typeof TransactionDialogActions> | undefined>();
  const [transactionDialogOpen, setTransactionDialogOpen] = useState(false);

  const getButton = () => {
    if (hidden) {
      return null;
    }

    if (disabled) {
      return (
        <Button
          data-cy={dataCy}
          fullWidth
          disabled
          color="primary"
          variant="contained"
          size="xl"
        >
          {children}
        </Button>
      );
    }

    if (isImpersonated) {
      return (
        <Button
          data-cy={"view-mode-button"}
          fullWidth
          color="warning"
          variant="contained"
          size="xl"
          onClick={stopImpersonation}
        >
          Stop Viewing an Address
        </Button>
      );
    }

    if (!account?.address) {
      return (
        <ConnectButton.Custom>
          {({ openConnectModal }) => (
            <LoadingButton
              data-cy={"connect-wallet"}
              fullWidth
              loading={isConnecting}
              color="primary"
              variant="contained"
              size="xl"
              onClick={openConnectModal}
            >
              Connect Wallet
            </LoadingButton>
          )}
        </ConnectButton.Custom>
      );
    }

    if (network.id !== activeChain?.id) {
      return (
        <Button
          data-cy={"change-network-button"}
          disabled={!switchNetwork}
          color="primary"
          variant="contained"
          size="xl"
          fullWidth
          onClick={() => {
            if (switchNetwork) {
              switchNetwork(network.id);
            }
          }}
        >
          Change Network to {network.name}
        </Button>
      );
    }

    return (
      <LoadingButton
        data-cy={dataCy}
        fullWidth
        loading={mutationResult.isLoading}
        color="primary"
        variant="contained"
        size="xl"
        disabled={disabled}
        onClick={() => {
          onClick(
            (arg: {
              label?: React.ReactNode;
              successActions?: ReturnType<typeof TransactionDialogActions>;
            }) => {
              setTransactionDialogLabel(arg?.label);
              setTransactionDialogSuccessActions(arg?.successActions);
            },
            () => setTransactionDialogOpen(false)
          );
          setTransactionDialogOpen(true);
        }}
        {...ButtonProps}
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
        label={transactionDialogLabel}
        successActions={
          transactionDialogSuccessActions ?? (
            <DialogActions sx={{ p: 3, pt: 0 }}>
              <TransactionDialogButton
                onClick={() => setTransactionDialogOpen(false)}
              >
                OK
              </TransactionDialogButton>
            </DialogActions>
          )
        }
      ></TransactionDialog>
    </>
  );
};
