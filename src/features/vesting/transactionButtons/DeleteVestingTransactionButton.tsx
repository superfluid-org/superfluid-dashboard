import { skipToken } from "@reduxjs/toolkit/dist/query";
import { FC } from "react";
import { usePendingVestingScheduleDelete } from "../../pendingUpdates/PendingVestingScheduleDelete";
import { rpcApi } from "../../redux/store";
import { useConnectionBoundary } from "../../transactionBoundary/ConnectionBoundary";
import {
  TransactionBoundary,
  TransactionBoundaryProps,
} from "../../transactionBoundary/TransactionBoundary";
import {
  TransactionButton,
  TransactionButtonProps,
} from "../../transactionBoundary/TransactionButton";
import {
  TransactionDialogActions,
  TransactionDialogButton,
} from "../../transactionBoundary/TransactionDialog";
import NextLink from "next/link";
import { Typography } from "@mui/material";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import { useAnalytics } from "../../analytics/useAnalytics";
import { useAccount } from "wagmi";

export const DeleteVestingTransactionButton: FC<{
  superTokenAddress: string;
  senderAddress: string;
  receiverAddress: string;
  TransactionBoundaryProps?: TransactionBoundaryProps;
  TransactionButtonProps?: Partial<TransactionButtonProps>;
}> = ({
  superTokenAddress,
  senderAddress,
  receiverAddress,
  TransactionBoundaryProps,
  TransactionButtonProps = {},
}) => {
  const { txAnalytics } = useAnalytics();
  const [deleteVestingSchedule, deleteVestingScheduleResult] =
    rpcApi.useDeleteVestingScheduleMutation();

  const { expectedNetwork: network } = useConnectionBoundary();

  const { address: currentAccountAddress } = useAccount();
  const isSenderLooking =
    currentAccountAddress &&
    senderAddress.toLowerCase() === currentAccountAddress.toLowerCase();

  const { data: activeVestingSchedule } =
    rpcApi.useGetActiveVestingScheduleQuery(
      isSenderLooking
        ? {
            chainId: network.id,
            superTokenAddress,
            receiverAddress,
            senderAddress,
          }
        : skipToken
    );

  const { data: activeFlow } = rpcApi.useGetActiveFlowQuery(
    isSenderLooking && activeVestingSchedule
      ? {
          chainId: network.id,
          tokenAddress: superTokenAddress,
          receiverAddress,
          senderAddress,
        }
      : skipToken
  );

  const isBeingDeleted = !!usePendingVestingScheduleDelete({
    chainId: network.id,
    superTokenAddress,
    receiverAddress,
    senderAddress,
  });
  const isButtonVisible = !!activeVestingSchedule && !isBeingDeleted;

  const { ButtonProps = {}, ...RestTxButtonProps } = TransactionButtonProps;

  return (
    <TransactionBoundary
      {...TransactionBoundaryProps}
      mutationResult={deleteVestingScheduleResult}
    >
      {({ getOverrides, setDialogLoadingInfo, setDialogSuccessActions }) =>
        isButtonVisible && (
          <TransactionButton
            {...RestTxButtonProps}
            dataCy={"delete-schedule-button"}
            ButtonProps={{
              variant: "textContained",
              color: "error",
              size: "medium",
              fullWidth: false,
              startIcon: <CloseRoundedIcon />,
              ...ButtonProps,
            }}
            onClick={async (signer) => {
              const shouldDeleteActiveFlow =
                !!activeVestingSchedule && !!activeFlow;

              setDialogLoadingInfo(
                <Typography variant="h5" color="text.secondary" translate="yes">
                  {shouldDeleteActiveFlow
                    ? "You are canceling a stream and deleting a vesting schedule."
                    : "You are deleting a vesting schedule."}
                </Typography>
              );

              const primaryArgs = {
                chainId: network.id,
                superTokenAddress: superTokenAddress,
                senderAddress: await signer.getAddress(),
                receiverAddress: receiverAddress,
                deleteFlow: shouldDeleteActiveFlow,
              };
              deleteVestingSchedule({
                ...primaryArgs,
                signer,
                overrides: await getOverrides()
              })
                .unwrap()
                .then(...txAnalytics("Delete Vesting Schedule", primaryArgs))
                .catch((error: unknown) => void error); // Error is already logged and handled in the middleware & UI.

              setDialogSuccessActions(
                <TransactionDialogActions>
                  <NextLink href="/vesting" passHref legacyBehavior>
                    <TransactionDialogButton
                      data-cy={"ok-button"}
                      color="primary"
                    >
                      OK
                    </TransactionDialogButton>
                  </NextLink>
                </TransactionDialogActions>
              );
            }}
          >
            Delete
          </TransactionButton>
        )
      }
    </TransactionBoundary>
  );
};
