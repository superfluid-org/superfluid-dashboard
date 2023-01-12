import { skipToken } from "@reduxjs/toolkit/dist/query";
import { FC } from "react";
import {
  useAddressPendingVestingScheduleDeletes,
  usePendingVestingScheduleDelete,
} from "../pendingUpdates/PendingVestingScheduleDelete";
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
import { useVisibleAddress } from "../wallet/VisibleAddressContext";
import Link from "next/link";
import { Typography } from "@mui/material";

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
  const [deleteVestingSchedule, deleteVestingScheduleResult] =
    rpcApi.useDeleteVestingScheduleMutation();

  const { expectedNetwork: network } = useConnectionBoundary();

  const { visibleAddress } = useVisibleAddress();
  const isSender =
    senderAddress.toLowerCase() === visibleAddress?.toLowerCase();

  const { currentData: activeVestingSchedule } =
    rpcApi.useGetActiveVestingScheduleQuery(
      isSender
        ? {
            chainId: network.id,
            superTokenAddress,
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
              variant: "outlined",
              color: "error",
            }}
            onClick={async (signer) => {
              setDialogLoadingInfo(
                <Typography variant="h5" color="text.secondary" translate="yes">
                  You are deleting a vesting schedule.
                </Typography>
              );

              deleteVestingSchedule({
                signer,
                chainId: network.id,
                superTokenAddress: superTokenAddress,
                senderAddress: await signer.getAddress(),
                receiverAddress: receiverAddress,
                transactionExtraData: undefined,
                overrides: await getOverrides(),
                waitForConfirmation: false,
              });

              setDialogSuccessActions(
                <TransactionDialogActions>
                  <Link href="/vesting" passHref>
                    <TransactionDialogButton data-cy={"ok-button"} color="primary">
                      OK
                    </TransactionDialogButton>
                  </Link>
                </TransactionDialogActions>
              );
            }}
          >
            Delete Vesting Schedule
          </TransactionButton>
        )
      }
    </TransactionBoundary>
  );
};
