import { skipToken } from "@reduxjs/toolkit/dist/query";
import { FC } from "react";
import { usePendingVestingScheduleDelete } from "../pendingUpdates/PendingVestingScheduleDelete";
import { rpcApi } from "../redux/store";
import { useConnectionBoundary } from "../transactionBoundary/ConnectionBoundary";
import {
  TransactionBoundary,
  TransactionBoundaryProps,
} from "../transactionBoundary/TransactionBoundary";
import {
  TransactionButton,
  TransactionButtonProps,
} from "../transactionBoundary/TransactionButton";
import {
  TransactionDialogActions,
  TransactionDialogButton,
} from "../transactionBoundary/TransactionDialog";
import Link from "next/link";
import { Typography } from "@mui/material";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import { useAnalytics } from "../analytics/useAnalytics";
import { useAccount } from "wagmi";

export const DeleteVestingTransactionButton: FC<{
  superTokenAddress: string;
  senderAddress: string;
  receiverAddress: string;
  TransactionBoundaryProps?: TransactionBoundaryProps;
  TransactionButtonProps?: TransactionButtonProps;
}> = ({
  superTokenAddress,
  senderAddress,
  receiverAddress,
  TransactionBoundaryProps,
  TransactionButtonProps,
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

  return (
    <TransactionBoundary
      {...TransactionBoundaryProps}
      mutationResult={deleteVestingScheduleResult}
    >
      {({ getOverrides, setDialogLoadingInfo, setDialogSuccessActions }) =>
        isButtonVisible && (
          <TransactionButton
            {...TransactionButtonProps}
            dataCy={"delete-schedule-button"}
            ButtonProps={{
              variant: "textContained",
              color: "error",
              size: "medium",
              fullWidth: false,
              startIcon: <CloseRoundedIcon />,
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
                overrides: await getOverrides(),
                waitForConfirmation: false,
              })
                .unwrap()
                .then(...txAnalytics("Delete Vesting Schedule", primaryArgs))
                .catch((error) => void error); // Error is already logged and handled in the middleware & UI.

              setDialogSuccessActions(
                <TransactionDialogActions>
                  <Link href="/vesting" passHref>
                    <TransactionDialogButton
                      data-cy={"ok-button"}
                      color="primary"
                    >
                      OK
                    </TransactionDialogButton>
                  </Link>
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
